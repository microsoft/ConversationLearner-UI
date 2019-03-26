/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import { Activity } from 'botframework-directlinejs'

export interface DialogRenderData {
    dialogMode: CLM.DialogMode
    memories: CLM.Memory[]
    prevMemories: CLM.Memory[]
    textVariations: CLM.TextVariation[]
    roundIndex: number | null
    scoreResponse?: CLM.ScoreResponse
    scoreInput?: CLM.ScoreInput
    selectedActionId?: string
    extractResponses?: CLM.ExtractResponse[]
}

export function getReplayError(activity: Activity | null): CLM.ReplayError | null | undefined {
    if (!activity || !activity.channelData || !activity.channelData.clData) {
        return null
    }
    const clData: CLM.CLChannelData = activity.channelData.clData
    return clData.replayError
}

// Returns conflicting extract response if textVariation conflicts with any existing ones
export function internalConflict(textVariation: CLM.TextVariation, trainDialog: CLM.TrainDialog, roundIndex: number | null): CLM.ExtractResponse | null {
    for (let i = 0; i < trainDialog.rounds.length; i = i + 1) {
        if (roundIndex === null || i !== roundIndex) {
            for (const tv of trainDialog.rounds[i].extractorStep.textVariations) {
                // If text is same, labels must match
                if (textVariation.text === tv.text) {
                    if (!CLM.ModelUtils.areEqualTextVariations(textVariation, tv)) {
                        return CLM.ModelUtils.ToExtractResponse(tv)
                    }
                }
            }
        }
    }
    return null
}

export function activityIndexFromRound(trainDialog: CLM.TrainDialog, roundIndex: number | null, scoreIndex: number | null): number | undefined {
    if (!roundIndex) { 
        return undefined
    }

    let activityIndex = 0
    let currentRoundIndex = 0
    for (const round of trainDialog.rounds) {
        if (currentRoundIndex === roundIndex) {
            if (!scoreIndex) {
                return activityIndex
            }
            else {
                return activityIndex + scoreIndex
            }
        }
        else {
            currentRoundIndex =  currentRoundIndex + 1
            activityIndex = activityIndex + 1 + round.scorerSteps.length
        }
    }
    return activityIndex
}

export function matchedActivityIndex(selectedActivity: Activity, activities: Activity[]): number | null {
    if (!selectedActivity || activities.length === 0) {
        return null
    }
    else {
        const clDataSelected: CLM.CLChannelData = selectedActivity.channelData.clData
        const index = activities.findIndex(a => {
            const clData: CLM.CLChannelData = a.channelData.clData
            return (
                clData.senderType === clDataSelected.senderType &&
                clData.roundIndex === clDataSelected.roundIndex &&
                clData.scoreIndex === clDataSelected.scoreIndex)
        }
        )
        if (index < 0) {
            console.log('Failed to find selected activity')
            return null
        }
        return index
    }
}

// SDK add dummy empty filled Entity when memory items are missing.  This filters them out
export function filterDummyEntities(memories: CLM.Memory[]): CLM.Memory[] {
    return memories.filter(m => {
        return (m.entityValues.length > 0)
    })
}

export function hasEndSession(trainDialog: CLM.TrainDialog, allActions: CLM.ActionBase[]): boolean {
    if (trainDialog.rounds.length === 0) {
        return false
    }
    const lastRound = trainDialog.rounds[trainDialog.rounds.length - 1]
    if (lastRound.scorerSteps.length === 0) {
        return false
    }
    const lastScorerStep = lastRound.scorerSteps[lastRound.scorerSteps.length - 1]
    const lastAction = allActions.find(a => a.actionId === lastScorerStep.labelAction)
    if (lastAction) {
        return lastAction.actionType === CLM.ActionTypes.END_SESSION
    }
    return false
}

// Return best action from ScoreResponse 
export function getBestAction(scoreResponse: CLM.ScoreResponse, allActions: CLM.ActionBase[], canEndSession: boolean): CLM.ScoredAction | undefined {

    const scoredActions = scoreResponse.scoredActions

    // Get highest scoring Action 
    let best
    for (const test of scoredActions) {

        const action = allActions.find(a => a.actionId === test.actionId)
        if (action) {
            // If has end session, disallow any additional End Session actions
            if (canEndSession || action.actionType !== CLM.ActionTypes.END_SESSION) {
                // Pick if has better score
                if (!best || test.score > best.score) {
                    best = test
                }
            }
        }
    }
    return best
}

function doesScorerStepMatch(scorerStep1: CLM.TrainScorerStep, scorerStep2: CLM.TrainScorerStep): boolean {
    if (scorerStep1.labelAction !== scorerStep2.labelAction) {
        return false
    }
    if (scorerStep1.input.filledEntities.length !== scorerStep2.input.filledEntities.length) {
        return false
    }
    let entityIndex = 0
    while (entityIndex < scorerStep1.input.filledEntities.length) {
        let entity1Id = scorerStep1.input.filledEntities[entityIndex].entityId
        if (!scorerStep2.input.filledEntities.find(fe => fe.entityId === entity1Id)) {
            return false
        }
        entityIndex = entityIndex + 1
    }
    return true
}

function doesRoundMatch(round1: CLM.TrainRound, round2: CLM.TrainRound, isLastRound: boolean): boolean {
    
    // If one has scorer steps and the other doesn't, only ok, on last round
    if (round1.scorerSteps && !round2.scorerSteps ||
        !round1.scorerSteps && round2.scorerSteps) {
            return isLastRound
        }
    // If they both don't have scorer steps
    if (!round1.scorerSteps && !round2.scorerSteps) {
        return true
    }

    // Test that scorer steps match
    const maxSteps = Math.max(round1.scorerSteps.length, round2.scorerSteps.length)
    let stepIndex = 0
    while (stepIndex < maxSteps) {
        const scorerStep1 = round1.scorerSteps[stepIndex]
        const scorerStep2 = round2.scorerSteps[stepIndex]
        // If the last round it's ok that round has extra scorer steps
        const extraScorerStep = (scorerStep1 && !scorerStep2) || (!scorerStep1 && scorerStep2)
        if (extraScorerStep) {
            return isLastRound
        }
        if (!doesScorerStepMatch(scorerStep1, scorerStep2)) {
            return false
        }
        stepIndex = stepIndex + 1
    }
    return true
}

export function doesTrainDialogMatch(trainDialog1: CLM.TrainDialog, trainDialog2: CLM.TrainDialog): boolean {
    // Never match to same train dialog Id
    if (trainDialog1.trainDialogId === trainDialog2.trainDialogId) {
        return false
    }

    const maxRounds = Math.max(trainDialog1.rounds.length, trainDialog2.rounds.length)
    const minRounds = Math.min(trainDialog1.rounds.length, trainDialog2.rounds.length)
    let roundIndex = 0
    while (roundIndex < maxRounds) { 
        const round1 = trainDialog1.rounds[roundIndex]
        const round2 = trainDialog2.rounds[roundIndex]
        // If one ran out of rounds that's ok, one dialog can be longer than the other  
        if ((round1 && !round2) || (round2 && !round1)) {
            return true
        }
        const isLastRound = (roundIndex === minRounds - 1)
        if (!doesRoundMatch(round1, round2, isLastRound)) {
            return false
        }
        roundIndex = roundIndex + 1
    }
    return true
}

export function findMatchingTrainDialog(trainDialog: CLM.TrainDialog, trainDialogs: CLM.TrainDialog[]): CLM.TrainDialog | null {
    for (const td of trainDialogs) {
        if (doesTrainDialogMatch(trainDialog, td)) {
            return td
        }
    }
    return null
}

// Returns true if trainDialog1 is longer than trainDialog2
export function isTrainDialogLonger(trainDialog1: CLM.TrainDialog, trainDialog2: CLM.TrainDialog): boolean {

    if (trainDialog1.rounds.length > trainDialog2.rounds.length) {
        return true
    }
    if (trainDialog1.rounds.length < trainDialog2.rounds.length) {
        return false
    }

    const lastRound1 = trainDialog1.rounds[trainDialog1.rounds.length - 1]
    const lastRound2 = trainDialog2.rounds[trainDialog2.rounds.length - 1]
    if (lastRound1.scorerSteps.length < lastRound2.scorerSteps.length) {
        return false
    }
    return true
}

// Merges smaller dialog into larger one and returns it
export function mergeTrainDialogs(trainDialog1: CLM.TrainDialog, trainDialog2: CLM.TrainDialog): CLM.TrainDialog {
    if (!doesTrainDialogMatch(trainDialog1, trainDialog2)) {
        throw new Error("Attempting to merge non-matching Train Dialogs")
    }

    // Merge from smallest into largest
    const d1Longer = isTrainDialogLonger(trainDialog1, trainDialog2)
    const smallTrainDialog = d1Longer ? trainDialog2 : trainDialog1
    const largeTrainDialog = d1Longer ? trainDialog1 : trainDialog2

    // Copy text variations from small dialog onto large one
    let roundIndex = 0
    while (roundIndex < smallTrainDialog.rounds.length) { 
        const roundSmall = smallTrainDialog.rounds[roundIndex]
        const roundLarge = largeTrainDialog.rounds[roundIndex]
        const extractorStepSmall = roundSmall.extractorStep
        const extractorStepLarge = roundLarge.extractorStep

        // Add novel text variatitions to large dialog
        const newTextVariations = extractorStepSmall.textVariations.filter(tvs => !extractorStepLarge.textVariations.find(tvl => tvl.text === tvs.text))
        roundLarge.extractorStep.textVariations = [...roundLarge.extractorStep.textVariations, ...newTextVariations]
        
        roundIndex = roundIndex + 1
    }

    // Assume longest description is best (TODO: Let user choose)
    largeTrainDialog.description = largeTrainDialog.description.length > smallTrainDialog.description.length 
        ? largeTrainDialog.description : smallTrainDialog.description

    // Unique merge of tags
    largeTrainDialog.tags = [...largeTrainDialog.tags, ...smallTrainDialog.tags].filter((item, i, ar) => ar.indexOf(item) === i)
    return largeTrainDialog
}
