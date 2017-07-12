import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { createBlisApp, createBlisAction, createBlisEntity } from "./apiHelpers";

export const createNewApplication: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_BLIS_APPLICATION")
        .flatMap((action: any) =>
            createBlisApp(action.blisApp)
				.mapTo({type: "CREATE_OPERATION_FULFILLED"})
        );
}
export const createNewEntity: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_ENTITY")
        .flatMap((action: any) =>
            createBlisEntity(action.entity, action.currentAppId)
				.mapTo({type: "CREATE_OPERATION_FULFILLED"})
        );
}
export const createNewAction: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_ACTION")
        .flatMap((action: any) =>
            createBlisAction(action.action, action.currentAppId)
				.mapTo({type: "CREATE_OPERATION_FULFILLED"})
        );
}