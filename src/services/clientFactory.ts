import BlisClient from './blisClient'
import ApiConfig from '../epics/config'
import { AT } from '../types/ActionTypes'
import { ErrorInjector } from '../ErrorInjector';
//import DebugErrors from '../components/modals/DebugErrors'

let getAccessToken = () => ''
let getMemoryKey = () => ''

export const getInstance = (actionType: AT): BlisClient => {

    let forceError = (actionType && ErrorInjector.ShouldError(actionType));

    /**
     * Notice we provide wrapping get functions which invoke the local functions
     * This allows the client to always access the latest of getAccessToken and getMemoryKey without reconstructing a new client
     */
    return new BlisClient(ApiConfig.BlisClientEnpoint, () => getAccessToken(), () => getMemoryKey(), null, forceError)
}

export const setAccessToken = (newGetAccessToken: () => string) => {
    getAccessToken = newGetAccessToken
}

export const setMemoryKey = (newGetMemoryKey: () => string) => {
    getMemoryKey = newGetMemoryKey
}