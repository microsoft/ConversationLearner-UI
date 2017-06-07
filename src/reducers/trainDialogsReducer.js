import { CREATE_TRAIN_DIALOG } from '../actions/create';
import { FETCH_TRAIN_DIALOGS } from '../actions/fetch';
const initialState = [];
export default (state = initialState, action) => {
    switch(action.type) {
        case FETCH_TRAIN_DIALOGS:
            return state;
        case CREATE_TRAIN_DIALOG:
            return state;
        default:
            return state;
    }
}