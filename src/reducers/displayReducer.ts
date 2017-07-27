import { ActionObject } from '../types'
import { DisplayState } from '../types'
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
        case 'SET_DISPLAY_MODE':
            return {...state, displayMode: action.setDisplay};
        case 'SET_LOGIN_DISPLAY':
            return {...state, displayLogin: action.setLoginDisplay};
        case 'CREATE_BLIS_APPLICATION_FULFILLED':
        case 'SET_CURRENT_BLIS_APP_FULFILLED':
            return {...state, displayMode: DisplayMode.AppAdmin};
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