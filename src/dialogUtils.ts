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
    extractResponses?: CLM.ExtractResponse[]
}

export function getReplayError(activity: Activity | null): CLM.ReplayError | null | undefined {
    if (!activity || !activity.channelData || !activity.channelData.clData) {
        return null
    }
    let clData: CLM.CLChannelData = activity.channelData.clData
    return clData.replayError
}

// Returns conflicting extract response if textVariation conflicts with any existing ones
export function internalConflict(textVariation: CLM.TextVariation, trainDialog: CLM.TrainDialog, roundIndex: number | null): CLM.ExtractResponse | null {
    for (let i = 0; i < trainDialog.rounds.length; i= i + 1) {
        if (roundIndex === null || i !== roundIndex) {
            for (let tv of trainDialog.rounds[i].extractorStep.textVariations) {
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
        let clDataSelected: CLM.CLChannelData = selectedActivity.channelData.clData
        let index = activities.findIndex(a => {
                let clData: CLM.CLChannelData = a.channelData.clData
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
