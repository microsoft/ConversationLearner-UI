/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { replace, equal, isActionUnique, deepCopy } from './util'
import * as CLM from '@conversationlearner/models'

describe('util', () => {

    describe('deepcopy', () => {

        test('returns a valid deep copy', () => {

            const testObj = {
                dateTime: Date.now(),
                nullV: null,
                undefinedV: undefined,
                complex: {
                    dateTime: Date.now(),
                    number: 5,
                    string: "blah",
                    complex2: {
                        arrayV: [1, 2, 3],
                        array2: [{number: 1, string: "1"}, {number: 2, string: "2"}]
                    }
                }
            }

            const copy = deepCopy(testObj)

            expect(JSON.stringify(testObj)).toEqual(JSON.stringify(copy))
        })

    })

    describe('replace', () => {

        test('returns new array with item replaced and preserves order', () => {
            // Arrange
            const list = [{ id: 1, value: 'a' }, { id: 2, value: 'b' }, { id: 3, value: 'c' }]
            const newItem = { id: 2, value: 'edited' }
            const expected = [...list.slice(0, 1), newItem, ...list.slice(2)]

            // Act
            const actual = replace(list, newItem, x => x.id)

            // Assert
            expect(actual).toEqual(expected)
        })

    })

    describe('equal', () => {

        test('given arrays of different length return false', () => {
            // Arrange
            const as = [1, 2, 3]
            const bs = [1, 2]

            // Act
            const actual = equal(as, bs)

            // Assert
            expect(actual).toBe(false)
        })

        test('given arrays of same length but different items return false', () => {
            // Arrange
            const as = [1, 2, 3]
            const bs = [1, 2, 4]

            // Act
            const actual = equal(as, bs)

            // Assert
            expect(actual).toBe(false)
        })

        test('given arrays of same length and values but different order return false', () => {
            // Arrange
            const as = [1, 2, 3]
            const bs = [1, 3, 2]

            // Act
            const actual = equal(as, bs)

            // Assert
            expect(actual).toBe(false)
        })

        test('given two arrays with same values return true', () => {
            // Arrange
            const as = [1, 2, 3]
            const bs = [1, 2, 3]

            // Act
            const actual = equal(as, bs)

            // Assert
            expect(actual).toBe(true)
        })
    })

    describe('isActionUnique', () => {

        describe('TEXT actions', () => {

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
                version: 0,
                entityId: undefined,
                enumValueId: undefined,
            }

            let actionSet: CLM.ActionBase[] = []

            test('if very first action created return true', () => {
                expect(isActionUnique(sampleAction, actionSet)).toBe(true)
            })

            test('if identical to existing action return false', () => {
                actionSet.push(sampleAction)
                expect(isActionUnique(sampleAction, actionSet)).toBe(false)
            })

            test('if similar yet different in termination to existing actions return true', () => {
                actionSet = [sampleAction]
                const similar = { ...sampleAction, isTerminal: !sampleAction.isTerminal }
                expect(isActionUnique(similar, actionSet)).toBe(true)
            })

            test('if similar yet different by required entities to existing actions return true', () => {
                actionSet = [sampleAction]
                const similar = { ...sampleAction, requiredEntities: ["85eccbec-7d01-4aea-a704-b2fdab09cf32"] }
                expect(isActionUnique(similar, actionSet)).toBe(true)
            })

        })

        describe('END_SESSION actions', () => {

            const sampleAction: CLM.ActionBase = {
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
                version: 0,
                entityId: undefined,
                enumValueId: undefined,
            }

            let actionSet: CLM.ActionBase[] = []

            test('if very first action created return true', () => {
                expect(isActionUnique(sampleAction, actionSet)).toBe(true)
            })

            test('if identical to existing action return false', () => {
                actionSet.push(sampleAction)
                expect(isActionUnique(sampleAction, actionSet)).toBe(false)
            })

            test('if similar yet different in termination to existing actions return true', () => {
                actionSet = [{ ...sampleAction }]
                const similar = { ...sampleAction, isTerminal: !sampleAction.isTerminal }
                expect(isActionUnique(similar, actionSet)).toBe(true)
            })

            test('if similar yet different by required entities to existing actions return true', () => {
                actionSet = [sampleAction]
                const similar = { ...sampleAction, isTerminal: !sampleAction.isTerminal }
                expect(isActionUnique(similar, actionSet)).toBe(true)
            })

        })

        describe('CARD actions', () => {

            const sampleAction: CLM.ActionBase = {
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
                version: 0,
                entityId: undefined,
                enumValueId: undefined,
            }

            let actionSet: CLM.ActionBase[] = []

            test('if very first action created return true', () => {
                expect(isActionUnique(sampleAction, actionSet)).toEqual(true)
            })

            test('if identical to existing action return false', () => {
                actionSet.push(sampleAction)
                expect(isActionUnique(sampleAction, actionSet)).toEqual(false)
            })

            test('if similar yet different in termination to existing actions return true', () => {
                actionSet = [{ ...sampleAction }]
                const similar = { ...sampleAction, isTerminal: !sampleAction.isTerminal }
                expect(isActionUnique(similar, actionSet)).toEqual(true)
            })

            test('if similar yet different by required entities to existing actions return true', () => {
                actionSet = [sampleAction]
                const similar = { ...sampleAction, isTerminal: !sampleAction.isTerminal }
                expect(isActionUnique(similar, actionSet)).toEqual(true)
            })
        })

        describe('tries adding the new actions to a diverse bag of existing actions', () => {

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
                version: 0,
                entityId: undefined,
                enumValueId: undefined,
            }

            const sampleActionSession: CLM.ActionBase = {
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
                version: 0,
                entityId: undefined,
                enumValueId: undefined,
            }

            const sampleActionCard: CLM.ActionBase = {
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
                version: 0,
                entityId: undefined,
                enumValueId: undefined,
            }

            const actionTypesExercised = [sampleActionText, sampleActionSession, sampleActionCard]

            // Asserts

            actionTypesExercised.forEach(newAction => {

                let actionSet: CLM.ActionBase[] = []

                test('if duplicate in a diverse set return false', () => {
                    actionSet = actionTypesExercised
                    expect(isActionUnique(newAction, actionSet)).toEqual(false)
                })

                test('if first of its type into a diverse set return true', () => {
                    actionSet = actionTypesExercised.filter(action => action.actionType !== newAction.actionType)
                    expect(isActionUnique(newAction, actionSet)).toEqual(true)
                })

                test('if similar, but not identical into a diverse set, return true', () => {
                    actionSet = actionTypesExercised
                    const similar = { ...newAction, isTerminal: !newAction.isTerminal }
                    expect(isActionUnique(similar, actionSet)).toEqual(true)
                })

            })

        })

    })

})
