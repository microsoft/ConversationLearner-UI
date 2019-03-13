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
