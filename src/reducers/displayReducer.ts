import { ActionObject } from '../types'
import { DisplayState } from '../types'
import { Reducer } from 'redux'

const initialState: DisplayState = {
    myAppsDisplay: "Home",
    displayWebchat: false
};

const displayReducer: Reducer<DisplayState> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'SET_BLIS_APP_DISPLAY':
            return {...state, myAppsDisplay: action.setDisplay};
        case 'SET_WEBCHAT_DISPLAY':
            return {...state, displayWebchat: action.setWebchatDisplay};
        default:
            return state;
    }
}
export default displayReducer;