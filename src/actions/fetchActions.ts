import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes, Session, Teach } from 'blis-models';

// TODO: These should have fullfillmen counterparts
export const fetchAllTrainDialogs = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_TRAIN_DIALOGS,
        key: key,
        allTrainDialogs: []
    }
}

// TODO: These should have fullfillmen counterparts
export const fetchAllLogDialogs = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_LOG_DIALOGS,
        key: key,
        allLogDialogs: []
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

