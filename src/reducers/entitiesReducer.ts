import { CREATE_ENTITY } from '../actions/create';
import { FETCH_ENTITIES } from '../actions/fetch';
import ActionObject from '../actions/ActionObject';
import { Entity } from '../models/Entity'
const initialState: Entity[] = [];
export default (state = initialState, action: ActionObject<any>) => {
    switch(action.type) {
        case FETCH_ENTITIES:
            return action.payload;
        case CREATE_ENTITY:
            return [...state, action.payload];
        default:
            return state;
    }
}