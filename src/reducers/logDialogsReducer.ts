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
        case AT.DELETE_TEACH_SESSION_FULFILLED: 
            if (action.sourceLogDialogId) {
                // Update log dialog this train dialog was created from
                let source = state.filter(d => d.logDialogId === action.sourceLogDialogId);
                if (source[0]) {
                    source[0].targetTrainDialogIds = [action.trainDialogId]
                }
                return state.filter(dialog => dialog.logDialogId !== action.sourceLogDialogId).concat(source[0])
            }
            return state
        default:
            return state;
    }
}
export default logDialogsReducer;