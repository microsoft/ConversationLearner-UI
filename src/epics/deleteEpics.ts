import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { deleteBlisApp } from './apiHelpers';

const assertNever = () => { throw Error(`Should not reach here`) }

export const deleteApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_BLIS_APPLICATION_ASYNC)
        .flatMap(action =>
            (action.type === AT.DELETE_BLIS_APPLICATION_ASYNC)
                ? deleteBlisApp(action.blisApp)
                : assertNever()
        )
}