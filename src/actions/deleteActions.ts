import { ActionObject } from '../types'
import { BlisAppBase, EntityBase, ActionBase} from 'blis-models'

export const deleteBLISApplication = (key: string, GUID: string, blisApp: BlisAppBase): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_BLIS_APPLICATION',
        key: key,
        blisAppGUID: GUID,
        blisApp: blisApp
    }
}

export const deleteEntity = (key: string, GUID: string, entity: EntityBase, currentAppId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_ENTITY',
        key: key,
        entityGUID: GUID,
        entity: entity,
        currentAppId: currentAppId
    }
}

export const deleteAction = (key: string, GUID: string, action: ActionBase, currentAppId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_ACTION',
        key: key,
        actionGUID: GUID,
        action: action,
        currentAppId: currentAppId
    }
}

export const deleteTrainDialog = (key: string, GUID: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_TRAIN_DIALOG',
        key: key,
        trainDialogGUID: GUID
    }
}