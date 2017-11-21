import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { ErrorType, DisplayMode } from '../types/const'
import { BlisAppBase } from 'blis-models';
import { TipType } from '../components/ToolTips'

export const setCurrentBLISApp = (key: string, app: BlisAppBase): ActionObject => {
    return {
        type: AT.SET_CURRENT_BLIS_APP_ASYNC,
        key,
        app
    }
}

export const setCurrentBLISAppFulfilled = (app: BlisAppBase): ActionObject => {
    return {
        type: AT.SET_CURRENT_BLIS_APP_FULFILLED,
        app
    }
}

export const setDisplayMode = (displayMode: DisplayMode): ActionObject => {
    return {
        type: AT.SET_DISPLAY_MODE,
        setDisplay: displayMode
    }
}

export const setTipType = (tipType: TipType): ActionObject => {
    return {
        type: AT.SET_TIP_TYPE,
        tipType: tipType
    }
}

export const setErrorDisplay = (errorType: ErrorType, error: string, message: string, route: AT): ActionObject => {
    return {
        type: AT.SET_ERROR_DISPLAY,
        errorType,
        error: error,
        message: message,
        route: route
    }
}

export const clearErrorDisplay = (): ActionObject => {
    return {
        type: AT.CLEAR_ERROR_DISPLAY
    }
}

export const logout = (): ActionObject => {
    return {
        type: AT.LOGOUT
    }
}

export const setUser = (name: string, password: string, id: string): ActionObject => {
    return {
        type: AT.SET_USER,
        name: name,
        password: password,
        id: id
    }
}

export const addMessageToTeachConversationStack = (message: string): ActionObject => {
    return {
        type: AT.TEACH_MESSAGE_RECEIVED,
        message: message
    }
}

export const addMessageToChatConversationStack = (message: {}): ActionObject => {
    return {
        type: AT.CHAT_MESSAGE_RECEIVED,
        message: message
    }
}