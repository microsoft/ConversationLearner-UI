import { ActionObject } from '../types'
import { TrainDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: TrainDialogState = [];

const trainDialogsReducer: Reducer<TrainDialogState> = (state = initialState, action: ActionObject): TrainDialogState => {
    switch (action.type) {
        case AT.LOGOUT:
            return { ...initialState };
        case AT.FETCH_TRAIN_DIALOGS_FULFILLED:
            return action.allTrainDialogs;
        case AT.EMPTY_STATE_PROPERTIES:
            let empty: TrainDialogState = []
            return empty;
        case AT.CREATE_TRAIN_DIALOG_FULFILLED:
            return [...state, action.trainDialog];
        case AT.DELETE_TRAIN_DIALOG_FULFILLED:
            return state.filter(dialog => dialog.trainDialogId !== action.trainDialogGUID);
        case AT.EDIT_TRAIN_DIALOG_FULFILLED:
            let index: number = 0;
            for (let i = 0; i < state.length; i++) {
                if (state[i].trainDialogId == action.trainDialog.trainDialogId) {
                    index = i
                }
            }
            let newState = Object.assign([], state);
            newState[index] = action.trainDialog;
            return newState;
        default:
            return state;
    }
}
export default trainDialogsReducer;