import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase, EntityBase, ActionBase, TrainDialog, LogDialog, Teach, Session, TrainingStatusCode, TeachWithHistory, UITeachResponse, SessionCreateParams } from 'blis-models'
import { Dispatch } from 'redux'
import { setErrorDisplay } from './displayActions'
import * as ClientFactory from '../services/clientFactory'
import { deleteTrainDialogThunkAsync } from './deleteActions';  
import { fetchApplicationsAsync, fetchApplicationTrainingStatusThunkAsync } from './fetchActions';

// --------------------------
// App
// --------------------------
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

// --------------------------
// CopyApps
// --------------------------
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

const copyApplicationsAsync = (srcUserId: string, destUserId: string): ActionObject => {
    return {
        type: AT.COPY_APPLICATIONS_ASYNC,
        srcUserId: srcUserId,
        destUserId: destUserId
    }
}

const copyApplicationsFulfilled = (): ActionObject => {
    return {
        type: AT.COPY_APPLICATIONS_FULFILLED
    }
}

// --------------------------
// Entity
// --------------------------
export const createEntityThunkAsync = (appId: string, entity: EntityBase) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(createEntityAsync(appId, entity))
        const blisClient = ClientFactory.getInstance(AT.CREATE_ENTITY_ASYNC)

        try {
            let posEntity = await blisClient.entitiesCreate(appId, entity);
            
            // If it's a negatable entity
            if (posEntity.isNegatible) {
                // Create negative entity with ref to positive entity
                let negEntity = {
                    ...entity, 
                    entityName: `~${entity.entityName}`,
                    positiveId: posEntity.entityId
                }
                // Remove pos entityId from negative entity
                delete negEntity.entityId;

                negEntity = await blisClient.entitiesCreate(appId, negEntity);
                dispatch(createEntityFulfilled(negEntity));

                // Update positive entity with ref to negative entity
                posEntity.negativeId = negEntity.entityId;
                posEntity = await blisClient.entitiesUpdate(appId, posEntity);
            }
            dispatch(createEntityFulfilled(posEntity));
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId));
            return true;
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.CREATE_ENTITY_ASYNC))
            return false;
        }
    }
}

const createEntityAsync = (appId: string, entity: EntityBase): ActionObject => {
    return {
        type: AT.CREATE_ENTITY_ASYNC,
        entity: entity,
        appId: appId
    }
}

const createEntityFulfilled = (entity: EntityBase): ActionObject => {
    return {
        type: AT.CREATE_ENTITY_FULFILLED,
        entity: entity
    }
}

// --------------------------
// Action
// --------------------------
export const createActionThunkAsync = (appId: string, action: ActionBase) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(createActionAsync(appId, action))
        const blisClient = ClientFactory.getInstance(AT.CREATE_ACTION_ASYNC)

        try {
            const newAction = await blisClient.actionsCreate(appId, action);
            dispatch(createActionFulfilled(newAction));
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId));
            return true;
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.CREATE_ACTION_ASYNC))
            return false;
        }
    }
}

const createActionAsync = (appId: string, action: ActionBase): ActionObject => {
    return {
        type: AT.CREATE_ACTION_ASYNC,
        action: action,
        appId: appId
    }
}

const createActionFulfilled = (action: ActionBase): ActionObject => {
    return {
        type: AT.CREATE_ACTION_FULFILLED,
        action: action
    }
}

// --------------------------
// AppTag
// --------------------------
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

const createAppTagAsync = (currentAppId: string, tagName: string, makeLive: boolean): ActionObject =>
    ({
        type: AT.CREATE_APP_TAG_ASYNC,
        tagName: tagName,
        makeLive: makeLive,
        appId: currentAppId
    })

const createAppTagFulfilled = (app: BlisAppBase): ActionObject => {
    return {
        type: AT.CREATE_APP_TAG_FULFILLED,
        blisApp: app
    }
}

// --------------------------
// ChatSession
// --------------------------
export const createChatSessionThunkAsync = (appId: string, packageId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.CREATE_CHAT_SESSION_ASYNC)
        dispatch(createChatSessionAsync())
        const app = await blisClient.appGet(appId)
        if (app.trainingStatus !== TrainingStatusCode.Completed) {
            dispatch(createChatSessionRejected())
            throw new Error(`Application is still training. You may not create chat session at this time. Please try again later.`)
        }

        const sessionCreateParams = {saveToLog: app.metadata.isLoggingOn !== false, packageId: packageId } as SessionCreateParams
        const session = await blisClient.chatSessionsCreate(appId, sessionCreateParams)
        dispatch(createChatSessionFulfilled(session))

        return session
    }
}

const createChatSessionAsync = (): ActionObject =>
    ({
        type: AT.CREATE_CHAT_SESSION_ASYNC
    })

const createChatSessionRejected = (): ActionObject =>
    ({
        type: AT.CREATE_CHAT_SESSION_REJECTED
    })

const createChatSessionFulfilled = (session: Session): ActionObject =>
    ({
        type: AT.CREATE_CHAT_SESSION_FULFILLED,
        session: session
    })

// --------------------------
// TeachSession
// --------------------------
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
const createTeachSessionAsync = (): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_ASYNC
    })

const createTeachSessionRejected = (): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_REJECTED
    })

const createTeachSessionFulfilled = (uiTeachResponse: UITeachResponse): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_FULFILLED,
        teachSession: uiTeachResponse.teachResponse as Teach,
        memories: uiTeachResponse.memories
    })

// --------------------------
// TeachSessionFromHistory
// --------------------------
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

const createTeachSessionFromHistoryAsync = (blisAppID: string, trainDialog: TrainDialog, userName: string, userId: string): ActionObject => {
    return {
        type: AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC,
        blisAppID: blisAppID,
        userName: userName,
        userId: userId,
        trainDialog: trainDialog
    }
}

const createTeachSessionFromHistoryFulfilled = (teachWithHistory: TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.CREATE_TEACH_SESSION_FROMHISTORYFULFILLED,
        teachWithHistory: teachWithHistory
    }
}

// --------------------------
// TeachSessionFromUndo
// --------------------------
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

const createTeachSessionFromUndoAsync = (blisAppID: string, teach: Teach, popRound: boolean, userName: string, userId: string): ActionObject => {
    return {
        type: AT.CREATE_TEACH_SESSION_FROMUNDOASYNC,
        blisAppID: blisAppID,
        teach: teach,
        popRound: popRound,
        userName: userName,
        userId: userId
    }
}

const createTeachSessionFromUndoFulfilled = (teachWithHistory: TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.CREATE_TEACH_SESSION_FROMUNDOFULFILLED,
        teachWithHistory: teachWithHistory
    }
}

// --------------------------
// TrainDialog
// --------------------------
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

// --------------------------
// LogDialog
// --------------------------
// TODO: should be async with fulfillment
export const createLogDialog = (logDialog: LogDialog): ActionObject => {
    return {
        type: AT.CREATE_LOG_DIALOG,
        logDialog: logDialog
    }
}