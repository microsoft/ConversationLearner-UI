import { CREATE_TRAIN_DIALOG } from '../actions/create';
import { FETCH_TRAIN_DIALOGS } from '../actions/fetch';
const initialState = [];
export default (state = initialState, action) => {
    switch(action.type) {
        case FETCH_TRAIN_DIALOGS:
            return [...state, ...action.payload];
        case CREATE_TRAIN_DIALOG:
            return [...state, action.payload];
        default:
            return state;
    }
    return state;
}