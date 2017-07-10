import { TrainDialog } from '../models/TrainDialog'
import { ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';

export const createBLISApplication = (application: BlisAppBase): ActionObject => {
    //will need to make a call to BLIS to add this application for this user
    return {
        type: 'CREATE_BLIS_APPLICATION',
        blisApp: application
    }
}

export const createEntity = (entity: EntityBase): ActionObject => {
    //will need to make a call to BLIS to add this entity for its application
    return {
        type: 'CREATE_ENTITY',
        entity: entity
    }
}

export const createAction = (action: ActionBase): ActionObject => {
    //will need to make a call to BLIS to add this action for its application
    return {
        type: 'CREATE_ACTION',
        action: action
    }
}

export const createTrainDialog = (trainDialog: TrainDialog): ActionObject => {
    //currently any type because this creator hasnt been set up
    //will need to make a call to BLIS to add this train dialog for its application
    return {
        type: 'CREATE_TRAIN_DIALOG',
        trainDialog: trainDialog
    }
}