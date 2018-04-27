/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import 'rxjs'
import axios from 'axios'
import {
  AppBase,
  UserInput,
  UIExtractResponse,
  UITrainScorerStep,
  ScoreInput,
  UIScoreInput,
  DialogType
} from 'conversationlearner-models'
import * as Rx from 'rxjs';
import { Observable, Observer } from 'rxjs'
import actions from '../actions'
import { ActionObject } from '../types'
import { ErrorType } from '../types/const'
import { AT } from '../types/ActionTypes'
import ApiConfig from '../epics/config'
import * as ClientFactory from '../services/clientFactory'

// =========================================================
// PARAMETER REQUIREMENTS
// =========================================================

export interface AppForUpdate extends AppBase {
  trainingRequired: boolean
  latestPackageId: number
}

// =========================================================
// STATE ROUTES
// =========================================================

/* Tell SDK what the currently selected AppId is */
export const setApp = (app: AppBase): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.SET_CURRENT_APP_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.setApp(app)
    .then(response => {
      obs.next(actions.display.setCurrentAppFulfilled(app));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.SET_CURRENT_APP_ASYNC)));
};

/* Tell SDK what conversationId webchat is using */
export const setConversationId = (userName: string, userId: string, conversationId: string): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.SET_CONVERSATION_ID_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.setConversationId(userName, userId, conversationId)
    .then(response => {
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.SET_CONVERSATION_ID_ASYNC)));
};

//=========================================================
// GET ROUTES
//=========================================================

export const getBotInfo = (): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_BOTINFO_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.getBotInfo()
    .then(botInfo => {
      obs.next(actions.fetch.fetchBotInfoFulfilled(botInfo));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_BOTINFO_ASYNC)));
};

export const getAllApps = (userId: string): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_APPLICATIONS_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.apps(userId)
    .then(uiAppList => {
      // Set datetime on each app
      uiAppList.appList.apps.forEach(app => app.datetime = new Date())
      obs.next(actions.fetch.fetchApplicationsFulfilled(uiAppList));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_APPLICATIONS_ASYNC)));
};

export const getAllEntitiesForApp = (appId: string): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_ENTITIES_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.entities(appId)
    .then(entities => {
      obs.next(actions.fetch.fetchAllEntitiesFulfilled(entities));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_ENTITIES_ASYNC)));
};

export const getSourceForApp = (appId: string, packageId: string): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_APPSOURCE_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.source(appId, packageId)
    .then(source => {
      obs.next(actions.fetch.fetchAppSourceFulfilled(source));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_APPSOURCE_ASYNC)));
};

export const getAllActionsForApp = (appId: string): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_ACTIONS_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.actions(appId)
    .then(botActions => {
      obs.next(actions.fetch.fetchAllActionsFulfilled(botActions));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_ACTIONS_ASYNC)));
};

export const getAllTrainDialogsForApp = (appId: string): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_TRAIN_DIALOGS_ASYNC);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.trainDialogs(appId)
    .then(trainDialogs => {
      obs.next(actions.fetch.fetchAllTrainDialogsFulfilled(trainDialogs));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_TRAIN_DIALOGS_ASYNC)));
};

export const getAllLogDialogsForApp = (appId: string, packageId: string): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_LOG_DIALOGS_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.logDialogs(appId, packageId)
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
  return axios.get(ApiConfig.CLLocaleEndpoint)
    .then(response => response.data)
}

export const createApp = (userId: string, app: AppBase): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.CREATE_APPLICATION_ASYNC)
  //remove the appId property from the object
  const { appId, ...appToSend } = app
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.appsCreate(userId, appToSend as AppBase)
    .then(app => {
      obs.next(actions.create.createApplicationFulfilled(app))
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.CREATE_APPLICATION_ASYNC)));
};

//=========================================================
// DELETE ROUTES
//=========================================================

export const deleteApp = (app: AppBase): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.DELETE_APPLICATION_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.appsDelete(app.appId)
    .then(response => {
      obs.next(actions.delete.deleteApplicationFulfilled(app.appId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.DELETE_APPLICATION_ASYNC)));
};

//=========================================================
// EDIT ROUTES
//=========================================================

export const editApp = (appId: string, app: AppBase): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.EDIT_APPLICATION_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.appsUpdate(appId, app)
    .then(updatedApp => {
      obs.next(actions.update.editApplicationFulfilled(updatedApp));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.EDIT_APPLICATION_ASYNC)));
}

// ========================================================
// SESSION ROUTES
// ========================================================

export const expireChatSession = (appId: string, sessionId: string): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC) 
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.chatSessionsExpire(appId, sessionId)
    .then(() => {
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC))); 
};

export const getAllSessionsForApp = (appId: string): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_CHAT_SESSIONS_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.chatSessions(appId)
    .then(sessions => {
      obs.next(actions.fetch.fetchAllChatSessionsFulfilled(sessions));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_CHAT_SESSIONS_ASYNC)));
};

// ========================================================
// Teach
// ========================================================

export const getAllTeachSessionsForApp = (appId: string): Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_TEACH_SESSIONS_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.teachSessions(appId)
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
  const clClient = ClientFactory.getInstance(AT.RUN_EXTRACTOR_ASYNC)
  let putExtractPromise: Promise<UIExtractResponse> = null

  switch (extractType) {
    case DialogType.TEACH:
      putExtractPromise = clClient.teachSessionsAddExtractStep(appId, sessionId, userInput)
      break;
    case DialogType.TRAINDIALOG:
      putExtractPromise = clClient.trainDialogsUpdateExtractStep(appId, sessionId, turnIndex, userInput)
      break;
    case DialogType.LOGDIALOG:
      putExtractPromise = clClient.logDialogsUpdateExtractStep(appId, sessionId, turnIndex, userInput)
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
  const clClient = ClientFactory.getInstance(AT.GET_SCORES_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.teachSessionRescore(appId, teachId, scoreInput)
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
  const clClient = ClientFactory.getInstance(AT.RUN_SCORER_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.teachSessionUpdateScorerStep(appId, teachId, uiScoreInput)
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
  const clClient = ClientFactory.getInstance(AT.POST_SCORE_FEEDBACK_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.teachSessionAddScorerStep(appId, teachId, uiTrainScorerStep)
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

let handleError = function (obs: Observer<ActionObject>, err: any, actionType: AT) {
  if (!obs.closed) {
    // Service call failure
    obs.next(actions.display.setErrorDisplay(ErrorType.Error, err.message, [toErrorString(err.response)], actionType));
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

