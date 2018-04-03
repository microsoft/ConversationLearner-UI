import { ActionObject } from '../types'
import { EntityState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { replace } from '../util'

const initialState: EntityState = [];

const entitiesReducer: Reducer<EntityState> = (state = initialState, action: ActionObject): EntityState => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return [...initialState]
        case AT.FETCH_ENTITIES_FULFILLED:
            return action.allEntities;
        case AT.FETCH_APPSOURCE_FULFILLED:
            return action.appDefinition.entities;
        case AT.CREATE_BLIS_APPLICATION_FULFILLED:
            return [...initialState]
        case AT.CREATE_ENTITY_FULFILLED:
            return [...state, action.entity];
        case AT.DELETE_ENTITY_FULFILLED:
            return state.filter(ent => ent.entityId !== action.entityId);
        case AT.EDIT_ENTITY_FULFILLED:
            return replace(state, action.entity, e => e.entityId)
        default:
            return state;
    }
}
export default entitiesReducer;