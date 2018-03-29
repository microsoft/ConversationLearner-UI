import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase, EntityBase, ActionBase, TrainDialog, LogDialog, Teach, Session, TrainingStatusCode, TeachWithHistory, UITeachResponse, SessionCreateParams } from 'blis-models'
import { Dispatch } from 'redux'
import { setErrorDisplay } from './displayActions'
import * as ClientFactory from '../services/clientFactory'
import { deleteTrainDialogThunkAsync } from './deleteActions';  
import { fetchApplicationsAsync } from './fetchActions';

export const createBLISApplicationAsync = (userId: string, application: BlisAppBase): ActionObject => {
    return {
        type: AT.CREATE_BLIS_APPLICATION_ASYNC,
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

export const copyApplicationsAsync = (srcUserId: string, destUserId: string): ActionObject => {
    return {
        type: AT.COPY_APPLICATIONS_ASYNC,
        srcUserId: srcUserId,
        destUserId: destUserId
    }
}

export const copyApplicationsFulfilled = (): ActionObject => {
    return {
        type: AT.COPY_APPLICATIONS_FULFILLED
    }
}

export const copyApplicationsThunkAsync = (srcUserId: string, destUserId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.COPY_APPLICATIONS_ASYNC)
        try {
            dispatch(copyApplicationsAsync(srcUserId, destUserId))
            await blisClient.appsCopy(srcUserId, destUserId)
            dispatch(fetchApplicationsAsync(destUserId))
            dispatch(copyApplicationsFulfilled())
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.COPY_APPLICATIONS_ASYNC))
            throw error
        }
        return;
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
export const createPositiveEntityFulfilled = (positiveEntity: EntityBase, positiveEntityId: string, currentAppId: string): ActionObject => {
    let negativeEntity: EntityBase = { 
        ...positiveEntity, 
        entityName: `~${positiveEntity.entityName}`, 
        isMultivalue: positiveEntity.isMultivalue,
        isNegatible: true,
        positiveId: positiveEntityId,
        negativeId: null,
    } as EntityBase;
    return {
        type: AT.CREATE_ENTITY_FULFILLEDPOSITIVE,
        negativeEntity: negativeEntity,
        positiveEntity: positiveEntity,
        currentAppId: currentAppId
    }
}

export const createNegativeEntityFulfilled = (positiveEntity: EntityBase, negativeEntity: EntityBase, negativeEntityId: string, currentAppId: string): ActionObject => {
    let posEntity: EntityBase = positiveEntity;
    posEntity.negativeId = negativeEntityId;
    posEntity.entityId = negativeEntity.positiveId;
    negativeEntity.entityId = negativeEntityId;
    //send both to store to be saved locally, and send the positive entity back to the service to update its metadata
    return {
        type: AT.CREATE_ENTITY_FULFILLEDNEGATIVE,
        positiveEntity: posEntity,
        negativeEntity: negativeEntity,
        currentAppId: currentAppId
    }
}

export const createActionAsync = (action: ActionBase, currentAppId: string): ActionObject => {
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

// --------------------------
// createAppTag
// --------------------------
export const createAppTagAsync = (currentAppId: string, tagName: string, makeLive: boolean): ActionObject =>
    ({
        type: AT.CREATE_APP_TAG_ASYNC,
        tagName: tagName,
        makeLive: makeLive,
        currentAppId: currentAppId
    })

export const createAppTagFulfilled = (app: BlisAppBase): ActionObject => {
    return {
        type: AT.CREATE_APP_TAG_FULFILLED,
        blisApp: app
    }
}

export const createAppTagThunkAsync = (appId: string, tagName: string, makeLive: boolean) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_ASYNC)
        dispatch(createAppTagAsync(appId, tagName, makeLive))

        try {
            const updatedApp = await blisClient.appCreateTag(appId, tagName, makeLive)
            dispatch(createAppTagFulfilled(updatedApp))
            return updatedApp
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.CREATE_APP_TAG_ASYNC))
            throw error
        }
    }
}

// --------------------------
// createChatSession
// --------------------------
export const createChatSessionAsync = (): ActionObject =>
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

export const createChatSessionThunkAsync = (appId: string, packageId: string, saveToLog: boolean) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.CREATE_CHAT_SESSION_ASYNC)
        dispatch(createChatSessionAsync())
        const session = await blisClient.chatSessionsCreate(appId, { saveToLog, packageId })
        dispatch(createChatSessionFulfilled(session))
        return session
    }
}

// --------------------------
// createTeachSession
// --------------------------
export const createTeachSessionAsync = (): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_ASYNC
    })

export const createTeachSessionRejected = (): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_REJECTED
    })

export const createTeachSessionFulfilled = (uiTeachResponse: UITeachResponse): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_FULFILLED,
        teachSession: uiTeachResponse.teachResponse as Teach,
        memories: uiTeachResponse.memories
    })

export const createTeachSessionThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_ASYNC)
        dispatch(createTeachSessionAsync())

        try {
            const uiTeachResponse = await blisClient.teachSessionsCreate(appId)
            dispatch(createTeachSessionFulfilled(uiTeachResponse))
            return uiTeachResponse
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.CREATE_TEACH_SESSION_ASYNC))
            dispatch(createTeachSessionRejected())
            throw error
        }
    }
}

export const createTeachSessionFromHistoryThunkAsync = (appId: string, trainDialog: TrainDialog, userName: string, userId: string, deleteSourceId: string = null, lastExtractChanged: boolean = false) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC)
        dispatch(createTeachSessionFromHistoryAsync(appId, trainDialog, userName, userId))

        try {
            const teachWithHistory = await blisClient.teachSessionFromHistory(appId, trainDialog, userName, userId, lastExtractChanged);
            
            // Delete source trainDialog if requested and no discrepancies during replay
            if (deleteSourceId && teachWithHistory.replayErrors.length === 0) {
                dispatch(deleteTrainDialogThunkAsync(userId, appId, deleteSourceId));
            }
            dispatch(createTeachSessionFromHistoryFulfilled(teachWithHistory))
            return teachWithHistory
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC))
            dispatch(createTeachSessionRejected())
            throw error
        }
    }
}

export const createTeachSessionFromHistoryAsync = (blisAppID: string, trainDialog: TrainDialog, userName: string, userId: string): ActionObject => {
    return {
        type: AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC,
        blisAppID: blisAppID,
        userName: userName,
        userId: userId,
        trainDialog: trainDialog
    }
}

export const createTeachSessionFromHistoryFulfilled = (teachWithHistory: TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.CREATE_TEACH_SESSION_FROMHISTORYFULFILLED,
        teachWithHistory: teachWithHistory
    }
}

export const createTeachSessionFromUndoThunkAsync = (appId: string, teach: Teach, popRound: boolean, userName: string, userId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_FROMUNDOASYNC)
        dispatch(createTeachSessionFromUndoAsync(appId, teach, popRound, userName, userId))

        try {
            const teachWithHistory = await blisClient.teachSessionFromUndo(appId, teach, popRound, userName, userId)
            dispatch(createTeachSessionFromUndoFulfilled(teachWithHistory))
            return teachWithHistory
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.CREATE_TEACH_SESSION_FROMUNDOASYNC))
            dispatch(createTeachSessionRejected())
            throw error
        }
    }
}

export const createTeachSessionFromUndoAsync = (blisAppID: string, teach: Teach, popRound: boolean, userName: string, userId: string): ActionObject => {
    return {
        type: AT.CREATE_TEACH_SESSION_FROMUNDOASYNC,
        blisAppID: blisAppID,
        teach: teach,
        popRound: popRound,
        userName: userName,
        userId: userId
    }
}

export const createTeachSessionFromUndoFulfilled = (teachWithHistory: TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.CREATE_TEACH_SESSION_FROMUNDOFULFILLED,
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
export const createLogDialog = (logDialog: LogDialog): ActionObject => {
    return {
        type: AT.CREATE_LOG_DIALOG,
        logDialog: logDialog
    }
}