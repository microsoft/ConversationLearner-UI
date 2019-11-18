/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as BB from 'botbuilder'
import * as CLM from '@conversationlearner/models'
import * as DialogEditing from './dialogEditing'
import * as DialogUtils from './dialogUtils'
import * as Util from './util'
import Plain from 'slate-plain-serializer'
import { REPROMPT_SELF } from '../types/const'
import { ImportedAction } from '../types/models'
import { Case } from '../types/obiTypes'
import { User } from '../types'

export async function toTranscripts(
    appDefinition: CLM.AppDefinition,
    appId: string,
    user: User,
    fetchActivitiesAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean) => Promise<CLM.TeachWithActivities>
): Promise<BB.Transcript[]> {

    const definitions = {
        entities: appDefinition.entities,
        actions: appDefinition.actions,
        trainDialogs: []
    }

    return Promise.all(appDefinition.trainDialogs.map(td => getActivities(appId, td, user, definitions, fetchActivitiesAsync)))
}

export interface OBIImportData {
    appId: string,
    files: File[],
    autoCreate: boolean,
    autoMerge: boolean,
    autoActionCreate: boolean
}

// Return activities for the given logDialogId
export async function getLogDialogActivities(
    appId: string,
    logDialogId: string,
    user: User,
    actions: CLM.ActionBase[],
    entities: CLM.EntityBase[],
    conversationId: string | undefined,
    channelId: string | undefined,
    fetchLogDialogThunkAsync: (appId: string, logDialogId: string, replaceLocal: boolean, nullOnNotFound: boolean, noSpinnerDisplay: boolean) => Promise<CLM.LogDialog>,
    fetchActivitiesThunkAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean, noSpinnerDisplay: boolean) => Promise<CLM.TeachWithActivities>
): Promise<Util.RecursivePartial<BB.Activity>[]> {

    // Fetch the LogDialog
    const logDialog = await fetchLogDialogThunkAsync(appId, logDialogId, true, true, true)
    if (!logDialog) {
        throw new Error(`Unable to find log Id: ${logDialogId}`)
    }

    // Convert to TrainDialog
    const trainDialog = CLM.ModelUtils.ToTrainDialog(logDialog, actions, entities)

    // Return activities
    const teachWithActivities = await fetchActivitiesThunkAsync(appId, trainDialog, user.name, user.id, false, true)
    const activities = teachWithActivities.activities
    if (conversationId || channelId) {
        addActivityReferences(activities, conversationId, channelId)
    }
    return activities
}

// Adds channelId and conversationId references to activities
function addActivityReferences(activities: Util.RecursivePartial<BB.Activity>[], conversationId: string | undefined, channelId: string | undefined): void {
    activities.forEach(a => {
        if (channelId) {
            a.channelId = channelId
        }
        if (conversationId) {
            a.conversation = { id: conversationId }
        }
    })
}

async function getActivities(appId: string, trainDialog: CLM.TrainDialog, user: User, definitions: CLM.AppDefinition,
    fetchActivitiesAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean) => Promise<CLM.TeachWithActivities>
): Promise<BB.Transcript> {
    const newTrainDialog = Util.deepCopy(trainDialog)
    newTrainDialog.definitions = definitions

    const teachWithActivities = await fetchActivitiesAsync(appId, newTrainDialog, user.name, user.id, false)
    return { activities: teachWithActivities.activities }
}

interface TranscriptActionInput {
    entityName: string
}

export interface TranscriptActionCall {
    type: string
    actionName: string
    actionInput: TranscriptActionInput[]
    actionOutput: OBIActionOutput[]
}

export interface OBIActionOutput {
    entityName: string,
    value?: string
}

export function isSameActivity(activity1: BB.Activity, activity2: BB.Activity): boolean {
    if ((activity1 && !activity2)
        || (activity2 && !activity1)
        || (activity1.text !== activity2.text)) {
        return false
    }
    const attachments1 = activity1.attachments ? JSON.stringify(activity1.attachments) : null
    const attachments2 = activity2.attachments ? JSON.stringify(activity2.attachments) : null
    if (attachments1 !== attachments2) {
        return false
    }
    return true
}

// Add new LG references from .lg file to Map (creates new one if doesn't already exist)
export async function lgMapFromLGFiles(lgFiles: File[] | null, lgItemList?: CLM.LGItem[]): Promise<CLM.LGItem[]> {
    const map = lgItemList ?? []
    if (lgFiles) {
        for (const lgFile of lgFiles) {
            if (lgFile.name.endsWith('.lg')) {
                const fileText = await Util.readFileAsync(lgFile)
                CLM.ObiUtils.addToLGMap(fileText, map)
            }
            else {
                throw new Error(`Expecting .lg file.\n\n Given: ${lgFile.name}`)
            }
        }
    }
    return map
}

// Returns true is any LG is used by this transcript
export function usesLG(transcript: BB.Activity[]): boolean {

    for (let activity of transcript) {
        if (activity.type === 'message' && activity.from.role === 'bot') {
            let lgName = lgNameFromImportText(activity.text)
            if (lgName) {
                return true
            }
        }
    }
    return false
}

// Given a transcript file, replace any LG references with actual LG content
// Returns true is any LG substitutions were made
export function fromLG(transcript: BB.Activity[], lgItemList: CLM.LGItem[]): boolean {

    let usedLG = false
    for (let activity of transcript) {
        if (activity.type === 'message' && activity.from.role === 'bot') {
            let lgName = lgNameFromImportText(activity.text)
            if (lgName) {
                usedLG = true
                let response = lgItemList.find(lg => lg.lgName === lgName)
                if (response) {
                    activity.text = (response.suggestions.length > 0) ? JSON.stringify(response) : response.text
                }
                else {
                    activity.text = `LG reference "${lgName}" not found`
                }
            }
        }
    }
    return usedLG
}

// Given a transcript file, replace expanded action references for LG
export function toLG(transcript: BB.Activity[], lgItemList: CLM.LGItem[], entities: CLM.EntityBase[], actions: CLM.ActionBase[]): void {

    for (let activity of transcript) {
        if (activity.channelData?.clData?.actionId) {
            const lgItem = lgItemList.find(lg => lg.actionId === activity.channelData.clData.actionId)
            if (lgItem) {
                activity.text = `[${lgItem.lgName}]`
                delete activity.attachments
                delete activity.attachmentLayout
            }
        }
    }
}

// Convert .transcript file into a TrainDialog
export async function trainDialogFromTranscriptImport(
    transcript: BB.Activity[],
    lgItemList: CLM.LGItem[] | null,
    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    app: CLM.AppBase,

    createActionThunkAsync?: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>,
    createEntityThunkAsync?: (appId: string, entity: CLM.EntityBase) => Promise<CLM.EntityBase | null>
): Promise<CLM.TrainDialog> {
    const transcriptHash = CLM.hashText(JSON.stringify(transcript))

    let trainDialog: CLM.TrainDialog = {
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
        clientData: { importHashes: [transcriptHash] }
    }

    // If I have an LG map, substitute in LG values
    if (lgItemList) {
        fromLG(transcript, lgItemList)
    }

    let curRound: CLM.TrainRound | null = null
    let nextFilledEntities: CLM.FilledEntity[] = []
    for (let index = 0; index < transcript.length; index = index + 1) {
        const activity = transcript[index]
        const nextActivity = transcript[index + 1]

        // TODO: Handle conversation updates
        if (activity.text === "END_SESSION") {
            return trainDialog
        }
        else if (!activity.type || activity.type === "message") {
            if (activity.from.role === "user") {
                const textVariations: CLM.TextVariation[] = [{
                    text: activity.text,
                    labelEntities: []
                }]
                if (activity.channelData?.textVariations) {
                    activity.channelData.textVariations.forEach((tv: any) => {
                        // Currently system is limited to 20 text variations
                        if (textVariations.length < CLM.MAX_TEXT_VARIATIONS && activity.text !== tv.text) {

                            let altTextVariation: CLM.TextVariation = {
                                text: tv.text,
                                labelEntities: []
                            }
                            textVariations.push(altTextVariation)
                        }
                    })
                }
                let extractorStep: CLM.TrainExtractorStep = {
                    textVariations: textVariations
                }
                curRound = {
                    extractorStep,
                    scorerSteps: []
                }
                trainDialog.rounds.push(curRound)
            }
            else if (activity.from.role === "bot") {
                let action = findMatchedAction(activity, entities, actions, nextFilledEntities)
                let logicResult: CLM.LogicResult | undefined
                let scoredAction: CLM.ScoredAction | undefined
                let filledEntities = Util.deepCopy(nextFilledEntities)

                // If I didn't find an action and is API, create API placeholder
                if (activity.channelData?.type === "ActionCall") {
                    const actionCall = activity.channelData as TranscriptActionCall
                    const isTerminal = !nextActivity || nextActivity.from.role === "user"

                    if (!action) {
                        action = await DialogEditing.getOrCreatePlaceholderAPIAction(app.appId, actionCall.actionName,
                            isTerminal, actions, createActionThunkAsync as any)
                    }
                    // Throw error if I was supposed to create actions
                    if (!action && createActionThunkAsync) {
                        throw new Error("Unable to create API placeholder Action")
                    }
                    // Otherwise pick action if created (may not exist when testing)
                    if (action) {
                        scoredAction = {
                            actionId: action.actionId,
                            payload: action.payload,
                            isTerminal: action.isTerminal,
                            actionType: CLM.ActionTypes.API_LOCAL,
                            score: 1
                        }

                        const actionFilledEntities = await importActionOutput(actionCall.actionOutput, entities, app.appId, createEntityThunkAsync)
                        // Store placeholder output in LogicResult
                        logicResult = {
                            logicValue: undefined,
                            changedFilledEntities: actionFilledEntities,
                        }

                        // Store filled entities for subsequent turns
                        nextFilledEntities = actionFilledEntities
                    }
                }

                let scoreInput: CLM.ScoreInput = {
                    filledEntities: filledEntities,
                    context: {},
                    maskedActions: []
                }
                // As a first pass, try to match by exact text
                let scorerStep: CLM.TrainScorerStep = {
                    importText: action ? undefined : activity.text,
                    input: scoreInput,
                    labelAction: action ? action.actionId : CLM.CL_STUB_IMPORT_ACTION_ID,
                    logicResult,
                    scoredAction
                }

                if (curRound) {
                    curRound.scorerSteps.push(scorerStep)
                }
                else {
                    throw new Error("Dialogs must start with User turn (role='user')")
                }
            }
        }
    }
    return trainDialog
}

// Given an Activity try to find a matching action
function findMatchedAction(activity: BB.Activity, entities: CLM.EntityBase[], actions: CLM.ActionBase[], filledEntities: CLM.FilledEntity[]): CLM.ActionBase | undefined {
    // If actionId provided return the action
    if (activity.channelData?.clData) {
        const clData: CLM.CLChannelData = activity.channelData.clData
        if (clData.actionId) {
            const action = actions.find(a => a.actionId === clData.actionId)
            if (action) {
                return action
            }
            else {
                throw new Error("Provided ActionId does not exist in this model")
            }
        }
    }
    // If importText is an lgName try to look it up in existing actions
    const lgName = lgNameFromImportText(activity.text)
    if (lgName) {
        const action = actions.find(a => a.clientData?.lgName === lgName)
        if (action) {
            return action
        }
    }

    // Otherwise try to look it up by hashing the activity content and looking up
    const hashText = hashTextFromActivity(activity, entities, filledEntities)
    return (hashText ? findActionFromHashText(hashText, actions) : undefined)
}

// Generate entity map for an action, filling in any missing entities with a blank value
export function generateEntityMapForAction(action: CLM.ActionBase, filledEntityMap: Map<string, string> = new Map<string, string>()): Map<string, string> {
    const map = new Map<string, string>()
    action.requiredEntities.forEach(e => {
        let value = filledEntityMap.get(e)
        if (value) {
            map.set(e, value)
        }
        else {
            map.set(e, "")
        }
    })
    return map
}

export interface ConditionEntityAndValue {
    entity: string
    value: string
}

// NOTA BENE : We currently assume that switch nodes will only be acting on values returned by
// API calls, and that values will be compared using strict string equality.
export function parseEntityConditionFromDialogCase(branch: Case, entityConditions: { [key: string]: Set<string> }):
    ConditionEntityAndValue {
    if (!branch.value) {
        throw new Error("SwitchCondition cases must have value")
    }
    // Currently we only support equality expressions.
    const tokens = branch.value.split("==").map(
        (i) => {
            const trimmed = i.trim()
            if (trimmed.length === 0) {
                throw new Error("SwitchCondition entity and value must be non-empty")
            }
            return trimmed
        }
    )
    if (tokens.length !== 2) {
        throw new Error("SwitchCondition case is expected to have format 'x == y'")
    }
    const [entity, value] = tokens
    let conditionValues = entityConditions[entity]
    if (!conditionValues) {
        conditionValues = new Set<string>()
        entityConditions[entity] = conditionValues
    }
    conditionValues.add(value)
    return { entity, value }
}

// Return hash text for the given activity
export function hashTextFromActivity(activity: BB.Activity, entities: CLM.EntityBase[], filledEntities: CLM.FilledEntity[] | undefined): string {

    // If an API placeholder user the action name
    if (activity.channelData?.type === "ActionCall") {
        const actionCall = activity.channelData as TranscriptActionCall
        return actionCall.actionName
    }
    // If entities have been set, substitute entityIDs in before hashing
    else if (filledEntities && filledEntities.length > 0) {
        const filledEntityMap = DialogUtils.filledEntityIdMap(filledEntities, entities)
        return importTextWithEntityIds(activity.text, filledEntityMap)
    }
    // Default to raw text
    return activity.text
}

// Substibute entityIds into imported text when text matches entity value
export function importTextWithEntityIds(importText: string, valueMap: Map<string, string>) {

    let outText = importText.slice()
    valueMap.forEach((value: string, entityId: string) => {
        outText = outText.replace(value, entityId)
    })
    return outText
}

// Look for imported actions in TrainDialog and attempt to replace them
// with existing actions.  Return true if any replacement occurred
export function replaceImportActions(trainDialog: CLM.TrainDialog, actions: CLM.ActionBase[], entities: CLM.EntityBase[]): boolean {

    // Filter out actions that have no hash lookups. If there are none, terminate early
    const actionsWithHash = actions.filter(a => a.clientData?.actionHashes && a.clientData.actionHashes.length > 0)
    if (actionsWithHash.length === 0) {
        return false
    }

    // Now swap any actions that match
    let match = false
    trainDialog.rounds.forEach(round => {
        round.scorerSteps.forEach(scorerStep => {

            let foundAction = findActionFromScorerStep(scorerStep, actionsWithHash, entities)

            // If action found replace labelled action with match
            if (foundAction) {
                scorerStep.labelAction = foundAction.actionId
                delete scorerStep.importText
                match = true
            }
        })
    })
    return match
}

export function expandLGItems(trainDialog: CLM.TrainDialog, lgItems: CLM.LGItem[]): void {
    for (const round of trainDialog.rounds) {
        for (const scorerStep of round.scorerSteps) {
            const lgName = scorerStep.importText ? lgNameFromImportText(scorerStep.importText) : null
            if (lgName) {
                let lgItem = lgItems.find(lg => lg.lgName === lgName)
                if (lgItem) {
                    scorerStep.importText = lgItem.text
                }
            }
        }
    }
}
function lgNameFromImportText(importText: string): string {
    return importText.substring(importText.indexOf("[") + 1, importText.lastIndexOf("]")).trim()
}

// Attempt to find action for the given scorer step
function findActionFromScorerStep(scorerStep: CLM.TrainScorerStep, actions: CLM.ActionBase[], entities: CLM.EntityBase[]): CLM.ActionBase | undefined {

    let hashText: string | null = null

    // If replacing imported action
    if (scorerStep.importText) {

        // If importText is an lgName try to look it up in existing actions
        const lgName = lgNameFromImportText(scorerStep.importText)
        if (lgName) {
            const action = actions.find(a => a.clientData?.lgName === lgName)
            if (action) {
                return action
            }
        }
        // Otherwise substitue entityIds back into import text to build import hash lookup
        const filledEntityMap = DialogUtils.filledEntityIdMap(scorerStep.input.filledEntities, entities)
        hashText = importTextWithEntityIds(scorerStep.importText, filledEntityMap)
    }
    // If replacing placeholder action
    else if (scorerStep.labelAction && CLM.ActionBase.isPlaceholderAPI(scorerStep.scoredAction)) {
        const apiAction = new CLM.ApiAction(scorerStep.scoredAction as any)
        hashText = apiAction.name
    }

    if (hashText) {
        return findActionFromHashText(hashText, actions)
    }

    return undefined
}

/**
 * Holds information about enum entities that should be set in a TrainDialog after a round containing
 * an API action with known output values.
 */
interface EnumDataFromCondition {
    enumEntityId: string
    enumValueId: string
    enumValueText: string
}

/**
 * Creates actions for the input `TrainDialog`.
 * Imports happen in 2 stages : in the first, TrainDialogs are created with placeholder actions that
 * are only stored in UI component state memory.  In the second, real actions are created either
 * interactively or automatically -- the latter invokes this function.
 * 
 * @param scorerStepConditions a map of `TrainScorerStep.importId` values to `Condition`s that should
 *   be set on the generated action
 */
export async function createImportedActions(
    appId: string,
    trainDialog: CLM.TrainDialog,
    templates: CLM.Template[],
    lgItems: CLM.LGItem[] | undefined,
    actions: CLM.ActionBase[],
    scorerStepConditions: { [key: string]: CLM.Condition[] } | undefined,
    createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>,
): Promise<void> {
    const newActions: CLM.ActionBase[] = []
    for (const round of trainDialog.rounds) {
        for (const [scoreIndex, scorerStep] of round.scorerSteps.entries()) {
            if (!scorerStep.importText) {
                continue
            }
            // First check to see if matching action already exists.
            let action = findActionFromScorerStep(scorerStep, [...newActions, ...actions], [])

            // If not, create a new one.
            if (!action) {
                const isTerminal = round.scorerSteps.length === scoreIndex + 1
                let importedAction: ImportedAction | undefined
                if (lgItems) {
                    const lgName = lgNameFromImportText(scorerStep.importText)
                    if (lgName) {
                        let lgItem = lgItems.find(lg => lg.lgName === lgName)
                        if (lgItem) {
                            importedAction = {
                                text: lgItem.text,
                                buttons: lgItem.suggestions,
                                isTerminal,
                                reprompt: lgItem.suggestions.length > 0,
                                lgName
                            }
                        }
                        else {
                            // LARS thow error once CCI .dialog transformer has been fixed
                            lgItem = { lgName: "", text: "Can't Parse LG", suggestions: [] }
                            //throw new Error(`LG name ${prompt} undefined`)
                        }
                    }
                }
                if (!importedAction) {
                    importedAction = {
                        text: scorerStep.importText,
                        buttons: [],
                        isTerminal,
                        reprompt: false,
                        actionHash: CLM.hashText(scorerStep.importText)
                    }
                }
                action = await createActionFromImport(appId, importedAction, templates, scorerStep, scorerStepConditions, createActionThunkAsync)
                newActions.push(action)
            }

            // Update scorer step
            scorerStep.labelAction = action.actionId
            delete scorerStep.importText
        }
    }
}

/**
 * Updates memory state by setting `logicResult` in the `TrainDialog` `TrainScorerSteps` for cases where
 * the dialog produces a deterministic output from an API call.
 */
export function setMemoryStateForImportedTrainDialog(
    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    trainDialog: CLM.TrainDialog,
    scorerStepConditions: { [key: string]: CLM.Condition[] } | undefined) {
    if (!scorerStepConditions) {
        // If this is undefined, then there were no SwithCondition nodes in our imported dialog, so nothing to do.
        return
    }
    for (const round of trainDialog.rounds) {
        setMemoryStateForApiActionWithSwitch(entities, actions, round.scorerSteps, scorerStepConditions)
    }
}

/**
 * Updates memory state for a single `TrainRound`.  Specifically, if we have an API action followed by
 * a `SwitchCondition` node that consumes the output of that API, we know that each branch of the dialog
 * should represent a scenario where the API has returned the given conditional value.  This code sets
 * that conditional value in bot memory. 
 */
function setMemoryStateForApiActionWithSwitch(
    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    scorerSteps: CLM.TrainScorerStep[],
    scorerStepConditions: { [key: string]: CLM.Condition[] }) {
    for (let i = 0; i < scorerSteps.length - 1; i = i + 1) {
        if (!scorerSteps[i].labelAction) {
            // Need a labelAction to figure out which action is associated with the scorer step.
            continue
        }
        const j = i + 1
        if (j >= scorerSteps.length) {
            // There is no next action; we're done.
            break
        }
        const actionId1 = scorerSteps[i].labelAction
        const action1 = actions.find(a => a.actionId === actionId1)
        if (!action1 || action1.actionType !== CLM.ActionTypes.API_LOCAL) {
            // We only care about API actions followed by SwitchCondition-gated nodes.
            continue
        }
        const scorerStep = scorerSteps[i]
        const nextScorerStep = scorerSteps[j]
        if (!nextScorerStep.importId || !scorerStepConditions[nextScorerStep.importId]) {
            // The next action is not a SwitchCondition-gated node.
            continue
        }
        // Set the logic result on the *current* scorer step.
        if (!scorerStep.logicResult) {
            scorerStep.logicResult = { logicValue: undefined, changedFilledEntities: [] }
        }
        // Get conditions from the SwitchCondition-gated node.
        const conditions = scorerStepConditions[nextScorerStep.importId]
        const enumConditionData = conditions.map(condition => getEnumConditionData(entities, condition))
        for (const conditionEntity of enumConditionData) {
            const filledEntity: CLM.FilledEntity = {
                entityId: conditionEntity.enumEntityId,
                values: [{
                    userText: conditionEntity.enumValueText,
                    displayText: conditionEntity.enumValueText,
                    builtinType: null,
                    resolution: null,
                    enumValueId: conditionEntity.enumValueId
                }]
            }
            scorerStep.logicResult.changedFilledEntities.push(filledEntity)
        }
    }
}

/**
 * Gets the enum entity and enum value associated with the given conditions.
 * @throws if the entity referenced in any `Condition` is not a valid enum.
 */
function getEnumConditionData(entities: CLM.EntityBase[], condition: CLM.Condition): EnumDataFromCondition {
    if (!condition.valueId) {
        // This should not happen; conditions created from conditions in .dialog import should always reference enum entities.
        throw new Error(`Action condition doesn't reference an entity`)
    }
    // Find the entity.
    const conditionEntity = entities.find(e => e.entityId === condition.entityId)
    if (!conditionEntity) {
        throw new Error(`Couldn't find entity with id ${condition.entityId}`)
    }
    if (conditionEntity.entityType !== CLM.EntityType.ENUM || !conditionEntity.enumValues) {
        // This should not happen; entities created from conditions in .dialog import should always be enum.
        throw new Error(`Entity ${conditionEntity.entityId} is not a valid enum`)
    }
    // Find the specific enum value referenced by the condition.
    const enumValue = conditionEntity.enumValues.find(val => val.enumValueId === condition.valueId)
    if (!enumValue) {
        throw new Error(`Enum entity ${conditionEntity.entityName} missing enum value ${condition.valueId}`)
    }
    return {
        enumEntityId: condition.entityId,
        enumValueId: condition.valueId,
        enumValueText: enumValue.enumValue,
    }
}

/**
 * Creates a real action for an `ImportedAction` action placeholder.
 * 
 * @param scorerStepConditions a map of `TrainScorerStep.importId` values to `Condition`s that should
 *   be set on the generated action
 */
async function createActionFromImport(
    appId: string,
    importedAction: ImportedAction,
    templates: CLM.Template[],
    scorerStep: CLM.TrainScorerStep,
    scorerStepConditions: { [key: string]: CLM.Condition[] } | undefined,
    createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>,
): Promise<CLM.ActionBase> {

    const template = DialogUtils.bestTemplateMatch(importedAction, templates)
    const actionType = template ? CLM.ActionTypes.CARD : CLM.ActionTypes.TEXT
    const repromptActionId = template && importedAction.buttons.length > 0 ? REPROMPT_SELF : undefined
    const textValue = Plain.deserialize(`${importedAction.text}`)
    let payload: string | null = null

    // If a template was found, create a CARD action
    if (template) {
        const actionArguments: CLM.IActionArgument[] = []

        // Put text on first TextBody or TextBlock variable
        const textBody = template.variables.find(v => v.type === "TextBody" || v.type === "TextBlock")
        if (textBody) {
            const title = Plain.deserialize(importedAction.text)
            actionArguments.push({ parameter: textBody.key, value: { json: title.toJSON() } })
        }

        // Map additional variables to buttons
        if (importedAction.buttons.length > 0) {
            const buttons = importedAction.buttons.map(t => Plain.deserialize(t))
            buttons.forEach((button, index) => {
                if ((index + 1) < template.variables.length) {
                    actionArguments.push({ parameter: template.variables[index + 1].key, value: { json: button.toJSON() } })
                }
            })
        }
        const cp: CLM.CardPayload = {
            payload: template.name,
            arguments: actionArguments
        }
        payload = JSON.stringify(cp)
    }
    // Otherwise create ordinary text action
    else {
        const tp: CLM.TextPayload = {
            json: textValue.toJSON()
        }
        payload = JSON.stringify(tp)
    }

    const action = new CLM.ActionBase({
        actionId: null!,
        payload,
        createdDateTime: new Date().toJSON(),
        isTerminal: importedAction.isTerminal,
        repromptActionId,
        requiredEntitiesFromPayload: [],
        requiredEntities: [],
        negativeEntities: [],
        requiredConditions: [],
        negativeConditions: [],
        suggestedEntity: undefined,
        version: 0,
        packageCreationId: 0,
        packageDeletionId: 0,
        actionType,
        entityId: undefined,
        enumValueId: undefined,
        clientData: {
            actionHashes: importedAction.actionHash ? [importedAction.actionHash] : [],
            lgName: importedAction.lgName
        }
    })
    if (scorerStep.importId && scorerStepConditions?.[scorerStep.importId]) {
        action.requiredConditions = scorerStepConditions[scorerStep.importId]
    }

    const newAction = await createActionThunkAsync(appId, action)
    if (!newAction) {
        throw new Error("Unable to create action")
    }
    return newAction
}

// NOTE: eventually LGItems could be adaptive cards
export function importedActionFromImportText(importText: string, isTerminal: boolean): ImportedAction {
    // Could be JSON object or just string
    try {
        const lgItem: CLM.LGItem = JSON.parse(importText)
        // Assume reprompt if item has buttons
        return { text: lgItem.text, buttons: lgItem.suggestions, isTerminal, reprompt: lgItem.suggestions.length > 0 }
    }
    catch (e) {
        // Assume no repropmt for plain text
        return { text: importText, buttons: [], isTerminal, reprompt: false }
    }
}

// Search for an action by hash
export function findActionFromHashText(hashText: string, actions: CLM.ActionBase[]): CLM.ActionBase | undefined {

    const importHash = CLM.hashText(hashText)

    // Try to find matching action with same hash
    let matchedActions = actions.filter(a => {
        return a.clientData?.actionHashes?.includes(importHash)
    })

    // If more than one, prefer the one that isn't a placeholder
    if (matchedActions.length > 1) {
        matchedActions = matchedActions.filter(ma => !CLM.ActionBase.isPlaceholderAPI(ma))
    }

    return matchedActions[0]
}

// Transcripts are partials of partials of BB.Activity, so RecusivePartial
export function areTranscriptsEqual(transcript1: Util.RecursivePartial<BB.Activity>[], transcript2: Util.RecursivePartial<BB.Activity>[], excessOk: boolean = false): boolean {
    if (!excessOk && transcript1.length !== transcript2.length) {
        return false
    }
    if (transcript1.length === 0 || transcript2.length === 0) {
        throw new Error("Transcript has no turns")
    }
    if (!transcript1[0].conversation || !transcript2[0].conversation) {
        throw new Error("Not a valid transcript. Conversation not defined")
    }
    if (transcript1[0].conversation.id !== transcript2[0].conversation.id) {
        throw new Error("Not a valid comparison.  ConversationIds do not match.")
    }
    if (transcript1[0].channelId === transcript2[0].channelId) {
        throw new Error("Not a valid comparison.  Same channel.")
    }
    for (let i = 0; i < Math.min(transcript1.length, transcript2.length); i = i + 1) {
        const activity1 = transcript1[i]
        const activity2 = transcript2[i]
        if (activity1.type !== activity2.type) {
            return false
        }
        if (!activity1.from || !activity2.from) {
            throw new Error("Not a valid transcript.  Has no from")
        }
        if (activity1.from.role !== activity2.from.role) {
            return false
        }
        if (activity1.text !== activity2.text) {
            // If different user input, not a valid comparison
            if (activity1.from.role === "user") {
                throw new Error("Not a valid comparison.  Inconsistent User Input")
            }
            // If different bot reponse, transcripts are different
            else {
                return false
            }
        }
    }
    return true
}

/**
 * Given the {entityName, entityValue} results from some action being imported, returns
 * an array of FilledEntity instances representing those results.
 * Entities that do not yet exist will be created and added to `entities`.
 */
export async function importActionOutput(
    actionResults: OBIActionOutput[],
    entities: CLM.EntityBase[],
    appId: string,
    createEntityThunkAsync?: ((appId: string, entity: CLM.EntityBase) => Promise<CLM.EntityBase | null>)
): Promise<CLM.FilledEntity[]> {

    const filledEntities: CLM.FilledEntity[] = []

    for (const actionResult of actionResults) {
        // Check if entity already exists
        const foundEntity = entities.find(e => e.entityName === actionResult.entityName)
        let entityId: string = ""
        if (foundEntity) {
            entityId = foundEntity.entityId
        }
        // If create function provided, create a new enity for the missing entity
        else if (createEntityThunkAsync) {
            // If it doesn't exist create a new one
            const newEntity: CLM.EntityBase = {
                entityId: undefined!,
                entityName: actionResult.entityName,
                resolverType: "none",
                createdDateTime: new Date().toJSON(),
                lastModifiedDateTime: new Date().toJSON(),
                isResolutionRequired: false,
                isMultivalue: false,
                isNegatible: false,
                negativeId: null,
                positiveId: null,
                entityType: CLM.EntityType.LOCAL,
                version: null,
                packageCreationId: null,
                packageDeletionId: null,
                doNotMemorize: false
            }

            entityId = await ((createEntityThunkAsync(appId, newEntity) as any) as Promise<string>)
            if (!entityId) {
                throw new Error("Invalid Entity Definition")
            }
            // Record the created entity in the input entity list.
            newEntity.entityId = entityId
            entities.push(newEntity)
        }
        else {
            entityId = "UNKNOWN ENTITY"
        }
        const memoryValue: CLM.MemoryValue = {
            userText: actionResult.value ? actionResult.value : null,
            displayText: null,
            builtinType: null,
            resolution: {}
        }
        const filledEntity: CLM.FilledEntity = {
            entityId,
            values: [memoryValue]
        }
        filledEntities.push(filledEntity)
    }
    return filledEntities
}
