/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import { TreeUtils } from './TreeUtils'

export interface LogScore {
    logDialogId: string
    knownPath?: boolean
    validEndAction?: boolean
    numberUnknownUtterances?: number
    numberLowConfidence?: number,
    score: number
}

export class LogRanker {

    private entities: CLM.EntityBase[]
    private logDialogs: CLM.LogDialog[]
    private trainDialogs: CLM.TrainDialog[]
    private logScores: LogScore[]

    constructor(logDialogs: CLM.LogDialog[], trainDialogs: CLM.TrainDialog[], entities: CLM.EntityBase[]) {
        this.entities = entities
        this.logDialogs = logDialogs
        this.trainDialogs = trainDialogs
    }

    analyze(): LogScore[] {

        // Create tree from trainDialogs
        const trainTree = new TreeUtils(this.trainDialogs, this.entities)
        const leafActionIds = trainTree.getLeafActionIds()
        const allKnownUtterances = this.getAllUtterances(this.trainDialogs)
        this.logScores = []
        this.logDialogs.forEach(ld => {
            // Convert LogDialog to TrainDialog
            const convertedDialog = CLM.ModelUtils.ToTrainDialog(ld)

            // Generate some stats
            const knownPath = trainTree.isInTree(convertedDialog)
            const validEndAction = this.isLastActionInSet(convertedDialog, leafActionIds)
            const numberUnknownUtterances = this.numberUnknownUtterances(convertedDialog, allKnownUtterances)
            const numberLowConfidence = this.numberLowConfidence(ld, allKnownUtterances)
            const score = this.score(knownPath, validEndAction, numberUnknownUtterances, numberLowConfidence)
            this.logScores.push({
                logDialogId: ld.logDialogId,
                knownPath,
                validEndAction,
                numberUnknownUtterances,
                numberLowConfidence,
                score
            })
        })

        return this.logScores
    }

    private score(knownPath: boolean, validEndAction: boolean, numberUnknownUtterances: number, numberLowConfidence: number): number {
        let score =
            (knownPath ? 0 : 1)
            + (validEndAction ? 0 : 1)
            + Math.min(1, numberUnknownUtterances * 0.1)
            + Math.min(1, numberLowConfidence * 0.1)
        
        return +(score / 4).toFixed(4)
    }

    // Returns true if TrainDialog's last action is in the set of actionIds
    private isLastActionInSet(trainDialog: CLM.TrainDialog, actionIds: string[]) {
        const lastRound = trainDialog
            .rounds[trainDialog.rounds.length - 1]
        
        const actionId = lastRound.scorerSteps[lastRound.scorerSteps.length - 1].labelAction
        if (!actionId) {
            return false
        }
        return actionIds.includes(actionId)
    }

    // Return number user utterance in TrainDialog that are not included in the known utterance list
    private numberUnknownUtterances(trainDialog: CLM.TrainDialog, knownUtterances: string[]): number {
        const utterances = this.getUtterances(trainDialog)
        return utterances.reduce((acc, u) =>
            acc + (knownUtterances.includes(u) ? 0 : 1), 0)
    }

    // Return number scorer steps in TrainDialog with low confidence
    private numberLowConfidence(logDialog: CLM.LogDialog, knownUtterances: string[]): number {
        let numLowConfidence = 0
        logDialog.rounds.forEach(r =>
            r.scorerSteps.forEach(ss => {
                if (ss.predictionDetails.scoredActions.length >= 2) {
                    const scoredActions = ss.predictionDetails.scoredActions.sort(sa => sa.score)
                    const scoreDiff = scoredActions[0].score - scoredActions[1].score
                    if (scoreDiff < 0.2) {
                        numLowConfidence = numLowConfidence + 1
                    }
                }
            })
        )
        return numLowConfidence
    }

    // Return list of all unique utterances in TrainDialogs
    private getAllUtterances(trainDialogs: CLM.TrainDialog[]): string[] {
        const utterances: string[] = []
        trainDialogs.forEach(td =>
            td.rounds.forEach(r =>
                r.extractorStep.textVariations.forEach(t => utterances.push(this.clean(t.text)))
            )
        )
        // Make unique
        return [...new Set(utterances)]
    }

    // Return list of all utternaces in a TrainDialog
    private getUtterances(trainDialog: CLM.TrainDialog): string[] {
        const utterances: string[] = []
        trainDialog.rounds.forEach(r =>
            r.extractorStep.textVariations.forEach(t => utterances.push(this.clean(t.text)))
        )
        return utterances
    }

    // Remove punctuation and lowercase
    private clean(text: string): string {
        const regex = /[!"#$%&'ʼ()*+,-./:;<=>?@[\]^_`{|}~]/g;
        return text.replace(regex, '').toLowerCase()
    }
}