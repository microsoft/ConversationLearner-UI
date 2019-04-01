/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import { doesTrainDialogMatch, findMatchingTrainDialog, isTrainDialogLonger, mergeTrainDialogs } from './dialogUtils'
import { makeTrainDialog, makeExtractorStep, makeScorerStep, makeLabelEntities } from './testDataUtil'
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

    const copyTrainDialog = (trainDialogId?: string) => {
        const copy = deepCopy(trainDialog1)
        copy.trainDialogId = trainDialogId || CLM.ModelUtils.generateGUID()
        return copy
    }

    describe('doesTrainDialogMatch', () => {

        test('exactMatch', () => {

            const trainDialog2 = copyTrainDialog()

            let result = doesTrainDialogMatch(trainDialog1, trainDialog2)
            expect(result).toEqual(true)

            // Never match to self
            result = doesTrainDialogMatch(trainDialog1, trainDialog1)
            expect(result).toEqual(false)
        })

        test('extraRound', () => {

            const shortDialog = copyTrainDialog()

            shortDialog.rounds.pop()
            
            let result = doesTrainDialogMatch(shortDialog, trainDialog1)
            expect(result).toEqual(true)

            result = doesTrainDialogMatch(trainDialog1, shortDialog)
            expect(result).toEqual(true)
        })

        test('changedExtractorStep', () => {

            const newDialog = copyTrainDialog()

            // Add a label - should fail
            let newLabelledEntities = makeLabelEntities({"new_id": "value"})
            newDialog.rounds[0].extractorStep.textVariations[0].labelEntities.push(newLabelledEntities[0])
            
            let result = doesTrainDialogMatch(newDialog, trainDialog1)
            expect(result).toEqual(false)

            result = doesTrainDialogMatch(trainDialog1, newDialog)
            expect(result).toEqual(false)

            // Delete all labels - should fail
            newDialog.rounds[0].extractorStep.textVariations[0].labelEntities = []
            
            result = doesTrainDialogMatch(newDialog, trainDialog1)
            expect(result).toEqual(false)

            result = doesTrainDialogMatch(trainDialog1, newDialog)
            expect(result).toEqual(false)

            // Different labels - should fail
            newLabelledEntities = makeLabelEntities({"entityN1_id": "entity1_value", "entityN2_id": "entity2_value"})
            newDialog.rounds[0].extractorStep.textVariations[0].labelEntities = newLabelledEntities
            
            result = doesTrainDialogMatch(newDialog, trainDialog1)
            expect(result).toEqual(false)

            result = doesTrainDialogMatch(trainDialog1, newDialog)
            expect(result).toEqual(false)

            // Multiple of same entity should be ok
            newLabelledEntities = deepCopy(trainDialog1.rounds[0].extractorStep.textVariations[0].labelEntities)
            newLabelledEntities.push(trainDialog1.rounds[0].extractorStep.textVariations[0].labelEntities[0])
            newDialog.rounds[0].extractorStep.textVariations[0].labelEntities = newLabelledEntities
            result = doesTrainDialogMatch(newDialog, trainDialog1)
            expect(result).toEqual(true)

            result = doesTrainDialogMatch(trainDialog1, newDialog)
            expect(result).toEqual(true)
        })

        test('extraScorerStepLastRound', () => {

            const shortDialog = copyTrainDialog()

            shortDialog.rounds[shortDialog.rounds.length - 1].scorerSteps.pop()
            
            let result = doesTrainDialogMatch(shortDialog, trainDialog1)
            expect(result).toEqual(true)

            result = doesTrainDialogMatch(trainDialog1, shortDialog)
            expect(result).toEqual(true)
        })

        test('noScorerStepLastRound', () => {

            const shortDialog = copyTrainDialog()

            shortDialog.rounds[shortDialog.rounds.length - 1].scorerSteps = []
            
            let result = doesTrainDialogMatch(shortDialog, trainDialog1)
            expect(result).toEqual(true)

            result = doesTrainDialogMatch(trainDialog1, shortDialog)
            expect(result).toEqual(true)
        })

        test('extraRoundAndNoScorerStepLastRound', () => {

            const shortDialog = copyTrainDialog()
            shortDialog.rounds.pop()
            shortDialog.rounds[shortDialog.rounds.length - 1].scorerSteps = []
            
            let result = doesTrainDialogMatch(shortDialog, trainDialog1)
            expect(result).toEqual(true)

            result = doesTrainDialogMatch(trainDialog1, shortDialog)
            expect(result).toEqual(true)
        })

        test('extraScorerStepNotLastRound', () => {

            const shortDialog = copyTrainDialog()

            shortDialog.rounds[shortDialog.rounds.length - 2].scorerSteps.pop()
            
            let result = doesTrainDialogMatch(shortDialog, trainDialog1)
            expect(result).toEqual(false)

            result = doesTrainDialogMatch(trainDialog1, shortDialog)
            expect(result).toEqual(false)
        })

        test('differentAction', () => {

            const changedDialog = copyTrainDialog()

            const lastRound = changedDialog.rounds[changedDialog.rounds.length - 1]
            const lastScorerStep = lastRound.scorerSteps[lastRound.scorerSteps.length - 1]
            lastScorerStep.labelAction = "CHANGED"

            let result = doesTrainDialogMatch(changedDialog, trainDialog1)
            expect(result).toEqual(false)

            result = doesTrainDialogMatch(trainDialog1, changedDialog)
            expect(result).toEqual(false)
        })

        test('changedFilledEntities', () => {

            const changedDialog = copyTrainDialog()

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
        const trainDialog2 = copyTrainDialog("trainDialog2")

        const lastRound2 = trainDialog2.rounds[trainDialog2.rounds.length - 1]
        const lastScorerStep2 = lastRound2.scorerSteps[lastRound2.scorerSteps.length - 1]
        lastScorerStep2.labelAction = "CHANGED"

        const trainDialog3 = copyTrainDialog("trainDialog3")
        const lastRound3 = trainDialog3.rounds[trainDialog3.rounds.length - 1]
        const lastScorerStep3 = lastRound3.scorerSteps[lastRound3.scorerSteps.length - 1]
        lastScorerStep3.input.filledEntities.pop()

        test('found', () => {
            const trainDialog1C = copyTrainDialog()
            let result = findMatchingTrainDialog(trainDialog1C, [trainDialog1, trainDialog2, trainDialog3])
            expect(result && result.trainDialogId).toEqual(trainDialog1.trainDialogId)

            const trainDialog2C = deepCopy(trainDialog2)
            trainDialog2C.trainDialogId = "trainDialog2C"
            result = findMatchingTrainDialog(trainDialog2C, [trainDialog1, trainDialog2, trainDialog3])
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
            const trainDialog2 = copyTrainDialog()
            trainDialog2.rounds.pop()

            let result = isTrainDialogLonger(trainDialog1, trainDialog2)
            expect(result).toEqual(true)

            result = isTrainDialogLonger(trainDialog2, trainDialog1)
            expect(result).toEqual(false)
        })

        test('removeScorerStep', () => {
            
            // Create two new train dailogs a bit different from the base
            const trainDialog2 = copyTrainDialog()
            trainDialog2.rounds[trainDialog2.rounds.length - 1].scorerSteps.pop()

            let result = isTrainDialogLonger(trainDialog1, trainDialog2)
            expect(result).toEqual(true)

            result = isTrainDialogLonger(trainDialog2, trainDialog1)
            expect(result).toEqual(false)
        })

        test('same', () => {
            
            let result = isTrainDialogLonger(trainDialog1, trainDialog1)
            expect(result).toEqual(true)
        })
    })

    describe('mergeTrainDialogs', () => {

        test('addTextVariation', () => {
            
            const trainDialog2 = copyTrainDialog()
            trainDialog2.rounds[0].extractorStep = makeExtractorStep(
                [{
                    "entity1_id": "entity1_value_new",
                    "entity2_id": "entity2_value_new"
                }]
            )

            // Need a copy as will be mutated
            let trainDialog1C  = copyTrainDialog()
            let result = mergeTrainDialogs(trainDialog1C, trainDialog2)
            // New text variation should be added
            expect(result.rounds[0].extractorStep.textVariations.length).toEqual(2)
            // Existing text variation shouldn't be duplicated
            expect(result.rounds[1].extractorStep.textVariations.length).toEqual(1)

            // Need a copy as will be mutated
            trainDialog1C = copyTrainDialog()
            result = mergeTrainDialogs(trainDialog2, trainDialog1C)
            // New text variation should be added
            expect(result.rounds[0].extractorStep.textVariations.length).toEqual(2)
            // Existing text variation shouldn't be duplicated
            expect(result.rounds[1].extractorStep.textVariations.length).toEqual(1)
        })

        test('addScorerStep', () => {
            
            const trainDialog2 = copyTrainDialog()
            const lastRound = trainDialog2.rounds.length - 1
            trainDialog2.rounds[lastRound].scorerSteps.push(
                makeScorerStep("action5", ["entity1_id", "entity2_id"])
            )

            // Need a copy as will be mutated
            let trainDialog1C  = copyTrainDialog()
            let result = mergeTrainDialogs(trainDialog1C, trainDialog2)
            // Larger train dialog should be returned
            expect(result.trainDialogId).toEqual(trainDialog2.trainDialogId)
            // New scorer step should be added
            expect(result.rounds[lastRound].scorerSteps.length).toEqual(trainDialog1.rounds[lastRound].scorerSteps.length + 1)

            // Need a copy as will be mutated
            trainDialog1C = copyTrainDialog()
            result = mergeTrainDialogs(trainDialog2, trainDialog1C)
            // Larger train dialog should be returned
            expect(result.trainDialogId).toEqual(trainDialog2.trainDialogId)
            // New scorer step should be added
            expect(result.rounds[lastRound].scorerSteps.length).toEqual(trainDialog1.rounds[lastRound].scorerSteps.length + 1)
        })

        test('addRound', () => {
            
            const trainDialog2 = copyTrainDialog()
            trainDialog2.rounds.pop()

            // Need a copy as will be mutated
            let trainDialog1C = copyTrainDialog()
            let result = mergeTrainDialogs(trainDialog1C, trainDialog2)
            // Larger train dialog should be returned
            expect(result.trainDialogId).toEqual(trainDialog1C.trainDialogId)
            // New should be present
            expect(result.rounds.length).toEqual(trainDialog1.rounds.length)

            // Need a copy as will be mutated
            trainDialog1C = copyTrainDialog()
            result = mergeTrainDialogs(trainDialog2, trainDialog1C)
            // Larger train dialog should be returned
            expect(result.trainDialogId).toEqual(trainDialog1C.trainDialogId)
            // New rounds should be present
            expect(result.rounds.length).toEqual(trainDialog1.rounds.length)
        })

        test('keysAndDescription', () => {
            
            const trainDialog1C = copyTrainDialog()
            trainDialog1C.tags = ["old1", "old2"]
            trainDialog1C.description = "short"

            const trainDialog2 = copyTrainDialog()
            trainDialog2.tags = ["old1", "new2"]
            trainDialog2.description = "a long description"

            let result = mergeTrainDialogs(trainDialog1C, trainDialog2)
            expect(result.tags.length).toEqual(3)
            expect(result.description).toEqual("a long description")

            trainDialog1C.tags = ["old1", "old2"]
            trainDialog2.tags = []
            trainDialog1C.description = "this is a long description"
            trainDialog2.description = "tiny"

            result = mergeTrainDialogs(trainDialog1C, trainDialog2)
            expect(result.tags.length).toEqual(2)
            expect(result.description).toEqual("this is a long description")
        })
    })
})
