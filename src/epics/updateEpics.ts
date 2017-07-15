import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { editBlisAction, editBlisApp, editBlisEntity } from "./apiHelpers";

export const editApplication: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("EDIT_BLIS_APPLICATION")
        .flatMap((action: any) =>
            editBlisApp(action.blisApp.appId, action.blisApp)
                .mapTo({ type: "UPDATE_OPERATION_FULFILLED" })
        );
}

export const editAction: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("EDIT_ACTION")
        .flatMap((action: any) =>
            editBlisAction(action.currentAppId, action.blisAction.actionId, action.blisAction)
                .mapTo({ type: "UPDATE_OPERATION_FULFILLED" })
        );
}

export const editEntity: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("CREATE_NEGATIVE_ENTITY_FULFILLED")
        .flatMap((action: any) =>
            editBlisEntity(action.currentAppId, action.positiveEntity)
                .mapTo({ type: "UPDATE_OPERATION_FULFILLED" })
        );
}