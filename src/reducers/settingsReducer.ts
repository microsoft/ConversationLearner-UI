/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, SettingsState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: SettingsState = {
    botPort: 3978
}

const reducer: Reducer<SettingsState> = (state = initialState, action: ActionObject): SettingsState => {
    switch (action.type) {
        case AT.SETTINGS_RESET:
            return { ...initialState }
        case AT.SETTINGS_UPDATE:
            return {
                ...state,
                botPort: action.botPort
            }
        default:
            return state
    }
}

export default reducer