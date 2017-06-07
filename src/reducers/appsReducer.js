import { CREATE_BLIS_APPLICATION } from '../actions/create';
import { FETCH_APPLICATIONS } from '../actions/fetch';
const initialState = {
    all: [], 
    current: {},
};
export default (state = initialState, action) => {
    switch(action.type) {
        default:
            return state;
    }
}