import BlisClient from './blisClient'
import { AT } from '../types/ActionTypes'
import { ErrorInjector } from '../ErrorInjector';
//import DebugErrors from '../components/modals/DebugErrors'

let sdkPort = 5000
let getAccessToken = () => ''
let getMemoryKey = () => ''

export const getInstance = (actionType: AT): BlisClient => {
    let forceError = (actionType && ErrorInjector.ShouldError(actionType));

    /**
     * Notice we provide wrapping get functions which invoke the local functions
     * This allows the client to always access the latest of getAccessToken and getMemoryKey without reconstructing a new client
     */
    // TODO: Refactor out the force error argument and need to take in paramter. This should be implemented in another layer as extension not modifcation
    // TODO: Allow configuration whole URI for SDK to enable communicating with hosted version (Likely change to getter function like access token)
    return new BlisClient(`http://localhost:${sdkPort}`, () => getAccessToken(), () => getMemoryKey(), null, forceError)
}

export const setPort = (port: number) => {
    sdkPort = port
}

export const setAccessToken = (newGetAccessToken: () => string) => {
    getAccessToken = newGetAccessToken
}

export const setMemoryKey = (newGetMemoryKey: () => string) => {
    getMemoryKey = newGetMemoryKey
}