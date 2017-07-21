import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { createBlisApp, createBlisAction, createBlisEntity } from "./apiHelpers";
import { createApplicationFulfilled, createPositiveEntityFulfilled, createNegativeEntityFulfilled } from '../actions/createActions'
import { setErrorDisplay } from '../actions/updateActions'

export const createNewApplication: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_BLIS_APPLICATION")
        .flatMap((action: any) =>
            createBlisApp(action.key, action.userId, action.blisApp))
}

export const createNewAction: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_ACTION")
        .flatMap((actionObject: any) =>
            createBlisAction(actionObject.key, actionObject.action, actionObject.currentAppId)
        );
}

export const createNewEntity: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_ENTITY")
        .flatMap((action: any) =>
            createBlisEntity(action.key, action.entity, action.currentAppId)
        );
}

export const createNegativeEntity: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_POSITIVE_ENTITY_FULFILLED")
        .flatMap((action: any) =>
            createBlisEntity(action.key, action.negativeEntity, action.currentAppId, action.positiveEntity)
        );
}