/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { createStore, applyMiddleware, Store } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import thunkMiddleware from 'redux-thunk'
import { State } from './types'
import rootEpic from './epics/root'
import rootReducer from './reducers/root'
import { throttle } from 'lodash'
import * as localStorage from './services/localStorage'
import * as ClientFactory from './services/clientFactory'

const persistedState: Partial<State> = localStorage.load()
export const createReduxStore = (): Store<State> => {
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