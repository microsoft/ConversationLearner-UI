/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, SettingsState, ports } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import produce from 'immer'

// TODO: Consolidate calculation, needs to match reduxStore
const useCustomPort = ports.defaultUiPort === ports.urlBotPort
const botPort = useCustomPort
    ? ports.defaultBotPort
    : ports.urlBotPort


export const initialState: SettingsState = {
    useCustomPort,
    botPort,
    customPort: ports.defaultBotPort,
}

const settingsReducer: Reducer<SettingsState> = produce((state: SettingsState, action: ActionObject) => {
    switch (action.type) {
        case AT.SETTINGS_RESET:
            state.customPort = ports.defaultBotPort
            return
        case AT.SETTINGS_UPDATE:
            state.customPort = action.port
            if (state.useCustomPort) {
                state.botPort = state.customPort
            }
            return
        case AT.SETTINGS_USE_CUSTOM_PORT:
            state.useCustomPort = !state.useCustomPort
            state.botPort = state.useCustomPort
                ? state.customPort
                : ports.urlBotPort
            return
        default:
            return
    }
}, initialState)

export default settingsReducer