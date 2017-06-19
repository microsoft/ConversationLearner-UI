export const DELETE_BLIS_APPLICATION = 'DELETE_BLIS_APPLICATION';
export const DELETE_ENTITY = 'DELETE_ENTITY';
export const DELETE_ACTION = 'DELETE_ACTION';
export const DELETE_TRAIN_DIALOG = 'DELETE_TRAIN_DIALOG';
import { BLISApplication } from '../models/Application'
import { Entity } from '../models/Entity'
import { Action } from '../models/Action'
import { TrainDialog } from '../models/TrainDialog'
import { DeleteAction } from './ActionObject'
export const deleteBLISApplication = (GUID: string): DeleteAction => {
    //will need to make a call to BLIS to delete this application for this user
    return {
        type: DELETE_BLIS_APPLICATION,
        blisAppGUID: GUID
    }
}
export const deleteEntity = (GUID: string): DeleteAction => {
    //will need to make a call to BLIS to delete this entity for its application
    return {
        type: DELETE_ENTITY,
        entityGUID: GUID,
    }
}
export const deleteAction = (GUID: string): DeleteAction => {
    //will need to make a call to BLIS to delete this action for its application
    return {
        type: DELETE_ACTION,
        actionGUID: GUID
    }
}
export const deleteTrainDialog = (GUID: string): DeleteAction => {
    //currently any type because this creator hasnt been set up
    //will need to make a call to BLIS to delete this train dialog for its application
    return {
        type: DELETE_TRAIN_DIALOG,
        trainDialogGUID: GUID
    }
}