import { combineReducers, Reducer } from 'redux';
import appsReducer from './appsReducer';
import entitiesReducer from './entitiesReducer';
import actionsReducer from './actionsReducer';
import trainDialogsReducer from './trainDialogsReducer';
import displayReducer from './displayReducer';
import { State } from '../types';

const rootReducer = combineReducers<State>({
    apps: appsReducer,
    entities: entitiesReducer,
    actions: actionsReducer,
    trainDialogs: trainDialogsReducer,
    display: displayReducer
});

export default rootReducer;