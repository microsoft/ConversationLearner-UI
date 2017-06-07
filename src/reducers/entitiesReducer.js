import { CREATE_ENTITY } from '../actions/create';
import { FETCH_ENTITIES } from '../actions/fetch';
const initialState = {
    all: []
};
export default (state = initialState, action) => {
    switch(action.type) {
        default:
            return state;
    }
}