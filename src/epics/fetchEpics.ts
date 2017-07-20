import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { getAllBlisApps, getAllEntitiesForBlisApp, getAllActionsForBlisApp } from "./apiHelpers";
import { fetchApplicationsFulfilled, fetchAllEntitiesFulfilled, fetchAllActionsFulfilled } from '../actions/fetchActions'
import { setErrorDisplay } from '../actions/updateActions'

export const fetchApplications: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("FETCH_APPLICATIONS")
        .flatMap((action: any) => getAllBlisApps(action.key, action.userId));
}

export const fetchEntities: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("FETCH_ENTITIES")
        .flatMap((action: any) =>
            getAllEntitiesForBlisApp(action.key, action.blisAppID)
                .map(response => fetchAllEntitiesFulfilled(response.data.entities))
        );       
}

export const fetchActions: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("FETCH_ACTIONS")
        .flatMap((action: any) =>
            getAllActionsForBlisApp(action.key, action.blisAppID)
                .map(response => fetchAllActionsFulfilled(response.data.actions))
        );
}
