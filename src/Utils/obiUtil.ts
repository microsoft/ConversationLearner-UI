/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as BB from 'botbuilder'
import * as Util from './util'
import { User } from '../types'
import { OBIDialog } from '../types/obi/dialog';

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

export interface LGItem {
    text: string,
    suggestions: string[]
}

export interface ComposerDialog {
    dialogs: OBIDialog[]
    luMap: Map<string, string[]>
    lgMap: Map<string, LGItem>
}

function removeSuffix(text: string): string {
    let name = text.split('.')
    name.pop()
    return name.join('.')
}

export async function getTrainDialogsFromComposer(
    files: File[],
    createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>,
    createEntityThunkAsync: (appId: string, entity: CLM.EntityBase) => Promise<CLM.EntityBase | null>
    ): Promise<CLM.TrainDialog[] | null> {

    const dialogs: OBIDialog[] = []
    const luMap: Map<string, string[]> = new Map()
    const lgMap: Map<string, LGItem> = new Map()
    for (const file of files) {
        if (file.name.endsWith('.dialog')) {
            const fileText = await Util.readFileAsync(file)
            const obiDialog: OBIDialog = JSON.parse(fileText)
            // Set name, removing suffix
            obiDialog.$id = removeSuffix(file.name)
            dialogs.push(obiDialog)
        }
        else if (file.name.endsWith('.lu')) {
            const fileText = await Util.readFileAsync(file)
            addToLUMap(fileText, luMap)
        }
        else if (file.name.endsWith('.lg')) {
            const fileText = await Util.readFileAsync(file)
            addToLGMap(fileText, lgMap)
        }
    }

    const composerDialog = {
        dialogs,
        luMap,
        lgMap
    }

    const mainDialog = composerDialog.dialogs.find(d => d.$id === "Entry.main")
    if (!mainDialog) {
        return null
    }


    return getTrainDialogsfromOBIDialog(mainDialog, composerDialog, createActionThunkAsync, createEntityThunkAsync)
}

function addToLUMap(text: string, luMap: Map<string, string[]>): any {
    const keys = text.split('##')
    for (const key of keys) {
        if (!key.startsWith(">")) {
            const inputs = key.split('- ').map(i => i.trim())
            luMap.set(inputs[0], inputs.slice(1))
        }
    }
    return luMap
}

function addToLGMap(text: string, lgMap: Map<string, LGItem>): any {
    const items = text.split('# ')
    for (const item of items) {
        const key = item.substring(0, item.indexOf("-")).trim()
        const body = item.substring(item.indexOf("```") + 3, item.lastIndexOf("[")).trim()
        const suggestionList = item.substring(item.lastIndexOf("[Suggestions=") + 13, item.lastIndexOf("]"))
        const suggestions = suggestionList.length > 0 ? suggestionList.split('|') : []
        const output = {
            text: body,
            suggestions
        }
        lgMap.set(key, output)
    }
    return lgMap
}

function getTrainDialogsfromOBIDialog(
    obiDialog: OBIDialog,
    composerDialog: ComposerDialog,
    createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>,
    createEntityThunkAsync: (appId: string, entity: CLM.EntityBase) => Promise<CLM.EntityBase | null>
    ): CLM.TrainDialog[] {

    let trainDialogs: CLM.TrainDialog[] = []
    if (obiDialog.rules) {
        obiDialog.rules.forEach(rule => {
            if (rule.$type === "Microsoft.IntentRule") {

                const textVariations = getTextVariations(composerDialog, rule.intent!)
                const extractorStep: CLM.TrainExtractorStep = {
                    textVariations: textVariations
                }

                if (rule.steps) {
                    rule.steps.forEach(step => {
                        if (typeof step === "string") {
                            console.log("string todo")
                            //LARS todo
                        }
                        else {
                            if (step.$type === "Microsoft.BeginDialog" && typeof step.dialog === "string") {
                                
                                const subDialog =  composerDialog.dialogs.find(d => d.$id === step.dialog)
                                if (!subDialog) {
                                    throw new Error(`Dialog name ${step.dialog} undefined`)
                                }

                                const childDialogs = getTrainDialogsfromOBIDialog(subDialog, composerDialog, createActionThunkAsync, createEntityThunkAsync)
                                
                                // Add extractor step to all the children
                                childDialogs.forEach(td => {
                                    td.rounds[0].extractorStep = extractorStep
                                })

                                // Add children to train dialog list
                                trainDialogs = [...trainDialogs, ...childDialogs]
                            }
                            else if (step.$type === "Microsoft.SendActivity") {

                            }
                            else {
                                console.log(`Unhandled OBI Type: ${step.$type}`)
                            }
                        }
                    })
                }
            }
        })
    }
    let trainRound: CLM.TrainRound | undefined
    if (obiDialog.steps) {
        obiDialog.steps.forEach(step => {
            if (typeof step === "string") {
                console.log("string todo")
                //LARS todo
            }
            else if (step.$type === "Microsoft.SendActivity") {
                if (!trainRound) {
                    trainRound = {
                        extractorStep: { textVariations: [] },
                        scorerSteps: []
                    }
                }
                if (!step.activity) {
                    throw new Error("Expected activity to be set")
                }
                const scorerStep = getScorerStepfromActivity(step.activity, composerDialog)
                trainRound.scorerSteps.push(scorerStep)
            }
            else {
                console.log(`Unhandled OBI Type: ${step.$type}`)
            }
        })
        if (trainRound) {
            if (trainDialogs.length === 0) {
                trainDialogs.push(makeEmptyTrainDialog())
            }
            for (const td of trainDialogs) {
                td.rounds = [trainRound, ...td.rounds]
            }
        }
    }
    return trainDialogs
}

function getScorerStepfromActivity(activity: string, composerDialog: ComposerDialog): CLM.TrainScorerStep {

    const parsedActivity = activity.substring(activity.indexOf("[") + 1, activity.lastIndexOf("]")).trim()
    const response = composerDialog.lgMap.get(parsedActivity)
    if (!response) {
        throw new Error(`LU name ${activity} undefined`)
    }

    let scoreInput: CLM.ScoreInput = {
        filledEntities: [],  //LARS handle filled entities from api calls
        context: {},
        maskedActions: []
    }

    //LARS todo deal with "suggestions"
    return {
        importText: response.text,
        input: scoreInput,
        labelAction: CLM.CL_STUB_IMPORT_ACTION_ID,
        logicResult: undefined,  // LARS handle api calls
        scoredAction: undefined // LARS handle action creation
    }

}

function getTextVariations(composerDialog: ComposerDialog, intentName: string) {
    let userInputs = composerDialog.luMap.get(intentName)
    if (!userInputs) {
        throw new Error (`Intent name ${intentName} undefined`)
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

function makeEmptyTrainDialog(): CLM.TrainDialog {
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

async function getHistory(appId: string, trainDialog: CLM.TrainDialog, user: User, definitions: CLM.AppDefinition,
    fetchHistoryAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean) => Promise<CLM.TeachWithHistory>
    ): Promise<BB.Transcript> {
    const newTrainDialog = Util.deepCopy(trainDialog)
    newTrainDialog.definitions = definitions

    const teachWithHistory = await fetchHistoryAsync(appId, newTrainDialog, user.name, user.id, false)
    return { activities: teachWithHistory.history }
}