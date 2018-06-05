/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import ClClient from './client'
import { AT } from '../types/ActionTypes'
import { ErrorInjector } from '../ErrorInjector';
//import DebugErrors from '../components/modals/DebugErrors'

let sdkPort = 5000
let getMemoryKey = (): string => {
    console.warn(`You attempted to use the Conversation Learner Client before its getMemoryKey method was properly configured. Call setMemoryKey to configure`)
    return ''
}

export const getInstance = (actionType: AT): ClClient => {
    let forceError = (actionType && ErrorInjector.ShouldError(actionType));

    /**
     * Notice we provide wrapping get functions which invoke the local functions
     * This allows the client to always access the latest of getAccessToken and getMemoryKey without reconstructing a new client
     */
    // TODO: Refactor out the force error argument and need to take in paramter. This should be implemented in another layer as extension not modification
    // TODO: Allow configuration whole URI for SDK to enable communicating with hosted version (Likely change to getter function like access token)
    
    return new ClClient(`http://localhost:${sdkPort}`, () => getMemoryKey(), null, forceError)
}

export const setPort = (port: number) => {
    sdkPort = port
}

export const setMemoryKey = (newGetMemoryKey: () => string) => {
    getMemoryKey = newGetMemoryKey
}