import { ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes, Session, Teach } from 'blis-models';

//=========================================================
//=========================================================

export const fetchApplications = (key: string, userId : string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: 'FETCH_APPLICATIONS',
        key: key,
        userId : userId
    }
}

export const fetchAllEntities = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: 'FETCH_ENTITIES',
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllActions = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: 'FETCH_ACTIONS',
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllTrainDialogs = (blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: 'FETCH_TRAIN_DIALOGS',
        allTrainDialogs: []
    }
}

export const fetchAllLogDialogs = (blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: 'FETCH_LOG_DIALOGS',
        allLogDialogs: []
    }
}


export const fetchAllChatSessions = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: 'FETCH_CHAT_SESSIONS',
        key: key,
        blisAppID: blisAppID
    }
}

//=========================================================
// FULFILLED FROM EPICS
//=========================================================

export const fetchApplicationsFulfilled = (apps: BlisAppBase[]): ActionObject => {
    return {
        type: 'FETCH_APPLICATIONS_FULFILLED',
        allBlisApps: apps
    }
}

export const fetchAllEntitiesFulfilled = (entities: EntityBase[]): ActionObject => {
    return {
        type: 'FETCH_ENTITIES_FULFILLED',
        allEntities: entities
    }
}

export const fetchAllActionsFulfilled = (actions: ActionBase[]): ActionObject => {
    return {
        type: 'FETCH_ACTIONS_FULFILLED',
        allActions: actions
    }
}

export const fetchAllChatSessionsFulfilled = (sessions: Session[]): ActionObject => {
    return {
        type: 'FETCH_CHAT_SESSIONS_FULFILLED',
        allSessions: sessions
    }
}

export const fetchAllTeachSessions = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: 'FETCH_TEACH_SESSIONS',
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllTeachSessionsFulfilled = (teachSessions: Teach[]): ActionObject => {
    return {
        type: 'FETCH_TEACH_SESSIONS_FULFILLED',
        allTeachSessions: teachSessions
    }
}

