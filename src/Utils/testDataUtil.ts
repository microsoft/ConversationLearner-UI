/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'

export function makeEntityValues(): CLM.MemoryValue[] {
    return [{
        "userText": "userText",
        "displayText": "displayText",
        "builtinType": null,
        "resolution": {}
    }]
}

export function makeFilledEntity(entityId?: string): CLM.FilledEntity {
    return {
        entityId: entityId || CLM.ModelUtils.generateGUID(),
        values: makeEntityValues()
    }
}

export function makeScoreInput(entityIds?: string[]): CLM.ScoreInput {
    const fillledEntities = entityIds ?
        entityIds.map(eid => makeFilledEntity(eid)) : [makeFilledEntity()]
    return {
        filledEntities: fillledEntities,
        context: {},
        maskedActions: []
    }
}

export function makeScorerStep(labelAction?: string, filledEntityIds?: string[]): CLM.TrainScorerStep {
    return {
        input: makeScoreInput(filledEntityIds),
        logicResult: undefined,
        scoredAction: undefined,
        labelAction: labelAction || CLM.ModelUtils.generateGUID()
    }
}

export function makeScorerSteps(scorerSteps?: {[labelAction: string]: string[] | undefined}): CLM.TrainScorerStep[] {
    return scorerSteps 
        ? Object.keys(scorerSteps).map(labelAction => makeScorerStep(labelAction, scorerSteps[labelAction]))
        : []
}

export function makeLabelEntity(entityId?: string, entityValue?: string): CLM.LabeledEntity {
    return {
        "entityId": entityId || CLM.ModelUtils.generateGUID(),
        "startCharIndex": 0,
        "endCharIndex": 5,
        "entityText": entityValue || "hello",
        "resolution": {}, 
        "builtinType": ""
    }
}

export function makeLabelEntities(entities?: {[id: string]: string}): CLM.LabeledEntity[] {
    if (!entities) { 
        return [makeLabelEntity()]
    }
    return Object.keys(entities).map(key => 
        makeLabelEntity(key, entities[key])
    )
}

export function makeTextVariation(entities?: {[id: string]: string}): CLM.TextVariation {
    return {
        text: entities ? Object.values(entities).join(" ") : "Hello World",
        labelEntities: makeLabelEntities(entities)
    }
}

export function makeExtractorStep(textVariations?: {[id: string]: string}[]): CLM.TrainExtractorStep {
    return {
        textVariations: textVariations 
        ? textVariations.map(entities => makeTextVariation(entities))
        : [makeTextVariation()]
    }
}

export function makeRound(roundData: RoundData): CLM.TrainRound {
    return {
        extractorStep: makeExtractorStep(roundData.textVariations),
        scorerSteps: makeScorerSteps(roundData.scorerSteps)
    }
}

export interface RoundData {
    textVariations?: {[id: string]: string}[], 
    scorerSteps?: {[labelAction: string]: string[] | undefined}
}

export function makeTrainDialog(rounds: RoundData[], id?: string): CLM.TrainDialog {
    return {
        rounds: rounds.map(round => makeRound(round)),
        "createdDateTime": "",
        "lastModifiedDateTime": "",
        "trainDialogId": id || CLM.ModelUtils.generateGUID(),
        "version": 0,
        "packageCreationId": 0,
        "packageDeletionId": 0,
        "initialFilledEntities": [],
        "tags": [],
        "description": "",
        "sourceLogDialogId": ""
    }
}