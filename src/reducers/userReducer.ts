import { ActionObject } from '../types'
import { UserState } from '../types'
import { Reducer } from 'redux'

const initialState: UserState = {
    name: "",
    password: "",
    id: null
};

const userReducer: Reducer<UserState> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'SET_USER':
            return {...state, name: action.name, password: action.password, id: action.id };
        default:
            return state;
    }
}



export default userReducer;