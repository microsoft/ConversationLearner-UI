import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { editBlisApp, setBlisApp, setConversationId, expireChatSession } from './apiHelpers';

const assertNever = () => { throw Error(`Should not reach here`) }

export const editApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.EDIT_BLIS_APPLICATION_ASYNC)
        .flatMap(action =>
            (action.type === AT.EDIT_BLIS_APPLICATION_ASYNC)
                ? editBlisApp(action.blisApp.appId, action.blisApp)
                : assertNever())
}

export const editChatSessionExpireEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC)
        .flatMap(action =>
            (action.type === AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC)
                ? expireChatSession(action.appId, action.sessionId)
                : assertNever())
}

export const setBlisApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.SET_CURRENT_BLIS_APP_ASYNC)
        .flatMap(action =>
            (action.type === AT.SET_CURRENT_BLIS_APP_ASYNC)
                ? setBlisApp(action.app)
                : assertNever())
}

export const setConversationIdEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.SET_CONVERSATION_ID_ASYNC)
        .flatMap(action =>
            (action.type === AT.SET_CONVERSATION_ID_ASYNC)
                ? setConversationId(action.userName, action.userId, action.conversationId)
                : assertNever())
}
