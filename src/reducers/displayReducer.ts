import { ActionObject } from '../actions/ActionObject'
export interface displayReducerState {
    myAppsDisplay: string,
}
const initialState: displayReducerState = {
    myAppsDisplay: "Home",
};
export default (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'SET_BLIS_APP_DISPLAY':
            return {...state, myAppsDisplay: action.setDisplay};
        default:
            return state;
    }
}