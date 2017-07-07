import { ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';

//=========================================================
//=========================================================

export const fetchApplications = (): ActionObject => {
    //will need to make a call to BLIS to get all apps for this user
    let apps: BlisAppList;
    return {
        type: 'FETCH_APPLICATIONS',
        allBlisApps: apps
    }
}

export const fetchAllEntities = (blisAppID: string): ActionObject => {
    //will need to make a call to BLIS to get all entities for this app
    let entities: EntityList;
    return {
        type: 'FETCH_ENTITIES',
        allEntities: entities
    }
}

export const fetchAllActions = (blisAppID: string): ActionObject => {
    //will need to make a call to BLIS to get all actions for this app
    let actions: ActionList;
    return {
        type: 'FETCH_ACTIONS',
        allActions: actions
    }
}

export const fetchAllTrainDialogs = (blisAppID: string): ActionObject => {
    //will need to make a call to BLIS to get all train dialogs for this app
    return {
        type: 'FETCH_TRAIN_DIALOGS',
        allTrainDialogs: []
    }
}