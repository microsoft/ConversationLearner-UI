import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { createBlisApp, createBlisAction, createBlisEntity, createChatSession, createTeachSession } from "./apiHelpers";
import { createApplicationFulfilled, createPositiveEntityFulfilled, createNegativeEntityFulfilled } from '../actions/createActions'
import { setErrorDisplay } from '../actions/displayActions'

export const createNewApplicationEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_BLIS_APPLICATION_ASYNC)
        .flatMap((action: any) =>
            createBlisApp(action.key, action.userId, action.blisApp))
}

export const createNewActionEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_ACTION_ASYNC)
        .flatMap((actionObject: any) =>
            createBlisAction(actionObject.key, actionObject.action, actionObject.currentAppId)
        );
}

export const createNewEntityEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_ENTITY_ASYNC)
        .flatMap((action: any) =>
            createBlisEntity(action.key, action.entity, action.currentAppId)
        );
}

export const createNegativeEntity: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_ENTITY_FULFILLEDPOSITIVE)
        .flatMap((action: any) =>
            createBlisEntity(action.key, action.negativeEntity, action.currentAppId, action.positiveEntity)
        );
}

export const createNewChatSessionEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_CHAT_SESSION_ASYNC)
        .flatMap((actionObject: any) =>
            createChatSession(actionObject.key, actionObject.session, actionObject.currentAppId)
        );
}

export const createNewTeachSessionEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.CREATE_TEACH_SESSION)
        .flatMap((actionObject: any) =>
            createTeachSession(actionObject.key, actionObject.teachSession, actionObject.currentAppId)
        );
}