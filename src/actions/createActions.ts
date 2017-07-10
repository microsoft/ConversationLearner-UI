import { TrainDialog } from '../models/TrainDialog'
import { ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';

export const createBLISApplication = (application: BlisAppBase): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_BLIS_APPLICATION',
        blisApp: application
    }
}

export const createEntity = (entity: EntityBase): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_ENTITY',
        entity: entity
    }
}

export const createAction = (action: ActionBase): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_ACTION',
        action: action
    }
}

export const createTrainDialog = (trainDialog: TrainDialog): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_TRAIN_DIALOG',
        trainDialog: trainDialog
    }
}