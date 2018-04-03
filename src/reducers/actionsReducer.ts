import { ActionObject } from '../types'
import { ActionState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { replace } from '../util'

const initialState: ActionState = [];

const actionsReducer: Reducer<ActionState> = (state = initialState, actionObject: ActionObject): ActionState => {
    switch (actionObject.type) {
        case AT.USER_LOGOUT:
            return [...initialState]
        case AT.FETCH_ACTIONS_FULFILLED:
            return actionObject.allActions;
        case AT.FETCH_APPSOURCE_FULFILLED:
            return actionObject.appDefinition.actions;
        case AT.CREATE_BLIS_APPLICATION_FULFILLED:
            return [...initialState]
        case AT.CREATE_ACTION_FULFILLED:
            return [...state, actionObject.action];
        case AT.DELETE_ACTION_FULFILLED:
            return state.filter(a => a.actionId !== actionObject.actionId)
        case AT.EDIT_ACTION_FULFILLED:
            return replace(state, actionObject.blisAction, a => a.actionId)
        default:
            return state;
    }
}
export default actionsReducer;