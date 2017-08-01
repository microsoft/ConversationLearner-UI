import { ActionObject } from '../types'
import { ErrorState } from '../types'
import { Reducer } from 'redux'
import { AT } from '../types/ActionTypes'

const initialState: ErrorState = {
    error: null,
    message: null,
    route: AT.NO_OP
};

const errorReducer: Reducer<ErrorState> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case AT.CLEAR_ERROR_DISPLAY:
            return { ...initialState };
        case AT.SET_ERROR_DISPLAY:
            return {error: action.error, message: action.message, route: action.route}          
        default:
            return state;
    }
}

export default errorReducer;