import { ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes, TrainDialog, LogDialog, Session, Teach } from 'blis-models';

export const createBLISApplication = (key : string, userId : string, application: BlisAppBase): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_BLIS_APPLICATION',
        key : key,
        userId: userId,
        blisApp: application,
    }
}

export const createApplicationFulfilled = (blisApp: BlisAppBase, appId: string): ActionObject => {
    return {
        type: 'CREATE_BLIS_APPLICATION_FULFILLED',
        blisApp: blisApp,
        blisAppId: appId
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

export const createEntityFulfilled = (entity: EntityBase, entityId: string): ActionObject => {
    return {
        type: 'CREATE_ENTITY_FULFILLED',
        entity: entity,
        entityId: entityId
    }
}

// After positive entity has been created, create the negative entity with a reference to the positiveId
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

export const createAction = (key: string, action: ActionBase, currentAppId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_ACTION',
        key: key,
        action: action,
        currentAppId: currentAppId
    }
}

export const createActionFulfilled = (action: ActionBase, actionId: string): ActionObject => {
    return {
        type: 'CREATE_ACTION_FULFILLED',
        action: action,
        actionId: actionId
    }
}

export const createChatSession = (key: string, session: Session, currentAppId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_CHAT_SESSION',
        key: key,
        session: session,
        currentAppId: currentAppId
    }
}

export const createChatSessionFulfilled = (session: Session, sessionId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_CHAT_SESSION_FULFILLED',
        session: session,
        sessionId: sessionId
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

export const createLogDialog = (key: string, logDialog: LogDialog): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_LOG_DIALOG',
        key: key,
        logDialog: logDialog
    }
}

export const createTeachSession = (key: string, teachSession: Teach, currentAppId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_TEACH_SESSION',
        key: key,
        teachSession: teachSession,
        currentAppId: currentAppId
    }
}

export const createTeachSessionFulfilled = (teachSession: Teach, teachSessionId: string): ActionObject => {
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'CREATE_TEACH_SESSION_FULFILLED',
        teachSession: teachSession,
        teachSessionId: teachSessionId
    }
}