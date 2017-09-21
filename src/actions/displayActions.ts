
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { DisplayMode } from '../types/const'
import { BlisAppBase, TrainDialog, LogDialog, Session, Teach } from 'blis-models';


export const setCurrentBLISApp = (key: string, app: BlisAppBase) : ActionObject => { 
    return {
        type: AT.SET_CURRENT_BLIS_APP,
        key: key,
        currentBLISApp: app
    }
}

export const setCurrentBLISAppFulfilled = (app: BlisAppBase) : ActionObject => { 
    return {
        type: AT.SET_CURRENT_BLIS_APP_FULFILLED,
        currentBLISApp: app
    }
}

export const emptyStateProperties = () : ActionObject => { 
    return {
        type: AT.EMPTY_STATE_PROPERTIES
    }
}

export const setCurrentTrainDialog = (key: string, trainDialog: TrainDialog) : ActionObject => { 
    return {
        type: AT.SET_CURRENT_TRAIN_DIALOG,
        currentTrainDialog: trainDialog
    }
}

export const setTrainDialogView = (roundNumber: number, scoreNumber: number) : ActionObject => { 
    return {
        type: AT.SET_TRAIN_DIALOG_VIEW,
        roundNumber: roundNumber,
        scoreNumber: scoreNumber
    }
}

export const setCurrentLogDialog = (key: string, logDialog: LogDialog) : ActionObject => { 
    return {
        type: AT.SET_CURRENT_LOG_DIALOG,
        currentLogDialog: logDialog
    }
}

export const toggleTrainDialog = (forward: boolean) => {
    return {
        type: AT.TOGGLE_TRAIN_DIALOG,
        forward: forward
    }
}

export const toggleLogDialog = (forward: boolean) => {
    return {
        type: AT.TOGGLE_LOG_DIALOG,
        forward: forward
    }
}

export const setDisplayMode = (displayMode: DisplayMode) : ActionObject => { 
    return {
        type: AT.SET_DISPLAY_MODE,
        setDisplay: displayMode
    }
}

export const setLoginDisplay = (isShown: boolean) : ActionObject => { 
    return {
        type: AT.SET_LOGIN_DISPLAY,
        setLoginDisplay: isShown
    }
}

export const setErrorDisplay = (error: string, message: string, route : AT) : ActionObject => { 
    return {
        type: AT.SET_ERROR_DISPLAY,
        error: error,
        message: message,
        route: route
    }
}

export const clearErrorDisplay = () : ActionObject => { 
    return {
        type: AT.CLEAR_ERROR_DISPLAY
    }
}

export const logout = () : ActionObject => { 
    return {
        type: AT.LOGOUT
    }
}

export const setUser = (name: string, password: string, id: string) : ActionObject => { 
    return {
        type: AT.SET_USER,
        name: name,
        password: password,
        id: id
    }
}

export const setUserKey = (key: string) : ActionObject => { 
    return {
        type: AT.SET_USER_KEY,
        key: key
    }
}

export const setCurrentChatSession = (session: Session) : ActionObject => { 
    return {
        type: AT.SET_CURRENT_CHAT_SESSION,
        currentSession: session
    }
}

export const setCurrentTeachSession = (teachSession: Teach) : ActionObject => { 
    return {
        type: AT.SET_CURRENT_TEACH_SESSION,
        currentTeachSession: teachSession
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