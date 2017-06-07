import { CREATE_TRAIN_DIALOG } from '../actions/create';
import { FETCH_TRAIN_DIALOGS } from '../actions/fetch';
const initialState = {
    all: []
};
export default (state = initialState, action) => {
    switch(action.type) {
        default:
            return state;
    }
}