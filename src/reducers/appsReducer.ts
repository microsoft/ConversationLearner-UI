import { CREATE_BLIS_APPLICATION } from '../actions/create';
import { FETCH_APPLICATIONS } from '../actions/fetch';
import { SET_CURRENT_BLIS_APP, SET_BLIS_APP_DISPLAY } from '../actions/update';
const initialState = {
    all: [], 
    current: {},
    pageToDisplay: "Home"
};
export default (state = initialState, action) => {
    switch(action.type) {
        case FETCH_APPLICATIONS:
            return {...state, all: action.payload};
        case CREATE_BLIS_APPLICATION:
            return {...state, current: action.payload, all: [...state.all, action.payload]};
        case SET_CURRENT_BLIS_APP:
            return {...state, current: action.payload};
        case SET_BLIS_APP_DISPLAY:
            return {...state, pageToDisplay: action.payload};
        default:
            return state;
    }
    return state;
}