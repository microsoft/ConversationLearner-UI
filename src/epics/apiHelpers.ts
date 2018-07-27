/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import axios, { AxiosError } from 'axios'
import * as Rx from 'rxjs'
import actions from '../actions'
import { ActionObject } from '../types'
import { ErrorType } from '../types/const'
import { AT } from '../types/ActionTypes'
import ApiConfig from '../epics/config'
import * as ClientFactory from '../services/clientFactory'

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

// ========================================================
// SESSION ROUTES
// ========================================================
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

const handleError = (obs: Rx.Observer<ActionObject>, e: any, actionType: AT) => {
  if (!obs.closed) {
    // Service call failure
    const error = e as AxiosError
    obs.next(actions.display.setErrorDisplay(ErrorType.Error, error.message, [toErrorString(error.response)], actionType));
    obs.complete();
  }
  else {
    // Means we've hit a code error not a service failure
    throw (e);
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
