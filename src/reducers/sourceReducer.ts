/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActionObject, SourceState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import produce from 'immer'

const initialState: SourceState = {}

const sourceReducer: Reducer<SourceState> = produce((state: SourceState, action: ActionObject) => {
    switch (action.type) {
        case AT.SOURCE_SET_UPDATED_APP_DEFINITION:
            state[action.appId] = action.appDefinitionChange
            return
        case AT.SOURCE_PROMOTE_UPDATED_APP_DEFINITION:
            delete state[action.appId]
            return
        default:
            return
    }
}, initialState)

export default sourceReducer