import { ActionObject } from '../types'
import { ErrorState } from '../types'
import { Reducer } from 'redux'

const initialState: ErrorState = {
    error: null,
    message: null,
    route: null
};

const errorReducer: Reducer<ErrorState> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'CLEAR_ERROR_DISPLAY':
            return { ...initialState };
        case 'SET_ERROR_DISPLAY':
            return {error: action.error, message: action.message, route: action.route}          
        default:
            return state;
    }
}

export default errorReducer;