import { ActionObject } from '../actions/ActionObject'
import { BLISApplication } from '../models/Application';
export interface appReducerState {
    all: BLISApplication[],
    current: BLISApplication
}
const initialState: appReducerState = {
    all: [], 
    current: null
};
export default (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'FETCH_APPLICATIONS':
            return {...state, all: action.allBlisApps};
        case 'CREATE_BLIS_APPLICATION':
            return {...state, current: action.blisApp, all: [...state.all, action.blisApp]};
        case 'SET_CURRENT_BLIS_APP':
            return {...state, current: action.currentBLISApp};
        case 'DELETE_BLIS_APPLICATION':
            return {...state, all: state.all.filter(app => app.modelID !== action.blisAppGUID)};
        case 'EDIT_BLIS_APPLICATION':
            // return {...state, pageToDisplay: action.payload};
        default:
            return state;
    }
}