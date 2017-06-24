import { ActionObject } from '../actions/ActionObject'
import { TrainDialog } from '../models/TrainDialog'
import { TrainDialogState } from './stateTypes'

const initialState: TrainDialogState = [];

export default (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'FETCH_TRAIN_DIALOGS':
            return action.allTrainDialogs;
        case 'CREATE_TRAIN_DIALOG':
            return [...state, action.trainDialog];
        case 'DELETE_TRAIN_DIALOG':
            // return [...state, action.payload];
        case 'EDIT_TRAIN_DIALOG':
            // return [...state, action.payload];
        default:
            return state;
    }
}