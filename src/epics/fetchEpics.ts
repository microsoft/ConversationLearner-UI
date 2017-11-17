import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { getBotInfo, getAllBlisApps, getAppTrainingStatus, getAllEntitiesForBlisApp, getAllActionsForBlisApp, getAllSessionsForBlisApp, getAllTeachSessionsForBlisApp, getAllTrainDialogsForBlisApp, getAllLogDialogsForBlisApp } from "./apiHelpers";

const assertNever = () => { throw Error(`Should not reach here`) }

export const fetchBotInfoEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_BOTINFO_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_BOTINFO_ASYNC)
                ? getBotInfo('')
                : assertNever())
}

export const fetchApplicationsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_APPLICATIONS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_APPLICATIONS_ASYNC)
                ? getAllBlisApps('', action.userId)
                : assertNever())
}

export const fetchApplicationTrainingStatusEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_APPLICATION_TRAININGSTATUS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_APPLICATION_TRAININGSTATUS_ASYNC)
                ? getAppTrainingStatus(action.appId)
                : assertNever())
}

export const fetchEntitiesEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_ENTITIES_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_ENTITIES_ASYNC)
                ? getAllEntitiesForBlisApp('', action.blisAppID)
                : assertNever())
}

export const fetchActionsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_ACTIONS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_ACTIONS_ASYNC)
                ? getAllActionsForBlisApp('', action.blisAppID)
                : assertNever())
}

export const fetchTrainDialogsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_TRAIN_DIALOGS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_TRAIN_DIALOGS_ASYNC)
                ? getAllTrainDialogsForBlisApp(action.key, action.blisAppID)
                : assertNever())
}

export const fetchLogDialogsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_LOG_DIALOGS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_LOG_DIALOGS_ASYNC)
                ? getAllLogDialogsForBlisApp(action.key, action.blisAppID)
                : assertNever())
}

export const fetchChatSessionsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_CHAT_SESSIONS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_CHAT_SESSIONS_ASYNC)
                ? getAllSessionsForBlisApp(action.key, action.blisAppID)
                : assertNever())
}

export const fetchTeachSessionsEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.FETCH_TEACH_SESSIONS_ASYNC)
        .flatMap(action =>
            (action.type === AT.FETCH_TEACH_SESSIONS_ASYNC)
                ? getAllTeachSessionsForBlisApp(action.key, action.blisAppID)
                : assertNever())
}
