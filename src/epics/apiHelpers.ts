import 'rxjs'
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { 
	BlisAppBase, BlisAppMetaData, BlisAppList, 
	EntityBase, EntityMetaData, EntityList, 
	ActionBase, ActionMetaData, ActionList, ActionTypes,
	UserInput,
	TrainExtractorStep, ExtractResponse, TrainScorerStep,
	Session, Teach
} from 'blis-models'
import * as Rx from 'rxjs';
import { Observable, Observer } from 'rxjs'
import { fetchApplicationsFulfilled, fetchAllEntitiesFulfilled, fetchAllActionsFulfilled, fetchAllChatSessionsFulfilled, fetchAllTeachSessionsFulfilled } from '../actions/fetchActions'
import { createApplicationFulfilled, createEntityFulfilled, createPositiveEntityFulfilled, createNegativeEntityFulfilled, createActionFulfilled, createChatSessionFulfilled, createTeachSessionFulfilled } from '../actions/createActions'
import { deleteBLISApplicationFulfilled, deleteReverseEntity, deleteEntityFulfilled, deleteActionFulfilled, deleteChatSessionFulfilled, deleteTeachSessionFulfilled } from '../actions/deleteActions'
import { editBLISApplicationFulfilled, editEntityFulfilled, editActionFulfilled, setCurrentBLISAppFulfilled } from '../actions/updateActions'
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
// STATE ROUTES
//=========================================================

	/* Tell SDK what the currently selected AppId is */
	export const setBlisApp = (key : string, blisApp: BlisAppBase): Observable<ActionObject> => {
		let setBlisAppRoute: string = makeRoute(key, `state/app/${blisApp.appId}`);
		return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.put(setBlisAppRoute, null, config)
			.then(response => {
							obs.next(setCurrentBLISAppFulfilled(blisApp));
							obs.complete();
						})
						.catch(err => {
							obs.next(setErrorDisplay(err.message, "", "SET_BLIS_APPLICATION"));  
							obs.complete();
						}));
	};

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

export const getAllEntitiesForBlisApp = (key : string, appId: string): Observable<ActionObject> => {
	let getEntitiesForAppRoute: string = makeRoute(key, `app/${appId}/entities`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.get(getEntitiesForAppRoute, config)
		.then(response => {
            obs.next(fetchAllEntitiesFulfilled(response.data.entities));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "FETCH_ENTITIES"));
            obs.complete();
          }));
};

export const getAllActionsForBlisApp = (key : string, appId: string): Observable<ActionObject> => {
	let getActionsForAppRoute: string = makeRoute(key, `app/${appId}/actions`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.get(getActionsForAppRoute, config)
		.then(response => {
            obs.next(fetchAllActionsFulfilled(response.data.actions));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "FETCH_ACTIONS"));
            obs.complete();
          }));
};

// Not currently used
export const getBlisApp = (key : string, appId: string): Observable<AxiosResponse> => {
	let getAppRoute: string = makeRoute(key, `app/${appId}`);
	return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};
// Not currently used
export const getBlisEntity = (key : string, appId: string, entityId: string): Observable<AxiosResponse> => {
	let getEntityRoute: string = makeRoute(key, `app/${appId}/entity/${entityId}`);
	return Rx.Observable.fromPromise(axios.get(getEntityRoute, config))
};
// Not currently used
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
export const deleteBlisEntity = (key : string, appId: string, deleteEntityId: string, reverseEntityId: string): Observable<ActionObject> => {
	let deleteEntityRoute: string = makeRoute(key, `app/${appId}/entity/${deleteEntityId}`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.delete(deleteEntityRoute)
		.then(response => {
					if (reverseEntityId) {
							obs.next(deleteReverseEntity(key, deleteEntityId, reverseEntityId, appId));
						}
						else {
							obs.next(deleteEntityFulfilled(key, deleteEntityId, appId));
						}
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
	const { appId, latestPackageId, trainingRequired, trainingStatus, trainingFailureMessage, ...appToSend } = blisApp
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
export const createChatSession = (key: string, session: Session, appId: string): Observable<ActionObject> => {
	let addSessionRoute: string = makeRoute(key, `app/${appId}/session`);
	let configWithBody = {...config, body: session}
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.post(addSessionRoute, config).then(response => {
			let newSessionId = response.data.sessionId;
			obs.next(createChatSessionFulfilled(session, newSessionId));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "CREATE_CHAT_SESSION"));
            obs.complete();
          }));
};

export const deleteChatSession = (key : string, appId: string, session: Session): Observable<ActionObject> => {
	let deleteAppRoute: string = makeRoute(key, `app/${appId}/session/${session.sessionId}`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.delete(deleteAppRoute, config)
		.then(response => {
            obs.next(deleteChatSessionFulfilled(session.sessionId));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "DELETE_CHAT_SESSION"));
            obs.complete();
          }));
};

export const getAllSessionsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
	let getSessionsForAppRoute: string = makeRoute(key, `app/${appId}/sessions`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.get(getSessionsForAppRoute, config)
		.then(response => {
            obs.next(fetchAllChatSessionsFulfilled(response.data.sessions));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "FETCH_CHAT_SESSIONS"));
            obs.complete();
          }));
};

/** GET SESSION : Retrieves information about the specified session */
export const getSession = (key : string, appId: string, sessionId: string): Observable<AxiosResponse> => {
	let getAppRoute: string = makeRoute(key, `app/${appId}/session/${sessionId}`);
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

/** START SESSION : Creates a new session and a corresponding logDialog */
export const createTeachSession = (key: string, teachSession: Teach, appId: string): Observable<ActionObject> => {
	let addTeachRoute: string = makeRoute(key, `app/${appId}/teach`);
	let configWithBody = {...config, body: teachSession}
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.post(addTeachRoute, config).then(response => {
			let newTeachSessionId = response.data.teachId;
			obs.next(createTeachSessionFulfilled(teachSession, newTeachSessionId));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "CREATE_TEACH_SESSION"));
            obs.complete();
          }));
};

export const deleteTeachSession = (key : string, appId: string, teachSession: Teach): Observable<ActionObject> => {
	let deleteTeachSessionRoute: string = makeRoute(key, `app/${appId}/teach/${teachSession.teachId}`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.delete(deleteTeachSessionRoute, config)
		.then(response => {
            obs.next(deleteTeachSessionFulfilled(teachSession.teachId));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "DELETE_TEACH_SESSION"));
            obs.complete();
          }));
};

export const getAllTeachSessionsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
	let getTeachSessionsForAppRoute: string = makeRoute(key, `app/${appId}/teaches`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.get(getTeachSessionsForAppRoute, config)
		.then(response => {
            obs.next(fetchAllTeachSessionsFulfilled(response.data.teaches));
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "FETCH_TEACH_SESSIONS"));
            obs.complete();
          }));
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
export const putExtract = (key : string, appId: string, teachId: string, userInput: UserInput): Observable<ActionObject> => {
	let editAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/extractor`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.put(editAppRoute, userInput, config)		
		.then(response => {
            obs.next(fetchAllTeachSessionsFulfilled(response.data.teaches));  //TODO
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "RUN_EXTRACTOR"));
            obs.complete();
          }));
};

/** EXTRACTION FEEDBACK: Uploads a labeled entity extraction instance
 * ie "commits" an entity extraction label, appending it to the teach session's
 * trainDialog, and advancing the dialog. This may yield produce a new package.
 */
export const postExtraction = (key : string, appId : string, teachId: string, trainExtractorStep : TrainExtractorStep): Observable<ActionObject> => {
	let addAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/extractor`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.post(addAppRoute, trainExtractorStep, config)		
		.then(response => {
            obs.next(fetchAllTeachSessionsFulfilled(response.data.teaches)); // TODO
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "POST_EXTACT_FEEDBACK"));
            obs.complete();
					}));
};

/** RUN SCORER: Takes a turn and return distribution over actions.
 * If a more recent version of the package is 
 * available on the server, the session will first migrate to that newer version.  
 * This doesn't affect the trainDialog maintained by the teaching session.
 */
export const putScore = (key : string, appId: string, teachId: string, extractResponse: ExtractResponse): Observable<ActionObject> => {
	let editAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/scorer`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.put(editAppRoute, extractResponse, config)	
	 		.then(response => {
            obs.next(fetchAllTeachSessionsFulfilled(response.data.teaches)); // TODO
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "RUN_SCORER"));
            obs.complete();
					}));
};

/** SCORE FEEDBACK: Uploads a labeled scorer step instance 
 * – ie "commits" a scorer label, appending it to the teach session's 
 * trainDialog, and advancing the dialog. This may yield produce a new package.
 */
export const postScore = (key : string, appId : string, teachId: string, trainScorerStep : TrainScorerStep): Observable<ActionObject> => {
	let addAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/scorer`);
	return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.post(addAppRoute, trainScorerStep, config)		
			.then(response => {
            obs.next(fetchAllTeachSessionsFulfilled(response.data.teaches)); // TODO
            obs.complete();
          })
          .catch(err => {
            obs.next(setErrorDisplay(err.message, "", "POST_SCORE_FEEDBACK"));
            obs.complete();
          }));
};

/** END TEACH: Ends a teach.   
 * For Teach sessions, does NOT delete the associated trainDialog.
 * To delete the associated trainDialog, call DELETE on the trainDialog.
 */


/** GET TEACH SESSION IDS: Retrieves a list of teach session IDs */
export const getTeachIds = (key : string, appId: string): Observable<AxiosResponse> => {
	let getAppRoute: string = makeRoute(key, `app/${appId}/teach`);
	return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};
