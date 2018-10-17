/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, TrainDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { replace } from '../util'
import * as CLM from '@conversationlearner/models'

const initialState: TrainDialogState = [];

// Find train dialogs with conflicting label entities and mark them as invalid
function markedInvalidTrainDialogs(trainingFailureMessage: string, originalTrainDialogs: CLM.TrainDialog[]): CLM.TrainDialog[] {
    
    let trainingError = CLM.parseTrainingFailureMessage(trainingFailureMessage)

    let td1 = originalTrainDialogs.find(td => td.trainDialogId === trainingError.trainDialogId1)
    let td2 = originalTrainDialogs.find(td => td.trainDialogId === trainingError.trainDialogId2)

    if (!td1 && !td2) {
        return originalTrainDialogs
    }
    let editedTrainDialogs: CLM.TrainDialog[] | null = null
    if (td1) {
        const newTD1: CLM.TrainDialog = {
            ...td1,
            invalid: true
        }
        editedTrainDialogs = replace(originalTrainDialogs, newTD1, a => a.trainDialogId)
    }
    if (td2) {
        const newTD2: CLM.TrainDialog = {
            ...td2,
            invalid: true
        }
        if (editedTrainDialogs) {
            editedTrainDialogs = replace(editedTrainDialogs, newTD2, a => a.trainDialogId)
        }
        else {
            editedTrainDialogs = replace(originalTrainDialogs, newTD2, a => a.trainDialogId)
        }
    }
    return editedTrainDialogs || originalTrainDialogs
}

const trainDialogsReducer: Reducer<TrainDialogState> = (state = initialState, action: ActionObject): TrainDialogState => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return [...initialState]
        case AT.FETCH_TRAIN_DIALOGS_FULFILLED:
            // Find train dialogs with conflicting label entities and mark them as invalid
            if (action.app.trainingFailureMessage) {
                return markedInvalidTrainDialogs(action.app.trainingFailureMessage, action.allTrainDialogs)
            }
            return action.allTrainDialogs;
        case AT.FETCH_APPSOURCE_FULFILLED:
            // Find train dialogs with conflicting label entities and mark them as invalid
            if (action.app.trainingFailureMessage) {
                return markedInvalidTrainDialogs(action.app.trainingFailureMessage, action.appDefinition.trainDialogs)
            }
            return action.appDefinition.trainDialogs;
        case AT.SOURCE_PROMOTE_UPDATED_APP_DEFINITION:
            // Find train dialogs with conflicting label entities and mark them as invalid
            if (action.app.trainingFailureMessage) {
                return markedInvalidTrainDialogs(action.app.trainingFailureMessage, action.updatedAppDefinition.trainDialogs)
            }
            return action.updatedAppDefinition.trainDialogs
        case AT.CREATE_APPLICATION_FULFILLED:
            return [...initialState]
        case AT.CREATE_TRAIN_DIALOG_FULFILLED:
            return [...state, action.trainDialog];
        case AT.DELETE_TRAIN_DIALOG_ASYNC:
            // Delete train dialog optimistically to update UI.  Will reload train dialogs on failure
            return state.filter(dialog => dialog.trainDialogId !== action.trainDialogId);
        case AT.EDIT_TRAINDIALOG_FULFILLED:
            return replace(state, action.trainDialog, a => a.trainDialogId);
        case AT.FETCH_TRAIN_DIALOG_FULFILLED:
            if (action.replaceLocal) {
                return replace(state, action.trainDialog, a => a.trainDialogId);
            }
            else {
                return state
            }
        case AT.FETCH_APPLICATION_TRAININGSTATUS_FULFILLED: {
            // Find train dialogs with conflicting label entities and mark them as invalid
            if (action.trainingStatus.trainingStatus === CLM.TrainingStatusCode.Failed && action.trainingStatus.trainingFailureMessage) {
                return markedInvalidTrainDialogs(action.trainingStatus.trainingFailureMessage, state)
            }
            return state
        }
        default:
            return state;
    }
}
export default trainDialogsReducer;