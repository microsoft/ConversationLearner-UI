
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { DisplayMode } from '../types/const'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes, TrainDialog, LogDialog, Session, Teach } from 'blis-models';


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

export const editBLISApplication = (key: string, application: BlisAppBase) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: AT.EDIT_BLIS_APPLICATION,
        key: key,
        blisApp: application
    }
}

export const editBLISApplicationFulfilled = (application: BlisAppBase) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: AT.EDIT_BLIS_APPLICATION_FULFILLED,
        blisApp: application
    }
}

export const editEntity = (key: string, entity: EntityBase) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: AT.EDIT_ENTITY,
        key: key,
        entity: entity
    }
}

export const editEntityFulfilled = (entity: EntityBase) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: AT.EDIT_ENTITY_FULFILLED,
        entity: entity
    }
}

export const editAction = (key: string, action: ActionBase, currentAppId: string) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: AT.EDIT_ACTION,
        key: key,
        blisAction: action,
        currentAppId: currentAppId
    }
}

export const editActionFulfilled = (action: ActionBase) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: AT.EDIT_ACTION_FULFILLED,
        blisAction: action,
    }
}

export const editTrainDialog = (key: string, trainDialog: TrainDialog) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: AT.EDIT_TRAIN_DIALOG,
        key: key,
        trainDialog: trainDialog
    }
}

export const editLogDialog = (key: string, logDialog: LogDialog) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: AT.EDIT_LOG_DIALOG,
        key: key,
        logDialog: logDialog
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

export const addMessageToTeachConversationStack = (message: {}): ActionObject => {
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