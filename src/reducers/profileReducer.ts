/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ProfileState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: ProfileState = {
    current: null
}

const profileReducer: Reducer<ProfileState> = (state = initialState, action: ActionObject): ProfileState => {
    switch (action.type) {
        case AT.FETCH_PROFILE_FULFILLED:
            return { current: action.profile }
        default:
            return state
    }
}

export default profileReducer