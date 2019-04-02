/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import { deepCopy } from './util'
import { Activity } from 'botframework-directlinejs'
import TagsReadOnly from '../components/TagsReadOnly'

const MAX_SAMPLE_INPUT_LENGTH = 150

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

export function dialogSampleInput(dialog: CLM.TrainDialog | CLM.LogDialog): string {
    const userInputs: string[] = []
    let round = 0
    let length = 0
    while (round < dialog.rounds.length && length < MAX_SAMPLE_INPUT_LENGTH) {
        const userInput = 
            (dialog as CLM.LogDialog).rounds[round].extractorStep.text ||
            (dialog as CLM.TrainDialog).rounds[round].extractorStep.textVariations[0].text
        
        userInputs.push(userInput)
        length = length + userInput.length
        round = round + 1
    }
    return userInputs.join(" ◾️ ").slice(0, MAX_SAMPLE_INPUT_LENGTH)
}

export function trainDialogFirstInput(trainDialog: CLM.TrainDialog): string {
    if (trainDialog.rounds && trainDialog.rounds.length > 0) {
        return trainDialog.rounds[0].extractorStep.textVariations[0].text
    }
    return ""
}

export function trainDialogLastInput(trainDialog: CLM.TrainDialog): string | void {
    if (trainDialog.rounds && trainDialog.rounds.length > 0) {
        return trainDialog.rounds[trainDialog.rounds.length - 1].extractorStep.textVariations[0].text;
    }
}

export function trainDialogRenderTags(trainDialog: CLM.TrainDialog): React.ReactNode {
    return (
        <span className={`${OF.FontClassNames.mediumPlus}`} data-testid="train-dialogs-tags">
            {trainDialog.tags.length === 0
                ? <OF.Icon iconName="Remove" className="cl-icon" />
                : <TagsReadOnly tags={trainDialog.tags} />}
        </span>
    )
}

export function trainDialogRenderDescription(trainDialog: CLM.TrainDialog): React.ReactNode {
    return trainDialog.description ? <i>{trainDialog.description}</i> : dialogSampleInput(trainDialog)
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

function doesExtractorStepMatch(extractorStep1: CLM.TrainExtractorStep, extractorStep2: CLM.TrainExtractorStep): boolean {
    // Only need to test the 1st Text Variation as they are equivalent w/in a round
    const labelEntities1 = extractorStep1.textVariations[0].labelEntities
    const labelEntities2 = extractorStep2.textVariations[0].labelEntities

    // Get unique ids
    const entityIds1 = labelEntities1.map(le => le.entityId).filter((item, i, ar) => ar.indexOf(item) === i)
    const entityIds2 = labelEntities2.map(le => le.entityId).filter((item, i, ar) => ar.indexOf(item) === i)

    if (entityIds1.length !== entityIds2.length) {
        return false
    }

    if (entityIds1.filter(entityId => entityIds2.indexOf(entityId) < 0).length > 0) {
        return false
    }
    if (entityIds2.filter(entityId => entityIds1.indexOf(entityId) < 0).length > 0) {
        return false
    }
    return true
}

function doesRoundMatch(round1: CLM.TrainRound, round2: CLM.TrainRound, isLastRound: boolean): boolean {
    
    // Check that text variations are equivalent in the extractor step
    if (!doesExtractorStepMatch(round1.extractorStep, round2.extractorStep)) {
        return false
    }

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

export function findMatchingTrainDialog(trainDialog: CLM.TrainDialog, trainDialogs: CLM.TrainDialog[], ignoreTrainDialogId: string | null = null): CLM.TrainDialog | null {
    for (const td of trainDialogs) {
        if (td.trainDialogId !== ignoreTrainDialogId && doesTrainDialogMatch(trainDialog, td)) {
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
    // Prefer trainDialog1
    return true
}

export function mergeTrainDialogTags(trainDialog1: CLM.TrainDialog, trainDialog2: CLM.TrainDialog): string[] {
    return [...trainDialog1.tags, ...trainDialog2.tags].filter((item, i, ar) => ar.indexOf(item) === i)
}

export function mergeTrainDialogDescription(trainDialog1: CLM.TrainDialog, trainDialog2: CLM.TrainDialog): string {
     // Assume longest description is best 
    return trainDialog1.description.length > trainDialog2.description.length 
        ? trainDialog1.description : trainDialog2.description
}

// Merges smaller dialog into larger one and returns it
export function mergeTrainDialogs(trainDialog1: CLM.TrainDialog, trainDialog2: CLM.TrainDialog): CLM.TrainDialog {
    if (!doesTrainDialogMatch(trainDialog1, trainDialog2)) {
        throw new Error("Attempting to merge non-matching Train Dialogs")
    }

    // Merge from smallest into largest
    const d1Longer = isTrainDialogLonger(trainDialog1, trainDialog2)
    const smallTrainDialog = d1Longer ? trainDialog2 : trainDialog1
    // Make copy of the one that I'm altering
    const largeTrainDialog = deepCopy(d1Longer ? trainDialog1 : trainDialog2)

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

    largeTrainDialog.description = mergeTrainDialogDescription(largeTrainDialog, smallTrainDialog)
    largeTrainDialog.tags = mergeTrainDialogTags(largeTrainDialog, smallTrainDialog)
    return largeTrainDialog
}
