import { ActionObject } from '../types'
import { UserState } from '../types'
import { Reducer } from 'redux'
import { KeyGen } from 'blis-models'

const initialState: UserState = {
    name: "",
    password: "",
    id: null,
    key: null
};

const userReducer: Reducer<UserState> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {
        case 'SET_USER':
            // TEMP: Until user data is passed through correctly
            let userdata = { id: action.id, name: action.name };
            let key = KeyGen.MakeKey(JSON.stringify(userdata));
            return {...state, name: action.name, password: action.password, id: action.id, key: key };
        case 'SET_USER_KEY':
            return {...state, key: action.key };
        case 'SET_ERROR_DISPLAY':
            switch (action.route) {
                case 'FETCH_APPLICATIONS' :
                    return {...initialState};
                default:
                    return {...state}
            }
            
        default:
            return state;
    }
}



export default userReducer;