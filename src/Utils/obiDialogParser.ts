/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as Util from './util'
import * as OBIUtils from './obiUtils'  
import { OBIDialog } from '../types/obiTypes'

enum OBIStepType {
    TEXT_INPUT = "Microsoft.TextInput",
    BEGIN_DIALOG = "Microsoft.BeginDialog",
    END_TURN = "Microsoft.EndTurn",
    SEND_ACTIVITY = "Microsoft.SendActivity"
}

enum OBIRuleType {
    INTENT_RULE = "Microsoft.IntentRule"
}

export class ObiDialogParser {
    private composerDialog: OBIUtils.ComposerDialog

    async getTrainDialogs(files: File[]): Promise<CLM.TrainDialog[] | null> {

        const dialogs: OBIDialog[] = []
        const luMap: Map<string, string[]> = new Map()
        const lgMap: Map<string, CLM.LGItem> = new Map()
        for (const file of files) {
            if (file.name.endsWith('.dialog')) {
                const fileText = await Util.readFileAsync(file)
                const obiDialog: OBIDialog = JSON.parse(fileText)
                // Set name, removing suffix
                obiDialog.$id = this.removeSuffix(file.name)
                dialogs.push(obiDialog)
            }
            else if (file.name.endsWith('.lu')) {
                const fileText = await Util.readFileAsync(file)
                this.addToLUMap(fileText, luMap)
            }
            else if (file.name.endsWith('.lg')) {
                const fileText = await Util.readFileAsync(file)
                CLM.ObiUtils.addToLGMap(fileText, lgMap)
            }
            else {
                throw new Error(`Expecting .dialog, .lu and .lg files. ${file.name} is of unknown file type`)
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
    
    private async getTrainDialogsfromOBIDialog(obiDialog: OBIDialog): Promise<CLM.TrainDialog[]> {
    
        let trainDialogs: CLM.TrainDialog[] = []
        if (obiDialog.rules) {
            for (const rule of obiDialog.rules) {
                if (rule.$type === OBIRuleType.INTENT_RULE) {
    
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
                                if (step.$type === OBIStepType.BEGIN_DIALOG && typeof step.dialog === "string") {
                                    
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
                else if (step.$type === OBIStepType.SEND_ACTIVITY) {
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
                else if (step.$type === OBIStepType.TEXT_INPUT) {
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
                else if (step.$type === OBIStepType.BEGIN_DIALOG) {
                    const subDialog =  this.composerDialog.dialogs.find(d => d.$id === step.dialog)
                    if (!subDialog) {
                        throw new Error(`Dialog name ${step.dialog} undefined`)
                    }

                    const childDialogs = await this.getTrainDialogsfromOBIDialog(subDialog)
                    
                    // Add children to train dialog list
                    trainDialogs = [...trainDialogs, ...childDialogs]
                }
                else if (step.$type !== OBIStepType.END_TURN) {
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
            // LARS thow error once CCI .dialog transformer has been fixed
            response = { text: "Can't Parse LU", suggestions: []}
           //throw new Error(`LG name ${prompt} undefined`)
        }
    
        let scoredAction: CLM.ScoredAction | undefined

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
    
    private removeSuffix(text: string): string {
        let name = text.split('.')
        name.pop()
        return name.join('.')
    }
}