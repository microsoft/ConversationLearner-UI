import 'rxjs'
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { 
	BlisAppBase, BlisAppMetaData, BlisAppList, 
	EntityBase, EntityMetaData, EntityList, 
	ActionBase, ActionMetaData, ActionList, ActionTypes,
	UserInput,
	TrainExtractorStep, ExtractResponse, TrainScorerStep } from 'blis-models'
import * as Rx from 'rxjs';
import { Observable, Observer } from 'rxjs'
import { fetchApplicationsFulfilled, fetchAllEntitiesFulfilled, fetchAllActionsFulfilled } from '../actions/fetchActions'
import { createApplicationFulfilled, createEntityFulfilled, createPositiveEntityFulfilled, createNegativeEntityFulfilled, createActionFulfilled } from '../actions/createActions'
import { deleteBLISApplicationFulfilled, deleteEntityFulfilled, deleteActionFulfilled } from '../actions/deleteActions'
import { editBLISApplicationFulfilled, editEntityFulfilled, editActionFulfilled } from '../actions/updateActions'
import { setErrorDisplay } from '../actions/updateActions'
import { ActionObject } from '../types'

//=========================================================
// CONFIG
//=========================================================

const config: AxiosRequestConfig = {
	headers: {
		"Content-Type": "application/json"
	}
}
const rootUrl: string = "http://localhost:5000/";

const makeRoute = (key: string, actionRoute : string, qstring? : string) =>
{
	let route = rootUrl.concat(actionRoute, `?key=${key}`);
	if (qstring)
	{
		route = route + `&${qstring}`;
	}
	return route;
}

//=========================================================
// PARAMETER REQUIREMENTS
//=========================================================

export interface BlisAppForUpdate extends BlisAppBase {
	trainingFailureMessage: string;
	trainingRequired: boolean;
	trainingStatus: string;
	latestPackageId: number
}

//=========================================================
// GET ROUTES
//=========================================================

export const getAllBlisApps = (key : string, userId : string): Observable<ActionObject> => {
	const getAppsRoute: string = makeRoute(key, `apps`, `userId=${userId}`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.get(getAppsRoute, config)
          .then(response => {
            obs.next(fetchApplicationsFulfilled(response.data.apps));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "FETCH_APPLICATIONS"));
            obs.complete();
          }));
};
export const getBlisApp = (key : string, appId: string): Observable<AxiosResponse> => {
	let getAppRoute: string = makeRoute(key, `app/${appId}`);
	return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};
export const getAllEntitiesForBlisApp = (key : string, appId: string): Observable<AxiosResponse> => {
	let getEntitiesForAppRoute: string = makeRoute(key, `app/${appId}/entities`);
	return Rx.Observable.fromPromise(axios.get(getEntitiesForAppRoute, config))
};
export const getBlisEntity = (key : string, appId: string, entityId: string): Observable<AxiosResponse> => {
	let getEntityRoute: string = makeRoute(key, `app/${appId}/entity/${entityId}`);
	return Rx.Observable.fromPromise(axios.get(getEntityRoute, config))
};
export const getAllActionsForBlisApp = (key : string, appId: string): Observable<AxiosResponse> => {
	let getActionsForAppRoute: string = makeRoute(key, `app/${appId}/actions`);
	return Rx.Observable.fromPromise(axios.get(getActionsForAppRoute, config))
};
export const getBlisAction = (key : string, appId: string, actionId: string): Observable<AxiosResponse> => {
	let getActionRoute: string = makeRoute(key, `app/${appId}/action/${actionId}`);
	return Rx.Observable.fromPromise(axios.get(getActionRoute, config))
};

//=========================================================
// CREATE ROUTES
//=========================================================

export const createBlisApp = (key: string, userId : string, blisApp: BlisAppBase): Observable<ActionObject> => {
	let addAppRoute: string = makeRoute(key, `app`, `userId=${userId}`);
	//remove the appId property from the object
	const { appId, ...appToSend } = blisApp
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.post(addAppRoute, appToSend, config)
          .then(response => {
            obs.next(createApplicationFulfilled(blisApp, response.data));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "CREATE_BLIS_APPLICATION"));
            obs.complete();
          }));
};
export const createBlisEntity = (key: string, entity: EntityBase, appId: string, reverseEntity?: EntityBase): Observable<ActionObject> => {
	let addEntityRoute: string = makeRoute(key, `app/${appId}/entity`);
	//remove property from the object that the route will not accept
	const { version, packageCreationId, packageDeletionId, entityId, ...entityToSend } = entity;
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.post(addEntityRoute, entityToSend, config).then(response => {
			let newEntityId = response.data;
			if (!entity.metadata.isReversable) {
				obs.next(createEntityFulfilled(entity, newEntityId));
			}
			else if (entity.metadata.positiveId) {
				obs.next(createNegativeEntityFulfilled(key, reverseEntity, entity, newEntityId, appId));
			}
			else {
				obs.next(createPositiveEntityFulfilled(key, entity, newEntityId, appId));
			}
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "CREATE_ENTITY"));
            obs.complete();
          }));
};

export const createBlisAction = (key: string, action: ActionBase, appId: string): Observable<ActionObject> => {
	let addActionRoute: string = makeRoute(key, `app/${appId}/action`);
	//remove property from the object that the route will not accept
	const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.post(addActionRoute, actionToSend, config).then(response => {
			let newActionId = response.data;
			obs.next(createActionFulfilled(action, newActionId));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "CREATE_ACTION"));
            obs.complete();
          }));
};

//=========================================================
// DELETE ROUTES
//=========================================================

export const deleteBlisApp = (key : string, blisAppId: string, blisApp: BlisAppForUpdate): Observable<ActionObject> => {
	let deleteAppRoute: string = makeRoute(key, `app/${blisAppId}`); //takes an app in the body
	const { appId, latestPackageId, metadata, trainingRequired, trainingStatus, trainingFailureMessage, ...appToSend } = blisApp
	let configWithBody = {...config, body: appToSend}
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.delete(deleteAppRoute, configWithBody)
		.then(response => {
            obs.next(deleteBLISApplicationFulfilled(blisAppId));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "DELETE_BLIS_APPLICATION"));
            obs.complete();
          }));
};
export const deleteBlisEntity = (key : string, appId: string, entity: EntityBase): Observable<ActionObject> => {
	let deleteEntityRoute: string = makeRoute(key, `app/${appId}/entity/${entity.entityId}`);
	const { version, packageCreationId, packageDeletionId, entityId, ...entityToSend } = entity;
	let configWithBody = {...config, body: entityToSend};
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.delete(deleteEntityRoute, configWithBody)
		.then(response => {
            obs.next(deleteEntityFulfilled(entity.entityId));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "DELETE_ENTITY"));
            obs.complete();
          }));
};
export const deleteBlisAction = (key : string, appId: string, action: ActionBase): Observable<ActionObject> => {
	let deleteActionRoute: string = makeRoute(key, `app/${appId}/action/${action.actionId}`); 
	const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action
	let configWithBody = {...config, body: actionToSend}
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.delete(deleteActionRoute, configWithBody)
		.then(response => {
            obs.next(deleteActionFulfilled(action.actionId));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "DELETE_ACTION"));
            obs.complete();
          }));
};

//=========================================================
// EDIT ROUTES
//=========================================================

export const editBlisApp = (key : string, blisAppId: string, blisApp: BlisAppForUpdate): Observable<ActionObject> => {
	let editAppRoute: string = makeRoute(key, `app/${blisAppId}`);
	const { appId, latestPackageId, metadata, trainingRequired, trainingStatus, trainingFailureMessage, ...appToSend } = blisApp
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.put(editAppRoute, appToSend, config)
		.then(response => {
            obs.next(editBLISApplicationFulfilled(blisApp));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "EDIT_BLIS_APPLICATION"));
            obs.complete();
          }));
};
export const editBlisAction = (key : string, appId: string, blisActionId: string, action: ActionBase): Observable<ActionObject> => {
	let editActionRoute: string = makeRoute(key, `app/${appId}/action/${blisActionId}`);
	const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.put(editActionRoute, actionToSend, config)
		.then(response => {
            obs.next(editActionFulfilled(action));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "EDIT_ACTION"));
            obs.complete();
          }));
};
export const editBlisEntity = (key: string, appId: string, entity: EntityBase): Observable<ActionObject> => {
 	let editActionRoute: string = makeRoute(key, `app/${appId}/entity/${entity.entityId}`);
 	const { version, packageCreationId, packageDeletionId, ...entityToSend } = entity;
	 return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.put(editActionRoute, entityToSend, config)
	  	.then(response => {
            obs.next(editEntityFulfilled(entity));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "EDIT_ENTITY"));
            obs.complete();
          }));
}
//========================================================
// SESSION ROUTES
//========================================================

/** START SESSION : Creates a new session and a corresponding logDialog */
export const createSession = (key : string, appId : string): Observable<AxiosResponse> => {
	let addAppRoute: string = makeRoute(key, `app/${appId}/session`);
	return Rx.Observable.fromPromise(axios.post(addAppRoute, config))
};

/** GET SESSION : Retrieves information about the specified session */
export const getSession = (key : string, appId: string, sessionId: string): Observable<AxiosResponse> => {
	let getAppRoute: string = makeRoute(key, `app/${appId}/session/${sessionId}`);
	return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};

/** END SESSION : End a session. */
export const deleteSession = (key : string, appId: string, sessionId: string): Observable<AxiosResponse> => {
	let deleteAppRoute: string = makeRoute(key, `app/${appId}/session/${sessionId}`); 
	return Rx.Observable.fromPromise(axios.delete(deleteAppRoute))
};

/** GET SESSIONS : Retrieves definitions of ALL open sessions */
export const getSessions = (key : string, appId: string): Observable<AxiosResponse> => {
	let getAppRoute: string = makeRoute(key, `app/${appId}/sessions`);
	return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};

/** GET SESSION IDS : Retrieves a list of session IDs */
export const getSessionIds = (key : string, appId: string): Observable<AxiosResponse> => {
	let getAppRoute: string = makeRoute(key, `app/${appId}/session`);
	return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};

//========================================================
// Teach
//========================================================

/** START TEACH SESSION: Creates a new teaching session and a corresponding trainDialog */
export const createTeach = (key : string, appId : string): Observable<AxiosResponse> => {
	let addAppRoute: string = makeRoute(key, `app/${appId}/teach`);
	return Rx.Observable.fromPromise(axios.post(addAppRoute, config))
};

/** GET TEACH: Retrieves information about the specified teach */
export const getTeach = (key : string, appId: string, teachId: string): Observable<AxiosResponse> => {
	let getAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}`);
	return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};

/** RUN EXTRACTOR: Runs entity extraction (prediction). 
 * If a more recent version of the package is available on 
 * the server, the session will first migrate to that newer version.  This 
 * doesn't affect the trainDialog maintained.
 */
export const putExtract = (key : string, appId: string, teachId: string, userInput: UserInput): Observable<AxiosResponse> => {
	let editAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/extractor`);
	return Rx.Observable.fromPromise(axios.put(editAppRoute, userInput, config))
};

/** EXTRACTION FEEDBACK: Uploads a labeled entity extraction instance
 * ie "commits" an entity extraction label, appending it to the teach session's
 * trainDialog, and advancing the dialog. This may yield produce a new package.
 */
export const postExtraction = (key : string, appId : string, teachId: string, trainExtractorStep : TrainExtractorStep): Observable<AxiosResponse> => {
	let addAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/extractor`);
	return Rx.Observable.fromPromise(axios.post(addAppRoute, trainExtractorStep, config))
};

/** RUN SCORER: Takes a turn and return distribution over actions.
 * If a more recent version of the package is 
 * available on the server, the session will first migrate to that newer version.  
 * This doesn't affect the trainDialog maintained by the teaching session.
 */
export const putScore = (key : string, appId: string, teachId: string, extractResponse: ExtractResponse): Observable<AxiosResponse> => {
	let editAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/scorer`);
	return Rx.Observable.fromPromise(axios.put(editAppRoute, extractResponse, config))
};

/** SCORE FEEDBACK: Uploads a labeled scorer step instance 
 * – ie "commits" a scorer label, appending it to the teach session's 
 * trainDialog, and advancing the dialog. This may yield produce a new package.
 */
export const postScore = (key : string, appId : string, teachId: string, trainScorerStep : TrainScorerStep): Observable<AxiosResponse> => {
	let addAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/scorer`);
	return Rx.Observable.fromPromise(axios.post(addAppRoute, trainScorerStep, config))
};

/** END TEACH: Ends a teach.   
 * For Teach sessions, does NOT delete the associated trainDialog.
 * To delete the associated trainDialog, call DELETE on the trainDialog.
 */
export const deleteTeach = (key : string, appId: string, teachId: string): Observable<AxiosResponse> => {
	let deleteAppRoute: string = `app/${appId}/teach/${teachId}`
	return Rx.Observable.fromPromise(axios.delete(rootUrl.concat(deleteAppRoute)))
};

/** GET TEACH SESSIONS: Retrieves definitions of ALL open teach sessions */
export const getTeaches = (key : string, appId: string): Observable<AxiosResponse> => {
	let getAppRoute: string = makeRoute(key, `app/${appId}/teaches`);
	return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};

/** GET TEACH SESSION IDS: Retrieves a list of teach session IDs */
export const getTeachIds = (key : string, appId: string): Observable<AxiosResponse> => {
	let getAppRoute: string = makeRoute(key, `app/${appId}/teach`);
	return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};
