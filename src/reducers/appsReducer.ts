import { AppState } from '../types'
import { ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { Reducer } from 'redux'

const initialState: AppState = {
    all: [],
    current: null
};

const appsReducer: Reducer<AppState> = (state = initialState, action: ActionObject) => {
    switch (action.type) {
        case 'FETCH_APPLICATIONS_FULFILLED':
            return { ...state, all: action.allBlisApps };
        case 'CREATE_BLIS_APPLICATION_FULFILLED':
            let newApp = {...action.blisApp, appId: action.blisAppId};
            return { ...state, current: newApp, all: [...state.all, newApp]};
        case 'SET_CURRENT_BLIS_APP':
            return { ...state, current: action.currentBLISApp };
        case 'DELETE_BLIS_APPLICATION':
            return { ...state, all: state.all.filter(app => app.appId !== action.blisAppGUID) };
        case 'EDIT_BLIS_APPLICATION':
            let index: number = 0;
            for (let i = 0; i < state.all.length; i++) {
                if (state.all[i].appId == action.blisApp.appId) {
                    index = i
                }
            }
            let newAll = Object.assign([], state.all);
            newAll[index] = action.blisApp;
            let stateToReturn: AppState = {
                all: newAll,
                current: action.blisApp
            }
            return stateToReturn
        default:
            return state;
    }
}
export default appsReducer;