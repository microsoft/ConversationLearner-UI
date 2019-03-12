/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ProfileState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import produce from 'immer'

const initialState: ProfileState = {
    current: null
}

const profileReducer: Reducer<ProfileState> = produce((state: ProfileState, action: ActionObject) => {
    switch (action.type) {
        case AT.FETCH_PROFILE_FULFILLED:
            state.current = action.profile
            return
        default:
            return
    }
}, initialState)

export default profileReducer