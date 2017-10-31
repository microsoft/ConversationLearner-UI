import { AppState } from '../types'
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { replace } from '../util'

const initialState: AppState = {
    all: []
};

const appsReducer: Reducer<AppState> = (state = initialState, action: ActionObject): AppState => {
    switch (action.type) {
        case AT.LOGOUT:
            return { ...initialState };
        case AT.FETCH_APPLICATIONS_FULFILLED:
            return { ...state, all: action.allBlisApps };
        case AT.CREATE_BLIS_APPLICATION_FULFILLED:
            return { ...state, all: [...state.all, action.blisApp] }
        case AT.SET_CURRENT_BLIS_APP_FULFILLED:
            return { ...state };
        case AT.DELETE_BLIS_APPLICATION_FULFILLED:
            return { ...state, all: state.all.filter(app => app.appId !== action.blisAppGUID) };
        case AT.EDIT_BLIS_APPLICATION_FULFILLED:
            return { ...state, all: replace(state.all, action.blisApp, app => app.appId) }
        default:
            return state;
    }
}
export default appsReducer;