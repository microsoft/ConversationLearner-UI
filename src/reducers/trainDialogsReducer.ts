import { CREATE_TRAIN_DIALOG } from '../actions/create';
import { FETCH_TRAIN_DIALOGS } from '../actions/fetch';
import ActionObject from '../actions/ActionObject';
import { TrainDialog } from '../models/TrainDialog'
const initialState: TrainDialog[] = [];
export default (state = initialState, action: ActionObject<any>) => {
    switch(action.type) {
        case FETCH_TRAIN_DIALOGS:
            return action.payload;
        case CREATE_TRAIN_DIALOG:
            return [...state, action.payload];
        default:
            return state;
    }
}