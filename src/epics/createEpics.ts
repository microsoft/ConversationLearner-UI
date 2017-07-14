import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { createBlisApp, createBlisAction, createBlisEntity } from "./apiHelpers";
import { createApplicationFulfilled, createPositiveEntityFulfilled, createNegativeEntityFulfilled } from '../actions/createActions'

export const createNewApplication: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_BLIS_APPLICATION")
        .flatMap((action: any) =>
            createBlisApp(action.userId, action.blisApp)
                .map(response => createApplicationFulfilled(response.data))
        );
}

export const createNewEntity: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_ENTITY")
        .flatMap((action: any) =>
            createBlisEntity(action.entity, action.currentAppId)
				.mapTo({type: "CREATE_OPERATION_FULFILLED"})
        );
}

export const createReversibleEntity: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_REVERSIBLE_ENTITY")
        .flatMap((action: any) =>
            createBlisEntity(action.entity, action.currentAppId)
                .map(response => createPositiveEntityFulfilled(action.entity, response.data, action.currentAppId))
        );
}

export const createNegativeEntity: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_POSITIVE_ENTITY_FULFILLED")
        .flatMap((action: any) =>
            createBlisEntity(action.negativeEntity, action.currentAppId)
                .map(response => createNegativeEntityFulfilled(action.positiveEntity, action.negativeEntity, response.data, action.currentAppId))
        );
}

export const createNewAction: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_ACTION")
        .flatMap((actionObject: any) =>
            createBlisAction(actionObject.action, actionObject.currentAppId)
				.mapTo({type: "CREATE_OPERATION_FULFILLED"})
        );
}