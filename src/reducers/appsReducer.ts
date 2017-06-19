import { CREATE_BLIS_APPLICATION } from '../actions/create';
import { FETCH_APPLICATIONS } from '../actions/fetch';
import { DELETE_BLIS_APPLICATION } from '../actions/delete';
import { SET_CURRENT_BLIS_APP, SET_BLIS_APP_DISPLAY, EDIT_BLIS_APPLICATION } from '../actions/update';
import { CreateAction, FetchAction, UpdateAction, DeleteAction} from '../actions/ActionObject'
import { BLISApplication } from '../models/Application';
export interface appReducerState {
    all: BLISApplication[],
    current: BLISApplication,
    pageToDisplay: string
}
const initialState: appReducerState = {
    all: [], 
    current: null,
    pageToDisplay: "Home"
};
export default (state = initialState, action: any) => {
    switch(action.type) {
        case FETCH_APPLICATIONS:
            return {...state, all: action.blisApps};
        case CREATE_BLIS_APPLICATION:
            return {...state, current: action.blisApp, all: [...state.all, action.blisApp]};
        case SET_CURRENT_BLIS_APP:
            return {...state, currentBLISApp: action.currentBLISApp};
        case SET_BLIS_APP_DISPLAY:
            return {...state, pageToDisplay: action.setDisplay};
        case DELETE_BLIS_APPLICATION:
            // return {...state, current: action.payload};
        case EDIT_BLIS_APPLICATION:
            // return {...state, pageToDisplay: action.payload};
        default:
            return state;
    }
}