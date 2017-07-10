import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';

export const fetchApplications: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
	console.log("in observable", action$)
    //will need to make a call to BLIS to get all apps for this user
    return action$.filter(a => a.type == "FETCH_APPLICATIONS").mapTo({
        type: "TEST"
    })
}
