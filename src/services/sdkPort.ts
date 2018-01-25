import * as ClientFactory from '../services/clientFactory'

const defaultPort = 5000
const localStorageSdkPortKey = 'blis-sdk-port'

export function initialize() {
    const existingSdkPort = get()
    if (Number.isNaN(existingSdkPort)) {
        set(defaultPort)
    }
    else {
        set(existingSdkPort)
    }
}

export const set = (port: number): void => {
    localStorage.setItem(localStorageSdkPortKey, port.toString())
    ClientFactory.setPort(port)
}

export const get = (): number => {
    return parseInt(localStorage.getItem(localStorageSdkPortKey))
}



