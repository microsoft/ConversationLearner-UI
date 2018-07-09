/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as ClientFactory from '../services/clientFactory'

const previousDefault = 5000
export const defaultPort = 3978
const localStorageSdkPortKey = 'conversationlearner-sdk-port'

export const set = (port: number): void => {
    localStorage.setItem(localStorageSdkPortKey, port.toString())
    ClientFactory.setPort(port)
}

export const get = (): number => {
    return parseInt(localStorage.getItem(localStorageSdkPortKey), 10)
}

export function initialize() {
    const existingSdkPort = get()
    if (Number.isNaN(existingSdkPort)) {
        set(defaultPort)
    } else if (existingSdkPort === previousDefault) {
        set(defaultPort)
    } else {
        set(existingSdkPort)
    }
}