/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { createApp } from "./apiHelpers";

const assertNever = () => { throw Error(`Should not reach here`) }

export const createNewApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_APPLICATION_ASYNC)
        .flatMap(action =>
            (action.type === AT.CREATE_APPLICATION_ASYNC)
                ? createApp(action.userId, action.app)
                : assertNever()
        )
}