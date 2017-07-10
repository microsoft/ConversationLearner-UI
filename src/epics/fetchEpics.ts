import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';
import { getAllBlisApps } from "./apiHelpers";
import { fetchApplicationsFulfilled } from '../actions/fetchActions'

export const fetchApplications: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("FETCH_APPLICATIONS")
        .mergeMap(action =>
            getAllBlisApps().map(response => fetchApplicationsFulfilled(response.data.apps))
        );
}
