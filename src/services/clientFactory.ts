import BlisClient from './blisClient'
import ApiConfig from '../epics/config'

let getAccessToken = () => ''
let getMemoryKey = () => ''

export const getInstance = (): BlisClient => {
    /**
     * Notice we provide wrapping get functions which invoke the local functions
     * This allows the client to always access the latest of getAccessToken and getMemoryKey without reconstructing a new client
     */
    return new BlisClient(ApiConfig.BlisClientEnpoint, () => getAccessToken(), () => getMemoryKey())
}

export const setAccessToken = (newGetAccessToken: () => string) => {
    getAccessToken = newGetAccessToken
}

export const setMemoryKey = (newGetMemoryKey: () => string) => {
    getMemoryKey = newGetMemoryKey
}