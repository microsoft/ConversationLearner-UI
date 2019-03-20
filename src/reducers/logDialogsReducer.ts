/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, LogDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import produce from 'immer'

const initialState: LogDialogState = [];

const logDialogsReducer: Reducer<LogDialogState> = produce((state: LogDialogState, action: ActionObject) => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return [...initialState]
        case AT.FETCH_LOG_DIALOGS_FULFILLED:
            return action.allLogDialogs
        case AT.CREATE_APPLICATION_FULFILLED:
            return [...initialState]
        case AT.CREATE_LOG_DIALOG:
            state.push(action.logDialog)
            return
        case AT.DELETE_LOG_DIALOG_FULFILLED:
            // Delete log dialog optimistically.  Will reload train dialogs on failure
            return state.filter(dialog => dialog.logDialogId !== action.logDialogId);
        case AT.DELETE_TEACH_SESSION_FULFILLED:
            // TODO: Refactor to different action instead of using null
            if (action.sourceLogDialogId) {
                // Update log dialog this train dialog was created from
                const sourceLogDialog = state.find(d => d.logDialogId === action.sourceLogDialogId)
                if (sourceLogDialog) {
                    sourceLogDialog.targetTrainDialogIds = [action.trainDialogId]
                }
            }
            return
        default:
            return
    }
}, initialState)

export default logDialogsReducer