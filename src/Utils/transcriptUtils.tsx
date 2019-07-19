/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as BB from 'botbuilder'
import * as Util from './util'
import * as DialogEditing from './dialogEditing'
import * as DialogUtils from './dialogUtils'

interface TranscriptActionInput {
    entityName: string
}

interface TranscriptActionCall {
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
    for (let index = 0; index < transcript.length; index = index + 1) {
        const activity = transcript[index]
        const nextActivity = transcript[index + 1]
        // TODO: Handle conversation updates
        if (!activity.type || activity.type === "message") {
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
                let action: CLM.ActionBase | undefined | null = DialogUtils.importedActionMatch(activity.text, actions)
                let filledEntities: CLM.FilledEntity[] = []
                let logicResult: CLM.LogicResult | undefined

                // If I didn't find an action and is API, create API stub
                if (!action && activity.channelData && activity.channelData.type === "ActionCall") {
                    const actionCall = activity.channelData as TranscriptActionCall
                    const isTerminal = !nextActivity || nextActivity.from.role === "user"
                    action = await DialogEditing.getStubAPIAction(app.appId, actionCall.actionName, isTerminal, actions, createActionThunkAsync as any)

                    // Store stub API output in LogicResult
                    logicResult = {
                        logicValue: undefined,
                        changedFilledEntities: await importActionOutput(actionCall.actionOutput, entities, app, createEntityThunkAsync),
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
                    logicResult: logicResult,
                    scoredAction: undefined
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

async function importActionOutput(
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