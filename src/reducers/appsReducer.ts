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
import produce from 'immer'

const initialState: AppsState = {
    all: [],
    activeApps: {},
    selectedAppId: undefined
};

const appsReducer: Reducer<AppsState> = produce((state: AppsState, action: ActionObject) => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return { ...initialState }
        case AT.FETCH_APPLICATIONS_FULFILLED:
            state.all = action.uiAppList.appList.apps
            state.activeApps = action.uiAppList.activeApps
            return
        case AT.FETCH_APPLICATION_TRAININGSTATUS_ASYNC: {
            const app = state.all.find(a => a.appId === action.appId) as App | undefined
            // User may have deleted the app
            if (!app) {
                return
            }

            app.didPollingExpire = false
            return
        }
        case AT.FETCH_APPLICATION_TRAININGSTATUS_EXPIRED: {
            const app = state.all.find(a => a.appId === action.appId) as App | undefined
            // User may have delete the app
            if (!app) {
                return
            }

            app.didPollingExpire = true
            return
        }
        case AT.FETCH_APPLICATION_TRAININGSTATUS_FULFILLED: {
            const app = state.all.find(a => a.appId === action.appId) as App | undefined
            // User may have delete the app
            if (!app) {
                return
            }

            app.didPollingExpire = false
            app.trainingStatus = action.trainingStatus.trainingStatus
            // Since we're updating training status simulate update to datetime field
            app.datetime = new Date()
            // Used discriminated union to access failure message
            app.trainingFailureMessage = (action.trainingStatus.trainingStatus === TrainingStatusCode.Failed)
                ? action.trainingStatus.trainingFailureMessage
                : null
            return
        }
        case AT.CREATE_APPLICATION_FULFILLED:
            state.all.push(action.app)
            state.selectedAppId = action.app.appId
            return
        case AT.SET_CURRENT_APP_FULFILLED:
            state.selectedAppId = action.app.appId
            return
        case AT.DELETE_APPLICATION_FULFILLED:
            state.all = state.all.filter(app => app.appId !== action.appId)
            state.selectedAppId = undefined
            return
        case AT.EDIT_APPLICATION_FULFILLED:
        case AT.CREATE_APP_TAG_FULFILLED:
        case AT.EDIT_APP_LIVE_TAG_FULFILLED:
            state.all = replace(state.all, action.app, app => app.appId)
            return
        case AT.EDIT_APP_EDITING_TAG_FULFILLED:
            state.activeApps = action.activeApps
            return

        // TODO: We're expecting more handlers here, as we're simply updating lastModifiedDateTime...
        case AT.EDIT_TRAINDIALOG_FULFILLED:

            const app = state.all.find(a => a.appId === action.appId) as App | undefined
            // User may have delete the app
            if (!app) {
                return
            }

            app.lastModifiedDateTime = `${new Date().toISOString().slice(0, 19)}+00:00`
            return
        default:
            return
    }
}, initialState)

export default appsReducer