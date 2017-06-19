import { CREATE_ENTITY } from '../actions/create';
import { FETCH_ENTITIES } from '../actions/fetch';
import { DELETE_ENTITY } from '../actions/delete';
import { EDIT_ENTITY } from '../actions/update';
import ActionObject from '../actions/ActionObject';
import { Entity } from '../models/Entity'
const initialState: Entity[] = [];
export default (state = initialState, action: ActionObject<any>) => {
    switch(action.type) {
        case FETCH_ENTITIES:
            return action.payload;
        case CREATE_ENTITY:
            return [...state, action.payload];
        case DELETE_ENTITY:
            // return [...state, action.payload];
        case EDIT_ENTITY:
            // return [...state, action.payload];
        default:
            return state;
    }
}