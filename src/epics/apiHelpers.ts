import 'rxjs'
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import {
  BlisAppBase,
  EntityBase,
  ActionBase,
  UserInput,
  TrainDialog,
  TrainScorerStep,
  Session,
  Teach,
  UIScoreInput
} from 'blis-models'
import * as Rx from 'rxjs';
import { Observable, Observer } from 'rxjs'
import { fetchBotInfoFulfilled, fetchApplicationsFulfilled, fetchAllEntitiesFulfilled, fetchAllActionsFulfilled, fetchAllChatSessionsFulfilled, fetchAllTeachSessionsFulfilled, fetchAllTrainDialogsFulfilled, fetchAllLogDialogsFulfilled, fetchAllLogDialogsAsync } from '../actions/fetchActions'
import { createApplicationFulfilled, createEntityFulfilled, createPositiveEntityFulfilled, createNegativeEntityFulfilled, createActionFulfilled, createChatSessionFulfilled, createTeachSessionFulfilled } from '../actions/createActions'
import { deleteBLISApplicationFulfilled, deleteReverseEntityAsnyc, deleteEntityFulfilled, deleteActionFulfilled, deleteChatSessionFulfilled, deleteTeachSessionFulfilled, deleteLogDialogFulFilled, deleteTrainDialogFulfilled } from '../actions/deleteActions'
import { editBLISApplicationFulfilled, editEntityFulfilled, editActionFulfilled } from '../actions/updateActions'
import { runExtractorFulfilled, runScorerFulfilled, postScorerFeedbackWaitFulfilled, postScorerFeedbackNoWaitFulfilled } from '../actions/teachActions'
import { setErrorDisplay, setCurrentBLISAppFulfilled } from '../actions/displayActions'
import { fetchAllTrainDialogsAsync } from '../actions/fetchActions';
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'

//=========================================================
// CONFIG
//=========================================================

const config: AxiosRequestConfig = {
  headers: {
    "Content-Type": "application/json"
  }
}
const rootUrl: string = "http://localhost:5000/";

const makeRoute = (key: string, actionRoute: string, qstring?: string) => {
  let route = rootUrl.concat(actionRoute, `?key=${key}`);
  if (qstring) {
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
export const setBlisApp = (key: string, blisApp: BlisAppBase): Observable<ActionObject> => {
  let setBlisAppRoute: string = makeRoute(key, `state/app/${blisApp.appId}`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.put(setBlisAppRoute, null, config)
    .then(response => {
      obs.next(setCurrentBLISAppFulfilled(blisApp));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.SET_CURRENT_BLIS_APP)));
};

//=========================================================
// GET ROUTES
//=========================================================

export const getBotInfo = (key: string): Observable<ActionObject> => {
  const getBotRoute: string = makeRoute(key, `bot`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.get(getBotRoute, config)
    .then(response => {
      obs.next(fetchBotInfoFulfilled(response.data));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_BOTINFO_ASYNC)));
};

export const getAllBlisApps = (key: string, userId: string): Observable<ActionObject> => {
  const getAppsRoute: string = makeRoute(key, `apps`, `userId=${userId}`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.get(getAppsRoute, config)
    .then(response => {
      obs.next(fetchApplicationsFulfilled(response.data.apps));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_APPLICATIONS_ASYNC)));
};

export const getAllEntitiesForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  let getEntitiesForAppRoute: string = makeRoute(key, `app/${appId}/entities`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.get(getEntitiesForAppRoute, config)
    .then(response => {
      obs.next(fetchAllEntitiesFulfilled(response.data.entities));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_ENTITIES_ASYNC)));
};

export const getAllActionsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  let getActionsForAppRoute: string = makeRoute(key, `app/${appId}/actions`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.get(getActionsForAppRoute, config)
    .then(response => {
      obs.next(fetchAllActionsFulfilled(response.data.actions));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_ACTIONS_ASYNC)));
};

export const getAllTrainDialogsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  let getEntitiesForAppRoute: string = makeRoute(key, `app/${appId}/traindialogs`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.get(getEntitiesForAppRoute, config)
    .then(response => {
      obs.next(fetchAllTrainDialogsFulfilled(response.data.trainDialogs));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_TRAIN_DIALOGS_ASYNC)));
};

export const getAllLogDialogsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  let getActionsForAppRoute: string = makeRoute(key, `app/${appId}/logdialogs`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.get(getActionsForAppRoute, config)
    .then(response => {
      obs.next(fetchAllLogDialogsFulfilled(response.data.logDialogs));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_LOG_DIALOGS_ASYNC)));
};

// Not currently used
export const getBlisApp = (key: string, appId: string): Observable<AxiosResponse> => {
  let getAppRoute: string = makeRoute(key, `app/${appId}`);
  return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};
// Not currently used
export const getBlisEntity = (key: string, appId: string, entityId: string): Observable<AxiosResponse> => {
  let getEntityRoute: string = makeRoute(key, `app/${appId}/entity/${entityId}`);
  return Rx.Observable.fromPromise(axios.get(getEntityRoute, config))
};
// Not currently used
export const getBlisAction = (key: string, appId: string, actionId: string): Observable<AxiosResponse> => {
  let getActionRoute: string = makeRoute(key, `app/${appId}/action/${actionId}`);
  return Rx.Observable.fromPromise(axios.get(getActionRoute, config))
};

//=========================================================
// CREATE ROUTES
//=========================================================

export const createBlisApp = (key: string, userId: string, blisApp: BlisAppBase): Observable<ActionObject> => {
  let addAppRoute: string = makeRoute(key, `app`, `userId=${userId}`);
  //remove the appId property from the object
  const { appId, ...appToSend } = blisApp
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.post(addAppRoute, appToSend, config)
    .then(response => {
      obs.next(createApplicationFulfilled(blisApp, response.data));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.CREATE_BLIS_APPLICATION_ASYNC)));
};
export const createBlisEntity = (key: string, entity: EntityBase, appId: string, reverseEntity?: EntityBase): Observable<ActionObject> => {
  let addEntityRoute: string = makeRoute(key, `app/${appId}/entity`);
  //remove property from the object that the route will not accept
  const { version, packageCreationId, packageDeletionId, entityId, ...entityToSend } = entity;
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.post(addEntityRoute, entityToSend, config).then(response => {
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
    .catch(err => handleError(obs, err, AT.CREATE_ENTITY_ASYNC)));
};

export const createBlisAction = (key: string, action: ActionBase, appId: string): Observable<ActionObject> => {
  let addActionRoute: string = makeRoute(key, `app/${appId}/action`);
  //remove property from the object that the route will not accept
  const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action;
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.post(addActionRoute, actionToSend, config).then(response => {
    let newActionId = response.data;
    obs.next(createActionFulfilled(action, newActionId));
    obs.complete();
  })
    .catch(err => handleError(obs, err, AT.CREATE_ACTION_ASYNC)));
};

//=========================================================
// DELETE ROUTES
//=========================================================

export const deleteBlisApp = (key: string, blisAppId: string, blisApp: BlisAppForUpdate): Observable<ActionObject> => {
  let deleteAppRoute: string = makeRoute(key, `app/${blisAppId}`); //takes an app in the body
  const { appId, latestPackageId, metadata, trainingRequired, trainingStatus, trainingFailureMessage, ...appToSend } = blisApp
  let configWithBody = { ...config, body: appToSend }
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.delete(deleteAppRoute, configWithBody)
    .then(response => {
      obs.next(deleteBLISApplicationFulfilled(blisAppId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_BLIS_APPLICATION_ASYNC)));
};
export const deleteBlisEntity = (key: string, appId: string, deleteEntityId: string, reverseEntityId: string): Observable<ActionObject> => {
  let deleteEntityRoute: string = makeRoute(key, `app/${appId}/entity/${deleteEntityId}`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.delete(deleteEntityRoute)
    .then(response => {
      if (reverseEntityId) {
        obs.next(deleteReverseEntityAsnyc(key, deleteEntityId, reverseEntityId, appId));
      }
      else {
        obs.next(deleteEntityFulfilled(key, deleteEntityId, appId));
      }
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_ENTITY_ASYNC)));
};
export const deleteBlisAction = (key: string, appId: string, action: ActionBase): Observable<ActionObject> => {
  let deleteActionRoute: string = makeRoute(key, `app/${appId}/action/${action.actionId}`);
  const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action
  let configWithBody = { ...config, body: actionToSend }
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.delete(deleteActionRoute, configWithBody)
    .then(response => {
      obs.next(deleteActionFulfilled(action.actionId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_ACTION_ASYNC)));
};

export const deleteLogDialog = (appId: string, logDialogId: string): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.delete(`${rootUrl}app/${appId}/logdialog/${logDialogId}`, config)
    .then(response => {
      obs.next(deleteLogDialogFulFilled(logDialogId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_LOG_DIALOG_ASYNC)));
};

export const deleteTrainDialog = (key: string, appId: string, trainDialog: TrainDialog): Observable<ActionObject> => {
  let deleteActionRoute: string = makeRoute(key, `app/${appId}/traindialog/${trainDialog.trainDialogId}`);
  const { trainDialogId, version, packageCreationId, packageDeletionId, ...dialogToSend } = trainDialog
  let configWithBody = { ...config, body: dialogToSend }
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.delete(deleteActionRoute, configWithBody)
    .then(response => {
      obs.next(deleteTrainDialogFulfilled(key, trainDialog.trainDialogId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_TRAIN_DIALOG_ASYNC)));
};

//=========================================================
// EDIT ROUTES
//=========================================================

export const editBlisApp = (key: string, blisAppId: string, blisApp: BlisAppForUpdate): Observable<ActionObject> => {
  let editAppRoute: string = makeRoute(key, `app/${blisAppId}`);
  const { appId, latestPackageId, trainingRequired, trainingStatus, trainingFailureMessage, ...appToSend } = blisApp
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.put(editAppRoute, appToSend, config)
    .then(response => {
      obs.next(editBLISApplicationFulfilled(blisApp));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.EDIT_BLIS_APPLICATION_ASYNC)));
}
export const editBlisAction = (key: string, appId: string, blisActionId: string, action: ActionBase): Observable<ActionObject> => {
  let editActionRoute: string = makeRoute(key, `app/${appId}/action/${blisActionId}`);
  const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.put(editActionRoute, actionToSend, config)
    .then(response => {
      obs.next(editActionFulfilled(action));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.EDIT_ACTION_ASYNC)));
};
export const editBlisEntity = (key: string, appId: string, entity: EntityBase): Observable<ActionObject> => {
  let editActionRoute: string = makeRoute(key, `app/${appId}/entity/${entity.entityId}`);
  const { version, packageCreationId, packageDeletionId, ...entityToSend } = entity;
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.put(editActionRoute, entityToSend, config)
    .then(response => {
      obs.next(editEntityFulfilled(entity));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.EDIT_ENTITY_ASYNC)));
}
//========================================================
// SESSION ROUTES
//========================================================

/** START SESSION : Creates a new session and a corresponding logDialog */
export const createChatSession = (key: string, session: Session, appId: string): Observable<ActionObject> => {
  let addSessionRoute: string = makeRoute(key, `app/${appId}/session`);

  // TODO: It seems like this should be used instead of default config since it has the session object in the body, but yet the API works?
  // let configWithBody = {...config, body: session}
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.post(addSessionRoute, config).then(response => {
    let newSessionId = response.data.sessionId;
    obs.next(createChatSessionFulfilled(session, newSessionId));
    obs.complete();
  })
    .catch(err => handleError(obs, err, AT.CREATE_CHAT_SESSION_ASYNC)));
};

export const deleteChatSession = (key: string, appId: string, session: Session): Observable<ActionObject> => {
  let deleteAppRoute: string = makeRoute(key, `app/${appId}/session/${session.sessionId}`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.delete(deleteAppRoute, config)
    .then(response => {
      obs.next(deleteChatSessionFulfilled(session.sessionId));
      obs.next(fetchAllLogDialogsAsync(key, appId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_CHAT_SESSION_ASYNC)));
};

export const getAllSessionsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  let getSessionsForAppRoute: string = makeRoute(key, `app/${appId}/sessions`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.get(getSessionsForAppRoute, config)
    .then(response => {
      obs.next(fetchAllChatSessionsFulfilled(response.data.sessions));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_CHAT_SESSIONS_ASYNC)));
};

/** GET SESSION : Retrieves information about the specified session */
export const getSession = (key: string, appId: string, sessionId: string): Observable<AxiosResponse> => {
  let getAppRoute: string = makeRoute(key, `app/${appId}/session/${sessionId}`);
  return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};

/** GET SESSION IDS : Retrieves a list of session IDs */
export const getSessionIds = (key: string, appId: string): Observable<AxiosResponse> => {
  let getAppRoute: string = makeRoute(key, `app/${appId}/session`);
  return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};

//========================================================
// Teach
//========================================================

/** START SESSION : Creates a new session and a corresponding logDialog */
export const createTeachSession = (key: string, teachSession: Teach, appId: string): Observable<ActionObject> => {
  let addTeachRoute: string = makeRoute(key, `app/${appId}/teach`);

  // TODO: It seems like this should be used instead of default config since it has the session object in the body, but yet the API works?
  // let configWithBody = {...config, body: teachSession}
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.post(addTeachRoute, config).then(response => {
    let newTeachSessionId = response.data.teachId;
    obs.next(createTeachSessionFulfilled(teachSession, newTeachSessionId));
    obs.complete();
  })
    .catch(err => handleError(obs, err, AT.CREATE_TEACH_SESSION_ASYNC)));;
};

export const deleteTeachSession = (key: string, appId: string, teachSession: Teach, save: boolean): Observable<ActionObject> => {
  let deleteTeachSessionRoute: string = makeRoute(key, `app/${appId}/teach/${teachSession.teachId}`, `save=${save}`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.delete(deleteTeachSessionRoute, config)
    .then(response => {
      obs.next(deleteTeachSessionFulfilled(key, teachSession.teachId, appId));
      // TODO: Change to fetch single dialog by id
      // Maybe the delete teach session api could return the id of the corresponding train dialog this would be much more efficient than reloading everything
      obs.next(fetchAllTrainDialogsAsync(key, appId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_TEACH_SESSION_ASYNC)));
};

export const getAllTeachSessionsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  let getTeachSessionsForAppRoute: string = makeRoute(key, `app/${appId}/teaches`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.get(getTeachSessionsForAppRoute, config)
    .then(response => {
      obs.next(fetchAllTeachSessionsFulfilled(response.data.teaches));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_TEACH_SESSIONS_ASYNC)));
};

/** GET TEACH: Retrieves information about the specified teach */
export const getTeach = (key: string, appId: string, teachId: string): Observable<AxiosResponse> => {
  let getAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}`);
  return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};

/** RUN EXTRACTOR: Runs entity extraction (prediction). 
 * If a more recent version of the package is available on 
 * the server, the session will first migrate to that newer version.  This 
 * doesn't affect the trainDialog maintained.
 */
export const putExtract = (key: string, appId: string, teachId: string, userInput: UserInput): Observable<ActionObject> => {
  let editAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/extractor`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.put(editAppRoute, userInput, config)
    .then(response => {
      obs.next(runExtractorFulfilled(key, appId, teachId, response.data));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.RUN_EXTRACTOR_ASYNC)));
};

/** RUN SCORER: 
 * 1) Uploads a labeled entity extraction instance
 * ie "commits" an entity extraction label, appending it to the teach session's
 * trainDialog, and advancing the dialog. This may yield produce a new package.
 * 2) Takes a turn and return distribution over actions.
 * If a more recent version of the package is 
 * available on the server, the session will first migrate to that newer version.  
 * This doesn't affect the trainDialog maintained by the teaching session.
 */
export const putScore = (key: string, appId: string, teachId: string, uiScoreInput: UIScoreInput): Observable<ActionObject> => {
  let editAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/scorer`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.put(editAppRoute, uiScoreInput, config)
    .then(response => {
      obs.next(runScorerFulfilled(key, appId, teachId, response.data));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.RUN_SCORER_ASYNC)));
};

/** SCORE FEEDBACK: Uploads a labeled scorer step instance 
 * – ie "commits" a scorer label, appending it to the teach session's 
 * trainDialog, and advancing the dialog. This may yield produce a new package.
 */
export const postScore = (key: string, appId: string, teachId: string, trainScorerStep: TrainScorerStep, waitForUser: boolean, uiScoreInput: UIScoreInput): Observable<ActionObject> => {
  let addAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/scorer`);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.post(addAppRoute, trainScorerStep, config)
    .then(response => {
      if (!waitForUser) {
        obs.next(postScorerFeedbackNoWaitFulfilled(key, appId, teachId, response.data, uiScoreInput))
      }
      else {
        obs.next(postScorerFeedbackWaitFulfilled(key, appId, teachId, response.data));
      }
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.POST_SCORE_FEEDBACK_ASYNC)));
};

/** END TEACH: Ends a teach.   
 * For Teach sessions, does NOT delete the associated trainDialog.
 * To delete the associated trainDialog, call DELETE on the trainDialog.
 */


/** GET TEACH SESSION IDS: Retrieves a list of teach session IDs */
export const getTeachIds = (key: string, appId: string): Observable<AxiosResponse> => {
  let getAppRoute: string = makeRoute(key, `app/${appId}/teach`);
  return Rx.Observable.fromPromise(axios.get(getAppRoute, config))
};

let handleError = function (obs: Observer<ActionObject>, err: any, route: AT) {
  if (!obs.closed) {
    // Service call failure
    obs.next(setErrorDisplay(err.message, toErrorString(err.response), route));
    obs.complete();
  }
  else {
    // Means we've hit a code error not a service failure
    throw (err);
  }
}

let toErrorString = function (error: any): string {
  try {
    if (!error || !error.data) {
      return "";
    }
    else if (error.data.message) {
      return error.data.message;
    }
    else if (error.data.errorMessages) {
      return error.data.errorMessages.join();
    }
    return error.data.stringify();
  }
  catch (e) {
    return "Unknown Error";
  }
}

