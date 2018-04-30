/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, UserState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import * as ClientFactory from '../services/clientFactory'

const initialState: UserState = {
    name: "Unset",
    id: null
}

const intializeClientFactory = (id: string) => {
    // Update the Client configuration to access token and user id for memory for all future requests
    ClientFactory.setMemoryKey(() => id)
}

const userReducer: Reducer<UserState> = (state = initialState, action: ActionObject): UserState => {
    switch (action.type) {
        case AT.FETCH_BOTINFO_FULFILLED:
            const user = action.botInfo.user
            intializeClientFactory(user.id)
            return { ...state, ...user }
        default:
            return state
    }
}

export default userReducer