/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
const localStorageKey = 'conversation-learner-state'

export const load = <T>(): T | undefined => {
    try {
        const serializedState = localStorage.getItem(localStorageKey)
        if (serializedState === null) {
            return undefined
        }
        
        return JSON.parse(serializedState) as T
    }
    catch (error) {
        console.warn(`Error during local storage load: `, error)
        return undefined
    }
}

export const save = <T>(state: T): void => {
    try {
        const serializedState = JSON.stringify(state, null, '  ')
        localStorage.setItem(localStorageKey, serializedState)
    }
    catch (error) {
        console.warn(`Error during local storage save: `, error)
    }
}