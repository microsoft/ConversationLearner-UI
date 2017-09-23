import { ActionObject, CounterState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: CounterState = {
    value: 0
}

const chatSessionReducer: Reducer<CounterState> = (state = initialState, action: ActionObject) => {
    switch (action.type) {
        case AT.COUNTER_ADD:
            return { ...state, value: state.value + action.value }
        case AT.COUNTER_DECREMENT:
            return {...state, value: state.value - action.value }
        default:
            return state
    }
}

export default chatSessionReducer
