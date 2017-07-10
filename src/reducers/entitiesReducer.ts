import { ActionObject} from '../types'
import { EntityState } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { Reducer } from 'redux'

const initialState: EntityState = [];

const entitiesReducer: Reducer<EntityState> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'FETCH_ENTITIES_FULFILLED':
            return action.allEntities;
        case 'CREATE_ENTITY':
            return [...state, action.entity];
        case 'DELETE_ENTITY':
            return state.filter(ent => ent.entityId !== action.entityGUID);
        case 'EDIT_ENTITY':
            let index: number = 0;
            for(let i = 0; i < state.length; i++){
                if(state[i].entityId == action.entity.entityId){
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
export default entitiesReducer;