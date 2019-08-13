/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as BB from 'botbuilder'
import * as Util from './util'
import * as TranscriptUtils from './transcriptUtils'  //LARS merge with OBI utis
import Plain from 'slate-plain-serializer'
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

export interface OBIImportFiles {
    appId: string,
    files: File[]
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

export class ObiDialogParser {
    private composerDialog: ComposerDialog
    private appId: string
    private actions: CLM.ActionBase[] = []
    //LARSprivate entities: CLM.EntityBase[] = []
    private createActionThunkAsync: ((appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>) | undefined
    //LARSprivate createEntityThunkAsync: (appId: string, entity: CLM.EntityBase) => Promise<CLM.EntityBase | null>
    
    constructor(
        appId: string,
        createActionThunkAsync?: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>,
        createEntityThunkAsync?: (appId: string, entity: CLM.EntityBase) => Promise<CLM.EntityBase | null>
    ) {
        this.appId = appId
        this.createActionThunkAsync = createActionThunkAsync
        //LARSthis.createEntityThunkAsync = createEntityThunkAsync
    }

    async getTrainDialogsFromComposer(files: File[]): Promise<CLM.TrainDialog[] | null> {
    
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
                this.addToLUMap(fileText, luMap)
            }
            else if (file.name.endsWith('.lg')) {
                const fileText = await Util.readFileAsync(file)
                this.addToLGMap(fileText, lgMap)
            }
        }
    
        this.composerDialog = {
            dialogs,
            luMap,
            lgMap
        }
    
        const mainDialog = this.composerDialog.dialogs.find(d => d.$id === "Entry.main")
        if (!mainDialog) {
            return null
        }
    
        return this.getTrainDialogsfromOBIDialog(mainDialog)
    }
    
    private addToLUMap(text: string, luMap: Map<string, string[]>): any {
        const keys = text.split('##')
        for (const key of keys) {
            if (!key.startsWith(">")) {
                const inputs = key.split('- ').map(i => i.trim())
                luMap.set(inputs[0], inputs.slice(1))
            }
        }
        return luMap
    }
    
    private addToLGMap(text: string, lgMap: Map<string, LGItem>): any {
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
    
    private async getTrainDialogsfromOBIDialog(obiDialog: OBIDialog): Promise<CLM.TrainDialog[]> {
    
        let trainDialogs: CLM.TrainDialog[] = []
        if (obiDialog.rules) {
            for (const rule of obiDialog.rules) {
                if (rule.$type === "Microsoft.IntentRule") {
    
                    const textVariations = this.getTextVariations(rule.intent!)
                    const extractorStep: CLM.TrainExtractorStep = {
                        textVariations: textVariations
                    }
    
                    if (rule.steps) {
                        for (const step of rule.steps) {
                            if (typeof step === "string") {
                                throw new Error("Unexpected string step")
                            }
                            else {
                                if (step.$type === "Microsoft.BeginDialog" && typeof step.dialog === "string") {
                                    
                                    const subDialog =  this.composerDialog.dialogs.find(d => d.$id === step.dialog)
                                    if (!subDialog) {
                                        throw new Error(`Dialog name ${step.dialog} undefined`)
                                    }
    
                                    const childDialogs = await this.getTrainDialogsfromOBIDialog(subDialog)
                                    
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
                        }
                    }
                }
            }
        }
        let trainRound: CLM.TrainRound | undefined
        if (obiDialog.steps) {
            for (const step of obiDialog.steps) {
                if (typeof step === "string") {
                    throw new Error("Unexected step of type string")
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
                    const scorerStep = await this.getScorerStepfromActivity(step.activity)
                    trainRound.scorerSteps.push(scorerStep)
                }
                else if (step.$type === "Microsoft.TextInput") {
                    if (!trainRound) {
                        trainRound = {
                            extractorStep: { textVariations: [] },
                            scorerSteps: []
                        }
                    }
                    if (!step.prompt) {
                        throw new Error("Expected activity to be set")
                    }
                    const scorerStep = await this.getScorerStepfromActivity(step.prompt)
                    trainRound.scorerSteps.push(scorerStep)
                }
                else if (step.$type === "Microsoft.BeginDialog") {
                    const subDialog =  this.composerDialog.dialogs.find(d => d.$id === step.dialog)
                    if (!subDialog) {
                        throw new Error(`Dialog name ${step.dialog} undefined`)
                    }

                    const childDialogs = await this.getTrainDialogsfromOBIDialog(subDialog)
                    
                    // Add children to train dialog list
                    trainDialogs = [...trainDialogs, ...childDialogs]
                }
                else if (step.$type !== "Microsoft.EndTurn") {
                    console.log(`Unhandled OBI Type: ${step.$type}`)
                }
            }
            if (trainRound) {
                if (trainDialogs.length === 0) {
                    trainDialogs.push(this.makeEmptyTrainDialog())
                }
                for (const td of trainDialogs) {
                    // If susequent round has no extractor step, just prepend scorer steps
                    if (td.rounds.length > 0 && td.rounds[0].extractorStep.textVariations.length === 0) {
                        td.rounds[0].scorerSteps = [...trainRound.scorerSteps, ...td.rounds[0].scorerSteps]
                    }
                    // Otherwise prepend round
                    else {
                        td.rounds = [trainRound, ...td.rounds]
                    }
                }
            }
        }
        return trainDialogs
    }
    
    private async getScorerStepfromActivity(prompt: string): Promise<CLM.TrainScorerStep> {
    
        const parsedActivity = prompt.substring(prompt.indexOf("[") + 1, prompt.lastIndexOf("]")).trim()
        let response = this.composerDialog.lgMap.get(parsedActivity)
        if (!response) {
            response = { text: "Can't Parse LU", suggestions: []}
           //LARS temp throw new Error(`LU name ${prompt} undefined`)
        }
    
        let scoredAction: CLM.ScoredAction | undefined
        if (this.createActionThunkAsync) {
            const action = await this.getActionFromLG(response, true)
            if (action) {
                scoredAction = {
                    actionId: action.actionId,
                    payload: action.payload,
                    isTerminal: action.isTerminal,
                    actionType: CLM.ActionTypes.TEXT,
                    score: 1
                }
            }
        }
    
        let scoreInput: CLM.ScoreInput = {
            filledEntities: [],  //LARS handle filled entities from api calls
            context: {},
            maskedActions: []
        }
    
        const importText = response.suggestions.length > 0 ? JSON.stringify(response) : response.text
        return {
            importText,
            input: scoreInput,
            labelAction: CLM.CL_STUB_IMPORT_ACTION_ID,
            logicResult: undefined,  // LARS handle api calls
            scoredAction
        }
    
    }
    
    // Generate action directly from LG
    private async getActionFromLG(lg: LGItem, isTerminal: boolean): Promise<CLM.ActionBase | undefined> {
    
        let action = TranscriptUtils.findActionFromHashText(lg.text, this.actions)
        if (!action && this.createActionThunkAsync) {

            const tp: CLM.TextPayload = {
                json: Plain.deserialize(lg.text)
            }
            const payload = JSON.stringify(tp)

            const actionBody = new CLM.ActionBase({
                actionId: null!,
                payload,
                createdDateTime: new Date().toJSON(),
                isTerminal,
                requiredEntitiesFromPayload: [],
                requiredEntities: [],
                negativeEntities: [],
                requiredConditions: [],
                negativeConditions: [],
                suggestedEntity: undefined,
                version: 0,
                packageCreationId: 0,
                packageDeletionId: 0,
                actionType: CLM.ActionTypes.TEXT,
                entityId: undefined,
                enumValueId: undefined,
                clientData: { importHashes: [Util.hashText(lg.text)]}
            })
            const newAction = await this.createActionThunkAsync(this.appId, actionBody)
            if (!newAction) {
                throw new Error("Unable to create action")
            }
            this.actions.push(newAction)
            return newAction
        }
        return action
    }

    private getTextVariations(intentName: string) {
        let userInputs = this.composerDialog.luMap.get(intentName)
        if (!userInputs) {
            throw new Error (`Intent name ${intentName} undefined`)
        }
        // Programatically fired events have no intent
        // Use intent name for now LARS
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
    
}

async function getHistory(appId: string, trainDialog: CLM.TrainDialog, user: User, definitions: CLM.AppDefinition,
    fetchHistoryAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean) => Promise<CLM.TeachWithHistory>
    ): Promise<BB.Transcript> {
    const newTrainDialog = Util.deepCopy(trainDialog)
    newTrainDialog.definitions = definitions

    const teachWithHistory = await fetchHistoryAsync(appId, newTrainDialog, user.name, user.id, false)
    return { activities: teachWithHistory.history }
}