/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { createStore, applyMiddleware, Store } from 'redux'
import thunk from 'redux-thunk'
import { State } from './types'
import rootReducer from './reducers/root'
import { throttle } from 'lodash'
import * as localStorage from './services/localStorage'
import * as ClientFactory from './services/clientFactory'
// Note: Because we need and force initialState to be done here it has no effect on the reducer but is kept there to follow pattern.
import { initialState as initialSettings } from './reducers/settingsReducer'

export const createReduxStore = (): Store<State> => {
    let persistedState = localStorage.load<Partial<State>>()

    if (typeof persistedState !== 'object') {
        persistedState = {
            settings: initialSettings
        }
    }
    else {
        if (!persistedState.settings) {
            persistedState.settings = initialSettings
        }
        else {
            if (!persistedState.settings.useCustomPort) {
                persistedState.settings.useCustomPort = initialSettings.useCustomPort
            }
            if (!persistedState.settings.customPort) {
                persistedState.settings.customPort = initialSettings.customPort
            }
        }
    }

    // At this point persistedState should have a correct format of settings object
    const state = persistedState as State
    // If user chose to use custom port update the client to use this port
    // Need this since the subscribe below only happens on store change not initialization
    const botPort = state.settings.useCustomPort
        ? state.settings.customPort
        : initialSettings.botPort

    ClientFactory.setPort(botPort)
    state.settings.botPort = botPort

    const store = createStore(rootReducer,
        state,
        applyMiddleware(
            thunk
        )
    )

    store.subscribe(throttle(() => {
        const state = store.getState()

        // Update client to use the PORT
        if (state.settings.botPort) {
            ClientFactory.setPort(state.settings.botPort)
        }

        const stateToPersist = {
            settings: {
                useCustomPort: state.settings.useCustomPort,
                customPort: state.settings.customPort,
            }
        }

        localStorage.save(stateToPersist)
    }, 1000))

    return store
}