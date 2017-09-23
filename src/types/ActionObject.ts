import { AT } from '../types/ActionTypes'
import { BlisAppBase } from 'blis-models'

export type AppAction = {
    type: AT.CREATE_APPLICATION_FULFILLED,
    app: BlisAppBase
} | {
    type: AT.DELETE_BLIS_APPLICATION_FULFILLED,
    app: BlisAppBase
}

export type CounterAction = {
    type: AT.COUNTER_ADD,
    value: number
} | {
    type: AT.COUNTER_DECREMENT,
    value: number
}

export type ActionObject = 
    AppAction |
    CounterAction