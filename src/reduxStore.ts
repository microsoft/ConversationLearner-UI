/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { createStore, applyMiddleware, Store } from 'redux'
import thunk from 'redux-thunk'
import { State, ports } from './types'
import rootReducer from './reducers/root'
import { throttle } from 'lodash'
import * as localStorage from './services/localStorage'
import * as ClientFactory from './services/clientFactory'

export const createReduxStore = (): Store<State> => {
    const persistedState = localStorage.load<Partial<State>>()
    const state = persistedState as State

    const settings = persistedState && persistedState.settings
    // If user chose to use custom port update the client to use this port
    // Need this since the subscribe below only happens on store change not initialization
    if (settings && settings.useCustomPort) {
        ClientFactory.setPort(settings.customPort)
        state.settings.botPort = settings.customPort
    }
    // TODO: Could move initialization to client, but try to keep on one place
    else {
        if (ports.defaultUiPort === ports.urlBotPort) {
            ClientFactory.setPort(ports.defaultBotPort)
            if (settings) {
                state.settings.botPort = settings.customPort
            }
        }
    }

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