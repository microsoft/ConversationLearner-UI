/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as DialogEditing from './dialogEditing'
import * as OBIUtils from './obiUtils'
import * as Util from './util'
import * as OBITypes from '../types/obiTypes'
import * as stripJsonComments from 'strip-json-comments'

enum OBIStepType {
    BEGIN_DIALOG = "Microsoft.BeginDialog",
    END_DIALOG = "Microsoft.EndDialog",
    END_TURN = "Microsoft.EndTurn",
    HTTP_REQUEST = "Microsoft.HttpRequest",
    SEND_ACTIVITY = "Microsoft.SendActivity",
    SWITCH_CONDITION = "Microsoft.SwitchCondition",
    TEXT_INPUT = "Microsoft.TextInput"
}

enum OBIRuleType {
    INTENT_RULE = "Microsoft.IntentRule"
}

// A node in a dialog tree.
class ObiDialogNode {
    readonly dialog: OBITypes.OBIDialog
    intent?: string
    children: ObiDialogNode[]
    constructor(dialog: OBITypes.OBIDialog) {
        this.dialog = dialog
        this.children = []
    }
}

export interface ObiDialogParserResult {
    luMap: { [key: string]: string[] }
    lgItems: CLM.LGItem[],
    trainDialogs: CLM.TrainDialog[]
    warnings: string[]
}

export class ObiDialogParser {
    private app: CLM.AppBase
    private actions: CLM.ActionBase[] = []
    private entities: CLM.EntityBase[] = []
    private dialogs: { [key: string]: OBITypes.OBIDialog }
    private lgItems: CLM.LGItem[]
    private luMap: { [key: string]: string[] }
    private warnings: string[]
    private createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>
    private createEntityThunkAsync: (appId: string, entity: CLM.EntityBase) => Promise<CLM.EntityBase | null>
    private readonly MAX_ENUM_VALUE_NAME_LENGTH = 10  // TODO(thpar) : move this to Models.

    constructor(
        app: CLM.AppBase,
        actions: CLM.ActionBase[],
        entities: CLM.EntityBase[],
        createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>,
        createEntityThunkAsync: (appId: string, entity: CLM.EntityBase) => Promise<CLM.EntityBase | null>
    ) {
        this.app = app
        this.actions = [...actions]
        this.entities = [...entities]
        this.createActionThunkAsync = createActionThunkAsync
        this.createEntityThunkAsync = createEntityThunkAsync
    }

    async parse(files: File[]): Promise<ObiDialogParserResult> {
        this.lgItems = []
        this.luMap = {}
        this.dialogs = {}
        this.warnings = []

        await this.readDialogFiles(files)

        let trainDialogs: CLM.TrainDialog[] = []
        const mainDialog = this.dialogs["Entry.main"]
        if (!mainDialog) {
            this.warnings.push(`Missing entry point. Expecting a .dialog file called "Entry.main"`)
        } else {
            const conditionalEntities: { [key: string]: Set<string> } = {}
            const rootNode = await this.collectDialogNodes(mainDialog, conditionalEntities)
            await this.createOrUpdateConditionalEntities(conditionalEntities)
            trainDialogs = await this.getTrainDialogs(rootNode)
        }
        return {
            luMap: this.luMap,
            lgItems: this.lgItems,
            trainDialogs,
            warnings: this.warnings
        }
    }

    // Reads input files; packs data into dialog / LU / LG maps according to file extensions.
    private async readDialogFiles(files: File[]) {
        for (const file of files) {
            if (file.name.endsWith('.dialog')) {
                const fileText = await Util.readFileAsync(file)
                const obiDialog: OBITypes.OBIDialog = JSON.parse(stripJsonComments(fileText))
                // Set name, removing suffix
                obiDialog.$id = this.removeSuffix(file.name)
                this.dialogs[obiDialog.$id] = obiDialog
            }
            else if (file.name.endsWith('.lu')) {
                const fileText = await Util.readFileAsync(file)
                this.addToLUMap(fileText, this.luMap)
            }
            else if (file.name.endsWith('.lg')) {
                const fileText = await Util.readFileAsync(file)
                CLM.ObiUtils.addToLGMap(fileText, this.lgItems)
            }
            else {
                this.warnings.push(`Expecting .dialog, .lu and .lg files. ${file.name} is of unknown file type`)
            }
        }
    }

    private addToLUMap(text: string, luMap: { [key: string]: string[] }): any {
        const keys = text.split('##')
        for (const key of keys) {
            if (!key.startsWith(">")) {
                const inputs = key.split('- ').map(i => i.trim())
                luMap[inputs[0]] = inputs.slice(1)
            }
        }
        return luMap
    }

    /**
     * Walks the dialog tree from the given node.  Validates types of nodes in the tree and returns an
     * in-memory representation of the tree.
     * Tree construction is slightly complicated since child nodes can be referenced in `rules` or `steps`.
     */
    private async collectDialogNodes(obiDialog: OBITypes.OBIDialog, conditionalEntities: { [key: string]: Set<string> }):
        Promise<ObiDialogNode> {
        let node: ObiDialogNode = new ObiDialogNode(obiDialog)
        // TODO(thpar) : add steps for capturing API input and output.
        if (obiDialog.rules) {
            await this.collectDialogRuleChildren(node, obiDialog.rules, conditionalEntities)
        }
        if (obiDialog.steps) {
            await this.collectDialogStepChildren(node, obiDialog.steps, conditionalEntities)
        }
        return node
    }

    // Collects dialog tree nodes from `Microsoft.IntentRule` elements in the dialog `rules` section.
    private async collectDialogRuleChildren(node: ObiDialogNode, rules: OBITypes.MicrosoftIRule[],
        conditionalEntities: { [key: string]: Set<string> }) {
        for (const rule of rules) {
            if (rule.$type !== OBIRuleType.INTENT_RULE) {
                this.warnings.push(`Unhandled OBI rule type: ${rule.$type} in ${node.dialog.$id}`)
                continue
            }
            const intent = rule.intent
            if (!intent) {
                this.warnings.push(`Rule is missing intent property in ${node.dialog.$id}`)
                continue
            }
            if (!rule.steps) {
                continue
            }
            for (const step of rule.steps) {
                if (typeof step === "string") {
                    this.warnings.push(`Unexpected string step in ${node.dialog.$id}`)
                    continue
                }
                if (step.$type !== OBIStepType.BEGIN_DIALOG || typeof step.dialog !== "string") {
                    this.warnings.push(`Unhandled OBI step type: ${step.$type} in ${node.dialog.$id}`)
                    continue
                }
                const subDialog = this.dialogs[step.dialog]
                if (!subDialog) {
                    throw new Error(`Dialog name ${step.dialog} undefined`)
                }
                // Add children to train dialog list, if applicable
                const child = await this.collectDialogNodes(subDialog, conditionalEntities)
                if (child) {
                    // Add this node's intent string to all children.
                    child.intent = intent
                    node.children.push(child)
                }
            }
        }
    }

    /**
     * Collects dialog nodes from dialog-redirecting elements in the dialog `steps` section.
     */
    private async collectDialogStepChildren(
        node: ObiDialogNode,
        steps: (string | OBITypes.OBIDialog)[],
        conditionalEntities: { [key: string]: Set<string> }): Promise<void> {
        for (const step of steps) {
            if (typeof step === "string") {
                this.warnings.push(`Unexpected string step in ${node.dialog.$id}`)
                continue
            }
            // Handle any steps that may contain an expansion of the dialog tree.
            switch (step.$type) {
                case OBIStepType.BEGIN_DIALOG:
                    if (!step.dialog || typeof step.dialog !== "string") {
                        this.warnings.push(`Invalid dialog in ${node.dialog.$id}`)
                        continue
                    }
                    const subDialog = this.dialogs[step.dialog]
                    if (!subDialog) {
                        throw new Error(`Dialog name ${step.dialog} undefined`)
                    }
                    const childDialogs = await this.collectDialogNodes(subDialog, conditionalEntities)
                    if (childDialogs) {
                        // Add children to train dialog list
                        node.children.push(childDialogs)
                    }
                    break
                case OBIStepType.SWITCH_CONDITION:
                    if (!step.cases && !step.default) {
                        throw new Error("SwitchCondition must have at least one case or default")
                    }
                    if (step.cases) {
                        for (const branch of step.cases) {
                            if (!branch.steps) {
                                throw new Error("Each case in SwitchCondition must have at least one step")
                            }
                            // Collect the entities and values used in case expressions.
                            OBIUtils.parseEntityConditionFromDialogCase(branch, conditionalEntities)
                            await this.collectDialogStepChildren(node, branch.steps, conditionalEntities)
                        }
                    }
                    if (step.default) {
                        await this.collectDialogStepChildren(node, step.default, conditionalEntities)
                    }
                    break
                default:
                // No child nodes, so nothing to do here.
                // The actions in this step will be handled later.
            }
        }
    }

    // Generates TrainDialog instances from the dialog tree.
    private async getTrainDialogs(node: ObiDialogNode): Promise<CLM.TrainDialog[]> {
        return this.getTrainDialogsIter(node, [], node.intent)
    }

    // Recursive helper.
    private async getTrainDialogsIter(
        node: ObiDialogNode,
        currentRounds: CLM.TrainRound[],
        intent: string | undefined):
        Promise<CLM.TrainDialog[]> {
        if (!node) {
            return []
        }
        // Intent may be carried forward from a previous node if that node did not create a TrainRound.
        let currentIntent = intent
        if (currentIntent) {
            if (node.intent && node.intent !== currentIntent) {
                throw Error(`Node intent ${node.intent} conflicts with incoming intent ${currentIntent}`)
            }
        } else {
            currentIntent = node.intent
        }
        let rounds = [...currentRounds]
        // Build up a training round from any applicable steps in this node.
        const obiDialog = node.dialog
        if (obiDialog.steps) {
            let scorerSteps = await this.getScorerStepsFromOBIDialogSteps(obiDialog.steps)
            if (scorerSteps.length > 0) {
                if (currentIntent) {
                    const extractorStep: CLM.TrainExtractorStep = {
                        textVariations: this.getTextVariations(currentIntent)
                    }
                    const trainRound: CLM.TrainRound = {
                        extractorStep,
                        scorerSteps
                    }
                    currentIntent = undefined  // Used the intent in this round, so reset it.
                    rounds.push(trainRound)
                } else {
                    // If we get here, then the current node has steps to execute *without* an intervening intent
                    // (user utterance).  We therefore must append these scorer steps to the previous round.
                    if (currentRounds.length === 0) {
                        throw Error(`Attempting to append scorer steps to a non-existent round in node ${obiDialog.$id}`)
                    }
                    let round = currentRounds[currentRounds.length - 1]
                    round.scorerSteps = [...round.scorerSteps, ...scorerSteps]
                }
            }
        }
        // This is a leaf node of the conversational tree; build a dialog containing the visited rounds.
        if (!node.children || node.children.length === 0) {
            let dialog = this.makeEmptyTrainDialog()
            dialog.rounds = [...rounds]
            return [dialog]
        }
        // This is not a leaf node; continue building up the dialog tree from the rounded visited so far.
        let dialogs: CLM.TrainDialog[] = []
        for (const child of node.children) {
            dialogs = [...dialogs, ...(await this.getTrainDialogsIter(child, rounds, currentIntent))]
        }
        return dialogs
    }

    private async getScorerStepsFromOBIDialogSteps(steps: (string | OBITypes.OBIDialog)[]):
        Promise<CLM.TrainScorerStep[]> {
        const scorerSteps: CLM.TrainScorerStep[] = []
        for (const [i, step] of steps.entries()) {
            const nextStep = (i + 1 < steps.length) ? steps[i + 1] : undefined
            if (typeof step === "string" || typeof nextStep === "string") {
                this.warnings.push(`Unexpected string step`)
                continue
            }
            switch (step.$type) {
                case OBIStepType.SEND_ACTIVITY: {
                    if (!step.activity) {
                        throw new Error("Expected activity to be set in steps")
                    }
                    const scorerStep = await this.getScorerStepFromActivity(step.activity)
                    scorerSteps.push(scorerStep)
                    break
                }
                case OBIStepType.TEXT_INPUT: {
                    if (!step.prompt) {
                        throw new Error("Expected activity to be set in steps")
                    }
                    const scorerStep = await this.getScorerStepFromActivity(step.prompt)
                    scorerSteps.push(scorerStep)
                    break
                }
                case OBIStepType.HTTP_REQUEST: {
                    const scorerStep = await this.createActionFromHttpRequest(step, nextStep)
                    scorerSteps.push(scorerStep)
                    break
                }
                case OBIStepType.SWITCH_CONDITION: {
                    // TODO(thpar) : Update to set entity memory for each branch of the case, and add conditions on the cases.
                    let childSteps: CLM.TrainScorerStep[] = []
                    if (step.cases) {
                        for (const branch of step.cases) {
                            if (!branch.steps) {
                                throw new Error("Case branch must contain steps")
                            }
                            childSteps = [...childSteps, ...await this.getScorerStepsFromOBIDialogSteps(branch.steps)]
                        }
                    }
                    if (step.default) {
                        childSteps = [...childSteps, ...await this.getScorerStepsFromOBIDialogSteps(step.default)]
                    }
                    // We currently require SwitchCondition steps to contain only StartDialog nodes, which are handled
                    // via generation of the dialog tree; they should not contain action steps.
                    // To handle action steps, we would need to modify this function to return a branching structure.
                    // Eg, if a dialog had [step0, swtich:{step1, step2}, step3], then we'd need to return 2 different sets
                    // of scorer steps : [step0, step1, step3] and [step0, step2, step3].
                    // Returning multiple sets of scorer steps would have many other repercussions on TrainDialog construction,
                    // such as assigning scorer steps from subsequent nodes without an extractor step.
                    if (childSteps.length > 0) {
                        throw new Error("SwitchConditions containing action steps are not currently supported")
                    }
                    // We also do not currently allow action-bearing steps to follow a SwtichCondition step.
                    // This is because actions in the current node are visited before traversing to children in the dialog tree.
                    // Eg, if a dialog had [step0, switch:{StartDialog(a)}, step1], then the current logic would generate
                    // the incorrect output scorer steps [step0, step1, <scorer steps from dialog a>]; users would probably
                    // expect that <dialog a> would be visited prior to executing step1.
                    if (nextStep) {
                        const remainingSteps = steps.slice(i + 1)
                        childSteps = await this.getScorerStepsFromOBIDialogSteps(remainingSteps)
                        if (childSteps.length > 0) {
                            throw new Error("SwitchCondition may not be followed by an action step in the same node")
                        }
                    }
                    // Either we've validated that there are no more action-bearing steps, or the switch is the last
                    // action in this node; either way, we can return now.
                    return scorerSteps
                }
                case OBIStepType.BEGIN_DIALOG: {
                    // Nothing to do here, the child dialogs were already expanded when we built the dialog tree.
                    break
                }
                case OBIStepType.END_DIALOG:
                case OBIStepType.END_TURN:
                    // Noop.
                    break
                default: {
                    this.warnings.push(`Unhandled OBI Type: ${step.$type}`)
                }
            }
        }
        return scorerSteps
    }

    /**
     * Creates enum entities and values for elements used in SwitchCondition comparisons, if they do not already exist.
     * 
     * @param conditionalEntities dictionary key is the name of the value used in comparison (entity name);
     *     dictionary values are the distinct string values used across all comparisons of that entity.
     */
    private async createOrUpdateConditionalEntities(conditionalEntities: { [key: string]: Set<string> }) {
        for (const entityName of Object.keys(conditionalEntities)) {
            let foundEntity = this.entities.find(e => e.entityName === entityName)
            if (foundEntity) {
                // This shouldn't happen since we only call createOrUpdateConditionalEntities once...
                throw new Error(`Unexpected: multiple definitions for ${entityName}`)
            }
            const newEntity = await this.createEnumEntity(entityName, conditionalEntities[entityName])
            this.entities.push(newEntity)
        }
    }

    /**
     * Creates a new enum entity with `values`.  Returns the new enum entity if successful.
     * Note that entity values will be truncated to the max length allowed by the backend.
     * Throws an error if multiple distinct condition names have the same truncated value.
     */
    private async createEnumEntity(entityName: string, values: Set<string>): Promise<CLM.EntityBase> {
        let enumValues: CLM.EnumValue[] = []
        // We need to truncate the value names.  Record the before/after names so we can detect if there are
        // any collisions.
        let updatedValues: { [key: string]: Set<string> } = {}
        for (const value of values) {
            const truncated = value.substr(0, this.MAX_ENUM_VALUE_NAME_LENGTH)
            if (!updatedValues[truncated]) {
                updatedValues[truncated] = new Set([value])
            } else {
                // Some value with this truncated string already exists, throw an error if it's a new value.
                // That would mean that we have 2 distinct condition values that map to the truncated string.
                const fullValues = updatedValues[truncated]
                if (!fullValues.has(value)) {
                    const existing = fullValues.values().next().value
                    throw new Error(`Can't create enum, values ${value} and ${existing} map to the same truncated string`)
                }
            }
            enumValues.push({ enumValue: truncated })
        }
        const newEntity: CLM.EntityBase = {
            entityId: undefined!,
            entityName,
            resolverType: "none",
            createdDateTime: new Date().toJSON(),
            lastModifiedDateTime: new Date().toJSON(),
            isResolutionRequired: false,
            isMultivalue: false,
            isNegatible: false,
            negativeId: null,
            positiveId: null,
            entityType: CLM.EntityType.ENUM,
            enumValues,
            version: null,
            packageCreationId: null,
            packageDeletionId: null,
            doNotMemorize: false
        }
        const entityId = await ((this.createEntityThunkAsync(this.app.appId, newEntity) as any) as Promise<string>)
        if (!entityId) {
            throw new Error(`Failed to create entity ${entityName}`)
        }
        newEntity.entityId = entityId
        return newEntity
    }

    private async getScorerStepFromActivity(prompt: string): Promise<CLM.TrainScorerStep> {
        let scoreInput: CLM.ScoreInput = {
            filledEntities: [],
            context: {},
            maskedActions: []
        }

        return {
            importText: prompt,
            input: scoreInput,
            labelAction: CLM.CL_STUB_IMPORT_ACTION_ID,
            logicResult: undefined,
            scoredAction: undefined
        }
    }

    /**
     * HttpRequest represents a RESTful request with known input and output parameters.
     * The .dialog file is expected to have a field `responseFields` that enumerates the top-level
     * output parameters of the response object.  Note that as of 2019.09, this field is specific
     * to ConversationLearner and is not part of the OBI spec.
     */
    private async createActionFromHttpRequest(step: OBITypes.OBIDialog, nextStep: OBITypes.OBIDialog | undefined):
        Promise<CLM.TrainScorerStep> {
        if (!step.url) {
            throw new Error('HTTP requests require url')
        }
        // TODO(thpar) : revisit logic for this.
        // Note that we cannot do this 100% correctly in the current implementation, since actions (scorer steps)
        // from a given dialog tree node $Y may be added to rounds from the previous dialog tree node $X if $Y does
        // not have an extractor step, but we are calling this method during the handling of $X.
        // To handle this 100% correctly, we'd need to do a multi-pass traversal of the dialog tree or build up a
        // second tree-like representation of extractor and scorer steps.
        const isTerminal = (!nextStep || nextStep.$type === OBIStepType.TEXT_INPUT ||
            nextStep.$type === OBIStepType.END_TURN)
        const hashText = JSON.stringify(step)
        let action: CLM.ActionBase | undefined | null = OBIUtils.findActionFromHashText(hashText, this.actions)
        if (!action && this.createActionThunkAsync) {
            action = await DialogEditing.getOrCreatePlaceholderAPIAction(this.app.appId, step.url,
                isTerminal, this.actions, this.createActionThunkAsync as any)
        }
        // Create an entity for each output parameter in the action.
        let actionOutputEntities: OBIUtils.OBIActionOutput[] = []
        if (step.responseFields) {
            actionOutputEntities = step.responseFields.map(
                (field) => { return { entityName: field } }
            )
        }
        const filledEntities = await OBIUtils.importActionOutput(actionOutputEntities, this.entities, this.app,
            this.createEntityThunkAsync)
        const scoreInput: CLM.ScoreInput = {
            filledEntities,
            context: {},
            maskedActions: []
        }
        // Create a scored action for this action; this will allow the action to be matched during import.
        let scoredAction: CLM.ScoredAction | undefined
        if (action) {
            scoredAction = {
                actionId: action.actionId,
                payload: action.payload,
                isTerminal: action.isTerminal,
                actionType: CLM.ActionTypes.API_LOCAL,
                score: 1
            }
        }
        return {
            importText: undefined,
            input: scoreInput,
            labelAction: action ? action.actionId : CLM.CL_STUB_IMPORT_ACTION_ID,
            logicResult: undefined,
            scoredAction
        }
    }

    private getTextVariations(intentName: string) {
        let userInputs = this.luMap[intentName]
        if (!userInputs) {
            throw new Error(`Intent name ${intentName} undefined`)
        }
        // Programatically fired events have no intent
        // Use intent name for now
        if (userInputs.length === 0) {
            userInputs = [intentName]
        }
        userInputs = userInputs.slice(0, CLM.MAX_TEXT_VARIATIONS)
        const textVariations: CLM.TextVariation[] = []
        userInputs.forEach(input => {
            textVariations.push({
                text: input,
                labelEntities: []
            })
        })
        return textVariations
    }

    private makeEmptyTrainDialog(): CLM.TrainDialog {
        return {
            trainDialogId: undefined!,
            version: undefined!,
            packageCreationId: undefined!,
            packageDeletionId: undefined!,
            sourceLogDialogId: undefined!,
            initialFilledEntities: [],
            rounds: [],
            tags: [],
            description: '',
            createdDateTime: new Date().toJSON(),
            lastModifiedDateTime: new Date().toJSON(),
            // It's initially invalid
            validity: CLM.Validity.INVALID,
        }
    }

    private removeSuffix(text: string): string {
        let name = text.split('.')
        name.pop()
        return name.join('.')
    }
}