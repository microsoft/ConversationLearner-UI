/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { createStore, applyMiddleware, Store } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import thunkMiddleware from 'redux-thunk'
import { State } from './types'
import rootEpic from './epics/root';
import rootReducer from './reducers/root';

export const createReduxStore = (): Store<State> =>
    createStore(rootReducer,
        applyMiddleware(
            thunkMiddleware,
            createEpicMiddleware(rootEpic)
        )
    );