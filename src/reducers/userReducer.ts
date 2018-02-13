import { ActionObject } from '../types'
import { UserState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import * as ClientFactory from '../services/clientFactory'
import RSA from 'react-simple-auth'
import { microsoftProvider } from '../providers/microsoft-v2'

const unauthenticatedState: UserState = {
    isLoggedIn: false,
    name: "",
    id: null
}

const intializeClientFactory = (id: string) => {
    // Update the BlisClient configuration to access token and user id for memory for all future requests
    ClientFactory.setAccessToken(() => RSA.getAccessToken(microsoftProvider, ''))
    ClientFactory.setMemoryKey(() => id)
}

const initialState = { ...unauthenticatedState }
const session = RSA.restoreSession(microsoftProvider)
if (session) {
    const id = session.decodedIdToken.oid
    const name = session.decodedIdToken.name

    intializeClientFactory(id)
    initialState.isLoggedIn = true
    initialState.id = id
    initialState.name = name
}

const userReducer: Reducer<UserState> = (state = initialState, action: ActionObject): UserState => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            RSA.invalidateSession()
            return { ...unauthenticatedState }
        case AT.USER_LOGIN:
            const { id, name } = action
            intializeClientFactory(id)
            return {
                ...state,
                isLoggedIn: true,
                name,
                id
            }
        default:
            return state
    }
}

export default userReducer