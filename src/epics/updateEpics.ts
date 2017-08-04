import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { editBlisAction, editBlisApp, editBlisEntity, setBlisApp } from "./apiHelpers";

export const editApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.EDIT_BLIS_APPLICATION_ASYNC)
        .flatMap((action: any) =>
            editBlisApp(action.key, action.blisApp.appId, action.blisApp)
        );
}

export const editActionEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.EDIT_ACTION_ASYNC)
        .flatMap((action: any) =>
            editBlisAction(action.key, action.currentAppId, action.blisAction.actionId, action.blisAction)
        );
}

export const editEntityEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_NEGATIVE_ENTITY_FULFILLED)
        .flatMap((action: any) =>
            editBlisEntity(action.key, action.currentAppId, action.positiveEntity)
        );
}

export const setBlisApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.SET_CURRENT_BLIS_APP)
        .flatMap((action: any) =>
            setBlisApp(action.key, action.currentBLISApp)
        );
}
