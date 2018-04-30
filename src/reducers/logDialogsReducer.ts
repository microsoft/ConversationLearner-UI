/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, LogDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: LogDialogState = [];

const logDialogsReducer: Reducer<LogDialogState> = (state = initialState, action: ActionObject): LogDialogState => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return { ...initialState };
        case AT.FETCH_LOG_DIALOGS_FULFILLED:
            return action.allLogDialogs;
        case AT.CREATE_APPLICATION_FULFILLED:
            return { ...initialState }
        case AT.CREATE_LOG_DIALOG:
            return [...state, action.logDialog];
        case AT.DELETE_LOG_DIALOG_FULFILLED:
            // Delete log dialog optimistically.  Will reload train dialogs on failure
            return state.filter(dialog => dialog.logDialogId !== action.logDialogId);
        default:
            return state;
    }
}
export default logDialogsReducer;