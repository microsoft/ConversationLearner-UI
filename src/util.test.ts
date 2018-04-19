/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { replace } from './util'

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
})