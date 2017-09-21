import { ActionObject } from '../types'
import { ActionState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: ActionState = [];

const actionsReducer: Reducer<ActionState> =  (state = initialState, actionObject: ActionObject) => {
    switch(actionObject.type) {
        case AT.LOGOUT:
            return { ...initialState };
        case AT.FETCH_ACTIONS_FULFILLED:
            return actionObject.allActions;
        case AT.EMPTY_STATE_PROPERTIES: 
            let empty: ActionState = []
            return empty;
        case AT.CREATE_ACTION_FULFILLED:
            let newAction = {...actionObject.action, actionId: actionObject.actionId};
            return [...state, newAction];
        case AT.DELETE_ACTION_FULFILLED:
            return state.filter(a => a.actionId !== actionObject.actionGUID)
        case AT.EDIT_ACTION_FULFILLED:
            let index: number = 0;
            for(let i = 0; i < state.length; i++){
                if(state[i].actionId == actionObject.blisAction.actionId){
                    index = i
                }
            }
            let newState = Object.assign([], state);
            newState[index] = actionObject.blisAction;
            return newState
        default:
            return state;
    }
}
export default actionsReducer;