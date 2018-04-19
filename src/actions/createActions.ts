/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { AppBase, EntityBase, ActionBase, TrainDialog, LogDialog, Teach, Session, TeachWithHistory, UITeachResponse } from 'conversationlearner-models'
import { Dispatch } from 'redux'
import { setErrorDisplay } from './displayActions'
import * as ClientFactory from '../services/clientFactory'
import { deleteTrainDialogThunkAsync } from './deleteActions';  
import { fetchApplicationsAsync, fetchApplicationTrainingStatusThunkAsync } from './fetchActions';

// --------------------------
// App
// --------------------------
export const createApplicationAsync = (userId: string, application: AppBase): ActionObject => {
    return {
        type: AT.CREATE_APPLICATION_ASYNC,
        userId: userId,
        app: application,
    }
}

export const createApplicationFulfilled = (app: AppBase): ActionObject => {
    return {
        type: AT.CREATE_APPLICATION_FULFILLED,
        app: app
    }
}

// --------------------------
// CopyApps
// --------------------------
export const copyApplicationsThunkAsync = (srcUserId: string, destUserId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.COPY_APPLICATIONS_ASYNC)
        try {
            dispatch(copyApplicationsAsync(srcUserId, destUserId))
            await clClient.appsCopy(srcUserId, destUserId)
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
        const clClient = ClientFactory.getInstance(AT.CREATE_ENTITY_ASYNC)

        try {
            let posEntity = await clClient.entitiesCreate(appId, entity);
            
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

                negEntity = await clClient.entitiesCreate(appId, negEntity);
                dispatch(createEntityFulfilled(negEntity));

                // Update positive entity with ref to negative entity
                posEntity.negativeId = negEntity.entityId;
                posEntity = await clClient.entitiesUpdate(appId, posEntity);
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
        const clClient = ClientFactory.getInstance(AT.CREATE_ACTION_ASYNC)

        try {
            const newAction = await clClient.actionsCreate(appId, action);
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
        const clClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_ASYNC)
        dispatch(createAppTagAsync(appId, tagName, makeLive))

        try {
            const updatedApp = await clClient.appCreateTag(appId, tagName, makeLive)
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

const createAppTagFulfilled = (app: AppBase): ActionObject => {
    return {
        type: AT.CREATE_APP_TAG_FULFILLED,
        app: app
    }
}

// --------------------------
// ChatSession
// --------------------------
export const createChatSessionThunkAsync = (appId: string, packageId: string, saveToLog: boolean) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.CREATE_CHAT_SESSION_ASYNC)
        dispatch(createChatSessionAsync())

        try {
            const session = await clClient.chatSessionsCreate(appId, { saveToLog, packageId })
            dispatch(createChatSessionFulfilled(session))
            return session
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.CREATE_CHAT_SESSION_ASYNC))
            throw error
        }
    }
}

const createChatSessionAsync = (): ActionObject =>
    ({
        type: AT.CREATE_CHAT_SESSION_ASYNC
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
        const clClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_ASYNC)
        dispatch(createTeachSessionAsync())

        try {
            const uiTeachResponse = await clClient.teachSessionsCreate(appId)
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
        const clClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC)
        dispatch(createTeachSessionFromHistoryAsync(appId, trainDialog, userName, userId))

        try {
            const teachWithHistory = await clClient.teachSessionFromHistory(appId, trainDialog, userName, userId, lastExtractChanged);
            
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

const createTeachSessionFromHistoryAsync = (clAppID: string, trainDialog: TrainDialog, userName: string, userId: string): ActionObject => {
    return {
        type: AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC,
        clAppID: clAppID,
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
        const clClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_FROMUNDOASYNC)
        dispatch(createTeachSessionFromUndoAsync(appId, teach, popRound, userName, userId))

        try {
            const teachWithHistory = await clClient.teachSessionFromUndo(appId, teach, popRound, userName, userId)
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

const createTeachSessionFromUndoAsync = (clAppID: string, teach: Teach, popRound: boolean, userName: string, userId: string): ActionObject => {
    return {
        type: AT.CREATE_TEACH_SESSION_FROMUNDOASYNC,
        clAppID: clAppID,
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