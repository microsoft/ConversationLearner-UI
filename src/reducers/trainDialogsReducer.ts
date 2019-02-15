/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, TrainDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { replace } from '../Utils/util'
import produce from 'immer'

const initialState: TrainDialogState = [];

const trainDialogsReducer: Reducer<TrainDialogState> = produce((state: TrainDialogState, action: ActionObject) => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return [...initialState]
        case AT.FETCH_TRAIN_DIALOGS_FULFILLED:
            return action.allTrainDialogs
        case AT.FETCH_APPSOURCE_FULFILLED:
            return action.appDefinition.trainDialogs
        case AT.SOURCE_PROMOTE_UPDATED_APP_DEFINITION:
            return action.updatedAppDefinition.trainDialogs
        case AT.CREATE_APPLICATION_FULFILLED:
            return [...initialState]
        case AT.CREATE_TRAIN_DIALOG_FULFILLED:
            state.push(action.trainDialog)
            return
        case AT.DELETE_TRAIN_DIALOG_ASYNC:
            // Delete train dialog optimistically to update UI.  Will reload train dialogs on failure
            return state.filter(dialog => dialog.trainDialogId !== action.trainDialogId)
        case AT.EDIT_TRAINDIALOG_FULFILLED:
            return replace(state, action.trainDialog, a => a.trainDialogId)
        case AT.FETCH_TRAIN_DIALOG_FULFILLED:
            if (action.replaceLocal) {
                return replace(state, action.trainDialog, a => a.trainDialogId)
            }
            else {
                return
            }
        default:
            return
    }
}, initialState)

export default trainDialogsReducer