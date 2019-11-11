/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as ClientFactory from '../services/clientFactory'
import * as CLM from '@conversationlearner/models'
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { Dispatch } from 'redux'
import { setErrorDisplay } from './displayActions'
import { AxiosError } from 'axios'
import { fetchAllLogDialogsThunkAsync, deleteLogDialogThunkAsync } from './logActions'

// --------------------------
// CreateChatSession
// --------------------------
const createChatSessionAsync = (): ActionObject =>
    ({
        type: AT.CREATE_CHAT_SESSION_ASYNC
    })

const createChatSessionFulfilled = (session: CLM.Session): ActionObject =>
    ({
        type: AT.CREATE_CHAT_SESSION_FULFILLED,
        session: session
    })

export const createChatSessionThunkAsync = (appId: string, packageId: string, saveToLog: boolean, initialFilledEntities: CLM.FilledEntity[] = []) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.CREATE_CHAT_SESSION_ASYNC)
        dispatch(createChatSessionAsync())

        try {
            const session = await clClient.chatSessionsCreate(appId, { saveToLog, packageId, initialFilledEntities })
            dispatch(createChatSessionFulfilled(session))
            return session
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.CREATE_CHAT_SESSION_ASYNC))
            throw error
        }
    }
}

// --------------------------
// DeleteChatSession
// --------------------------
const deleteChatSessionAsync = (session: CLM.Session, appId: string, packageId: string): ActionObject => {
    return {
        type: AT.DELETE_CHAT_SESSION_ASYNC,
        session: session,
        appId: appId,
        packageId: packageId
    }
}

const deleteChatSessionFulfilled = (sessionId: string): ActionObject => {
    return {
        type: AT.DELETE_CHAT_SESSION_FULFILLED,
        sessionId
    }
}

const editChatSessionExpireAsync = (appId: string, sessionId: string): ActionObject => {
    return {
        type: AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC,
        appId: appId,
        sessionId: sessionId
    }
}

export const deleteChatSessionThunkAsync = (session: CLM.Session, app: CLM.AppBase, packageId: string, deleteAssociatedLogDialog: boolean = false) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteChatSessionAsync(session, app.appId, packageId))
        const clClient = ClientFactory.getInstance(AT.DELETE_CHAT_SESSION_ASYNC)

        try {
            await clClient.chatSessionsDelete(app.appId);
            dispatch(deleteChatSessionFulfilled(session.sessionId));

            if (deleteAssociatedLogDialog) {
                void dispatch(deleteLogDialogThunkAsync(app, session.logDialogId, packageId))
            }
            else {
                void dispatch(fetchAllLogDialogsThunkAsync(app, packageId))
            }
            return true;
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.DELETE_CHAT_SESSION_ASYNC))
            return false;
        }
    }
}

export const editChatSessionExpireThunkAsync = (appId: string, sessionId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC)
        dispatch(editChatSessionExpireAsync(appId, sessionId))

        try {
            await clClient.chatSessionsExpire(appId)
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC))
            throw error
        }
    }
}