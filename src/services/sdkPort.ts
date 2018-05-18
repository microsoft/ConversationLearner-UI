/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as ClientFactory from '../services/clientFactory'

export const defaultPort = 5000
const localStorageSdkPortKey = 'conversationlearner-sdk-port'

export function initialize() {
    const existingSdkPort = get()
    if (Number.isNaN(existingSdkPort)) {
        set(defaultPort)
    } else {
        set(existingSdkPort)
    }
}

export const set = (port: number): void => {
    localStorage.setItem(localStorageSdkPortKey, port.toString())
    ClientFactory.setPort(port)
}

export const get = (): number => {
    return parseInt(localStorage.getItem(localStorageSdkPortKey), 10)
}
