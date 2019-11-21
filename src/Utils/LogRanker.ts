/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import { TreeUtils } from './TreeUtils'

export interface LogScore {
    logDialogId: string
    // Does log dialogs follow the path of one of the train dialogs?
    knownPath?: boolean
    // Does log dialog end on an action that one of the train dialogs ends with?
    validEndAction?: boolean
    // How many user utterances aren't represented in any of the train dialogs?
    numberUnknownUtterances?: number
    // How many scorer steps have low confidence?
    numberLowConfidence?: number,
    score: number
}

const LOW_CONFIDENCE_THRESHOLD = 0.2

function calcScore(knownPath: boolean, validEndAction: boolean, numberUnknownUtterances: number, numberLowConfidence: number): number {
    let score =
        (knownPath ? 0 : 1)
        + (validEndAction ? 0 : 1)
        + Math.min(1, numberUnknownUtterances * 0.1)
        + Math.min(1, numberLowConfidence * 0.1)
    
    return +(score / 4).toFixed(4)
}

// Returns true if TrainDialog's last action is in the set of actionIds
function isLastActionInSet(trainDialog: CLM.TrainDialog, actionIds: string[]) {
    const lastRound = trainDialog
        .rounds[trainDialog.rounds.length - 1]
    
    const actionId = lastRound.scorerSteps[lastRound.scorerSteps.length - 1].labelAction
    if (!actionId) {
        return false
    }
    return actionIds.includes(actionId)
}

// Return number user utterance in TrainDialog that are not included in the known utterance list
function calcNumberUnknownUtterances(trainDialog: CLM.TrainDialog, knownUtterances: string[]): number {
    const utterances = getUtterances(trainDialog)
    return utterances.reduce((acc, u) =>
        acc + (knownUtterances.includes(u) ? 0 : 1), 0)
}

// Return number scorer steps in TrainDialog with low confidence
function calcNumberLowConfidence(logDialog: CLM.LogDialog, knownUtterances: string[]): number {
    let numLowConfidence = 0
    logDialog.rounds.forEach(r =>
        r.scorerSteps.forEach(ss => {
            if (ss.predictionDetails.scoredActions.length >= 2) {
                const scoredActions = ss.predictionDetails.scoredActions.sort(sa => sa.score)
                const scoreDiff = scoredActions[0].score - scoredActions[1].score
                if (scoreDiff < LOW_CONFIDENCE_THRESHOLD) {
                    numLowConfidence = numLowConfidence + 1
                }
            }
        })
    )
    return numLowConfidence
}

// Return list of all unique utterances in TrainDialogs
function getAllUtterances(trainDialogs: CLM.TrainDialog[]): string[] {
    const utterances: string[] = []
    trainDialogs.forEach(td =>
        td.rounds.forEach(r =>
            r.extractorStep.textVariations.forEach(t => utterances.push(removePunctuationAndLowercase(t.text)))
        )
    )
    // Make unique
    return [...new Set(utterances)]
}

// Return list of all utternaces in a TrainDialog
function getUtterances(trainDialog: CLM.TrainDialog): string[] {
    const utterances: string[] = []
    trainDialog.rounds.forEach(r =>
        r.extractorStep.textVariations.forEach(t => utterances.push(removePunctuationAndLowercase(t.text)))
    )
    return utterances
}

// Remove punctuation and lowercases input string
function removePunctuationAndLowercase(text: string): string {
    const regex = /[!"#$%&'ʼ()*+,-./:;<=>?@[\]^_`{|}~]/g;
    return text.replace(regex, '').toLowerCase()
}

/**
 * Return LogScores for the given logs
 * @param logDialogs log dialogs to score
 * @param trainDialogs set of all training dialogs in the model,
 * @param entities set of all entities in the model
 */
export function rankLogs(logDialogs: CLM.LogDialog[], trainDialogs: CLM.TrainDialog[], entities: CLM.EntityBase[]): LogScore[] {

    // Create tree from trainDialogs
    const trainTree = new TreeUtils(trainDialogs, entities)
    const leafActionIds = trainTree.getLeafActionIds()
    const allKnownUtterances = getAllUtterances(trainDialogs)
    const logScores: LogScore[] = []
    logDialogs.forEach(ld => {
        // Convert LogDialog to TrainDialog
        const convertedDialog = CLM.ModelUtils.ToTrainDialog(ld)

        // Generate some stats
        const knownPath = trainTree.isInTree(convertedDialog)
        const validEndAction = isLastActionInSet(convertedDialog, leafActionIds)
        const numberUnknownUtterances = calcNumberUnknownUtterances(convertedDialog, allKnownUtterances)
        const numberLowConfidence = calcNumberLowConfidence(ld, allKnownUtterances)
        const score = calcScore(knownPath, validEndAction, numberUnknownUtterances, numberLowConfidence)
        logScores.push({
            logDialogId: ld.logDialogId,
            knownPath,
            validEndAction,
            numberUnknownUtterances,
            numberLowConfidence,
            score
        })
    })

    return logScores
}