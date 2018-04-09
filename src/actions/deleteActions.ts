import { AT, ActionObject, ErrorType } from '../types'
import { Dispatch } from 'redux'
import { BlisAppBase, Session, Teach } from 'blis-models'
import { setErrorDisplay } from './displayActions'
import { fetchAllTrainDialogsAsync, fetchAllLogDialogsAsync, fetchApplicationTrainingStatusThunkAsync } from './fetchActions'
import * as ClientFactory from '../services/clientFactory'

// ---------------------
// App
// ---------------------
export const deleteBLISApplicationAsync = (blisApp: BlisAppBase): ActionObject => {
    return {
        type: AT.DELETE_BLIS_APPLICATION_ASYNC,
        appId: blisApp.appId,
        blisApp: blisApp
    }
}

export const deleteBLISApplicationFulfilled = (appId: string): ActionObject => {
    return {
        type: AT.DELETE_BLIS_APPLICATION_FULFILLED,
        appId: appId
    }
}

// ---------------------
// Entity
// ---------------------
export const deleteEntityThunkAsync = (appId: string, entityId: string, reverseEntityId?: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteEntityAsync(appId, entityId))
        const blisClient = ClientFactory.getInstance(AT.DELETE_ENTITY_ASYNC)

        try {
            let deleteReverseResponse = null;
            const deleteEditResponse = await blisClient.entitiesDelete(appId, entityId);
            dispatch(deleteEntityFulfilled(entityId));

            // If it's a negatable entity
            if (reverseEntityId) {
                deleteReverseResponse = await blisClient.entitiesDelete(appId, reverseEntityId);
                dispatch(deleteEntityFulfilled(reverseEntityId));
            }

            // Fetch train dialogs if any train dialogs were impacted
            if ((deleteEditResponse.trainDialogIds && deleteEditResponse.trainDialogIds.length > 0) ||
                (deleteReverseResponse && deleteReverseResponse.trainDialogIds && deleteReverseResponse.trainDialogIds.length > 0)) {
                dispatch(fetchAllTrainDialogsAsync(appId));
            }

            dispatch(fetchApplicationTrainingStatusThunkAsync(appId));
            return true;
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.DELETE_ENTITY_ASYNC))
            return false;
        }
    }
}

const deleteEntityAsync = (appId: string, entityId: string): ActionObject => {
    return {
        type: AT.DELETE_ENTITY_ASYNC,
        entityId: entityId,
        appId: appId
    }
}

const deleteEntityFulfilled = (entityId: string): ActionObject => {
    return {
        type: AT.DELETE_ENTITY_FULFILLED,
        entityId: entityId
    }
}

// ---------------------
// Action
// ---------------------
export const deleteActionThunkAsync = (appId: string, actionId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteActionAsync(appId, actionId))
        const blisClient = ClientFactory.getInstance(AT.DELETE_ACTION_ASYNC)

        try {
            const deleteEditResponse = await blisClient.actionsDelete(appId, actionId);
            dispatch(deleteActionFulfilled(actionId));

            // Fetch train dialogs if any train dialogs were impacted
            if (deleteEditResponse.trainDialogIds && deleteEditResponse.trainDialogIds.length > 0) {
                dispatch(fetchAllTrainDialogsAsync(appId));
            }

            dispatch(fetchApplicationTrainingStatusThunkAsync(appId));
            return true;
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.DELETE_ACTION_ASYNC))
            return false;
        }
    }
}

const deleteActionAsync = (appId: string, actionId: string): ActionObject => {
    return {
        type: AT.DELETE_ACTION_ASYNC,
        actionId: actionId,
        appId: appId
    }
}

const deleteActionFulfilled = (actionId: string): ActionObject => {
    return {
        type: AT.DELETE_ACTION_FULFILLED,
        actionId: actionId
    }
}

// ---------------------
// ChatSession
// ---------------------
export const deleteChatSessionThunkAsync = (key: string, session: Session, app: BlisAppBase, packageId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteChatSessionAsync(key, session, app.appId, packageId))
        const blisClient = ClientFactory.getInstance(AT.DELETE_CHAT_SESSION_ASYNC)

        try {
            await blisClient.chatSessionsDelete(app.appId, session.sessionId);
            dispatch(deleteChatSessionFulfilled(session.sessionId));
            dispatch(fetchAllLogDialogsAsync(key, app, packageId))
            return true;
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.DELETE_CHAT_SESSION_ASYNC))
            return false;
        }
    }
}

const deleteChatSessionAsync = (key: string, session: Session, appId: string, packageId: string): ActionObject => {
    return {
        type: AT.DELETE_CHAT_SESSION_ASYNC,
        key: key,
        session: session,
        appId: appId,
        packageId: packageId
    }
}

const deleteChatSessionFulfilled = (sessionId: string): ActionObject => {
    return {
        type: AT.DELETE_CHAT_SESSION_FULFILLED,
        sessionId
    }
}

// ---------------------
// TeachSession
// ---------------------
export const deleteTeachSessionThunkAsync = (key: string, teachSession: Teach, appId: string, save: boolean) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteTeachSessionAsync(key, teachSession, appId, save))
        const blisClient = ClientFactory.getInstance(AT.DELETE_TEACH_SESSION_ASYNC)

        try {
            await blisClient.teachSessionsDelete(appId, teachSession, save);
            dispatch(deleteTeachSessionFulfilled(key, appId, teachSession.teachId));
            dispatch(fetchAllTrainDialogsAsync(appId));
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId));
            return true;
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.DELETE_TRAIN_DIALOG_REJECTED))
            dispatch(fetchAllTrainDialogsAsync(appId));
            return false;
        }
    }
}

const deleteTeachSessionAsync = (key: string, teachSession: Teach, appId: string, save: boolean): ActionObject => {
    return {
        type: AT.DELETE_TEACH_SESSION_ASYNC,
        key: key,
        teachSession: teachSession,
        appId: appId,
        save: save
    }
}

const deleteTeachSessionFulfilled = (key: string, teachSessionGUID: string, appId: string): ActionObject => {
    return {
        type: AT.DELETE_TEACH_SESSION_FULFILLED,
        key: key,
        appId: appId,
        teachSessionGUID: teachSessionGUID
    }
}

// -----------------
//  Memory
// -----------------
export const deleteMemoryThunkAsync = (key: string, currentAppId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteMemoryAsync(key, currentAppId))
        const blisClient = ClientFactory.getInstance(AT.DELETE_MEMORY_ASYNC)

        try {
            await blisClient.memoryDelete(currentAppId);
            dispatch(deleteMemoryFulfilled());
            return true;
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.DELETE_MEMORY_ASYNC))
            return false;
        }
    }
}

const deleteMemoryAsync = (key: string, currentAppId: string): ActionObject => {
    return {
        type: AT.DELETE_MEMORY_ASYNC,
        key: key,
        appId: currentAppId
    }
}

const deleteMemoryFulfilled = (): ActionObject => {
    return {
        type: AT.DELETE_MEMORY_FULFILLED
    }
}

// ------------------
// TrainDialog
// ------------------
export const deleteTrainDialogThunkAsync = (userId: string, appId: string, trainDialogId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteTrainDialogAsync(trainDialogId, appId))
        const blisClient = ClientFactory.getInstance(AT.DELETE_TRAIN_DIALOG_ASYNC)

        try {
            await blisClient.trainDialogsDelete(appId, trainDialogId)
            dispatch(deleteTrainDialogFulfilled(trainDialogId))
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId));
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.DELETE_TRAIN_DIALOG_REJECTED))
            dispatch(deleteTrainDialogRejected())
            dispatch(fetchAllTrainDialogsAsync(appId));
        }
    }
}
const deleteTrainDialogAsync = (trainDialogId: string, appId: string): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_ASYNC,
        appId,
        trainDialogId
    }
}

const deleteTrainDialogRejected = (): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_REJECTED
    }
}

const deleteTrainDialogFulfilled = (trainDialogId: string): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_FULFILLED,
        trainDialogId
    }
}

// -----------------
// LogDialog
// -----------------
export const deleteLogDialogThunkAsync = (userId: string, app: BlisAppBase, logDialogId: string, packageId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteLogDialogAsync(app.appId, logDialogId))
        const blisClient = ClientFactory.getInstance(AT.DELETE_LOG_DIALOG_ASYNC)

        try {
            await blisClient.logDialogsDelete(app.appId, logDialogId)
            dispatch(deleteLogDialogFulfilled(logDialogId))
        }
        catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.message], AT.DELETE_LOG_DIALOG_ASYNC))
            dispatch(deleteLogDialogRejected())
            dispatch(fetchAllLogDialogsAsync(userId, app, packageId));
        }
    }
}

const deleteLogDialogAsync = (appId: string, logDialogId: string): ActionObject => {
    return {
        type: AT.DELETE_LOG_DIALOG_ASYNC,
        appId,
        logDialogId
    }
}

const deleteLogDialogFulfilled = (logDialogId: string): ActionObject => {
    return {
        type: AT.DELETE_LOG_DIALOG_FULFILLED,
        logDialogId
    }
}

const deleteLogDialogRejected = (): ActionObject => {
    return {
        type: AT.DELETE_LOG_DIALOG_REJECTED
    }
}