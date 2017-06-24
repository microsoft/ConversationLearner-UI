import { BLISApplication } from '../models/Application'
import { Entity } from '../models/Entity'
import { Action } from '../models/Action'
import { TrainDialog } from '../models/TrainDialog'
import { ActionObject } from '../types'
export const deleteBLISApplication = (GUID: string): ActionObject => {
    //will need to make a call to BLIS to delete this application for this user
    return {
        type: 'DELETE_BLIS_APPLICATION',
        blisAppGUID: GUID
    }
}
export const deleteEntity = (GUID: string): ActionObject => {
    //will need to make a call to BLIS to delete this entity for its application
    return {
        type: 'DELETE_ENTITY',
        entityGUID: GUID,
    }
}
export const deleteAction = (GUID: string): ActionObject => {
    //will need to make a call to BLIS to delete this action for its application
    return {
        type: 'DELETE_ACTION',
        actionGUID: GUID
    }
}
export const deleteTrainDialog = (GUID: string): ActionObject => {
    //currently any type because this creator hasnt been set up
    //will need to make a call to BLIS to delete this train dialog for its application
    return {
        type: 'DELETE_TRAIN_DIALOG',
        trainDialogGUID: GUID
    }
}