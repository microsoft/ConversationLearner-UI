/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, SettingsState, defaultBotPort } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: SettingsState = {
    botPort: defaultBotPort
}

const settingsReducer: Reducer<SettingsState> = (state = initialState, action: ActionObject): SettingsState => {
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

export default settingsReducer