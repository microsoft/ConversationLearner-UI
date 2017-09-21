import { combineReducers, Reducer } from 'redux';
import appsReducer from './appsReducer';
import botReducer from './botReducer';
import entitiesReducer from './entitiesReducer';
import actionsReducer from './actionsReducer';
import trainDialogsReducer from './trainDialogsReducer';
import logDialogsReducer from './logDialogsReducer';
import displayReducer from './displayReducer';
import userReducer from './userReducer';
import errorReducer from './errorReducer';
import teachSessionReducer from './teachSessionReducer';
import chatSessionReducer from './chatSessionReducer';
import { State } from '../types';

const rootReducer: Reducer<State> = combineReducers<State>({
    user: userReducer,
    apps: appsReducer,
    bot: botReducer,
    entities: entitiesReducer,
    actions: actionsReducer,
    trainDialogs: trainDialogsReducer,
    display: displayReducer,
    error: errorReducer,
    logDialogs: logDialogsReducer,
    teachSessions: teachSessionReducer,
    chatSessions: chatSessionReducer
});

export default rootReducer;