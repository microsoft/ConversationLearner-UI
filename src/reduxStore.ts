/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { createStore, applyMiddleware, Store } from 'redux'
import thunk from 'redux-thunk'
import { State } from './types'
import rootReducer from './reducers/root'

export const createReduxStore = (): Store<State> => {
    const store = createStore(rootReducer,
        applyMiddleware(
            thunk
        )
    )

    return store
}