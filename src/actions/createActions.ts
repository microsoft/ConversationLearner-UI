import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes, TrainDialog, LogDialog, Session, Teach } from 'blis-models';

export const createBLISApplicationAsync = (key : string, userId : string, application: BlisAppBase): ActionObject => {
    
    return {
        type: AT.CREATE_BLIS_APPLICATION_ASYNC,
        key : key,
        userId: userId,
        blisApp: application,
    }
}

export const createApplicationFulfilled = (blisApp: BlisAppBase, appId: string): ActionObject => {
    return {
        type: AT.CREATE_BLIS_APPLICATION_FULFILLED,
        blisApp: blisApp,
        blisAppId: appId
    }
}

export const createEntityAsync = (key: string, entity: EntityBase, currentAppId: string): ActionObject => {
    
    return {
        type: AT.CREATE_ENTITY_ASYNC,
        key: key,
        entity: entity,
        currentAppId: currentAppId
    }
}

export const createEntityFulfilled = (entity: EntityBase, entityId: string): ActionObject => {
    return {
        type: AT.CREATE_ENTITY_FULFILLED,
        entity: entity,
        entityId: entityId
    }
}

// After positive entity has been created, create the negative entity with a reference to the positiveId
export const createPositiveEntityFulfilled = (key: string, positiveEntity: EntityBase, positiveEntityId: string, currentAppId: string): ActionObject => {
    let negativeEntity: EntityBase = {...positiveEntity, entityName: `~${positiveEntity.entityName}`, metadata: {...positiveEntity.metadata, positiveId: positiveEntityId}} as EntityBase;
    return { 
        type: AT.CREATE_ENTITY_FULFILLEDPOSITIVE,
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
        type: AT.CREATE_ENTITY_FULFILLEDNEGATIVE,
        key: key,
        positiveEntity: posEntity,
        negativeEntity: negativeEntity,
        currentAppId: currentAppId
    }
}

export const createActionAsync = (key: string, action: ActionBase, currentAppId: string): ActionObject => {
    return {
        type: AT.CREATE_ACTION_ASYNC,
        key: key,
        action: action,
        currentAppId: currentAppId
    }
}

export const createActionFulfilled = (action: ActionBase, actionId: string): ActionObject => {
    return {
        type: AT.CREATE_ACTION_FULFILLED,
        action: action,
        actionId: actionId
    }
}

export const createChatSessionAsync = (key: string, session: Session, currentAppId: string): ActionObject => {
    
    return {
        type: AT.CREATE_CHAT_SESSION_ASYNC,
        key: key,
        session: session,
        currentAppId: currentAppId
    }
}

export const createChatSessionFulfilled = (session: Session, sessionId: string): ActionObject => {
    
    return {
        type: AT.CREATE_CHAT_SESSION_FULFILLED,
        session: session,
        sessionId: sessionId
    }
}

export const createTeachSessionAsync = (key: string, teachSession: Teach, currentAppId: string): ActionObject => {
    
    return {
        type: AT.CREATE_TEACH_SESSION_ASYNC,
        key: key,
        teachSession: teachSession,
        currentAppId: currentAppId
    }
}

export const createTeachSessionFulfilled = (teachSession: Teach, teachSessionId: string): ActionObject => {
    
    return {
        type: AT.CREATE_TEACH_SESSION_FULFILLED,
        teachSession: teachSession,
        teachSessionId: teachSessionId
    }
}

// TODO: should be async with fulfillment
export const createTrainDialog = (key: string, trainDialog: TrainDialog): ActionObject => {
    
    return {
        type: AT.CREATE_TRAIN_DIALOG,
        key: key,
        trainDialog: trainDialog
    }
}

// TODO: should be async with fulfillment
export const createLogDialog = (key: string, logDialog: LogDialog): ActionObject => {
    
    return {
        type: AT.CREATE_LOG_DIALOG,
        key: key,
        logDialog: logDialog
    }
}