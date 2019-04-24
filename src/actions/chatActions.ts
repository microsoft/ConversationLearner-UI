/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { Session, AppBase, FilledEntity } from '@conversationlearner/models'
import { Dispatch } from 'redux'
import { setErrorDisplay } from './displayActions'
import * as ClientFactory from '../services/clientFactory'
import { AxiosError } from 'axios'
import { fetchAllLogDialogsThunkAsync, deleteLogDialogThunkAsync } from './logActions'

// --------------------------
// CreateChatSession
// --------------------------
export const createChatSessionThunkAsync = (appId: string, packageId: string, saveToLog: boolean, initialFilledEntities: FilledEntity[] = []) => {
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

const createChatSessionAsync = (): ActionObject =>
    ({
        type: AT.CREATE_CHAT_SESSION_ASYNC
    })

const createChatSessionFulfilled = (session: Session): ActionObject =>
    ({
        type: AT.CREATE_CHAT_SESSION_FULFILLED,
        session: session
    })

// --------------------------
// DeleteChatSession
// --------------------------
export const deleteChatSessionThunkAsync = (session: Session, app: AppBase, packageId: string, deleteAssociatedLogDialog: boolean = false) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteChatSessionAsync(session, app.appId, packageId))
        const clClient = ClientFactory.getInstance(AT.DELETE_CHAT_SESSION_ASYNC)

        try {
            await clClient.chatSessionsDelete(app.appId);
            dispatch(deleteChatSessionFulfilled(session.sessionId));

            if (deleteAssociatedLogDialog) {
                dispatch(deleteLogDialogThunkAsync(app, session.logDialogId, packageId))
            }
            else {
                dispatch(fetchAllLogDialogsThunkAsync(app, packageId))
            }
            return true;
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.DELETE_CHAT_SESSION_ASYNC))
            return false;
        }
    }
}

const deleteChatSessionAsync = (session: Session, appId: string, packageId: string): ActionObject => {
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