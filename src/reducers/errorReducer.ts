/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject } from '../types'
import { ErrorType } from '../types/const'
import { ErrorState } from '../types'
import { Reducer } from 'redux'
import { AT } from '../types/ActionTypes'

const initialState: ErrorState = {
    errorType: ErrorType.Error,
    error: null,
    messages: null,
    actionType: AT.NO_OP
};

const errorReducer: Reducer<ErrorState> = (state = initialState, action: ActionObject): ErrorState => {
    switch (action.type) {
        case AT.CLEAR_ERROR_DISPLAY:
            return { ...initialState };
        case AT.SET_ERROR_DISPLAY:
            return { errorType: action.errorType, error: action.title, messages: action.messages, actionType: action.actionType }
        default:
            return state;
    }
}

export default errorReducer;