import { CREATE_BLIS_APPLICATION } from '../actions/create';
import { FETCH_APPLICATIONS } from '../actions/fetch';
const initialState = {
    all: [], 
    current: {},
};
export default (state = initialState, action) => {
    switch(action.type) {
        case FETCH_APPLICATIONS:
            return state;
        case CREATE_BLIS_APPLICATION:
            return state;
        default:
            return state;
    }
}