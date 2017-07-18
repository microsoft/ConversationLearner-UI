import { ActionObject } from '../types'
import { UserState } from '../types'
import { Reducer } from 'redux'

const initialState: UserState = {
    name: "",
    password: "",
    id: null,
    key: null
};

const userReducer: Reducer<UserState> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'SET_USER':
            return {...state, name: action.name, password: action.password, id: action.id };
        case 'SET_USER_KEY':
            return {...state, key: action.key };
        default:
            return state;
    }
}



export default userReducer;