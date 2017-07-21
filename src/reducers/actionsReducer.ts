import { ActionObject } from '../types'
import { ActionState } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { Reducer } from 'redux'

const initialState: ActionState = [];

const actionsReducer: Reducer<ActionState> =  (state = initialState, actionObject: ActionObject) => {
    switch(actionObject.type) {
        case 'FETCH_ACTIONS_FULFILLED':
            return actionObject.allActions;
        case "EMPTY_STATE_PROPERTIES": 
            let empty: ActionState = []
            return empty;
        case 'CREATE_ACTION_FULFILLED':
            let newAction = {...actionObject.action, actionId: actionObject.actionId};
            return [...state, newAction];
        case 'DELETE_ACTION_FULFILLED':
            return state.filter(a => a.actionId !== actionObject.actionGUID)
        case 'EDIT_ACTION_FULFILLED':
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