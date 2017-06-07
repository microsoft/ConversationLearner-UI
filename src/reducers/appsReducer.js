import { CREATE_BLIS_APPLICATION } from '../actions/create';
import { FETCH_APPLICATIONS } from '../actions/fetch';
const initialState = {
    all: [], 
    current: {},
};
export default (state = initialState, action) => {
    switch(action.type) {
        case FETCH_APPLICATIONS:
            return {...state, all: action.payload};
        case CREATE_BLIS_APPLICATION:
            return {...state, current: action.payload};
        default:
            return state;
    }
}