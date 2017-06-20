import { CREATE_TRAIN_DIALOG } from '../actions/create';
import { FETCH_TRAIN_DIALOGS } from '../actions/fetch';
import { DELETE_TRAIN_DIALOG } from '../actions/delete';
import { EDIT_TRAIN_DIALOG } from '../actions/update';
import { ActionObject } from '../actions/ActionObject'
import { TrainDialog } from '../models/TrainDialog'
const initialState: TrainDialog[] = [];
export default (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case FETCH_TRAIN_DIALOGS:
            return action.allTrainDialogs;
        case CREATE_TRAIN_DIALOG:
            return [...state, action.trainDialog];
        case DELETE_TRAIN_DIALOG:
            // return [...state, action.payload];
        case EDIT_TRAIN_DIALOG:
            // return [...state, action.payload];
        default:
            return state;
    }
}