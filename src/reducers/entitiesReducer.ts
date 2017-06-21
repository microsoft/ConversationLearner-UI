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
            let index: number = 0;
            for(let i = 0; i < state.length; i++){
                if(state[i].id == action.entity.id){
                    index = i
                }
            }
            let newState = Object.assign([], state);
            newState[index] = action.entity;
            return newState
        default:
            return state;
    }
}