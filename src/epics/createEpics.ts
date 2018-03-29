import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { createBlisApp, createBlisAction, createBlisEntity } from "./apiHelpers";

const assertNever = () => { throw Error(`Should not reach here`) }

export const createNewApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_BLIS_APPLICATION_ASYNC)
        .flatMap(action =>
            (action.type === AT.CREATE_BLIS_APPLICATION_ASYNC)
                ? createBlisApp(action.userId, action.blisApp)
                : assertNever()
        )
}

export const createNewActionEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_ACTION_ASYNC)
        .flatMap(action =>
            (action.type === AT.CREATE_ACTION_ASYNC)
                ? createBlisAction(action.action, action.currentAppId)
                : assertNever()
        )
}

export const createNewEntityEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_ENTITY_ASYNC)
        .flatMap(action =>
            (action.type === AT.CREATE_ENTITY_ASYNC)
                ? createBlisEntity(action.entity, action.currentAppId)
                : assertNever()
        )
}

export const createNegativeEntity: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_ENTITY_FULFILLEDPOSITIVE)
        .flatMap(action =>
            (action.type === AT.CREATE_ENTITY_FULFILLEDPOSITIVE)
                ? createBlisEntity(action.negativeEntity, action.currentAppId, action.positiveEntity)
                : assertNever()
        )

}
