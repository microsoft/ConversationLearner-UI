import { CREATE_ACTION } from '../actions/create';
import { FETCH_ACTIONS } from '../actions/fetch';
const initialState = {
    all: []
};
export default (state = initialState, action) => {
    switch(action.type) {
        default:
            return state;
    }
}