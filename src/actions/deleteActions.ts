import { ActionObject } from '../types'
import { BlisAppBase, EntityBase, ActionBase} from 'blis-models'

export const deleteBLISApplication = (GUID: string, blisApp: BlisAppBase): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_BLIS_APPLICATION',
        blisAppGUID: GUID,
        blisApp: blisApp
    }
}

export const deleteEntity = (GUID: string, entity: EntityBase, currentAppId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_ENTITY',
        entityGUID: GUID,
        entity: entity,
        currentAppId: currentAppId
    }
}

export const deleteAction = (GUID: string, action: ActionBase, currentAppId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_ACTION',
        actionGUID: GUID,
        action: action,
        currentAppId: currentAppId
    }
}

export const deleteTrainDialog = (GUID: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_TRAIN_DIALOG',
        trainDialogGUID: GUID
    }
}