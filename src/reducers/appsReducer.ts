import { AppsState } from '../types'
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { replace } from '../util'
import { TrainingStatusCode } from 'blis-models'
import { App } from '../types/models'

const initialState: AppsState = {
    all: []
};

const appsReducer: Reducer<AppsState> = (state = initialState, action: ActionObject): AppsState => {
    switch (action.type) {
        case AT.LOGOUT:
            return { ...initialState };
        case AT.FETCH_APPLICATIONS_FULFILLED:
            return { ...state, all: action.allBlisApps }
        case AT.FETCH_APPLICATION_TRAININGSTATUS_ASYNC: {
            const app = state.all.find(app => app.appId === action.appId)
            const newApp: App = {
                ...app,
                didPollingExpire: false
            }

            return { ...state, all: replace(state.all, newApp, a => a.appId) }
        }
        case AT.FETCH_APPLICATION_TRAININGSTATUS_EXPIRED: {
            const app = state.all.find(app => app.appId === action.appId)
            const newApp: App = {
                ...app,
                didPollingExpire: true
            }

            return { ...state, all: replace(state.all, newApp, a => a.appId) }
        }
        case AT.FETCH_APPLICATION_TRAININGSTATUS_FULFILLED: {
            const app = state.all.find(app => app.appId === action.appId)
            const newApp: App = {
                ...app,
                didPollingExpire: false,
                trainingStatus: action.trainingStatus.trainingStatus,
                // Since we're updating training status simulate update to datetime field
                datetime: new Date(),
                // Used discriminated union to access failure message
                trainingFailureMessage: (action.trainingStatus.trainingStatus === TrainingStatusCode.Failed)
                    ? action.trainingStatus.trainingFailureMessage
                    : null
            }

            return { ...state, all: replace(state.all, newApp, a => a.appId) }
        }
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