import 'rxjs'
import axios from 'axios'
import {
  BlisAppBase,
  EntityBase,
  ActionBase,
  UserInput,
  TrainDialog,
  UIExtractResponse,
  UITrainScorerStep,
  Session,
  Teach,
  ScoreInput,
  UIScoreInput,
  DialogType
} from 'blis-models'
import * as Rx from 'rxjs';
import { Observable, Observer } from 'rxjs'
import actions from '../actions'
import { ActionObject } from '../types'
import { ErrorType } from '../types/const'
import { AT } from '../types/ActionTypes'
import BlisClient from '../services/blisClient'
import ApiConfig from './config'

//=========================================================
// CONFIG
//=========================================================
const blisClient = new BlisClient(ApiConfig.BlisClientEnpoint, () => '')

//=========================================================
// PARAMETER REQUIREMENTS
//=========================================================

export interface BlisAppForUpdate extends BlisAppBase {
  trainingRequired: boolean
  latestPackageId: number
}

//=========================================================
// STATE ROUTES
//=========================================================

/* Tell SDK what the currently selected AppId is */
export const setBlisApp = (key: string, app: BlisAppBase): Observable<ActionObject> => {
  blisClient.key = key
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.setBlisApp(app)
    .then(response => {
      obs.next(actions.display.setCurrentBLISAppFulfilled(app));
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
    .then(apps => {
      // Set datetime on each app
      apps.forEach(app => app.datetime = new Date())
      obs.next(actions.fetch.fetchApplicationsFulfilled(apps));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_APPLICATIONS_ASYNC)));
};

export const getAllEntitiesForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.entities(appId)
    .then(entities => {
      obs.next(actions.fetch.fetchAllEntitiesFulfilled(entities));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_ENTITIES_ASYNC)));
};

export const getAllActionsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.actions(appId)
    .then(botActions => {
      obs.next(actions.fetch.fetchAllActionsFulfilled(botActions));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_ACTIONS_ASYNC)));
};

export const getAllTrainDialogsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.trainDialogs(appId)
    .then(trainDialogs => {
      obs.next(actions.fetch.fetchAllTrainDialogsFulfilled(trainDialogs));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_TRAIN_DIALOGS_ASYNC)));
};

export const getAllLogDialogsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.logDialogs(appId)
    .then(logDialogs => {
      obs.next(actions.fetch.fetchAllLogDialogsFulfilled(logDialogs));
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
  return axios.get(ApiConfig.BlisLocaleEndpoint)
    .then(response => response.data)
}

export const createBlisApp = (key: string, userId: string, app: BlisAppBase): Observable<ActionObject> => {
  //remove the appId property from the object
  const { appId, ...appToSend } = app
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.appsCreate(userId, appToSend as BlisAppBase)
    .then(app => {
      obs.next(actions.create.createApplicationFulfilled(app))
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.CREATE_BLIS_APPLICATION_ASYNC)));
};
export const createBlisEntity = (key: string, entity: EntityBase, appId: string, reverseEntity?: EntityBase): Observable<ActionObject> => {
  //remove property from the object that the route will not accept
  const { version, packageCreationId, packageDeletionId, entityId, ...entityToSend } = entity;
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.entitiesCreate(appId, entityToSend as EntityBase)
    .then(newEntity => {
      if (!entity.metadata.isReversable) {
        obs.next(actions.create.createEntityFulfilled(newEntity, newEntity.entityId));
      }
      else if (entity.metadata.positiveId) {
        obs.next(actions.create.createNegativeEntityFulfilled(key, reverseEntity, newEntity, newEntity.entityId, appId));
      }
      else {
        obs.next(actions.create.createPositiveEntityFulfilled(key, newEntity, newEntity.entityId, appId));
      }
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.CREATE_ENTITY_ASYNC)));
};

export const createBlisAction = (key: string, action: ActionBase, appId: string): Observable<ActionObject> => {
  //remove property from the object that the route will not accept
  const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action;
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.actionsCreate(appId, actionToSend as ActionBase)
    .then(action => {
      obs.next(actions.create.createActionFulfilled(action, action.actionId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.CREATE_ACTION_ASYNC)));
};

// Train
export const createTrainDialog = (key: string, appId: string, trainDialog: TrainDialog, logDialogId: string): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.trainDialogsCreate(appId, trainDialog)
    .then(trainDialog => {
      obs.next(actions.create.createTrainDialogFulfilled(trainDialog));
      obs.next(actions.delete.deleteLogDialogAsync(appId, logDialogId))
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.CREATE_TRAIN_DIALOG_ASYNC)));
};

//=========================================================
// DELETE ROUTES
//=========================================================

export const deleteBlisApp = (key: string, blisApp: BlisAppBase): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.appsDelete(blisApp.appId)
    .then(response => {
      obs.next(actions.delete.deleteBLISApplicationFulfilled(blisApp.appId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_BLIS_APPLICATION_ASYNC)));
};

export const deleteBlisEntity = (key: string, appId: string, deleteEntityId: string, reverseEntityId: string): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.entitiesDelete(appId, deleteEntityId)
    .then(() => {
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
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.actionsDelete(appId, action.actionId)
    .then(() => {
      obs.next(actions.delete.deleteActionFulfilled(action.actionId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_ACTION_ASYNC)));
};

export const deleteLogDialog = (appId: string, logDialogId: string): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.logDialogsDelete(appId, logDialogId)
    .then(() => {
      obs.next(actions.delete.deleteLogDialogFulfilled(logDialogId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_LOG_DIALOG_ASYNC)));
};

//=========================================================
// EDIT ROUTES
//=========================================================

export const editBlisApp = (key: string, blisAppId: string, blisApp: BlisAppBase): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.appsUpdate(blisAppId, blisApp)
    .then(updatedApp => {
      obs.next(actions.update.editBLISApplicationFulfilled(updatedApp));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.EDIT_BLIS_APPLICATION_ASYNC)));
}
export const editBlisAction = (key: string, appId: string, blisActionId: string, action: ActionBase): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.actionsUpdate(appId, action)
    .then(updateAction => {
      obs.next(actions.update.editActionFulfilled(updateAction));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.EDIT_ACTION_ASYNC)));
};
export const editBlisEntity = (key: string, appId: string, entity: EntityBase): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.entitiesUpdate(appId, entity)
    .then(updatedEntity => {
      obs.next(actions.update.editEntityFulfilled(updatedEntity));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.EDIT_ENTITY_ASYNC)));
}
export const editTrainDialog = (key: string, appId: string, trainDialog: TrainDialog): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.trainDialogsUpdate(appId, trainDialog)
    .then(response => {
      obs.next(actions.update.editTrainDialogFulfilled(trainDialog));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.EDIT_TRAIN_DIALOG_ASYNC)));
};

//========================================================
// SESSION ROUTES
//========================================================

export const deleteChatSession = (key: string, appId: string, session: Session): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.chatSessionsDelete(appId, session.sessionId)
    .then(() => {
      obs.next(actions.delete.deleteChatSessionFulfilled(session.sessionId));
      obs.next(actions.fetch.fetchAllLogDialogsAsync(key, appId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_CHAT_SESSION_ASYNC)));
};

export const getAllSessionsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.chatSessions(appId)
    .then(sessions => {
      obs.next(actions.fetch.fetchAllChatSessionsFulfilled(sessions));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_CHAT_SESSIONS_ASYNC)));
};

//========================================================
// Teach
//========================================================
export const deleteTeachSession = (key: string, appId: string, teachSession: Teach, save: boolean): Observable<ActionObject> => {
  blisClient.key = key
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.teachSessionsDelete(appId, teachSession, save)
    .then(() => {
      obs.next(actions.delete.deleteTeachSessionFulfilled(key, teachSession.teachId, appId));
      obs.next(actions.fetch.fetchAllTrainDialogsAsync(key, appId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_TEACH_SESSION_ASYNC)));
};

export const getAllTeachSessionsForBlisApp = (key: string, appId: string): Observable<ActionObject> => {
  blisClient.key = key
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.teachSessions(appId)
    .then(teachSessions => {
      obs.next(actions.fetch.fetchAllTeachSessionsFulfilled(teachSessions));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_TEACH_SESSIONS_ASYNC)));
};

/** RUN EXTRACTOR: Runs entity extraction (prediction). 
 * If a more recent version of the package is available on 
 * the server, the session will first migrate to that newer version.  This 
 * doesn't affect the trainDialog maintained.
 */
export const putExtract = (key: string, appId: string, extractType: DialogType, sessionId: string, turnIndex: number, userInput: UserInput): Observable<ActionObject> => {
  blisClient.key = key
  let putExtractPromise: Promise<UIExtractResponse> = null

  switch (extractType) {
    case DialogType.TEACH:
      putExtractPromise = blisClient.teachSessionsAddExtractStep(appId, sessionId, userInput)
      break;
    case DialogType.TRAINDIALOG:
      putExtractPromise = blisClient.trainDialogsUpdateExtractStep(appId, sessionId, turnIndex, userInput)
      break;
    case DialogType.LOGDIALOG:
      putExtractPromise = blisClient.logDialogsUpdateExtractStep(appId, sessionId, turnIndex, userInput)
      break;
  }

  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => putExtractPromise
    .then(uiExtractResponse => {
      obs.next(actions.teach.runExtractorFulfilled(key, appId, sessionId, uiExtractResponse));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.RUN_EXTRACTOR_ASYNC)));
};

export const getScore = (key: string, appId: string, teachId: string, scoreInput: ScoreInput): Observable<ActionObject> => {
  blisClient.key = key
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.teachSessionGetScorerStep(appId, teachId, scoreInput)
    .then(uiScoreResponse => {
      obs.next(actions.teach.getScoresFulfilled(key, appId, teachId, uiScoreResponse))
      obs.complete()
    })
    .catch(err => handleError(obs, err, AT.GET_SCORES_ASYNC)))
}

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
  blisClient.key = key
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.teachSessionUpdateScorerStep(appId, teachId, uiScoreInput)
    .then(uiScoreResponse => {
      obs.next(actions.teach.runScorerFulfilled(key, appId, teachId, uiScoreResponse));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.RUN_SCORER_ASYNC)));
};

/** SCORE FEEDBACK: Uploads a labeled scorer step instance 
 * – ie "commits" a scorer label, appending it to the teach session's 
 * trainDialog, and advancing the dialog. This may yield produce a new package.
 */
export const postScore = (key: string, appId: string, teachId: string, uiTrainScorerStep: UITrainScorerStep, waitForUser: boolean, uiScoreInput: UIScoreInput): Observable<ActionObject> => {
  blisClient.key = key
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => blisClient.teachSessionAddScorerStep(appId, teachId, uiTrainScorerStep)
    .then(uiTeachResponse => {
      if (!waitForUser) {
        // Don't re-send predicted entities on subsequent score call -todo on non train path
        uiScoreInput.extractResponse.predictedEntities = [];
        obs.next(actions.teach.postScorerFeedbackNoWaitFulfilled(key, appId, teachId, uiTeachResponse, uiScoreInput))
      }
      else {
        obs.next(actions.teach.postScorerFeedbackWaitFulfilled(key, appId, teachId, uiTeachResponse));
      }
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.POST_SCORE_FEEDBACK_ASYNC)));
};

/** END TEACH: Ends a teach.   
 * For Teach sessions, does NOT delete the associated trainDialog.
 * To delete the associated trainDialog, call DELETE on the trainDialog.
 */

let handleError = function (obs: Observer<ActionObject>, err: any, route: AT) {
  if (!obs.closed) {
    // Service call failure
    obs.next(actions.display.setErrorDisplay(ErrorType.Error, err.message, toErrorString(err.response), route));
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
    else if (typeof error.data === 'string') {
      return error.data;
    }
    else {
      return JSON.stringify(error.data);
    }
  }
  catch (e) {
    return "Unknown Error";
  }
}

