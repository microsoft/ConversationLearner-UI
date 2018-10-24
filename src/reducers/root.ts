/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { combineReducers, Reducer } from 'redux'
import appsReducer from './appsReducer'
import botReducer from './botReducer'
import entitiesReducer from './entitiesReducer'
import actionsReducer from './actionsReducer'
import trainDialogsReducer from './trainDialogsReducer'
import logDialogsReducer from './logDialogsReducer'
import displayReducer from './displayReducer'
import userReducer from './userReducer'
import profileReducer from './profileReducer'
import errorReducer from './errorReducer'
import teachSessionReducer from './teachSessionReducer'
import chatSessionReducer from './chatSessionReducer'
import settingsReducer from './settingsReducer'
import sourceReducer from './sourceReducer'
import { State } from '../types'

const rootReducer: Reducer<State> = combineReducers<State>({
    user: userReducer,
    profile: profileReducer,
    apps: appsReducer,
    bot: botReducer,
    entities: entitiesReducer,
    actions: actionsReducer,
    trainDialogs: trainDialogsReducer,
    display: displayReducer,
    error: errorReducer,
    logDialogs: logDialogsReducer,
    teachSession: teachSessionReducer,
    chatSessions: chatSessionReducer,
    settings: settingsReducer,
    source: sourceReducer
})

export default rootReducer