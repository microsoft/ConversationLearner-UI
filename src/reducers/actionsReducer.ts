import { ActionObject } from '../types'
import { ActionState } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { Reducer } from 'redux'


const initialState: ActionState = [];

const actionsReducer: Reducer<ActionState> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'FETCH_ACTIONS':
            return action.allActions;
        case 'CREATE_ACTION':
            return [...state, action.action];
        case 'DELETE_ACTION':
            return state.filter(a => a.actionId !== action.actionGUID)
        case 'EDIT_ACTION':
            let index: number = 0;
            for(let i = 0; i < state.length; i++){
                if(state[i].actionId == action.action.actionId){
                    index = i
                }
            }
            let newState = Object.assign([], state);
            newState[index] = action.action;
            return newState
        default:
            return state;
    }
}
export default actionsReducer;