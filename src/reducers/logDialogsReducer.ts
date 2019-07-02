/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, LogDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { replace } from '../Utils/util'
import produce from 'immer'

const initialState: LogDialogState = [];

const logDialogsReducer = produce((state: LogDialogState, action: ActionObject) => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return [...initialState]
        case AT.FETCH_LOG_DIALOGS_FULFILLED:
            return action.allLogDialogs
        case AT.FETCH_LOG_DIALOG_FULFILLED:
            if (action.replaceLocal) {
                const existingLogDialog = state.find(d => d.logDialogId === action.logDialog.logDialogId)
                if (existingLogDialog) {
                    return replace(state, action.logDialog, a => a.logDialogId)
                }
                else {
                    return [...initialState, action.logDialog]
                }
            }
            else {
                return
            }
        case AT.CREATE_APPLICATION_FULFILLED:
            return [...initialState]
        case AT.CREATE_LOG_DIALOG:
            state.push(action.logDialog)
            return
        case AT.DELETE_LOG_DIALOG_FULFILLED:
            // Delete log dialog optimistically.  Will reload train dialogs on failure
            return state.filter(dialog => dialog.logDialogId !== action.logDialogId);
        case AT.DELETE_LOG_DIALOGS_ASYNC:
            return state.filter(dialog => !action.logDialogIds.some(ldId => ldId === dialog.logDialogId));
        case AT.UPDATE_SOURCE_LOG_DIALOG:
            // Update log dialog this train dialog was created from.
            // Used to hide converted log dialogs from the UI
            const sourceLogDialog = state.find(d => d.logDialogId === action.sourceLogDialogId)
            if (sourceLogDialog) {
                sourceLogDialog.targetTrainDialogIds = [action.trainDialogId]
            }
            return
        default:
            return
    }
}, initialState)

export default logDialogsReducer