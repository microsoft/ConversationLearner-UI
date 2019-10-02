/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as BB from 'botbuilder'
import * as Util from './util'
import * as DialogEditing from './dialogEditing'
import * as DialogUtils from './dialogUtils'
import * as OBITypes from '../types/obiTypes'
import Plain from 'slate-plain-serializer'
import { REPROMPT_SELF } from '../types/const'
import { ImportedAction } from '../types/models'
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

export interface ComposerDialog {
    dialogs: OBITypes.OBIDialog[]
    luMap: Map<string, string[]>
    lgMap: Map<string, CLM.LGItem>
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
    fetchLogDialogThunkAsync: (appId: string, logDialogId: string, replaceLocal: boolean, nullOnNotFound: boolean) => Promise<CLM.LogDialog>,
    fetchActivitiesAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean) => Promise<CLM.TeachWithActivities>
    ): Promise<Util.RecursivePartial<BB.Activity>[]> {

    // Fetch the LogDialog
    const logDialog = await fetchLogDialogThunkAsync(appId, logDialogId, true, true)
    if (!logDialog) {
        return []
    }

    // Convert to TrainDialog
    const trainDialog = CLM.ModelUtils.ToTrainDialog(logDialog, actions, entities)

    // Return activities
    const teachWithActivities = await fetchActivitiesAsync(appId, trainDialog, user.name, user.id, false)
    const activites = teachWithActivities.activities
    if (conversationId || channelId) {
        addActivityReferences(activites, conversationId, channelId)
    }
    return activites
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
export async function lgMapFromLGFiles(lgFiles: File[] | null, lgMap?: Map<string, CLM.LGItem>): Promise<Map<string, CLM.LGItem>> {
    const map = lgMap || new Map<string, CLM.LGItem>()
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

// Given a transcript file, replace and LG references with actual LG content
// Returns true is any LG substitutions were made
export function substituteLG(transcript: BB.Activity[], lgMap: Map<string, CLM.LGItem>): boolean {

    let usedLG = false
    for (let activity of transcript) {
        if (activity.type && activity.type === 'message' && activity.from.role === 'bot') {

            if (activity.text && activity.text.startsWith('[') && activity.text.endsWith(']')) {
                usedLG = true
                const lgName = activity.text.substring(activity.text.indexOf("[") + 1, activity.text.lastIndexOf("]")).trim()
                let response = lgMap.get(lgName)
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

// Convert .transcript file into a TrainDialog
export async function trainDialogFromTranscriptImport(
    transcript: BB.Activity[],
    lgMap: Map<string, CLM.LGItem> | null,
    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    app: CLM.AppBase,

    createActionThunkAsync?: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>,
    createEntityThunkAsync?: (appId: string, entity: CLM.EntityBase) => Promise<CLM.EntityBase | null>
): Promise<CLM.TrainDialog> {
    const transcriptHash = Util.hashText(JSON.stringify(transcript))

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
    if (lgMap) {
        substituteLG(transcript, lgMap)
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
                if (activity.channelData && activity.channelData.textVariations) {
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
                if (activity.channelData && activity.channelData.type === "ActionCall") {
                    const actionCall = activity.channelData as TranscriptActionCall
                    const isTerminal = !nextActivity || nextActivity.from.role === "user"

                    if (!action) {
                        action = await DialogEditing.getPlaceholderAPIAction(app.appId, actionCall.actionName, isTerminal, actions, createActionThunkAsync as any)
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

                        const actionFilledEntities = await importActionOutput(actionCall.actionOutput, entities, app, createEntityThunkAsync)
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
    if (activity.channelData && activity.channelData) {
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

// Return hash text for the given activity
export function hashTextFromActivity(activity: BB.Activity, entities: CLM.EntityBase[], filledEntities: CLM.FilledEntity[] | undefined): string {

    // If an API placeholder user the action name
    if (activity.channelData && activity.channelData.type === "ActionCall") {
        const actionCall = activity.channelData as TranscriptActionCall
        return actionCall.actionName
    }
    // If entites have been set, substitute entityIDs in before hashing
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
    const actionsWithHash = actions.filter(a => a.clientData != null && a.clientData.importHashes && a.clientData.importHashes.length > 0)
    if (actionsWithHash.length === 0) {
        return false
    }

    // Now swap any actions that match
    let match = false
    trainDialog.rounds.forEach(round => {
        round.scorerSteps.forEach(scorerStep => {

            let foundAction = findActionFromScorerStepHash(scorerStep, actionsWithHash, entities)

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

// Attempt to find action for the given scorer step
function findActionFromScorerStepHash(scorerStep: CLM.TrainScorerStep, actions: CLM.ActionBase[], entities: CLM.EntityBase[]): CLM.ActionBase | undefined {

    let hashText: string | null = null

    // If replacing imported action
    if (scorerStep.importText) {
        // Substitue entityIds back into import text to build import hash lookup
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

// Replace imported actions in TrainDialog with real Actions
export async function createImportedActions(
    appId: string,
    trainDialog: CLM.TrainDialog,
    templates: CLM.Template[],
    createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>,
): Promise<void> {

    const newActions: CLM.ActionBase[] = []
    for (const round of trainDialog.rounds) {
        for (let scoreIndex = 0; scoreIndex < round.scorerSteps.length; scoreIndex = scoreIndex + 1) {
            const scorerStep = round.scorerSteps[scoreIndex]

            if (scorerStep.importText) {
                let action: CLM.ActionBase | undefined

                // First check to see if matching action already exists
                // TODO: Support for entities / entity substitution
                action = findActionFromScorerStepHash(scorerStep, newActions, [])

                // Otherwise create a new one
                if (!action) {
                    const isTerminal = round.scorerSteps.length === scoreIndex + 1
                    const importedAction = importedActionFromImportText(scorerStep.importText, isTerminal)
                    action = await createActionFromImport(appId, importedAction, scorerStep.importText, templates, createActionThunkAsync)
                    newActions.push(action)
                }

                // Update scorer step
                scorerStep.labelAction = action.actionId
                delete scorerStep.importText
            }
        }
    }
}

// Greated an real action for an imported one, looking for a matching template
async function createActionFromImport(
    appId: string,
    importedAction: ImportedAction,
    importText: string,
    templates: CLM.Template[],
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
        clientData: { importHashes: [Util.hashText(importText)] }
    })

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

    const importHash = Util.hashText(hashText)

    // Try to find matching action with same hash
    let matchedActions = actions.filter(a => {
        return a.clientData && a.clientData.importHashes && a.clientData.importHashes.indexOf(importHash) > -1
    })

    // If more than one, prefer the one that isn't a placeholder
    if (matchedActions.length > 1) {
        matchedActions = matchedActions.filter(ma => !CLM.ActionBase.isPlaceholderAPI(ma))
    }

    return matchedActions[0]
}

// Transcripts are partials of partials of BB.Activity, so RecusivePartial
export function areTranscriptsEqual(transcript1: Util.RecursivePartial<BB.Activity>[], transcript2: Util.RecursivePartial<BB.Activity>[]): boolean {
    if (transcript1.length !== transcript2.length) {
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
    for (let i = 0; i < transcript1.length; i = i + 1) {
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
 * Entities that do not yet exist will be created once.
 */
export async function importActionOutput(
    actionResults: OBIActionOutput[],
    entities: CLM.EntityBase[],
    app: CLM.AppBase,
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

            entityId = await ((createEntityThunkAsync(app.appId, newEntity) as any) as Promise<string>)
            if (!entityId) {
                throw new Error("Invalid Entity Definition")
            }
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
