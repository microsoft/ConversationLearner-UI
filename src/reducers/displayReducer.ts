import { ActionObject } from '../types'
import { DisplayState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { DisplayMode } from '../types/const'

const initialState: DisplayState = {
    displayMode: DisplayMode.AppList,
    displayWebchat: false,
    webchatTeachMode: false,
    displayLogin: true
};

const displayReducer: Reducer<DisplayState> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case AT.SET_DISPLAY_MODE:
            return {...state, displayMode: action.setDisplay};
        case AT.SET_LOGIN_DISPLAY:
            return {...state, displayLogin: action.setLoginDisplay};
        case AT.CREATE_BLIS_APPLICATION_FULFILLED:
        case AT.SET_CURRENT_BLIS_APP_FULFILLED:
            return {...state, displayMode: DisplayMode.AppAdmin};
        case AT.SET_ERROR_DISPLAY:
            // If I fail to load critical data, return to home page
            switch (action.route) {
                case AT.FETCH_APPLICATIONS :
                case AT.FETCH_ENTITIES:
                case AT.FETCH_ACTIONS:
                    return {...initialState, displayLogin: false};
                default:
                    return {...state}
            }
        default:
            return state;
    }
}
export default displayReducer;