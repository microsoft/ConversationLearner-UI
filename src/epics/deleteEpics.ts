import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { deleteBlisApp, deleteBlisEntity, deleteBlisAction, deleteChatSession, deleteTeachSession } from "./apiHelpers";

const assertNever = () => { throw Error(`Should not reach here`) }

export const deleteApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_BLIS_APPLICATION_ASYNC)
        .flatMap(action =>
            (action.type === AT.DELETE_BLIS_APPLICATION_ASYNC)
                ? deleteBlisApp('', action.blisApp)
                : assertNever()
        )
}

export const deleteEntityEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_ENTITY_ASYNC)
        .flatMap(action =>
            (action.type === AT.DELETE_ENTITY_ASYNC)
                ? deleteBlisEntity('', action.currentAppId, action.entity.entityId, action.entity.negativeId || action.entity.positiveId)
                : assertNever()
        )
}

export const deleteReverseEntityEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_REVERSE_ENTITY_ASYNC)
        .flatMap(action =>
            (action.type === AT.DELETE_REVERSE_ENTITY_ASYNC)
                ? deleteBlisEntity(action.key, action.currentAppId, action.reverseEntityId, null)
                : assertNever()
        )
}

export const deleteActionEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_ACTION_ASYNC)
        .flatMap(action =>
            (action.type === AT.DELETE_ACTION_ASYNC)
                ? deleteBlisAction('', action.currentAppId, action.action)
                : assertNever()
        )
}

export const deleteSessionEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_CHAT_SESSION_ASYNC)
        .flatMap(action =>
            (action.type === AT.DELETE_CHAT_SESSION_ASYNC)
                ? deleteChatSession(action.key, action.currentAppId, action.session)
                : assertNever()
        )
}

export const deleteTeachEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_TEACH_SESSION_ASYNC)
        .flatMap(action =>
            (action.type === AT.DELETE_TEACH_SESSION_ASYNC)
                ? deleteTeachSession(action.key, action.currentAppId, action.teachSession, action.save)
                : assertNever()
        )
}