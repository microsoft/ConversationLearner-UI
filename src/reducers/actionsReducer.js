import { CREATE_ACTION } from '../actions/create';
import { FETCH_ACTIONS } from '../actions/fetch';
const initialState = [];
export default (state = initialState, action) => {
    switch(action.type) {
        case FETCH_ACTIONS:
            return action.payload;
        case CREATE_ACTION:
            return [...state, action.payload];
        default:
            return state;
    }
    return state;
}