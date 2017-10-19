import { ActionObject } from '../types'
import { ActionState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { replace } from '../util'

const initialState: ActionState = [];

const actionsReducer: Reducer<ActionState> = (state = initialState, actionObject: ActionObject): ActionState => {
    switch (actionObject.type) {
        case AT.LOGOUT:
            return [...initialState]
        case AT.FETCH_ACTIONS_FULFILLED:
            return actionObject.allActions
        case AT.CREATE_BLIS_APPLICATION_FULFILLED:
            return [...initialState]
        case AT.CREATE_ACTION_FULFILLED:
            let newAction = { ...actionObject.action, actionId: actionObject.actionId };
            return [...state, newAction];
        case AT.DELETE_ACTION_FULFILLED:
            return state.filter(a => a.actionId !== actionObject.actionGUID)
        case AT.EDIT_ACTION_FULFILLED:
            return replace(state, actionObject.blisAction, a => a.actionId)
        default:
            return state;
    }
}
export default actionsReducer;