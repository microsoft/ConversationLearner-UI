import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { editBlisAction, editBlisApp, editBlisEntity, setBlisApp, setConversationId, expireChatSession } from './apiHelpers';

const assertNever = () => { throw Error(`Should not reach here`) }

export const editApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.EDIT_BLIS_APPLICATION_ASYNC)
        .flatMap(action =>
            (action.type === AT.EDIT_BLIS_APPLICATION_ASYNC)
                ? editBlisApp('', action.blisApp.appId, action.blisApp)
                : assertNever())
}

export const editActionEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.EDIT_ACTION_ASYNC)
        .flatMap(action =>
            (action.type === AT.EDIT_ACTION_ASYNC)
                ? editBlisAction('', action.currentAppId, action.blisAction.actionId, action.blisAction)
                : assertNever())
}

export const editEntityEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_ENTITY_FULFILLEDNEGATIVE)
        .flatMap(action =>
            (action.type === AT.CREATE_ENTITY_FULFILLEDNEGATIVE)
                ? editBlisEntity('', action.currentAppId, action.positiveEntity)
                : assertNever())
}

export const editChatSessionExpireEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC)
        .flatMap(action =>
            (action.type === AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC)
                ? expireChatSession(action.key, action.appId, action.sessionId)
                : assertNever())
}

export const setBlisApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.SET_CURRENT_BLIS_APP_ASYNC)
        .flatMap(action =>
            (action.type === AT.SET_CURRENT_BLIS_APP_ASYNC)
                ? setBlisApp(action.key, action.app)
                : assertNever())
}

export const setConversationIdEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.SET_CONVERSATION_ID_ASYNC)
        .flatMap(action =>
            (action.type === AT.SET_CONVERSATION_ID_ASYNC)
                ? setConversationId(action.userName, action.userId, action.conversationId)
                : assertNever())
}
