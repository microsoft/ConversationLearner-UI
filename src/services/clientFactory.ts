/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import ClClient, { ClientHeaders } from './client'
import { AT } from '../types/ActionTypes'
import { ErrorInjector } from '../Utils/ErrorInjector'
import { ports } from '../types/const'
//import DebugErrors from '../components/modals/DebugErrors'

let sdkPort = ports.urlBotPort
let getClientHeaders = (): ClientHeaders => {
    console.warn(`You attempted to use the Conversation Learner Client before its getClientHeaders method was properly configured. Call setClientHeaders to configure`)
    return {
        botChecksum: '',
        memoryKey: ''
    }
}

export const getInstance = (actionType: AT): ClClient => {
    const forceError = (actionType && ErrorInjector.ShouldError(actionType));

    /**
     * Notice we provide wrapping get functions which invoke the local functions
     * This allows the client to always access the latest of getAccessToken and getClientHeaders without reconstructing a new client
     */
    // TODO: Refactor out the force error argument and need to take in paramter. This should be implemented in another layer as extension not modification
    // TODO: Allow configuration whole URI for SDK to enable communicating with hosted version (Likely change to getter function like access token)

    const getBaseUrl = () => `//localhost:${sdkPort}/sdk`
    return new ClClient(getBaseUrl, () => getClientHeaders(), {}, forceError)
}

export const setPort = (port: number) => {
    sdkPort = port
}

export const setHeaders = (newGetClientHeaders: () => ClientHeaders) => {
    getClientHeaders = newGetClientHeaders
}