import { ActionObject } from '../types'
import { LogDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: LogDialogState = {
    all: []
};

const logDialogsReducer: Reducer<LogDialogState> = (state = initialState, action: ActionObject): LogDialogState => {
    switch (action.type) {
        case AT.LOGOUT:
            return { ...initialState };
        case AT.FETCH_LOG_DIALOGS_FULFILLED:
            return { ...state, all: action.allLogDialogs };
        case AT.EMPTY_STATE_PROPERTIES:
            return { ...state, all: [] };
        case AT.CREATE_LOG_DIALOG:
            return { ...state, all: [...state.all, action.logDialog] };
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