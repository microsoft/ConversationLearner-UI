/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActionObject, SourceState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: SourceState = {}

const reducer: Reducer<SourceState> = (state = initialState, action: ActionObject): SourceState => {
    switch (action.type) {
        case AT.SOURCE_SET_UPDATED_APP_DEFINITION:
            return {
                ...state,
                [action.appId]: action.appDefinitionChange
            }
        case AT.SOURCE_PROMOTE_UPDATED_APP_DEFINITION:
            const newState = {
                ...state
            }

            delete newState[action.app.appId]

            return newState
        default:
            return state
    }
}

export default reducer