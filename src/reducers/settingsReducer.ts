/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, SettingsState, defaultBotPort, urlBotPort } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import produce from 'immer'

const initialState: SettingsState = {
    useCustomPort: false,
    botPort: urlBotPort,
    customPort: defaultBotPort,
}

const settingsReducer: Reducer<SettingsState> = produce((state: SettingsState, action: ActionObject) => {
    switch (action.type) {
        case AT.SETTINGS_RESET:
            return { ...initialState }
        case AT.SETTINGS_UPDATE:
            state.customPort = action.port
            return
        case AT.SETTINGS_USE_CUSTOM_PORT:
            state.useCustomPort = !state.useCustomPort
            if (state.useCustomPort) {
                state.botPort = state.customPort
            }
            return
        default:
            return
    }
}, initialState)

export default settingsReducer