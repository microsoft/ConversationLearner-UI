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

    const defaultPorts = [ports.defaultUiDevPort, ports.defaultUiReactPort]
    const settings = persistedState && persistedState.settings
    if (settings) {
        if (defaultPorts.includes(settings.botPort)) {
            settings.botPort = ports.defaultBotPort
        }
        ClientFactory.setPort(settings.botPort)
    }
    // If it's the first time loaded there are no saved settings
    // Use default port for dev and tests
    else {
        if (defaultPorts.includes(ports.urlBotPort)) {
            ClientFactory.setPort(ports.defaultBotPort)
        }
    }

    const store = createStore(rootReducer,
        persistedState as State,
        applyMiddleware(
            thunk
        )
    )

    store.subscribe(throttle(() => {
        const state = store.getState()

        // Update client to use the PORT
        ClientFactory.setPort(state.settings.botPort)

        const stateToPersist = {
            settings: state.settings
        }
        localStorage.save(stateToPersist)
    }, 1000))

    return store
}