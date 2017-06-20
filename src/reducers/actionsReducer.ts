import { ActionObject } from '../actions/ActionObject'
import { Action } from '../models/Action'
const initialState: Action[] = [];
export default (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'FETCH_ACTIONS':
            return action.allActions;
        case 'CREATE_ACTION':
            return [...state, action.action];
        case 'DELETE_ACTION':
            return state.filter(ent => ent.id !== action.actionGUID)
        case 'EDIT_ACTION':
            // return [...state, action.payload];
        default:
            return state;
    }
}