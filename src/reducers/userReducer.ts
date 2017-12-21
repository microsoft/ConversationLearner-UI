import { ActionObject } from '../types'
import { UserState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import * as ClientFactory from '../services/clientFactory'

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
            const userId = action.id
            // After user logs in we are able to get access token and memory key
            // Update the BlisClient configuration to use these values
            // TODO: Update with real access token
            ClientFactory.setAccessToken(() => btoa(JSON.stringify({ id: userId })))
            ClientFactory.setMemoryKey(() => userId)
            // TEMP: Until user data is passed through correctly
            return {
                ...state,
                name: action.name,
                password: action.password,
                id: userId,
            };
        default:
            return state;
    }
}



export default userReducer;