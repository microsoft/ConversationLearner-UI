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
import { User } from '../types'

export async function toTranscripts(
    appDefinition: CLM.AppDefinition, 
    appId: string,
    user: User,
    fetchHistoryAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean) => Promise<CLM.TeachWithHistory>
    ): Promise<BB.Transcript[]> {

    const definitions = {
        entities: appDefinition.entities,
        actions: appDefinition.actions,
        trainDialogs: []
    }

    return Promise.all(appDefinition.trainDialogs.map(td => getHistory(appId, td, user, definitions, fetchHistoryAsync)))
}

export interface OBIImportData {
    appId: string,
    files: File[],
    autoCreate: boolean,
    autoMerge: boolean
}

export interface LGItem {
    text: string,
    suggestions: string[]
}

export interface ComposerDialog {
    dialogs: OBITypes.OBIDialog[]
    luMap: Map<string, string[]>
    lgMap: Map<string, LGItem>
}

async function getHistory(appId: string, trainDialog: CLM.TrainDialog, user: User, definitions: CLM.AppDefinition,
    fetchHistoryAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean) => Promise<CLM.TeachWithHistory>
    ): Promise<BB.Transcript> {
    const newTrainDialog = Util.deepCopy(trainDialog)
    newTrainDialog.definitions = definitions

    const teachWithHistory = await fetchHistoryAsync(appId, newTrainDialog, user.name, user.id, false)
    return { activities: teachWithHistory.history }
}

interface TranscriptActionInput {
    entityName: string
}

export interface TranscriptActionCall {
    type: string
    actionName: string
    actionInput: TranscriptActionInput[]
    actionOutput: TranscriptActionOutput[]
}

interface TranscriptActionOutput {
    entityName: string,
    value: string
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

// Convert .transcript file into a TrainDialog
export async function trainDialogFromTranscriptImport(
    transcript: BB.Activity[],
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
        clientData: {importHashes: [transcriptHash]}
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
                const hashText = hashTextFromActivity(activity, entities, nextFilledEntities)
                let action: CLM.ActionBase | undefined | null = findActionFromHashText(hashText, actions)
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
                    if (!action) {
                        throw new Error("Unable to create API placeholder Action")
                    }

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
                const newAction = findActionFromHashText(hashText, actionsWithHash)

                // If action exists replace labelled action with match
                if (newAction) {
                    scorerStep.labelAction = newAction.actionId
                    delete scorerStep.importText
                    match = true
                }
            }
        })
    })
    return match
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

export async function importActionOutput(
    actionResults: TranscriptActionOutput[], 
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
            userText: actionResult.value,
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