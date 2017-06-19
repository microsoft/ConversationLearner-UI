import { CREATE_ACTION } from '../actions/create';
import { FETCH_ACTIONS } from '../actions/fetch';
import { DELETE_ACTION } from '../actions/delete';
import { EDIT_ACTION } from '../actions/update';
import { CreateAction, FetchAction, UpdateAction, DeleteAction} from '../actions/ActionObject'
import { Action } from '../models/Action'
const initialState: Action[] = [];
export default (state = initialState, action: any) => {
    switch(action.type) {
        case FETCH_ACTIONS:
            return action.allActions;
        case CREATE_ACTION:
            return [...state, action.action];
        case DELETE_ACTION:
            return state.filter(ent => ent.id !== action.actionGUID)
        case EDIT_ACTION:
            // return [...state, action.payload];
        default:
            return state;
    }
}