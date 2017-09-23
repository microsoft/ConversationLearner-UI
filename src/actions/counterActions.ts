import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'

export const counterAdd = (value: number): ActionObject => ({
    type: AT.COUNTER_ADD,
    value
})

export const counterDecrement = (value: number): ActionObject => ({
    type: AT.COUNTER_DECREMENT,
    value
})