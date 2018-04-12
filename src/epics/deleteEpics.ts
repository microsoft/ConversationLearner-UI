import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { deleteApp } from './apiHelpers';

const assertNever = () => { throw Error(`Should not reach here`) }

export const deleteApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_APPLICATION_ASYNC)
        .flatMap(action =>
            (action.type === AT.DELETE_APPLICATION_ASYNC)
                ? deleteApp(action.app)
                : assertNever()
        )
}