/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Test from './TestObjects'

describe('TestObject', () => {

    const ALPHA = "alpha"
    const BETA = "beta"
    const CHARLIE = "charlie"
    const conversationId = "1234" 

    const makePair = (sourceA: string, sourceB: string, result: Test.RatingResult): Test.RatingPair => {
        const sourceNames = [sourceA, sourceB].sort()
        return {
            conversationId,
            sourceNames: [sourceNames[0], sourceNames[1]],
            result
        }
    }

    const addPair = (testSet: Test.TestSet, sourceA: string, sourceB: string, result: Test.RatingResult): void => {
        testSet.ratingPairs.push(makePair(sourceA, sourceB, result))
    }

    describe('setFirstIsBetter', () => {

        test('alphaFirst', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.UNKNOWN)
            testSet.setFirstIsBetter(ALPHA, BETA, conversationId)

            const pair = testSet.getRatingPair(ALPHA, BETA, conversationId)
            expect(pair).not.toBeUndefined()
            if (pair) {
                expect(pair.result).toEqual(Test.RatingResult.FIRST)
            }
        })

        test('alphaSecond', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.UNKNOWN)
            testSet.setFirstIsBetter(BETA, ALPHA, conversationId)

            const pair = testSet.getRatingPair(ALPHA, BETA, conversationId)
            expect(pair).not.toBeUndefined()
            if (pair) {
                expect(pair.result).toEqual(Test.RatingResult.SECOND)
            }
        })
    })

    describe('whichIsBetter', () => {

        test('alphaFirst', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.FIRST)
            testSet.setFirstIsBetter(ALPHA, BETA, conversationId)

            const better = testSet.whichIsBetter(ALPHA, BETA, conversationId)
            expect(better).toEqual(ALPHA)
        })

        test('alphaSecond', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.SECOND)
            testSet.setFirstIsBetter(BETA, ALPHA, conversationId)

            const better = testSet.whichIsBetter(ALPHA, BETA, conversationId)
            expect(better).toEqual(BETA)
        })
    })

    describe('addRatingResult', () => {

        test('If A=B and A=C then B=C', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.UNKNOWN)
            addPair(testSet, ALPHA, CHARLIE, Test.RatingResult.SAME)
            addPair(testSet, BETA, CHARLIE, Test.RatingResult.UNKNOWN)

            const pairAB = makePair(ALPHA, BETA, Test.RatingResult.SAME) 
            testSet.addRatingResult(pairAB)

            const rating = testSet.getRating(BETA, CHARLIE, conversationId)
            expect(rating).toEqual(Test.RatingResult.SAME)
        })

        test('If A=B and B=C then A=C', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.UNKNOWN)
            addPair(testSet, ALPHA, CHARLIE, Test.RatingResult.UNKNOWN)
            addPair(testSet, BETA, CHARLIE, Test.RatingResult.SAME)

            const pairAB = makePair(ALPHA, BETA, Test.RatingResult.SAME) 
            testSet.addRatingResult(pairAB)

            const rating = testSet.getRating(ALPHA, CHARLIE, conversationId)
            expect(rating).toEqual(Test.RatingResult.SAME)
        })

        test('If A>B and B=C then A>C', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.UNKNOWN)
            addPair(testSet, ALPHA, CHARLIE, Test.RatingResult.UNKNOWN)
            addPair(testSet, BETA, CHARLIE, Test.RatingResult.SAME)

            const pairAB = makePair(ALPHA, BETA, Test.RatingResult.FIRST) 
            testSet.addRatingResult(pairAB)

            const better = testSet.whichIsBetter(ALPHA, CHARLIE, conversationId)
            expect(better).toEqual(ALPHA)
        })

        test('If A<B and B=C then A<C', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.UNKNOWN)
            addPair(testSet, ALPHA, CHARLIE, Test.RatingResult.UNKNOWN)
            addPair(testSet, BETA, CHARLIE, Test.RatingResult.SAME)

            const pairAB = makePair(ALPHA, BETA, Test.RatingResult.SECOND) 
            testSet.addRatingResult(pairAB)

            const better = testSet.whichIsBetter(ALPHA, CHARLIE, conversationId)
            expect(better).toEqual(CHARLIE)
        })

        test('CAB: If A>B and C>A than C>B', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.UNKNOWN)
            addPair(testSet, ALPHA, CHARLIE, Test.RatingResult.UNKNOWN)
            addPair(testSet, BETA, CHARLIE, Test.RatingResult.UNKNOWN)
            testSet.setFirstIsBetter(CHARLIE, ALPHA, conversationId)

            const pairAB = makePair(ALPHA, BETA, Test.RatingResult.FIRST)
            testSet.addRatingResult(pairAB)

            const better = testSet.whichIsBetter(BETA, CHARLIE, conversationId)
            expect(better).toEqual(CHARLIE)
        })

        test('BAC: If B>A and A>C than B>C', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.UNKNOWN)
            addPair(testSet, ALPHA, CHARLIE, Test.RatingResult.UNKNOWN)
            addPair(testSet, BETA, CHARLIE, Test.RatingResult.UNKNOWN)
            testSet.setFirstIsBetter(ALPHA, CHARLIE, conversationId)

            const pairAB = makePair(ALPHA, BETA, Test.RatingResult.SECOND)
            testSet.addRatingResult(pairAB)

            const better = testSet.whichIsBetter(BETA, CHARLIE, conversationId)
            expect(better).toEqual(BETA)
        })

        test('CBA: If C>B and B>A than C>A', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.UNKNOWN)
            addPair(testSet, ALPHA, CHARLIE, Test.RatingResult.UNKNOWN)
            addPair(testSet, BETA, CHARLIE, Test.RatingResult.UNKNOWN)
            testSet.setFirstIsBetter(CHARLIE, BETA, conversationId)

            const pairAB = makePair(ALPHA, BETA, Test.RatingResult.SECOND)
            testSet.addRatingResult(pairAB)

            const better = testSet.whichIsBetter(ALPHA, CHARLIE, conversationId)
            expect(better).toEqual(CHARLIE)
        })

        test('ABC: If A>B and B>C than A>C', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.UNKNOWN)
            addPair(testSet, ALPHA, CHARLIE, Test.RatingResult.UNKNOWN)
            addPair(testSet, BETA, CHARLIE, Test.RatingResult.UNKNOWN)
            testSet.setFirstIsBetter(ALPHA, BETA, conversationId)

            const pairAB = makePair(BETA, CHARLIE, Test.RatingResult.FIRST)
            testSet.addRatingResult(pairAB)

            const better = testSet.whichIsBetter(ALPHA, CHARLIE, conversationId)
            expect(better).toEqual(ALPHA)
        })

        test('BCA: If B>C and C>A than B>A', () => {

            const testSet = Test.TestSet.Create()
            addPair(testSet, ALPHA, BETA, Test.RatingResult.UNKNOWN)
            addPair(testSet, ALPHA, CHARLIE, Test.RatingResult.UNKNOWN)
            addPair(testSet, BETA, CHARLIE, Test.RatingResult.UNKNOWN)
            testSet.setFirstIsBetter(BETA, CHARLIE, conversationId)

            const pairAB = makePair(CHARLIE, ALPHA, Test.RatingResult.SECOND)
            testSet.addRatingResult(pairAB)

            const better = testSet.whichIsBetter(ALPHA, BETA, conversationId)
            expect(better).toEqual(BETA)
        })
    })
})
