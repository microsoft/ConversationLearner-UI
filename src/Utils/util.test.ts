/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { replace, equal } from './util'

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

    describe('equal', () => {
        test('given arrays of different length return false', () => {
            // Arrange
            const as = [1,2,3]
            const bs = [1,2]

            // Act
            const actual = equal(as, bs)

            // Assert
            expect(actual).toBe(false)
        })

        test('given arrays of same length but different items return false', () => {
            // Arrange
            const as = [1,2,3]
            const bs = [1,2,4]

            // Act
            const actual = equal(as, bs)

            // Assert
            expect(actual).toBe(false)
        })

        test('given arrays of same length and values but different order return false', () => {
            // Arrange
            const as = [1,2,3]
            const bs = [1,3,2]

            // Act
            const actual = equal(as, bs)

            // Assert
            expect(actual).toBe(false)
        })

        test('given two arrays with same values return true', () => {
            // Arrange
            const as = [1,2,3]
            const bs = [1,2,3]

            // Act
            const actual = equal(as, bs)

            // Assert
            expect(actual).toBe(true)
        })
    })
})