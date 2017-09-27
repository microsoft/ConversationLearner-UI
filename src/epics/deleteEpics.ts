import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject, DeleteLogDialogAsyncAction } from '../types'
import { AT } from '../types/ActionTypes'
import { deleteBlisApp, deleteBlisEntity, deleteBlisAction, deleteChatSession, deleteTeachSession, deleteTrainDialog, deleteLogDialog } from "./apiHelpers";

export const deleteApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_BLIS_APPLICATION_ASYNC)
        .flatMap((action: any) =>
            deleteBlisApp(action.key, action.blisAppGUID, action.blisApp)
        );
}

export const deleteEntityEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_ENTITY_ASYNC)
        .flatMap((action: any) =>
            deleteBlisEntity(action.key, action.currentAppId, action.entity.entityId, action.entity.metadata.negativeId || action.entity.metadata.positiveId)
        );
}

export const deleteReverseEntityEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_REVERSE_ENTITY_ASYNC)
        .flatMap((action: any) =>
            deleteBlisEntity(action.key, action.currentAppId, action.reverseEntityId, null)
        );
}

export const deleteActionEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_ACTION_ASYNC)
        .flatMap((actionObject: any) =>
            deleteBlisAction(actionObject.key, actionObject.currentAppId, actionObject.action)
        );
}

export const deleteSessionEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_CHAT_SESSION_ASYNC)
        .flatMap((actionObject: any) =>
            deleteChatSession(actionObject.key, actionObject.currentAppId, actionObject.session)
        );
}

export const deleteTeachEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_TEACH_SESSION_ASYNC)
        .flatMap((actionObject: any) =>
            deleteTeachSession(actionObject.key, actionObject.currentAppId, actionObject.teachSession, actionObject.save)
        );
}

export const deleteTrainDialogEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_TRAIN_DIALOG_ASYNC)
        .flatMap((actionObject: any) =>
            deleteTrainDialog(actionObject.key, actionObject.currentAppId, actionObject.trainDialog)
        );
}

export const deleteLogDialogEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.DELETE_LOG_DIALOG_ASYNC)
        .flatMap((actionObject: DeleteLogDialogAsyncAction) =>
            deleteLogDialog(actionObject.appId, actionObject.logDialogId)
        );
}