import { ActionObject } from '../types'
import { LogDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { LogDialog } from 'blis-models'
import { Reducer } from 'redux'

const initialState: LogDialogState = {
    all: [],
    current: null
};

const logDialogsReducer: Reducer<LogDialogState> =  (state = initialState, action: ActionObject) => {
    switch (action.type) {
        case AT.LOGOUT:
            return { ...initialState };
        case AT.FETCH_LOG_DIALOGS_FULFILLED:
            return { ...state, all: action.allLogDialogs };
        case AT.EMPTY_STATE_PROPERTIES: 
            return {...state, all: []};
        case AT.CREATE_LOG_DIALOG:
            return { ...state, all: [...state.all, action.logDialog], current: action.logDialog };
        case AT.SET_CURRENT_LOG_DIALOG:
            return { ...state, current: action.currentLogDialog };
        case AT.TOGGLE_LOG_DIALOG:
            let index: number = 0;
            for (let i = 0; i < state.all.length; i++) {
                if (state.all[i].logDialogId == state.current.logDialogId) {
                    index = i
                }
            }
            if (index == 0) {
                if (action.forward === false) {
                    return { ...state, current: state.all[state.all.length - 1] }
                }
            }
            if (index == state.all.length - 1) {
                if (action.forward === true) {
                    return { ...state, current: state.all[0] }
                }
            }
            let newState: LogDialogState;
            if (action.forward === true) {
                newState = { ...state, current: state.all[index + 1] }
            } else {
                newState = { ...state, current: state.all[index - 1] }
            }
            return newState;
        case AT.DELETE_LOG_DIALOG_FULFILLED:
            return { ...state, all: state.all.filter(dialog => dialog.logDialogId !== action.logDialogId) };
    /* TODO
        case AT.EDIT_LOG_DIALOG_FULFILLED:
            let index: number = 0;
            for (let i = 0; i < state.all.length; i++) {
                if (state.all[i].logDialogId == action.logDialog.logDialogId) {
                    index = i
                }
            }
            let newAll = Object.assign([], state.all);
            newAll[index] = action.logDialog;
            let stateToReturn: AppState = {
                all: newAll,
                current: action.logDialog
            }
            return stateToReturn
    */ 
        default:
            return state;
    }
}
export default logDialogsReducer;