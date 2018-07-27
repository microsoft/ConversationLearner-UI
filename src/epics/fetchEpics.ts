/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { getAllSessionsForApp, getAllTeachSessionsForApp, getAllLogDialogsForApp } from "./apiHelpers";
 
const assertNever = () => { throw Error(`Should not reach here`) }

export const fetchLogDialogsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_LOG_DIALOGS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_LOG_DIALOGS_ASYNC)
                ? getAllLogDialogsForApp(action.clAppID, action.packageId)
                : assertNever())
}

export const fetchChatSessionsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_CHAT_SESSIONS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_CHAT_SESSIONS_ASYNC)
                ? getAllSessionsForApp(action.clAppID)
                : assertNever())
}

export const fetchTeachSessionsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_TEACH_SESSIONS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_TEACH_SESSIONS_ASYNC)
                ? getAllTeachSessionsForApp(action.clAppID)
                : assertNever())
}
