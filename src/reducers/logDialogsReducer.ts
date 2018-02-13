import { ActionObject } from '../types'
import { LogDialogState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: LogDialogState = {
    all: []
};

const logDialogsReducer: Reducer<LogDialogState> = (state = initialState, action: ActionObject): LogDialogState => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return { ...initialState };
        case AT.FETCH_LOG_DIALOGS_FULFILLED:
            return { ...state, all: action.allLogDialogs };
        case AT.CREATE_BLIS_APPLICATION_FULFILLED:
            return { ...initialState }
        case AT.CREATE_LOG_DIALOG:
            return { ...state, all: [...state.all, action.logDialog] };
        case AT.DELETE_LOG_DIALOG_FULFILLED:
            return { ...state, all: state.all.filter(dialog => dialog.logDialogId !== action.logDialogId) }
        default:
            return state;
    }
}
export default logDialogsReducer;