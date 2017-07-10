import { ActionObject } from '../types'

export const deleteBLISApplication = (GUID: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_BLIS_APPLICATION',
        blisAppGUID: GUID
    }
}

export const deleteEntity = (GUID: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_ENTITY',
        entityGUID: GUID,
    }
}

export const deleteAction = (GUID: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_ACTION',
        actionGUID: GUID
    }
}

export const deleteTrainDialog = (GUID: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_TRAIN_DIALOG',
        trainDialogGUID: GUID
    }
}