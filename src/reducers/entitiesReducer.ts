import { ActionObject } from '../types'
import { EntityState } from '../types'
import { AT } from '../types/ActionTypes'
import { EntityBase } from 'blis-models';
import { Reducer } from 'redux'
import { replace } from '../util'

const initialState: EntityState = [];

const entitiesReducer: Reducer<EntityState> = (state = initialState, action: ActionObject): EntityState => {
    switch (action.type) {
        case AT.LOGOUT:
            return [...initialState]
        case AT.FETCH_ENTITIES_FULFILLED:
            return action.allEntities;
        case AT.CREATE_BLIS_APPLICATION_FULFILLED:
            return [...initialState]
        case AT.CREATE_ENTITY_FULFILLED:
            let newEntity = { ...action.entity, entityId: action.entityId };
            return [...state, newEntity];
        case AT.CREATE_ENTITY_FULFILLEDNEGATIVE:
            let entities: EntityBase[] = [action.positiveEntity, action.negativeEntity];
            return [...state, ...entities]
        case AT.DELETE_ENTITY_FULFILLED:
        case AT.DELETE_REVERSE_ENTITY_ASYNC:
            return state.filter(ent => ent.entityId !== action.deletedEntityId);
        case AT.EDIT_ENTITY_FULFILLED:
            return replace(state, action.entity, e => e.entityId)
        default:
            return state;
    }
}
export default entitiesReducer;