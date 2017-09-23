import { AppState } from '../types'
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { BlisAppBase } from 'blis-models'

const apps: BlisAppBase[] = [
    {
        appId: 'app-id-1',
        appName: 'App 1',
        luisKey: 'abc123uvw456',
        locale: 'en-US',
        metadata: {
            botFrameworkApps: []
        }
    },
    {
        appId: 'app-id-2',
        appName: 'App 2',
        luisKey: 'XYZ21-0349sad20345',
        locale: 'en-GB',
        metadata: {
            botFrameworkApps: []
        }
    }
]

const initialState: AppState = {
    list: [...apps]
};

const appsReducer: Reducer<AppState> = (state = initialState, action: ActionObject) => {
    switch (action.type) {
        case AT.CREATE_APPLICATION_FULFILLED:
            return { ...state, list: [...state.list, action.app] };
        case AT.DELETE_BLIS_APPLICATION_FULFILLED:
            return { ...state, list: state.list.filter(app => app.appId !== action.app.appId) };
        default:
            return state;
    }
}

export default appsReducer;