import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase } from 'blis-models'

export const createApp = (app: BlisAppBase): ActionObject => ({
    type: AT.CREATE_APPLICATION_FULFILLED,
    app
})

export const deleteApp = (app: BlisAppBase): ActionObject => ({
    type: AT.DELETE_BLIS_APPLICATION_FULFILLED,
    app
})