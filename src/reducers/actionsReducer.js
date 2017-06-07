import { CREATE_ACTION } from '../actions/create';
import { FETCH_ACTIONS } from '../actions/fetch';
const initialState = [];
export default (state = initialState, action) => {
    switch(action.type) {
        case FETCH_ACTIONS:
            return state;
        case CREATE_ACTION:
            return state;
        default:
            return state;
    }
}