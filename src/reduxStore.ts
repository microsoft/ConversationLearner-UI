/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { createStore, applyMiddleware, Store } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import thunkMiddleware from 'redux-thunk'
import { State, defaultBotPort, previousBotPort } from './types'
import rootEpic from './epics/root'
import rootReducer from './reducers/root'
import { throttle } from 'lodash'
import * as localStorage from './services/localStorage'
import * as ClientFactory from './services/clientFactory'

export const createReduxStore = (): Store<State> => {
    // TODO: The return type of persisted state should include 'undefined'
    const persistedState = localStorage.load<Partial<State>>()

    /**
     * This is a work around to auto reset port to 3978 from 5000
     * and avoid users having to manually resetting
     */
    const settings = persistedState && persistedState.settings
    if (settings) {
        if (settings.botPort === previousBotPort) {
            settings.botPort = defaultBotPort
        }
    }

    const store = createStore(rootReducer,
        persistedState as State,
        applyMiddleware(
            thunkMiddleware,
            createEpicMiddleware(rootEpic)
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