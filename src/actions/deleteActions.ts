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

export const deleteBLISApplicationFulfilled = (blisAppGUID: string): ActionObject => {
    return {
        type: 'DELETE_BLIS_APPLICATION_FULFILLED',
        blisAppGUID: blisAppGUID
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

export const deleteReverseEntity = (key: string, deletedEntityId: string, reverseEntityId: string, currentAppId: string): ActionObject => {
    return {
        type: 'DELETE_REVERSE_ENTITY',
        key: key,
        currentAppId: currentAppId,
        deletedEntityId: deletedEntityId,
        reverseEntityId: reverseEntityId
    }
}

export const deleteEntityFulfilled = (key: string, deletedEntityId: string, currentAppId: string): ActionObject => {
    return {
        type: 'DELETE_ENTITY_FULFILLED',
        key: key,
        currentAppId: currentAppId,
        deletedEntityId: deletedEntityId
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

export const deleteActionFulfilled = (actionGUID: string): ActionObject => {
    return {
        type: 'DELETE_ACTION_FULFILLED',
        actionGUID: actionGUID
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
export const deleteLogDialog = (key: string, GUID: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'DELETE_LOG_DIALOG',
        key: key,
        logDialogGUID: GUID
    }
}