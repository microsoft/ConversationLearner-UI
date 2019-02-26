/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { replace, isNewActionUnique } from './util'
import * as CLM from '@conversationlearner/models'

describe('util', () => {
    describe('replace', () => {
        it('returns new array with item replaced and preserves order', () => {
            // Arrange
            const list = [{ id: 1, value: 'a' }, { id: 2, value: 'b' }, { id: 3, value: 'c' }]
            const newItem = { id: 2, value: 'edited' }
            const expected = [...list.slice(0, 1), newItem, ...list.slice(2)]

            // Act
            const actual = replace(list, newItem, x => x.id)

            // Assert
            expect(actual).not.toBe(expected)
            expect(actual).toEqual(expected)
        })
    })
    describe('isNewActionUniqueTEXT', () => {
        it('', () => {
            const sampleAction: CLM.ActionBase = {
                actionId: "103726c8-2cfe-46e6-ad1e-fef8dbe4d6c3",
                actionType: CLM.ActionTypes.TEXT,
                createdDateTime: "2019-02-25T00:00:00.000Z",
                isTerminal: true,
                negativeConditions: [],
                negativeEntities: [],
                packageCreationId: 0,
                packageDeletionId: 0,
                payload: '{"json":{"kind":"value","document":{"kind":"document","data":{},"nodes":[{"kind":"block","type":"line","isVoid":false,"data":{},"nodes":[{"kind":"text","leaves":[{"kind":"leaf","text":"hi","marks":[]}]}]}]}}}"',
                requiredConditions: [],
                requiredEntities: [],
                requiredEntitiesFromPayload: [],
                suggestedEntity: null,
                version: 0
            }

            let actionSet: CLM.ActionBase[] = []

            // as first action created
            expect(isNewActionUnique(sampleAction, actionSet)).toEqual(true)

            // as absolutely identical action
            actionSet.push(sampleAction)
            expect(isNewActionUnique(sampleAction, actionSet)).not.toBe(true)

            // as a similar, but not identical into very similar set
            actionSet = [{ ...sampleAction }]
            let similar = { ...sampleAction, isTerminal: !sampleAction.isTerminal }
            expect(isNewActionUnique(similar, actionSet)).not.toBe(false)

            // as a similar, but not identical into very similar set. how smart is the find operator?
            actionSet = [sampleAction]
            similar = { ...sampleAction, negativeEntities: ["fooled-you"] }
            expect(isNewActionUnique(similar, actionSet)).not.toBe(false)
        })
    })
    describe('isNewActionUniqueENDSESSION', () => {
        it('', () => {
            const sampleAction = {
                actionId: "c64988df-a707-46c9-873c-8de42b9a116d",
                actionType: CLM.ActionTypes.END_SESSION,
                createdDateTime: "2019-02-25T00:00:00.001Z",
                isTerminal: true,
                negativeConditions: [],
                negativeEntities: [],
                packageCreationId: 0,
                packageDeletionId: 0,
                payload: '"{"json":{"kind":"value","document":{"kind":"document","data":{},"nodes":[{"kind":"block","type":"line","isVoid":false,"data":{},"nodes":[{"kind":"text","leaves":[{"kind":"leaf","text":"1","marks":[]}]}]}]}}}"',
                requiredConditions: [],
                requiredEntities: [],
                requiredEntitiesFromPayload: [],
                suggestedEntity: null,
                version: 0
            }

            let actionSet: CLM.ActionBase[] = []

            // as first action created
            expect(isNewActionUnique(sampleAction, actionSet)).toEqual(true)

            // as absolutely identical action
            actionSet.push(sampleAction)
            expect(isNewActionUnique(sampleAction, actionSet)).not.toBe(true)

            // as a similar, but not identical into very similar set
            actionSet = [{ ...sampleAction }]
            let similar = { ...sampleAction, isTerminal: !sampleAction.isTerminal }
            expect(isNewActionUnique(similar, actionSet)).not.toBe(false)

            // as a similar, but not identical into very similar set. how smart is the find operator?
            actionSet = [sampleAction]
            similar = { ...sampleAction, negativeEntities: ["fooled-you"] }
            expect(isNewActionUnique(similar, actionSet)).not.toBe(false)
        })
    })
    describe('isNewActionUniqueCARD', () => {
        it('', () => {
            const sampleAction = {
                actionId: "83c94294-3a42-49ae-ba84-a6f43fda2f3a",
                actionType: CLM.ActionTypes.CARD,
                createdDateTime: "2019-02-25T23:01:35.456Z",
                isTerminal: true,
                negativeConditions: [],
                negativeEntities: [],
                packageCreationId: 0,
                packageDeletionId: 0,
                payload: '"{"payload":"prompt","arguments":[{"parameter":"question","value":{"json":{"kind":"value","document":{"kind":"document","data":{},"nodes":[{"kind":"block","type":"line","isVoid":false,"data":{},"nodes":[{"kind":"text","leaves":[{"kind":"leaf","text":"left or right?","marks":[]}]}]}]}}}}]}"',
                requiredConditions: [],
                requiredEntities: [],
                requiredEntitiesFromPayload: [],
                suggestedEntity: null,
                version: 0
            }

            let actionSet: CLM.ActionBase[] = []

            // as first action created
            expect(isNewActionUnique(sampleAction, actionSet)).toEqual(true)

            // as absolutely identical action
            actionSet.push(sampleAction)
            expect(isNewActionUnique(sampleAction, actionSet)).not.toBe(true)

            // as a similar, but not identical into very similar set
            actionSet = [{ ...sampleAction }]
            let similar = { ...sampleAction, isTerminal: !sampleAction.isTerminal }
            expect(isNewActionUnique(similar, actionSet)).not.toBe(false)

            // as a similar, but not identical into very similar set. how smart is the find operator?
            actionSet = [sampleAction]
            similar = { ...sampleAction, negativeEntities: ["fooled-you"] }
            expect(isNewActionUnique(similar, actionSet)).not.toBe(false)
        })
    })
    describe('isNewActionUniqueDiverseSet', () => {
        it('exercises isNewActionUnique by adding a new action into a diverse bag of existing actions', () => {
            const sampleActionText: CLM.ActionBase = {
                actionId: "103726c8-2cfe-46e6-ad1e-fef8dbe4d6c3",
                actionType: CLM.ActionTypes.TEXT,
                createdDateTime: "2019-02-25T00:00:00.000Z",
                isTerminal: true,
                negativeConditions: [],
                negativeEntities: [],
                packageCreationId: 0,
                packageDeletionId: 0,
                payload: '{"json":{"kind":"value","document":{"kind":"document","data":{},"nodes":[{"kind":"block","type":"line","isVoid":false,"data":{},"nodes":[{"kind":"text","leaves":[{"kind":"leaf","text":"hi","marks":[]}]}]}]}}}"',
                requiredConditions: [],
                requiredEntities: [],
                requiredEntitiesFromPayload: [],
                suggestedEntity: null,
                version: 0
            }

            const sampleActionSession = {
                actionId: "c64988df-a707-46c9-873c-8de42b9a116d",
                actionType: CLM.ActionTypes.END_SESSION,
                createdDateTime: "2019-02-25T00:00:00.001Z",
                isTerminal: true,
                negativeConditions: [],
                negativeEntities: [],
                packageCreationId: 0,
                packageDeletionId: 0,
                payload: '"{"json":{"kind":"value","document":{"kind":"document","data":{},"nodes":[{"kind":"block","type":"line","isVoid":false,"data":{},"nodes":[{"kind":"text","leaves":[{"kind":"leaf","text":"1","marks":[]}]}]}]}}}"',
                requiredConditions: [],
                requiredEntities: [],
                requiredEntitiesFromPayload: [],
                suggestedEntity: null,
                version: 0
            }

            const sampleActionCard = {
                actionId: "83c94294-3a42-49ae-ba84-a6f43fda2f3a",
                actionType: CLM.ActionTypes.CARD,
                createdDateTime: "2019-02-25T23:01:35.456Z",
                isTerminal: true,
                negativeConditions: [],
                negativeEntities: [],
                packageCreationId: 0,
                packageDeletionId: 0,
                payload: '"{"payload":"prompt","arguments":[{"parameter":"question","value":{"json":{"kind":"value","document":{"kind":"document","data":{},"nodes":[{"kind":"block","type":"line","isVoid":false,"data":{},"nodes":[{"kind":"text","leaves":[{"kind":"leaf","text":"left or right?","marks":[]}]}]}]}}}}]}"',
                requiredConditions: [],
                requiredEntities: [],
                requiredEntitiesFromPayload: [],
                suggestedEntity: null,
                version: 0
            }

            const actionTypesExercised = [sampleActionText, sampleActionSession, sampleActionCard]

            // Asserts

            actionTypesExercised.forEach(newAction => {

                let actionSet: CLM.ActionBase[] = []

                // as a duplicate in a diverse set
                actionSet = actionTypesExercised
                expect(isNewActionUnique(newAction, actionSet)).not.toBe(true)

                // as first of its type into a diverse set
                actionSet = actionTypesExercised.filter(action => action.actionType !== newAction.actionType)
                expect(isNewActionUnique(newAction, actionSet)).toEqual(true)

                // as a similar, but not identical into a diverse set
                actionSet = actionTypesExercised
                const similar = { ...newAction, isTerminal: !newAction.isTerminal }
                expect(isNewActionUnique(similar, actionSet)).toEqual(true)

            })

        })
    })

})