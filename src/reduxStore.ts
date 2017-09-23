import { createStore, Store } from 'redux';
import { State } from './types'
import rootReducer from './reducers/root';

export const createReduxStore = (): Store<State> =>
    createStore(rootReducer)