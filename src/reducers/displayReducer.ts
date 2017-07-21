import { ActionObject } from '../types'
import { DisplayState } from '../types'
import { Reducer } from 'redux'

const initialState: DisplayState = {
    myAppsDisplay: "Home",
    displayWebchat: false,
    displayLogin: true
};

const displayReducer: Reducer<DisplayState> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'SET_BLIS_APP_DISPLAY':
            return {...state, myAppsDisplay: action.setDisplay};
        case 'SET_WEBCHAT_DISPLAY':
            return {...state, displayWebchat: action.setWebchatDisplay};
        case 'SET_LOGIN_DISPLAY':
            return {...state, displayLogin: action.setLoginDisplay};
        case 'CREATE_BLIS_APPLICATION_FULFILLED':
            return {...state, myAppsDisplay: "TrainingGround"};
        case 'SET_ERROR_DISPLAY':
            // If I fail to load critical data, return to home page
            switch (action.route) {
                case 'FETCH_APPLICATIONS' :
                case 'FETCH_ENTITIES':
                case 'FETCH_ACTIONS':
                    return {...initialState, displayLogin: false};
                default:
                    return {...state}
            }
        default:
            return state;
    }
}
export default displayReducer;