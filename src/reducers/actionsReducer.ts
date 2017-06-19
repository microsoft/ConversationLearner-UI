import { CREATE_ACTION } from '../actions/create';
import { FETCH_ACTIONS } from '../actions/fetch';
import { DELETE_ACTION } from '../actions/delete';
import { EDIT_ACTION } from '../actions/update';
import ActionObject from '../actions/ActionObject'
import { Action } from '../models/Action'
const initialState: Action[] = [];
export default (state = initialState, action: any) => {
    switch(action.type) {
        case FETCH_ACTIONS:
            return action.actions;
        case CREATE_ACTION:
            return [...state, action.action];
        case DELETE_ACTION:
            // return [...state, action.payload];
        case EDIT_ACTION:
            // return [...state, action.payload];
        default:
            return state;
    }
}