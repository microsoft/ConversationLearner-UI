import { createStore, applyMiddleware, Store } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { State } from './types'
import rootEpic from './epics/root';
import rootReducer from './reducers/root';

export const createReduxStore = () =>
    createStore(rootReducer,
        applyMiddleware(createEpicMiddleware(rootEpic))
    );