/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../Utils/util'
import * as BotChat from '@conversationlearner/webchat'
import { deepCopy, getDefaultEntityMap } from './util'
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

export function trainDialogLastResponse(trainDialog: CLM.TrainDialog, actions: CLM.ActionBase[], entities: CLM.EntityBase[]): string | void {
    // Find last action of last scorer step of last round
    // If found, return payload, otherwise return not found icon
    if (trainDialog.rounds && trainDialog.rounds.length > 0) {
        const scorerSteps = trainDialog.rounds[trainDialog.rounds.length - 1].scorerSteps;
        if (scorerSteps.length > 0) {
            const actionId = scorerSteps[scorerSteps.length - 1].labelAction;
            const action = actions.find(a => a.actionId === actionId);
            if (action) {
                return CLM.ActionBase.GetPayload(action, getDefaultEntityMap(entities))
            }
        }
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

// Returns true if train dialog has any stub import actions
export function hasImportActions(trainDialog: CLM.TrainDialog): boolean {
    for (const round of trainDialog.rounds) {
        for (const scorerStep of round.scorerSteps) {
            if (scorerStep.labelAction === CLM.CL_STUB_IMPORT_ACTION_ID) {
                return true
            }
        }
    }
    return false
}

// Does history have any replay errors
export function getMostSevereReplayError(history: BotChat.Activity[]): CLM.ReplayError| null {
    // Return most severe error level found
    let worstReplayError: CLM.ReplayError | null = null
    for (const h of history) {
        const clData: CLM.CLChannelData = h.channelData.clData
        if (clData && clData.replayError) {
            if (clData.replayError.errorLevel === CLM.ReplayErrorLevel.BLOCKING) {
                return clData.replayError
            }
            else if (clData.replayError.errorLevel === CLM.ReplayErrorLevel.ERROR) {
                worstReplayError = clData.replayError
            }
            else if (clData.replayError.errorLevel === CLM.ReplayErrorLevel.WARNING && 
                (!worstReplayError || worstReplayError.errorLevel !== CLM.ReplayErrorLevel.ERROR)) {
                worstReplayError = clData.replayError
            }
        }
    }
    return worstReplayError
}

// Given train dialog and rendered activity, return validity
export function getTrainDialogValidity(trainDialog: CLM.TrainDialog, history: BotChat.Activity[]): CLM.Validity | undefined {
    // Look for individual replay errors
    const worstReplayError = getMostSevereReplayError(history)
    if (worstReplayError) {
        if (worstReplayError.errorLevel === CLM.ReplayErrorLevel.BLOCKING || worstReplayError.errorLevel === CLM.ReplayErrorLevel.ERROR) {
            return CLM.Validity.INVALID
        }
        if (worstReplayError.errorLevel === CLM.ReplayErrorLevel.WARNING) {
            return CLM.Validity.WARNING
        }
    }
    // Didn't find any errors on individual rounds so state is now valid
    if (trainDialog.validity === CLM.Validity.INVALID) {
        return CLM.Validity.VALID
    }
    // Unless previous validity state was WARNING or UNKNOWN and then I don't know
    return trainDialog.validity
}

export function cleanTrainDialog(trainDialog: CLM.TrainDialog) {
    // Remove actionless dummy step (used for rendering) if they exist
    for (const round of trainDialog.rounds) {
        if (round.scorerSteps.length > 0 && round.scorerSteps[0].labelAction === undefined) {
            round.scorerSteps = []
        }
    }
    // Remove empty filled entities (used for rendering) if they exist
    for (const round of trainDialog.rounds) {
        for (const scorerStep of round.scorerSteps) {
            scorerStep.input.filledEntities = scorerStep.input.filledEntities.filter(fe => fe.values.length > 0)
        }
    }
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

// TEMP: Returns true if edited dialog has inconsistent labelling
// with the original train dialog.  Needed temporarily until server
// support dialog continuation that excludes original train dialog from conflict test
export function hasInternalLabelConflict(originalTrainDialog: CLM.TrainDialog, newTrainDialog: CLM.TrainDialog): boolean {
    if (!originalTrainDialog) {
        return false
    }

    let originalExtractorSteps = originalTrainDialog.rounds.reduce((acc, round) => {
        return [...acc, ...round.extractorStep.textVariations]
    }, []);

    let newExtractorSteps = newTrainDialog.rounds.reduce((acc, round) => {
        return [...acc, ...round.extractorStep.textVariations]
    }, []);

    // Only need to check one as train dialogs have self-consistent labelling, so make unique
    originalExtractorSteps = originalExtractorSteps.filter((item, i, ar) => ar.findIndex(es => es.text === item.text) === i)
    newExtractorSteps = newExtractorSteps.filter((item, i, ar) => ar.findIndex(es => es.text === item.text) === i)
    
    for (let newVariation of newExtractorSteps) {
        const sourceVariation = originalExtractorSteps.find(tv => tv.text === newVariation.text)
        if (sourceVariation) {
            if (!doLabelledEntitiesMatch(newVariation.labelEntities, sourceVariation.labelEntities)) {
                return true
            }
        }
    }
    return false
}

function doLabelledEntitiesMatch(labelEntities1: CLM.LabeledEntity[], labelEntities2: CLM.LabeledEntity[]): boolean {

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

function doesExtractorStepMatch(extractorStep1: CLM.TrainExtractorStep, extractorStep2: CLM.TrainExtractorStep): boolean {
    // Only need to test the 1st Text Variation as they are equivalent w/in a round
    const labelEntities1 = extractorStep1.textVariations[0].labelEntities
    const labelEntities2 = extractorStep2.textVariations[0].labelEntities

    return doLabelledEntitiesMatch(labelEntities1, labelEntities2)
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

// Returns true if trainDialog1 is more important than trainDialog2
export function isPrimaryTrainDialog(trainDialog1: CLM.TrainDialog, trainDialog2: CLM.TrainDialog): boolean {

    // Default to existing train dialog
    if (!trainDialog1.trainDialogId) {
        return false
    }
    if (!trainDialog2.trainDialogId) {
        return true
    }

    // Then pick one with more rounds
    if (trainDialog1.rounds.length > trainDialog2.rounds.length) {
        return true
    }
    if (trainDialog1.rounds.length < trainDialog2.rounds.length) {
        return false
    }

    // Then pick the one with more scorer steps
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

export function mergeTrainDialogClientData(trainDialog1: CLM.TrainDialog, trainDialog2: CLM.TrainDialog): CLM.TrainDialogClientData {
    const importHashes1 = trainDialog1.clientData ? trainDialog1.clientData.importHashes : []
    const importHashes2 = trainDialog2.clientData ? trainDialog2.clientData.importHashes : []
    
    return { importHashes: [...importHashes1, ...importHashes2].filter((item, i, ar) => ar.indexOf(item) === i) }
}

// Merges primary into secondary and returns it
export function mergeTrainDialogs(trainDialog1: CLM.TrainDialog, trainDialog2: CLM.TrainDialog): CLM.TrainDialog {
    if (!doesTrainDialogMatch(trainDialog1, trainDialog2)) {
        throw new Error("Attempting to merge non-matching Train Dialogs")
    }

    // Merge from secondary into primary
    const d1Longer = isPrimaryTrainDialog(trainDialog1, trainDialog2)
    const primaryTrainDialog = d1Longer ? trainDialog2 : trainDialog1
    // Make copy of the one that I'm altering
    const mergedTrainDialog = deepCopy(d1Longer ? trainDialog1 : trainDialog2)

    // Copy text variations from small dialog onto large one
    let roundIndex = 0
    while (roundIndex < primaryTrainDialog.rounds.length && roundIndex < mergedTrainDialog.rounds.length) { 
        const roundSmall = primaryTrainDialog.rounds[roundIndex]
        const roundLarge = mergedTrainDialog.rounds[roundIndex]
        const extractorStepSmall = roundSmall.extractorStep
        const extractorStepLarge = roundLarge.extractorStep

        // Add novel text variatitions to large dialog
        const newTextVariations = extractorStepSmall.textVariations.filter(tvs => !extractorStepLarge.textVariations.find(tvl => tvl.text === tvs.text))
        roundLarge.extractorStep.textVariations = [...roundLarge.extractorStep.textVariations, ...newTextVariations].slice(0, CLM.MAX_TEXT_VARIATIONS)
        
        roundIndex = roundIndex + 1
    }

    mergedTrainDialog.description = mergeTrainDialogDescription(mergedTrainDialog, primaryTrainDialog)
    mergedTrainDialog.tags = mergeTrainDialogTags(mergedTrainDialog, primaryTrainDialog)
    mergedTrainDialog.clientData = mergeTrainDialogClientData(mergedTrainDialog, primaryTrainDialog)

    return mergedTrainDialog
}

// Genereate entity map for an action, filling in any missing entities with a blank value
export function generateEntityMapForAction(action: CLM.ActionBase, filledEntityMap: Map<string, string> = new Map<string, string>()): Map<string, string> {
    const map = new Map<string, string>()
    action.requiredEntities.forEach(e => {
        let value = filledEntityMap.get(e)
        if (value) {
            map.set(e, value)
        }
        else {
            map.set(e, "")
        }
    })
    return map
}

export function importTextWithEntityIds(importText: string, valueMap: Map<string, string>) {

    let outText = importText.slice()
    valueMap.forEach((value: string, entityId: string) => {
        outText = outText.replace(value, entityId)
    })
    return outText
}

export function filledEntityIdMap(filledEntities: CLM.FilledEntity[], entities: CLM.EntityBase[]): Map<string, string> {
    const filledEntityMap = CLM.FilledEntityMap.FromFilledEntities(filledEntities, entities)
    const filledIdMap = filledEntityMap.EntityMapToIdMap()
    return CLM.getEntityDisplayValueMap(filledIdMap)
}

function findActionByImportHash(importText: string, actionsWithHash: CLM.ActionBase[]): CLM.ActionBase | undefined {
    const importHash = Util.hashText(importText)

    // Try to find matching action with same hash
    return actionsWithHash.find(a => {
        // Filter above ensures these are not null
        return a.clientData!.importHashes!.indexOf(importHash) > -1
    })
}

// Try to find existing action for import based solely on raw text (no filled entites available)
export function importedActionMatch(importText: string, actions: CLM.ActionBase[], filledEntityMap?: Map<string, string> | undefined): CLM.ActionBase | undefined {
    // First try match via has of importText
    // Filter out actions that have no hash lookups. If there are none, terminate early
    const actionsWithHash = actions.filter(a => a.clientData != null && a.clientData.importHashes && a.clientData.importHashes.length > 0)
    const matchedAction = findActionByImportHash(importText, actionsWithHash)
    if (matchedAction) {
        return matchedAction
    }
    
    // Next try by exact text match (note no filled entities available)
    return actions.find(action => {
            if (action.actionType === CLM.ActionTypes.TEXT) {
                const textAction = new CLM.TextAction(action)
                const entityMap = generateEntityMapForAction(action, filledEntityMap)
                const actionText = textAction.renderValue(entityMap)
                return importText === actionText
            }
            return false
        })
}

// Look for imported actions in TrainDialog and attempt to replace them
// with existing actions.  Return true if any replacement occurred
export function replaceImportActions(trainDialog: CLM.TrainDialog, actions: CLM.ActionBase[], entities: CLM.EntityBase[]): boolean {

    // Filter out actions that have no hash lookups. If there are none, terminate early
    const actionsWithHash = actions.filter(a => a.clientData != null && a.clientData.importHashes && a.clientData.importHashes.length > 0)
    if (actionsWithHash.length === 0) {
        return false
    }

    // Now swap any actions that match
    let match = false
    trainDialog.rounds.forEach(round => {
        round.scorerSteps.forEach(scorerStep => {
            const filledIdMap = filledEntityIdMap(scorerStep.input.filledEntities, entities)

            // If it's a dummy action with imported text
            if (scorerStep.importText) {
                // Convert import text to hash with entity Ids
                const importText = importTextWithEntityIds(scorerStep.importText, filledIdMap)
                const newAction = findActionByImportHash(importText, actionsWithHash)

                // If action exists replace labelled action with match
                if (newAction) {
                    scorerStep.labelAction = newAction.actionId
                    delete scorerStep.importText
                    match = true
                }
            }
        })
    })
    return match
}

export function filledEntitiesToMemory(filledEntities: CLM.FilledEntity[], entities: CLM.EntityBase[]): CLM.Memory[] {
    return filledEntities.map<CLM.Memory>(fe => {
        const entity = entities.find(e => e.entityId === fe.entityId)
        const entityName = entity ? entity.entityName : 'UNKNOWN ENTITY'
        return {
            entityName: entityName,
            entityValues: fe.values
        }
    })
}

export function getPrevMemories(trainDialog: CLM.TrainDialog, entities: CLM.EntityBase[], roundIndex: number, scoreIndex: number | null): CLM.Memory[] {

    let scorerStep: CLM.TrainScorerStep | null = null

    // If user input is selected (score index will be null)
    if (scoreIndex === null) {
        // Prev memory is from end of last round
        const prevIndex = roundIndex - 1
        if (prevIndex >= 0) {
            const round = trainDialog.rounds[prevIndex]
            if (round.scorerSteps.length > 0) {
                scorerStep = round.scorerSteps[round.scorerSteps.length - 1];
            }
        }
    }
    // If first bot response
    else if (scoreIndex === 0) {
        // Prev memory is current step
        const round = trainDialog.rounds[roundIndex]
        scorerStep = round.scorerSteps[0]
    }
    // Is bot response after a non-wait bot response
    else { 
        // Prev memory comes from previous score
        const round = trainDialog.rounds[roundIndex]
        scorerStep = round.scorerSteps[scoreIndex - 1]
    }
    
    if (scorerStep) {
        return filledEntitiesToMemory(scorerStep.input.filledEntities, entities)
    } 
    return []
}

export function getDialogRenderData(
    trainDialog: CLM.TrainDialog, 
    entities: CLM.EntityBase[], 
    actions: CLM.ActionBase[],
    roundIndex: number | null, 
    scoreIndex: number | null,
    senderType: CLM.SenderType | null
    ): DialogRenderData {
    let scorerStep: CLM.TrainScorerStep | undefined
    let scoreResponse: CLM.ScoreResponse | undefined
    let round: CLM.TrainRound | undefined
    let memories: CLM.Memory[] = [];
    let prevMemories: CLM.Memory[] = [];

    if (roundIndex !== null && roundIndex < trainDialog.rounds.length) {
        round = trainDialog.rounds[roundIndex];
        if (round.scorerSteps.length > 0) {
            // If a score round 
            if (typeof scoreIndex === "number") {
                scorerStep = round.scorerSteps[scoreIndex];
                if (!scorerStep) {
                    throw new Error(`Cannot get score step at index: ${scoreIndex} from array of length: ${round.scorerSteps.length}`)
                }

                let selectedAction = actions.find(action => action.actionId === scorerStep!.labelAction);

                if (!selectedAction) {
                    // Action may have been deleted.  If so create dummy action to render
                    selectedAction = {
                        actionId: scorerStep.labelAction || 'MISSING ACTION',
                        createdDateTime: new Date().toJSON(),
                        payload: 'MISSING ACTION',
                        isTerminal: false,
                        actionType: CLM.ActionTypes.TEXT,
                        requiredEntitiesFromPayload: [],
                        requiredEntities: [],
                        requiredConditions: [],
                        negativeEntities: [],
                        negativeConditions: [],
                        suggestedEntity: undefined,
                        version: 0,
                        packageCreationId: 0,
                        packageDeletionId: 0,
                        entityId: undefined,
                        enumValueId: undefined,
                    }
                }

                memories = filledEntitiesToMemory(scorerStep.input.filledEntities, entities)
                prevMemories = getPrevMemories(trainDialog, entities, roundIndex, scoreIndex)

                // If originated from LogDialog, I'll have score response data
                if (scorerStep.uiScoreResponse) {
                    scoreResponse = scorerStep.uiScoreResponse
                }
                // Otherwise generate it
                else {
                    const scoredAction: CLM.ScoredAction = {
                        actionId: selectedAction.actionId,
                        payload: selectedAction.payload,
                        isTerminal: selectedAction.isTerminal,
                        score: 1,
                        actionType: selectedAction.actionType
                    }

                    // Generate list of all actions (apart from selected) for ScoreResponse as I have no scores
                    const unscoredActions = actions
                        .filter(a => !selectedAction || a.actionId !== selectedAction.actionId)
                        .map<CLM.UnscoredAction>(action =>
                            ({
                                actionId: action.actionId,
                                payload: action.payload,
                                isTerminal: action.isTerminal,
                                reason: CLM.ScoreReason.NotCalculated,
                                actionType: action.actionType
                            }));

                    scoreResponse = {
                        metrics: {
                            wallTime: 0
                        },
                        scoredActions: [scoredAction],
                        unscoredActions: unscoredActions
                    }
                }
            }
            // If user round, get filled entities from first scorer step
            else {
                memories = filledEntitiesToMemory(round.scorerSteps[0].input.filledEntities, entities)
                prevMemories = getPrevMemories(trainDialog, entities, roundIndex, scoreIndex)
            }
        }
    }

    return {
        dialogMode: (senderType === CLM.SenderType.User) ? CLM.DialogMode.Extractor : CLM.DialogMode.Scorer,
        scoreInput: scorerStep ? scorerStep.input : undefined,
        scoreResponse: scoreResponse,
        roundIndex,
        textVariations: round ? round.extractorStep.textVariations : [],
        memories: filterDummyEntities(memories),
        prevMemories: filterDummyEntities(prevMemories),
        extractResponses: []
    }
}
