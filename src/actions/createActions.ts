import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase, EntityBase, ActionBase, TrainDialog, LogDialog, Teach, Session, TrainingStatusCode, TeachWithHistory } from 'blis-models'
import { Dispatch } from 'redux'
import * as ClientFactory from '../services/clientFactory'

export const createBLISApplicationAsync = (key: string, userId: string, application: BlisAppBase): ActionObject => {
    return {
        type: AT.CREATE_BLIS_APPLICATION_ASYNC,
        key: key,
        userId: userId,
        blisApp: application,
    }
}

export const createApplicationFulfilled = (blisApp: BlisAppBase): ActionObject => {
    return {
        type: AT.CREATE_BLIS_APPLICATION_FULFILLED,
        blisApp: blisApp
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
    let negativeEntity: EntityBase = { ...positiveEntity, entityName: `~${positiveEntity.entityName}`, metadata: { ...positiveEntity.metadata, positiveId: positiveEntityId } } as EntityBase;
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
        positiveEntity: posEntity,
        negativeEntity: negativeEntity,
        currentAppId: currentAppId
    }
}

export const createActionAsync = (key: string, action: ActionBase, currentAppId: string): ActionObject => {
    return {
        type: AT.CREATE_ACTION_ASYNC,
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

export const createChatSessionAsync = (key: string): ActionObject =>
    ({
        type: AT.CREATE_CHAT_SESSION_ASYNC
    })

export const createChatSessionRejected = (): ActionObject =>
    ({
        type: AT.CREATE_CHAT_SESSION_REJECTED
    })

export const createChatSessionFulfilled = (session: Session): ActionObject =>
    ({
        type: AT.CREATE_CHAT_SESSION_FULFILLED,
        session: session
    })

export const createChatSessionThunkAsync = (key: string, appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance()
        dispatch(createChatSessionAsync(key))
        const app = await blisClient.appGet(appId)
        if (app.trainingStatus !== TrainingStatusCode.Completed) {
            dispatch(createChatSessionRejected())
            throw new Error(`Application is still training. You may not create chat session at this time. Please try again later.`)
        }

        const session = await blisClient.chatSessionsCreate(appId)
        dispatch(createChatSessionFulfilled(session))

        return session
    }
}

export const createTeachSessionAsync = (): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_ASYNC
    })

export const createTeachSessionRejected = (): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_REJECTED
    })

export const createTeachSessionFulfilled = (teachSession: Teach): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_FULFILLED,
        teachSession
    })

export const createTeachSessionThunkAsync = (key: string, appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance()
        dispatch(createTeachSessionAsync())

        try {
            const session = await blisClient.teachSessionsCreate(appId)
            dispatch(createTeachSessionFulfilled(session))
            return session
        }
        catch (e) {
            dispatch(createTeachSessionRejected())
            throw e
        }
    }
}

export const createTeachSessionFromUndoThunkAsync = (appId: string, teach: Teach, userName: string, userId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance()
        dispatch(createTeachSessionFromUndoAsync(appId, teach, userName, userId))

        const teachWithHistory = await blisClient.teachSessionFromUndo(appId, teach, userName, userId)
        dispatch(createTeachSessionFromUndoFulfilled(teachWithHistory))
        return teachWithHistory
    }
    //LARS TODO fail catch
}

export const createTeachSessionFromUndoAsync = (blisAppID: string, teach: Teach, userName: string, userId: string): ActionObject => {
    return {
        type: AT.CREATE_TEACH_SESSION_FROM_UNDO_ASYNC,
        blisAppID: blisAppID,
        userName: userName,
        userId: userId,
        teach: teach
    }
}

export const createTeachSessionFromUndoFulfilled = (teachWithHistory: TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.CREATE_TEACH_SESSION_FROM_UNDO_FULFILLED,
        teachWithHistory: teachWithHistory
    }
}

export const createTeachSessionFromBranchThunkAsync = (appId: string, teachId: string, userName: string, userId: string, turnIndex: number) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance()
        dispatch(createTeachSessionFromBranchAsync(appId, teachId, userName, userId, turnIndex))

        const teachWithHistory = await blisClient.teachSessionFromBranch(appId, teachId, userName, userId, turnIndex)
        dispatch(createTeachSessionFromBranchFulfilled(teachWithHistory))
        return teachWithHistory
    }
    //LARS TODO fail catch
}

export const createTeachSessionFromBranchAsync = (blisAppID: string, teachId: string, userName: string, userId: string, turnIndex: number): ActionObject => {
    return {
        type: AT.CREATE_TEACH_SESSION_FROM_BRANCH_ASYNC,
        blisAppID: blisAppID,
        userName: userName,
        userId: userId,
        teachId: teachId,
        turnIndex: turnIndex
    }
}

export const createTeachSessionFromBranchFulfilled = (teachWithHistory: TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.CREATE_TEACH_SESSION_FROM_BRANCH_FULFILLED,
        teachWithHistory: teachWithHistory
    }
}

export const createTrainDialogAsync = (key: string, appId: string, trainDialog: TrainDialog, logDialogId: string): ActionObject =>
    ({
        type: AT.CREATE_TRAIN_DIALOG_ASYNC,
        key,
        appId,
        trainDialog,
        logDialogId
    })

export const createTrainDialogFulfilled = (trainDialog: TrainDialog): ActionObject =>
    ({
        type: AT.CREATE_TRAIN_DIALOG_FULFILLED,
        trainDialog
    })

// TODO: should be async with fulfillment
export const createLogDialog = (key: string, logDialog: LogDialog): ActionObject => {
    return {
        type: AT.CREATE_LOG_DIALOG,
        logDialog: logDialog
    }
}