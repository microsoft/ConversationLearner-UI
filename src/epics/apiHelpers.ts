import 'rxjs'
import axios, { AxiosRequestConfig } from 'axios'
import {
  BlisAppBase,
  EntityBase,
  ActionBase,
  UserInput,
  TrainDialog,
  // UIExtractResponse,
  UITrainScorerStep,
  Session,
  Teach,
  UIScoreInput,
  DialogType
} from 'blis-models'
import * as Rx from 'rxjs';
import { Observable, Observer } from 'rxjs'
import actions from '../actions'
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import BlisClient from './blisClient'

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
const blisClient = new BlisClient("http://localhost:5000", () => '')

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
    let setBlisAppRoute: string = makeRoute(key, `state/app`);
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.put(setBlisAppRoute, blisApp, config)
      .then(response => {
        obs.next(actions.display.setCurrentBLISAppFulfilled(blisApp));
        obs.complete();
      })
      .catch(err => handleError(obs, err, AT.SET_CURRENT_BLIS_APP_ASYNC)));
  };

//=========================================================
// GET ROUTES
//=========================================================

  export const getBotInfo = (key: string): Observable<ActionObject> => {
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.getBotInfo()
      .then(botInfo => {
        obs.next(actions.fetch.fetchBotInfoFulfilled(botInfo));
        obs.complete();
      })
      .catch(err => handleError(obs, err, AT.FETCH_BOTINFO_ASYNC)));
  };

  export const getAllBlisApps = (key: string, userId: string): Observable<ActionObject> => {
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.apps(userId)
      .then(response => {
        obs.next(actions.fetch.fetchApplicationsFulfilled(response.data));
        obs.complete();
      })
      .catch(err => handleError(obs, err, AT.FETCH_APPLICATIONS_ASYNC)));
  };

  export const getAllEntitiesForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.entities(appId)
      .then(response => {
        obs.next(actions.fetch.fetchAllEntitiesFulfilled(response.data));
        obs.complete();
      })
      .catch(err => handleError(obs, err, AT.FETCH_ENTITIES_ASYNC)));
  };

  export const getAllActionsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.actions(appId)
      .then(response => {
        obs.next(actions.fetch.fetchAllActionsFulfilled(response.data));
        obs.complete();
      })
      .catch(err => handleError(obs, err, AT.FETCH_ACTIONS_ASYNC)));
  };

  export const getAllTrainDialogsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.trainDialogs(appId)
      .then(response => {
        obs.next(actions.fetch.fetchAllTrainDialogsFulfilled(response.data));
        obs.complete();
      })
      .catch(err => handleError(obs, err, AT.FETCH_TRAIN_DIALOGS_ASYNC)));
  };

  export const getAllLogDialogsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.logDialogs(appId)
      .then(response => {
        obs.next(actions.fetch.fetchAllLogDialogsFulfilled(response.data));
        obs.complete();
      })
      .catch(err => handleError(obs, err, AT.FETCH_LOG_DIALOGS_ASYNC)));
  };

//=========================================================
// CREATE ROUTES
//=========================================================
export interface CultureObject {
  cultureCode: string
  cultureName: string
}

export const getLuisApplicationCultures = (): Promise<CultureObject[]> => {
  return axios.get('http://blis-service.azurewebsites.net/api/v1/applicationcultures')
      .then(response => response.data)
}

  export const createBlisApp = (key: string, userId: string, blisApp: BlisAppBase): Observable<ActionObject> => {
    let addAppRoute: string = makeRoute(key, `app`, `userId=${userId}`);
    //remove the appId property from the object
    const { appId, ...appToSend } = blisApp
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.post(addAppRoute, appToSend, config)
      .then(response => {
        blisApp.appId = response.data
        obs.next(actions.create.createApplicationFulfilled(blisApp))
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
        obs.next(actions.create.createEntityFulfilled(entity, newEntityId));
      }
      else if (entity.metadata.positiveId) {
        obs.next(actions.create.createNegativeEntityFulfilled(key, reverseEntity, entity, newEntityId, appId));
      }
      else {
        obs.next(actions.create.createPositiveEntityFulfilled(key, entity, newEntityId, appId));
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
      obs.next(actions.create.createActionFulfilled(action, newActionId));
      obs.complete();
    })
      .catch(err => handleError(obs, err, AT.CREATE_ACTION_ASYNC)));
  };

  // Train
  export const createTrainDialog = (key: string, appId: string, trainDialog: TrainDialog, logDialogId: string): Observable<ActionObject> => {
    let createTrainDialogRoute: string = makeRoute(key, `app/${appId}/traindialog`);
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.post(createTrainDialogRoute, trainDialog, config).then(response => {
      trainDialog.trainDialogId = response.data.trainDialogId;
      obs.next(actions.create.createTrainDialogFulfilled(trainDialog));
      obs.next(actions.delete.deleteLogDialogAsync(appId, logDialogId))
      obs.complete();
    })
      .catch(err => handleError(obs, err, AT.CREATE_TRAIN_DIALOG_ASYNC)));
  };

//=========================================================
// DELETE ROUTES
//=========================================================

  export const deleteBlisApp = (key: string, blisApp: BlisAppForUpdate): Observable<ActionObject> => {
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.delete(makeRoute(key, `app/${blisApp.appId}`))
      .then(response => {
        obs.next(actions.delete.deleteBLISApplicationFulfilled(blisApp.appId));
        obs.complete();
      })
      .catch(err => handleError(obs, err, AT.DELETE_BLIS_APPLICATION_ASYNC)));
  };
  
  export const deleteBlisEntity = (key: string, appId: string, deleteEntityId: string, reverseEntityId: string): Observable<ActionObject> => {
    let deleteEntityRoute: string = makeRoute(key, `app/${appId}/entity/${deleteEntityId}`);
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.delete(deleteEntityRoute)
      .then(response => {
        if (reverseEntityId) {
          obs.next(actions.delete.deleteReverseEntityAsnyc(key, deleteEntityId, reverseEntityId, appId));
        }
        else {
          obs.next(actions.delete.deleteEntityFulfilled(key, deleteEntityId, appId));
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
        obs.next(actions.delete.deleteActionFulfilled(action.actionId));
        obs.complete();
      })
      .catch(err => handleError(obs, err, AT.DELETE_ACTION_ASYNC)));
  };

  export const deleteLogDialog = (appId: string, logDialogId: string): Observable<ActionObject> => {
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.delete(`${rootUrl}app/${appId}/logdialog/${logDialogId}`, config)
      .then(response => {
        obs.next(actions.delete.deleteLogDialogFulFilled(logDialogId));
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
        obs.next(actions.delete.deleteTrainDialogFulfilled(key, trainDialog.trainDialogId));
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
          obs.next(actions.update.editBLISApplicationFulfilled(blisApp));
          obs.complete();
        })
        .catch(err => handleError(obs, err, AT.EDIT_BLIS_APPLICATION_ASYNC)));
    }
    export const editBlisAction = (key: string, appId: string, blisActionId: string, action: ActionBase): Observable<ActionObject> => {
      let editActionRoute: string = makeRoute(key, `app/${appId}/action/${blisActionId}`);
      const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action
      return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.put(editActionRoute, actionToSend, config)
        .then(response => {
          obs.next(actions.update.editActionFulfilled(action));
          obs.complete();
        })
        .catch(err => handleError(obs, err, AT.EDIT_ACTION_ASYNC)));
    };
    export const editBlisEntity = (key: string, appId: string, entity: EntityBase): Observable<ActionObject> => {
      let editActionRoute: string = makeRoute(key, `app/${appId}/entity/${entity.entityId}`);
      const { version, packageCreationId, packageDeletionId, ...entityToSend } = entity;
      return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.put(editActionRoute, entityToSend, config)
        .then(response => {
          obs.next(actions.update.editEntityFulfilled(entity));
          obs.complete();
        })
        .catch(err => handleError(obs, err, AT.EDIT_ENTITY_ASYNC)));
    }
    export const editTrainDialog = (key: string, appId: string, trainDialog: TrainDialog): Observable<ActionObject> => {
      let editTrainDialogRoute: string = makeRoute(key, `app/${appId}/traindialog/${trainDialog.trainDialogId}`);
      const { trainDialogId, ...trainDialogToSend } = trainDialog;
      return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.put(editTrainDialogRoute, trainDialogToSend, config)
        .then(response => {
          obs.next(actions.update.editTrainDialogFulfilled(trainDialog));
          obs.complete();
        })
        .catch(err => handleError(obs, err, AT.EDIT_TRAIN_DIALOG_ASYNC)));
    };

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
      obs.next(actions.create.createChatSessionFulfilled(session, newSessionId));
      obs.complete();
    })
      .catch(err => handleError(obs, err, AT.CREATE_CHAT_SESSION_ASYNC)));
  };

  export const deleteChatSession = (key: string, appId: string, session: Session): Observable<ActionObject> => {
    let deleteAppRoute: string = makeRoute(key, `app/${appId}/session/${session.sessionId}`);
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.delete(deleteAppRoute, config)
      .then(response => {
        obs.next(actions.delete.deleteChatSessionFulfilled(session.sessionId));
        obs.next(actions.fetch.fetchAllLogDialogsAsync(key, appId));
        obs.complete();
      })
      .catch(err => handleError(obs, err, AT.DELETE_CHAT_SESSION_ASYNC)));
  };

  export const getAllSessionsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
    let getSessionsForAppRoute: string = makeRoute(key, `app/${appId}/sessions`);
    return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => axios.get(getSessionsForAppRoute, config)
      .then(response => {
        obs.next(actions.fetch.fetchAllChatSessionsFulfilled(response.data.sessions));
        obs.complete();
      })
      .catch(err => handleError(obs, err, AT.FETCH_CHAT_SESSIONS_ASYNC)));
  };

//========================================================
// Teach
//========================================================

  /** START SESSION : Creates a new session and a corresponding logDialog */
  export const createTeachSession = (key: string, teachSession: Teach, appId: string): Observable<ActionObject> => {
    let addTeachRoute: string = makeRoute(key, `app/${appId}/teach`);

    // TODO: It seems like this should be used instead of default config since it has the session object in the body, but yet the API works?
    // let configWithBody = {...config, body: teachSession}
    return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.post(addTeachRoute, config).then(response => {
        let newTeachSessionId = response.data.teachId;
        obs.next(actions.create.createTeachSessionFulfilled(teachSession, newTeachSessionId));
          obs.complete();
        })
        .catch(err => handleError(obs, err,  AT.CREATE_TEACH_SESSION_ASYNC)));
  };

  export const deleteTeachSession = (key : string, appId: string, teachSession: Teach, save: boolean): Observable<ActionObject> => {
    return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => {
      let deleteTeachSessionRoute: string = makeRoute(key, `app/${appId}/teach/${teachSession.teachId}`,`save=${save}`);
      axios.delete(deleteTeachSessionRoute, config)
        .then(response => {
          obs.next(actions.delete.deleteTeachSessionFulfilled(key, teachSession.teachId, appId));
          obs.next(actions.fetch.fetchAllTrainDialogsAsync(key, appId));
          obs.complete();
        })
        .catch(err => handleError(obs, err,  AT.DELETE_TEACH_SESSION_ASYNC))
      });
  };

  export const getAllTeachSessionsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
    let getTeachSessionsForAppRoute: string = makeRoute(key, `app/${appId}/teaches`);
    return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.get(getTeachSessionsForAppRoute, config)
      .then(response => {
        obs.next(actions.fetch.fetchAllTeachSessionsFulfilled(response.data.teaches));
        obs.complete();
      })
      .catch(err => handleError(obs, err,  AT.FETCH_TEACH_SESSIONS_ASYNC)));
  };

  /** RUN EXTRACTOR: Runs entity extraction (prediction). 
   * If a more recent version of the package is available on 
   * the server, the session will first migrate to that newer version.  This 
   * doesn't affect the trainDialog maintained.
   */
  export const putExtract = (key : string, appId: string, extractType: DialogType, sessionId: string, turnIndex: number, userInput: UserInput): Observable<ActionObject> => {
    let routeURI : string = null;
    switch (extractType) {
      case DialogType.TEACH:
        routeURI = `app/${appId}/teach/${sessionId}/extractor`;
        break;
      case DialogType.TRAINDIALOG:
        routeURI = `app/${appId}/traindialog/${sessionId}/extractor/${turnIndex}`;
        break;
      case DialogType.LOGDIALOG:
        routeURI = `app/${appId}/logdialog/${sessionId}/extractor/${turnIndex}`;
        break;
    }
    let editAppRoute: string = makeRoute(key, routeURI);
    return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.put(editAppRoute, userInput, config)		
      .then(response => {
        obs.next(actions.teach.runExtractorFulfilled(key, appId, sessionId, response.data));
        obs.complete();
      })
      .catch(err => handleError(obs, err,  AT.RUN_EXTRACTOR_ASYNC)));
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
  export const putScore = (key : string, appId: string, teachId: string, uiScoreInput: UIScoreInput): Observable<ActionObject> => {
    let editAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/scorer`);
    return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.put(editAppRoute, uiScoreInput, config)	
      .then(response => {
        obs.next(actions.teach.runScorerFulfilled(key, appId, teachId, response.data)); 
        obs.complete();
      })
      .catch(err => handleError(obs, err,  AT.RUN_SCORER_ASYNC)));
  };

  /** SCORE FEEDBACK: Uploads a labeled scorer step instance 
   * – ie "commits" a scorer label, appending it to the teach session's 
   * trainDialog, and advancing the dialog. This may yield produce a new package.
   */
  export const postScore = (key : string, appId : string, teachId: string, uiTrainScorerStep : UITrainScorerStep, waitForUser : boolean, uiScoreInput: UIScoreInput): Observable<ActionObject> => {
    let addAppRoute: string = makeRoute(key, `app/${appId}/teach/${teachId}/scorer`);
    return Rx.Observable.create((obs : Rx.Observer<ActionObject>) => axios.post(addAppRoute, uiTrainScorerStep, config)		
      .then(response => {
        if (!waitForUser) {
          // Don't re-send predicted entities on subsequent score call -todo on non train path
          uiScoreInput.extractResponse.predictedEntities = [];
          obs.next(actions.teach.postScorerFeedbackNoWaitFulfilled(key, appId, teachId, response.data, uiScoreInput))
        }
        else {
          obs.next(actions.teach.postScorerFeedbackWaitFulfilled(key, appId, teachId, response.data));
        }
        obs.complete();
      })
      .catch(err => handleError(obs, err,  AT.POST_SCORE_FEEDBACK_ASYNC)));
  };

  /** END TEACH: Ends a teach.   
   * For Teach sessions, does NOT delete the associated trainDialog.
   * To delete the associated trainDialog, call DELETE on the trainDialog.
   */

let handleError = function (obs: Observer<ActionObject>, err: any, route: AT) {
  if (!obs.closed) {
    // Service call failure
    obs.next(actions.display.setErrorDisplay(err.message, toErrorString(err.response), route));
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
    else if (typeof error.data == 'string') {
      return error.data;
    }
    else {
      return error.data.stringify();
    }
  }
  catch (e) {
    return "Unknown Error";
  }
}

