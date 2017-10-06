import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { editBlisAction, editBlisApp, editBlisEntity, editTrainDialog, setBlisApp } from "./apiHelpers";

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
    return action$.ofType(AT.CREATE_ENTITY_FULFILLEDNEGATIVE)
        .flatMap((action: any) =>
            editBlisEntity(action.key, action.currentAppId, action.positiveEntity)
        );
}

export const editTrainDialogEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.EDIT_TRAIN_DIALOG_ASYNC)
        .flatMap((action: any) =>
            editTrainDialog(action.key, action.currentAppId, action.trainDialog)
        );
}

export const setBlisApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.SET_CURRENT_BLIS_APP_ASYNC)
        .flatMap((action: any) =>
            setBlisApp(action.key, action.app)
        );
}
