/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { doesTrainDialogMatch, findMatchingTrainDialog, isLonger, mergeTrainDialogs } from './dialogUtils'
import { makeTrainDialog, makeExtractorStep } from './testDataUtil'
import { deepCopy } from './util'
import * as CLM from '@conversationlearner/models'

describe('dialogUtils', () => {

    // Create training dialogs for test
    const trainDialog1 = makeTrainDialog(
        [
            {
                textVariations: [{
                    "entity1_id": "entity1_value",
                    "entity2_id": "entity2_value"
                }],
                // Round with one scorer step
                scorerSteps: { 
                    "action1": ["entity1_id", "entity2_id"]
                }
            },
            {
                textVariations: [{
                    "entity3_id": "entity3_value"
                }],
                // Rounds without scorer step
                scorerSteps: undefined
            },
            {
                textVariations: [{
                    "entity3_id": "entity3_value"
                }],
                // Round with multiple scorer steps
                scorerSteps: { 
                    "action2_id": ["entity1_id", "entity3_id"],
                    "action1_id": ["entity1_id"]
                }
            },
            {
                textVariations: [{
                    "entity1_id": "entity1_value"
                }],
                // End Round with multiple scorer steps
                scorerSteps: { 
                    "action4_id": ["entity1_id", "entity3_id"],
                    "action1_id": ["entity1_id"]
                }
            }
        ],
        "trainDialog1"
    )

    describe('doesTrainDialogMatch', () => {

        test('exactMatch', () => {
            const result = doesTrainDialogMatch(trainDialog1, trainDialog1)
            expect(result).toEqual(true)
        })

        test('extraRound', () => {
            const shortDialog: CLM.TrainDialog = deepCopy(trainDialog1)
            shortDialog.rounds.pop()
            
            let result = doesTrainDialogMatch(shortDialog, trainDialog1)
            expect(result).toEqual(true)

            result = doesTrainDialogMatch(trainDialog1, shortDialog)
            expect(result).toEqual(true)
        })

        test('extraScorerStepLastRound', () => {
            const shortDialog: CLM.TrainDialog = deepCopy(trainDialog1)
            shortDialog.rounds[shortDialog.rounds.length - 1].scorerSteps.pop()
            
            let result = doesTrainDialogMatch(shortDialog, trainDialog1)
            expect(result).toEqual(true)

            result = doesTrainDialogMatch(trainDialog1, shortDialog)
            expect(result).toEqual(true)
        })

        test('extraScorerStepNotLastRound', () => {
            const shortDialog: CLM.TrainDialog = deepCopy(trainDialog1)
            shortDialog.rounds[shortDialog.rounds.length - 2].scorerSteps.pop()
            
            let result = doesTrainDialogMatch(shortDialog, trainDialog1)
            expect(result).toEqual(false)

            result = doesTrainDialogMatch(trainDialog1, shortDialog)
            expect(result).toEqual(false)
        })

        test('differentAction', () => {
            const changedDialog: CLM.TrainDialog = deepCopy(trainDialog1)
            const lastRound = changedDialog.rounds[changedDialog.rounds.length - 1]
            const lastScorerStep = lastRound.scorerSteps[lastRound.scorerSteps.length - 1]
            lastScorerStep.labelAction = "CHANGED"

            let result = doesTrainDialogMatch(changedDialog, trainDialog1)
            expect(result).toEqual(false)

            result = doesTrainDialogMatch(trainDialog1, changedDialog)
            expect(result).toEqual(false)
        })

        test('changedFilledEntities', () => {

            const changedDialog: CLM.TrainDialog = deepCopy(trainDialog1)
            const lastRound = changedDialog.rounds[changedDialog.rounds.length - 1]
            const lastScorerStep = lastRound.scorerSteps[lastRound.scorerSteps.length - 1]
            lastScorerStep.input.filledEntities.pop()

            let result = doesTrainDialogMatch(changedDialog, trainDialog1)
            expect(result).toEqual(false)

            result = doesTrainDialogMatch(trainDialog1, changedDialog)
            expect(result).toEqual(false)
        })
    })

    describe('findMatchingTrainDialog', () => {

        // Create two new train dailogs a bit different from the base
        const trainDialog2: CLM.TrainDialog = deepCopy(trainDialog1)
        const lastRound2 = trainDialog2.rounds[trainDialog2.rounds.length - 1]
        const lastScorerStep2 = lastRound2.scorerSteps[lastRound2.scorerSteps.length - 1]
        trainDialog2.trainDialogId = "trainDialog2"
        lastScorerStep2.labelAction = "CHANGED"

        const trainDialog3: CLM.TrainDialog = JSON.parse(JSON.stringify(trainDialog1))
        const lastRound3 = trainDialog3.rounds[trainDialog3.rounds.length - 1]
        const lastScorerStep3 = lastRound3.scorerSteps[lastRound3.scorerSteps.length - 1]
        trainDialog2.trainDialogId = "trainDialog3"
        lastScorerStep3.input.filledEntities.pop()

        test('found', () => {
            let result = findMatchingTrainDialog(trainDialog1, [trainDialog1, trainDialog2, trainDialog3])
            expect(result && result.trainDialogId).toEqual(trainDialog1.trainDialogId)

            result = findMatchingTrainDialog(trainDialog2, [trainDialog1, trainDialog2, trainDialog3])
            expect(result && result.trainDialogId).toEqual(trainDialog2.trainDialogId)
        })

        test('notFound', () => {
            let result = findMatchingTrainDialog(trainDialog1, [trainDialog2, trainDialog3])
            expect(result).toEqual(null)
        })
    })

    describe('isLonger', () => {

        test('removeRound', () => {
            
            // Create two new train dailogs a bit different from the base
            const trainDialog2: CLM.TrainDialog = JSON.parse(JSON.stringify(trainDialog1))
            trainDialog2.rounds.pop()

            let result = isLonger(trainDialog1, trainDialog2)
            expect(result).toEqual(true)

            result = isLonger(trainDialog2, trainDialog1)
            expect(result).toEqual(false)
        })

        test('removeScorerStep', () => {
            
            // Create two new train dailogs a bit different from the base
            const trainDialog2: CLM.TrainDialog = JSON.parse(JSON.stringify(trainDialog1))
            trainDialog2.rounds[trainDialog2.rounds.length - 1].scorerSteps.pop()

            let result = isLonger(trainDialog1, trainDialog2)
            expect(result).toEqual(true)

            result = isLonger(trainDialog2, trainDialog1)
            expect(result).toEqual(false)
        })

        test('same', () => {
            
            let result = isLonger(trainDialog1, trainDialog1)
            expect(result).toEqual(true)
        })
    })

    describe('margeTrainDialogs', () => {

        test('addTextVariation', () => {
            
            const trainDialog2: CLM.TrainDialog = deepCopy(trainDialog1)
            trainDialog2.rounds[0].extractorStep = makeExtractorStep(
                [{
                    "entity1_n_id": "entity1_n_value",
                    "entity2_n_id": "entity2_n_value"
                }]
            )

            // Need a copy as will be mutated
            let trainDialog1C = deepCopy(trainDialog1)
            let result = mergeTrainDialogs(trainDialog1C, trainDialog2)
            // Larger train dialog should be returned
            expect(result.trainDialogId).toEqual(trainDialog1C.trainDialogId)
            // New text variation should be added
            expect(result.rounds[0].extractorStep.textVariations.length).toEqual(2)
            // Existing text variation shouldn't be duplicated
            expect(result.rounds[1].extractorStep.textVariations.length).toEqual(1)

            // Need a copy as will be mutated
            trainDialog1C = deepCopy(trainDialog1)
            result = mergeTrainDialogs(trainDialog2, trainDialog1C)
            // Larger train dialog should be returned
            expect(result.trainDialogId).toEqual(trainDialog1C.trainDialogId)
            // New text variation should be added
            expect(result.rounds[0].extractorStep.textVariations.length).toEqual(2)
            // Existing text variation shouldn't be duplicated
            expect(result.rounds[1].extractorStep.textVariations.length).toEqual(1)
        })

        test('addRound', () => {
            
            const trainDialog2: CLM.TrainDialog = JSON.parse(JSON.stringify(trainDialog1))
            trainDialog2.rounds.pop()

            // Need a copy as will be mutated
            let trainDialog1C = deepCopy(trainDialog1)
            let result = mergeTrainDialogs(trainDialog1C, trainDialog2)
            // Larger train dialog should be returned
            expect(result.trainDialogId).toEqual(trainDialog1C.trainDialogId)
            // New should be present
            expect(result.rounds.length).toEqual(trainDialog1.rounds.length)

            // Need a copy as will be mutated
            trainDialog1C = deepCopy(trainDialog1)
            result = mergeTrainDialogs(trainDialog2, trainDialog1C)
            // Larger train dialog should be returned
            expect(result.trainDialogId).toEqual(trainDialog1C.trainDialogId)
            // New rounds should be present
            expect(result.rounds.length).toEqual(trainDialog1.rounds.length)
        })
    })
})
