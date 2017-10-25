import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { editBlisAction, editBlisApp, editBlisEntity, editTrainDialog, setBlisApp } from "./apiHelpers";

const assertNever = () => { throw Error(`Should not reach here`) }

export const editApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.EDIT_BLIS_APPLICATION_ASYNC)
        .flatMap(action =>
            (action.type === AT.EDIT_BLIS_APPLICATION_ASYNC)
                ? editBlisApp('', action.blisApp.appId, action.blisApp)
                : assertNever())
}

export const editActionEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.EDIT_ACTION_ASYNC)
        .flatMap(action =>
            (action.type === AT.EDIT_ACTION_ASYNC)
                ? editBlisAction('', action.currentAppId, action.blisAction.actionId, action.blisAction)
                : assertNever())
}

export const editEntityEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_ENTITY_FULFILLEDNEGATIVE)
        .flatMap(action =>
            (action.type === AT.CREATE_ENTITY_FULFILLEDNEGATIVE)
                ? editBlisEntity('', action.currentAppId, action.positiveEntity)
                : assertNever())
}

export const editTrainDialogEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.EDIT_TRAIN_DIALOG_ASYNC)
        .flatMap(action =>
            (action.type === AT.EDIT_TRAIN_DIALOG_ASYNC)
                ? editTrainDialog('', action.currentAppId, action.trainDialog)
                : assertNever())
}

export const setBlisApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.SET_CURRENT_BLIS_APP_ASYNC)
        .flatMap(action =>
            (action.type === AT.SET_CURRENT_BLIS_APP_ASYNC)
                ? setBlisApp(action.key, action.app)
                : assertNever())
}
