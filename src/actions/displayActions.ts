/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { ErrorType } from '../types/const'
import { AppBase, Banner } from '@conversationlearner/models';
import { TipType } from '../components/ToolTips'
import * as ClientFactory from '../services/clientFactory'
import { Dispatch } from 'redux'
import { AxiosError } from 'axios';

const setCurrentApp = (key: string, app: AppBase): ActionObject => {
    return {
        type: AT.SET_CURRENT_APP_ASYNC,
        app
    }
}

const setCurrentAppFulfilled = (app: AppBase): ActionObject => {
    return {
        type: AT.SET_CURRENT_APP_FULFILLED,
        app
    }
}

export const setCurrentAppThunkAsync = (key: string, application: AppBase) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.SET_CURRENT_APP_ASYNC)
        try {
            dispatch(setCurrentApp(key, application))
            const newApp = await clClient.setApp(application)
            dispatch(setCurrentAppFulfilled(application))
            return newApp
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.SET_CURRENT_APP_ASYNC))
            throw error
        }
    }
}

export const setConversationId = (userName: string, userId: string, conversationId: string): ActionObject => {
    return {
        type: AT.SET_CONVERSATION_ID_ASYNC,
        userName,
        userId,
        conversationId
    }
}

export const setConversationIdThunkAsync = (userName: string, userId: string, conversationId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.SET_CONVERSATION_ID_ASYNC)
        try {
            dispatch(setConversationId(userName, userId, conversationId))
            await clClient.setConversationId(userName, userId, conversationId)
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.SET_CONVERSATION_ID_ASYNC))
            throw error
        }
    }
}

export const setTipType = (tipType: TipType): ActionObject => {
    return {
        type: AT.SET_TIP_TYPE,
        tipType: tipType
    }
}

export const setErrorDisplay = (errorType: ErrorType, title: string, messages: string[], actionType: AT | null): ActionObject => {
    return {
        type: AT.SET_ERROR_DISPLAY,
        errorType,
        title,
        messages,
        actionType
    }
}

export const clearBanner = (clearedBanner: Banner): ActionObject => {
    return {
        type: AT.CLEAR_BANNER,
        clearedBanner: clearedBanner
    }
}

export const clearErrorDisplay = (): ActionObject => {
    return {
        type: AT.CLEAR_ERROR_DISPLAY
    }
}

export const addMessageToTeachConversationStack = (message: string): ActionObject => {
    return {
        type: AT.TEACH_MESSAGE_RECEIVED,
        message: message
    }
}
