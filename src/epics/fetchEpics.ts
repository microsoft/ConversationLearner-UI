/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { getAllApps, getAllEntitiesForApp, getAllActionsForApp, getAllSessionsForApp, getAllTeachSessionsForApp, getAllTrainDialogsForApp, getAllLogDialogsForApp } from "./apiHelpers";
 
const assertNever = () => { throw Error(`Should not reach here`) }

export const fetchApplicationsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_APPLICATIONS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_APPLICATIONS_ASYNC)
                ? getAllApps(action.userId)
                : assertNever())
}

export const fetchEntitiesEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_ENTITIES_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_ENTITIES_ASYNC)
                ? getAllEntitiesForApp(action.clAppID)
                : assertNever())
}

export const fetchActionsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_ACTIONS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_ACTIONS_ASYNC)
                ? getAllActionsForApp(action.clAppID)
                : assertNever())
}

export const fetchTrainDialogsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_TRAIN_DIALOGS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_TRAIN_DIALOGS_ASYNC)
                ? getAllTrainDialogsForApp(action.clAppID)
                : assertNever())
}

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
