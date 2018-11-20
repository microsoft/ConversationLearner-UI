/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { AppsState, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { replace } from '../Utils/util'
import { TrainingStatusCode } from '@conversationlearner/models'
import { App } from '../types/models'

const initialState: AppsState = {
    all: [],
    activeApps: {}
};

const appsReducer: Reducer<AppsState> = (state = initialState, action: ActionObject): AppsState => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return { ...initialState };
        case AT.FETCH_APPLICATIONS_FULFILLED:
            return { ...state, all: action.uiAppList.appList.apps, activeApps: action.uiAppList.activeApps }
        case AT.FETCH_APPLICATION_TRAININGSTATUS_ASYNC: {
            const app = state.all.find(a => a.appId === action.appId)
            // User may have deleted the app
            if (!app) {
                return state;
            }
            const newApp: App = {
                ...app,
                trainingStatus: TrainingStatusCode.Queued,
                didPollingExpire: false
            }

            return { ...state, all: replace(state.all, newApp, a => a.appId) }
        }
        case AT.FETCH_APPLICATION_TRAININGSTATUS_EXPIRED: {
            const app = state.all.find(a => a.appId === action.appId)
            // User may have delete the app
            if (!app) {
                return state;
            }
            const newApp: App = {
                ...app,
                didPollingExpire: true
            }

            return { ...state, all: replace(state.all, newApp, a => a.appId) }
        }
        case AT.FETCH_APPLICATION_TRAININGSTATUS_FULFILLED: {
            const app = state.all.find(a => a.appId === action.appId)
            // User may have delete the app
            if (!app) {
                return state;
            }
            const newApp: App = {
                ...app,
                didPollingExpire: false,
                trainingStatus: action.trainingStatus.trainingStatus,
                // Since we're updating training status simulate update to datetime field
                datetime: new Date(),
                lastModifiedDateTime: `${new Date().toISOString().slice(0, 19)}+00:00`,
                // Used discriminated union to access failure message
                trainingFailureMessage: (action.trainingStatus.trainingStatus === TrainingStatusCode.Failed)
                    ? action.trainingStatus.trainingFailureMessage
                    : null
            }

            return { ...state, all: replace(state.all, newApp, a => a.appId) }
        }
        case AT.CREATE_APPLICATION_FULFILLED:
            return { ...state, all: [...state.all, action.app] }
        case AT.SET_CURRENT_APP_FULFILLED:
            return { ...state };
        case AT.DELETE_APPLICATION_FULFILLED:
            return { ...state, all: state.all.filter(app => app.appId !== action.appId) };
        case AT.EDIT_APPLICATION_FULFILLED:
        case AT.CREATE_APP_TAG_FULFILLED:
        case AT.EDIT_APP_LIVE_TAG_FULFILLED:
            return { ...state, all: replace(state.all, action.app, app => app.appId) }
        case AT.EDIT_APP_EDITING_TAG_FULFILLED:
            return { ...state, activeApps: action.activeApps }
        default:
            return state;
    }
}
export default appsReducer;