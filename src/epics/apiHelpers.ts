/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import axios from 'axios'
import {
  AppBase
} from '@conversationlearner/models'
import * as Rx from 'rxjs';
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

/**
 * Tell SDK what the currently selected AppId is
 */
export const setApp = (app: AppBase): Rx.Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.SET_CURRENT_APP_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.setApp(app)
    .then(response => {
      obs.next(actions.display.setCurrentAppFulfilled(app));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.SET_CURRENT_APP_ASYNC)));
};

/**
 * Tell SDK what conversationId webchat is using
 */
export const setConversationId = (userName: string, userId: string, conversationId: string): Rx.Observable<ActionObject> => {
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

export const getBotInfo = (browserId: string): Rx.Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_BOTINFO_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.getBotInfo(browserId)
    .then(botInfo => {
      obs.next(actions.fetch.fetchBotInfoFulfilled(botInfo, browserId));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_BOTINFO_ASYNC)));
};

export const getAllApps = (userId: string): Rx.Observable<ActionObject> => {
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

export const getAllEntitiesForApp = (appId: string): Rx.Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_ENTITIES_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.entities(appId)
    .then(entities => {
      obs.next(actions.fetch.fetchAllEntitiesFulfilled(entities));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_ENTITIES_ASYNC)));
};

export const getAllActionsForApp = (appId: string): Rx.Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_ACTIONS_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.actions(appId)
    .then(botActions => {
      obs.next(actions.fetch.fetchAllActionsFulfilled(botActions));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_ACTIONS_ASYNC)));
};

export const getAllTrainDialogsForApp = (appId: string): Rx.Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_TRAIN_DIALOGS_ASYNC);
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.trainDialogs(appId)
    .then(trainDialogs => {
      obs.next(actions.fetch.fetchAllTrainDialogsFulfilled(trainDialogs));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_TRAIN_DIALOGS_ASYNC)));
};

export const getAllLogDialogsForApp = (appId: string, packageId: string): Rx.Observable<ActionObject> => {
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

//=========================================================
// DELETE ROUTES
//=========================================================

export const deleteApp = (app: AppBase): Rx.Observable<ActionObject> => {
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

export const editApp = (appId: string, app: AppBase): Rx.Observable<ActionObject> => {
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

export const expireChatSession = (appId: string, sessionId: string): Rx.Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC) 
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.chatSessionsExpire(appId, sessionId)
    .then(() => {
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC))); 
};

export const getAllSessionsForApp = (appId: string): Rx.Observable<ActionObject> => {
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

export const getAllTeachSessionsForApp = (appId: string): Rx.Observable<ActionObject> => {
  const clClient = ClientFactory.getInstance(AT.FETCH_TEACH_SESSIONS_ASYNC)
  return Rx.Observable.create((obs: Rx.Observer<ActionObject>) => clClient.teachSessions(appId)
    .then(teachSessions => {
      obs.next(actions.fetch.fetchAllTeachSessionsFulfilled(teachSessions));
      obs.complete();
    })
    .catch(err => handleError(obs, err, AT.FETCH_TEACH_SESSIONS_ASYNC)));
};

const handleError = (obs: Rx.Observer<ActionObject>, err: any, actionType: AT) => {
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

const toErrorString = (error: any): string => {
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
