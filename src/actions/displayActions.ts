/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { ErrorType } from '../types/const'
import { AppBase, Banner } from '@conversationlearner/models';
import { TipType } from '../components/ToolTips'

export const setCurrentApp = (key: string, app: AppBase): ActionObject => {
    return {
        type: AT.SET_CURRENT_APP_ASYNC,
        key,
        app
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

export const setCurrentAppFulfilled = (app: AppBase): ActionObject => {
    return {
        type: AT.SET_CURRENT_APP_FULFILLED,
        app
    }
}

export const setTipType = (tipType: TipType): ActionObject => {
    return {
        type: AT.SET_TIP_TYPE,
        tipType: tipType
    }
}

export const setErrorDisplay = (errorType: ErrorType, title: string, messages: string[], actionType: AT): ActionObject => {
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
