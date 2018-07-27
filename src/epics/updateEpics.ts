/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { setApp, setConversationId } from './apiHelpers'

const assertNever = () => { throw Error(`Should not reach here`) }

export const setApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.SET_CURRENT_APP_ASYNC)
        .flatMap(action =>
            (action.type === AT.SET_CURRENT_APP_ASYNC)
                ? setApp(action.app)
                : assertNever())
}

export const setConversationIdEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.SET_CONVERSATION_ID_ASYNC)
        .flatMap(action =>
            (action.type === AT.SET_CONVERSATION_ID_ASYNC)
                ? setConversationId(action.userName, action.userId, action.conversationId)
                : assertNever())
}
