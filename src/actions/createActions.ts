import { ActionObject, TrainDialog } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';

export const createBLISApplication = (key : string, userId : string, application: BlisAppBase): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_BLIS_APPLICATION',
        key : key,
        userId: userId,
        blisApp: application,
    }
}

export const createEntity = (key: string, entity: EntityBase, currentAppId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_ENTITY',
        key: key,
        entity: entity,
        currentAppId: currentAppId
    }
}

export const createReversibleEntity = (key: string, entity: EntityBase, currentAppId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_REVERSIBLE_ENTITY',
        key: key,
        entity: entity,
        currentAppId: currentAppId
    }
}

export const createAction = (key: string, action: ActionBase, currentAppId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_ACTION',
        key: key,
        action: action,
        currentAppId: currentAppId
    }
}

export const createTrainDialog = (key: string, trainDialog: TrainDialog): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_TRAIN_DIALOG',
        key: key,
        trainDialog: trainDialog
    }
}

export const createApplicationFulfilled = (appId: string): ActionObject => {
    return {
        type: 'CREATE_BLIS_APPLICATION_FULFILLED',
        blisAppId: appId
    }
}

export const createPositiveEntityFulfilled = (key: string, positiveEntity: EntityBase, positiveEntityId: string, currentAppId: string): ActionObject => {
    let negativeEntity: EntityBase = {...positiveEntity, entityName: `~${positiveEntity.entityName}`, metadata: {...positiveEntity.metadata, positiveId: positiveEntityId}} as EntityBase;
    return {
        type: 'CREATE_POSITIVE_ENTITY_FULFILLED',
        key: key,
        negativeEntity: negativeEntity,
        positiveEntity: positiveEntity,
        currentAppId: currentAppId
    }
}

export const createNegativeEntityFulfilled = (key: string, positiveEntity: EntityBase, negativeEntity: EntityBase, negativeEntityId: string, currentAppId: string): ActionObject => {
    let posEntity: EntityBase = positiveEntity;
    posEntity.metadata.negativeId = negativeEntityId;
    posEntity.entityId = negativeEntity.metadata.positiveId;
    negativeEntity.entityId = negativeEntityId;
    //send both to store to be saved locally, and send the positive entity back to the service to update its metadata
    return {
        type: 'CREATE_NEGATIVE_ENTITY_FULFILLED',
        key: key,
        positiveEntity: posEntity,
        negativeEntity: negativeEntity,
        currentAppId: currentAppId
    }
}

