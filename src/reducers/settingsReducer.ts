/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, SettingsState, defaultBotPort } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import produce from 'immer'

const initialState: SettingsState = {
    botPort: defaultBotPort,
    key: undefined
}

const settingsReducer: Reducer<SettingsState> = produce((state: SettingsState, action: ActionObject) => {
    switch (action.type) {
        case AT.SETTINGS_RESET:
            return { ...initialState }
        case AT.SETTINGS_UPDATE:
            state.botPort = action.botPort
            state.key = action.key
            return
        default:
            return
    }
}, initialState)

export default settingsReducer