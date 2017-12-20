import { ActionObject } from '../types'
import { UserState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: UserState = {
    name: "",
    password: "",
    id: null
};

const userReducer: Reducer<UserState> = (state = initialState, action: ActionObject): UserState => {
    switch (action.type) {
        case AT.LOGOUT:
            return { ...initialState };
        case AT.SET_USER:
            // TEMP: Until user data is passed through correctly
            return {
                ...state,
                name: action.name,
                password: action.password,
                id: action.id,
            };
        default:
            return state;
    }
}



export default userReducer;