import { ActionObject } from '../types'
import { Action } from '../models/Action'
import { ActionState } from '../types'

const initialState: ActionState = [];

export default (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'FETCH_ACTIONS':
            return action.allActions;
        case 'CREATE_ACTION':
            return [...state, action.action];
        case 'DELETE_ACTION':
            return state.filter(ent => ent.id !== action.actionGUID)
        case 'EDIT_ACTION':
            let index: number = 0;
            for(let i = 0; i < state.length; i++){
                if(state[i].id == action.action.id){
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