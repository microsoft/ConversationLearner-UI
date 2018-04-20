/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject } from '../types'
import { TrainDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { replace } from '../util'

const initialState: TrainDialogState = [];

const trainDialogsReducer: Reducer<TrainDialogState> = (state = initialState, action: ActionObject): TrainDialogState => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return [...initialState]
        case AT.FETCH_TRAIN_DIALOGS_FULFILLED:
            return action.allTrainDialogs;
        case AT.FETCH_APPSOURCE_FULFILLED:
            return action.appDefinition.trainDialogs;
        case AT.CREATE_APPLICATION_FULFILLED:
            return [...initialState]
        case AT.CREATE_TRAIN_DIALOG_FULFILLED:
            return [...state, action.trainDialog];
        case AT.DELETE_TRAIN_DIALOG_ASYNC:
            // Delete train dialog optimistically to update UI.  Will reload train dialogs on failure
            return state.filter(dialog => dialog.trainDialogId !== action.trainDialogId);
        case AT.EDIT_TRAINDIALOG_FULFILLED:
            return replace(state, action.trainDialog, a => a.trainDialogId);
        default:
            return state;
    }
}
export default trainDialogsReducer;