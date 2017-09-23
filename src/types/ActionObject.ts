import { AT } from '../types/ActionTypes'

export type CounterAction = {
    type: AT.COUNTER_ADD,
    value: number
} | {
    type: AT.COUNTER_DECREMENT,
    value: number
}

export type ActionObject = 
    CounterAction