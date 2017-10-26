import { ActionObject } from '../types'
import { UserState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import { KeyGen } from 'blis-models'

const initialState: UserState = {
    name: "",
    password: "",
    id: null,
    key: null
};

const userReducer: Reducer<UserState> = (state = initialState, action: ActionObject): UserState => {
    switch (action.type) {
        case AT.LOGOUT:
            return { ...initialState };
        case AT.SET_USER:
            // TEMP: Until user data is passed through correctly
            let userdata = { id: action.id, name: action.name };
            let key = KeyGen.MakeKey(JSON.stringify(userdata));
            return { ...state, name: action.name, password: action.password, id: action.id, key: key };
        default:
            return state;
    }
}



export default userReducer;