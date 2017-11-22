import { ActionObject } from '../types'
import { TrainDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { replace } from '../util'

const initialState: TrainDialogState = [];

const trainDialogsReducer: Reducer<TrainDialogState> = (state = initialState, action: ActionObject): TrainDialogState => {
    switch (action.type) {
        case AT.LOGOUT:
            return [...initialState]
        case AT.FETCH_TRAIN_DIALOGS_FULFILLED:
            return action.allTrainDialogs;
        case AT.CREATE_BLIS_APPLICATION_FULFILLED:
            return [...initialState]
        case AT.CREATE_TRAIN_DIALOG_FULFILLED:
            return [...state, action.trainDialog];
        case AT.DELETE_TRAIN_DIALOG_FULFILLED:
            return state.filter(dialog => dialog.trainDialogId !== action.trainDialogId);
        case AT.EDIT_TRAIN_DIALOG_FULFILLED:
            return replace(state, action.trainDialog, trainDialog => trainDialog.trainDialogId)
        default:
            return state;
    }
}
export default trainDialogsReducer;