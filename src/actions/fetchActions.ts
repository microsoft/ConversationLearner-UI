import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase, BlisAppMetaData, BlisAppList, BotInfo,
        EntityBase, EntityMetaData, EntityList, 
        ActionBase, ActionMetaData, ActionList, ActionTypes, 
        TrainDialog, LogDialog,
        Session, Teach } from 'blis-models';

export const fetchAllTrainDialogsAsync = (key: string, blisAppID: string): ActionObject => {
    return {
        type: AT.FETCH_TRAIN_DIALOGS_ASYNC,
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllTrainDialogsFulfilled = (trainDialogs: TrainDialog[]): ActionObject => {
    return {
        type: AT.FETCH_TRAIN_DIALOGS_FULFILLED,
        allTrainDialogs: trainDialogs
    }
}

export const fetchAllLogDialogsAsync = (key: string, blisAppID: string): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOGS_ASYNC,
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllLogDialogsFulfilled = (logDialogs: LogDialog[]): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOGS_FULFILLED,
        allLogDialogs: logDialogs
    }
}

export const fetchBotInfoAsync = (): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_BOTINFO_ASYNC
    }
}

export const fetchBotInfoFulfilled = (botInfo: BotInfo): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_BOTINFO_FULFILLED,
        botInfo: botInfo
    }
}

export const fetchApplicationsAsync = (key: string, userId : string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_APPLICATIONS_ASYNC,
        key: key,
        userId : userId
    }
}

export const fetchApplicationsFulfilled = (apps: BlisAppBase[]): ActionObject => {
    return {
        type: AT.FETCH_APPLICATIONS_FULFILLED,
        allBlisApps: apps
    }
}

export const fetchAllEntitiesAsync = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_ENTITIES_ASYNC,
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllEntitiesFulfilled = (entities: EntityBase[]): ActionObject => {
    return {
        type: AT.FETCH_ENTITIES_FULFILLED,
        allEntities: entities
    }
}

export const fetchAllActionsAsync = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_ACTIONS_ASYNC,
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllActionsFulfilled = (actions: ActionBase[]): ActionObject => {
    return {
        type: AT.FETCH_ACTIONS_FULFILLED,
        allActions: actions
    }
}

export const fetchAllChatSessionsAsync = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_CHAT_SESSIONS_ASYNC,
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllChatSessionsFulfilled = (sessions: Session[]): ActionObject => {
    return {
        type: AT.FETCH_CHAT_SESSIONS_FULFILLED,
        allSessions: sessions
    }
}

export const fetchAllTeachSessionsAsync = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_TEACH_SESSIONS_ASYNC,
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllTeachSessionsFulfilled = (teachSessions: Teach[]): ActionObject => {
    return {
        type: AT.FETCH_TEACH_SESSIONS_FULFILLED,
        allTeachSessions: teachSessions
    }
}

