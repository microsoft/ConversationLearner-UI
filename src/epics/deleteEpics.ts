import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { deleteBlisApp, deleteBlisEntity, deleteBlisAction, deleteChatSession, deleteTeachSession } from "./apiHelpers";

export const deleteApplication: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("DELETE_BLIS_APPLICATION")
        .flatMap((action: any) =>
            deleteBlisApp(action.key, action.blisAppGUID, action.blisApp)
        );
}

export const deleteEntity: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("DELETE_ENTITY")
        .flatMap((action: any) => 
                deleteBlisEntity(action.key, action.currentAppId, action.entity.entityId, action.entity.metadata.negativeId || action.entity.metadata.positiveId)    
        );
}

export const deleteReverseEntity: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("DELETE_REVERSE_ENTITY")
        .flatMap((action: any) =>
                deleteBlisEntity(action.key, action.currentAppId, action.reverseEntityId, null)
        );
}

export const deleteAction: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("DELETE_ACTION")
        .flatMap((actionObject: any) =>
            deleteBlisAction(actionObject.key, actionObject.currentAppId, actionObject.action)
        );
}

export const deleteSession: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("DELETE_CHAT_SESSION")
        .flatMap((actionObject: any) =>
            deleteChatSession(actionObject.key, actionObject.currentAppId, actionObject.session)
        );
}

export const deleteTeach: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("DELETE_TEACH_SESSION")
        .flatMap((actionObject: any) =>
            deleteTeachSession(actionObject.key, actionObject.currentAppId, actionObject.teachSession)
        );
}