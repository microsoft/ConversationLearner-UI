import { combineReducers, Reducer } from 'redux';
import appsReducer from './appsReducer';
import entitiesReducer from './entitiesReducer';
import actionsReducer from './actionsReducer';
import trainDialogsReducer from './trainDialogsReducer';
import displayReducer from './displayReducer';
import userReducer from './userReducer';
import { State } from '../types';

const rootReducer = combineReducers<State>({
    user: userReducer,
    apps: appsReducer,
    entities: entitiesReducer,
    actions: actionsReducer,
    trainDialogs: trainDialogsReducer,
    display: displayReducer,
});

export default rootReducer;