/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, LogDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { replace } from '../Utils/util'
import produce from 'immer'

const initialState: LogDialogState = {
    logDialogs: [],
    continuationToken: undefined,
    pendingDelete: []
}

const logDialogsReducer = produce((state: LogDialogState, action: ActionObject) => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return { ...initialState }
        case AT.FETCH_LOG_DIALOGS_FULFILLED:
            if (action.clear) {
                state.logDialogs = action.logDialogs
                state.continuationToken = action.continuationToken
            }
            else {
                state.logDialogs = [...state.logDialogs, ...action.logDialogs]
                state.continuationToken = action.continuationToken
            }
            return
        case AT.FETCH_LOG_DIALOG_FULFILLED:
            if (action.replaceLocal) {
                const existingLogDialog = state.logDialogs.find(d => d.logDialogId === action.logDialog.logDialogId)
                if (existingLogDialog) {
                    replace(state.logDialogs, action.logDialog, a => a.logDialogId)
                }
                else {
                    state.logDialogs.push(action.logDialog)
                }
            }
            return
        case AT.CREATE_APPLICATION_FULFILLED:
            return { ...initialState }
        case AT.CREATE_LOG_DIALOG:
            state.logDialogs.push(action.logDialog)
            return
        case AT.DELETE_LOG_DIALOG_ASYNC:
            // Save deleted dialog, so can rehydrade UI if delete fails
            state.pendingDelete = state.logDialogs.filter(ld => ld.logDialogId === action.logDialogId)
            // Remove from log dialogs
            state.logDialogs = state.logDialogs.filter(ld => ld.logDialogId !== action.logDialogId)
            return
        case AT.DELETE_LOG_DIALOG_FULFILLED:
            // Remove from pending item list
            state.pendingDelete = state.pendingDelete.filter(ld => ld.logDialogId !== action.logDialogId)
            return 
        case AT.DELETE_LOG_DIALOG_REJECTED:
            // Restore pending item, remove from pending list
            const restoreItem = state.pendingDelete.filter(ld => ld.logDialogId === action.logDialogId)
            state.pendingDelete = state.pendingDelete.filter(ld => ld.logDialogId !== action.logDialogId)
            state.logDialogs = [...state.logDialogs, ...restoreItem]
            return
        case AT.DELETE_LOG_DIALOGS_ASYNC:
            // Save deleted dialogs, so can rehydrade UI if delete fails
            state.pendingDelete = state.logDialogs.filter(ld => action.logDialogIds.some(ldId => ldId === ld.logDialogId))
            state.logDialogs = state.logDialogs.filter(ld => !action.logDialogIds.some(ldId => ldId === ld.logDialogId))
            return
        case AT.DELETE_LOG_DIALOGS_FULFILLED:
            // Remove pending items from list
            state.pendingDelete = state.pendingDelete.filter(dialog => !action.logDialogIds.some(ldId => ldId === dialog.logDialogId))
            return 
        case AT.DELETE_LOG_DIALOGS_REJECTED:
            // Restore pending items, remove from pending list
            const restoreItems = state.pendingDelete.filter(dialog => action.logDialogIds.some(ldId => ldId === dialog.logDialogId))
            state.pendingDelete = state.pendingDelete.filter(dialog => !action.logDialogIds.some(ldId => ldId === dialog.logDialogId))
            state.logDialogs = [...state.logDialogs, ...restoreItems]
            return
        case AT.UPDATE_SOURCE_LOG_DIALOG:
            // Update log dialog this train dialog was created from.
            // Used to hide converted log dialogs from the UI
            const sourceLogDialog = state.logDialogs.find(d => d.logDialogId === action.sourceLogDialogId)
            if (sourceLogDialog) {
                sourceLogDialog.targetTrainDialogIds = [action.trainDialogId]
            }
            return
        default:
            return
    }
}, initialState)

export default logDialogsReducer