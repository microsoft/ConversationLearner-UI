import { ActionObject} from '../actions/ActionObject'
import { Entity } from '../models/Entity'
const initialState: Entity[] = [];
export default (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'FETCH_ENTITIES':
            return action.allEntities;
        case 'CREATE_ENTITY':
            return [...state, action.entity];
        case 'DELETE_ENTITY':
            return state.filter(ent => ent.id !== action.entityGUID);
        case 'EDIT_ENTITY':
            // return [...state, action.payload];
        default:
            return state;
    }
}