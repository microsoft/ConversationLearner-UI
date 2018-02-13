import { AT, ActionObject, ErrorType } from '../types'
import { Dispatch } from 'redux'
import { BlisAppBase, EntityBase, ActionBase, Session, Teach } from 'blis-models'
import { setErrorDisplay } from './displayActions'
import { fetchAllTrainDialogsAsync, fetchAllLogDialogsAsync, fetchApplicationTrainingStatusThunkAsync } from './fetchActions'
import * as ClientFactory from '../services/clientFactory'

export const deleteBLISApplicationAsync = (key: string, blisApp: BlisAppBase): ActionObject => {

    return {
        type: AT.DELETE_BLIS_APPLICATION_ASYNC,
        blisAppGUID: blisApp.appId,
        blisApp: blisApp
    }
}

export const deleteBLISApplicationFulfilled = (blisAppGUID: string): ActionObject => {
    return {
        type: AT.DELETE_BLIS_APPLICATION_FULFILLED,
        blisAppGUID: blisAppGUID
    }
}

export const deleteEntityAsync = (key: string, GUID: string, entity: EntityBase, currentAppId: string): ActionObject => {

    return {
        type: AT.DELETE_ENTITY_ASYNC,
        entityGUID: GUID,
        entity: entity,
        currentAppId: currentAppId
    }
}

export const deleteReverseEntityAsnyc = (key: string, deletedEntityId: string, reverseEntityId: string, currentAppId: string): ActionObject => {
    return {
        type: AT.DELETE_REVERSE_ENTITY_ASYNC,
        key: key,
        currentAppId: currentAppId,
        deletedEntityId: deletedEntityId,
        reverseEntityId: reverseEntityId
    }
}

export const deleteEntityFulfilled = (key: string, deletedEntityId: string, currentAppId: string): ActionObject => {
    return {
        type: AT.DELETE_ENTITY_FULFILLED,
        key: key,
        currentAppId: currentAppId,
        deletedEntityId: deletedEntityId
    }
}

export const deleteActionAsync = (key: string, GUID: string, action: ActionBase, currentAppId: string): ActionObject => {
    return {
        type: AT.DELETE_ACTION_ASYNC,
        actionGUID: GUID,
        action: action,
        currentAppId: currentAppId
    }
}

export const deleteActionFulfilled = (actionGUID: string): ActionObject => {
    return {
        type: AT.DELETE_ACTION_FULFILLED,
        actionGUID: actionGUID
    }
}

export const deleteChatSessionAsync = (key: string, session: Session, currentAppId: string): ActionObject => {
    return {
        type: AT.DELETE_CHAT_SESSION_ASYNC,
        key: key,
        session: session,
        currentAppId: currentAppId
    }
}

export const deleteChatSessionFulfilled = (sessionId: string): ActionObject => {
    return {
        type: AT.DELETE_CHAT_SESSION_FULFILLED,
        sessionId
    }
}

export const deleteTeachSessionAsync = (key: string, teachSession: Teach, currentAppId: string, save: boolean): ActionObject => {
    return {
        type: AT.DELETE_TEACH_SESSION_ASYNC,
        key: key,
        teachSession: teachSession,
        currentAppId: currentAppId,
        save: save
    }
}

export const deleteTeachSessionFulfilled = (key: string, teachSessionGUID: string, currentAppId: string): ActionObject => {
    return {
        type: AT.DELETE_TEACH_SESSION_FULFILLED,
        key: key,
        currentAppId: currentAppId,
        teachSessionGUID: teachSessionGUID
    }
}

export const deleteTeachSessionThunkAsync = (key: string, teachSession: Teach, currentAppId: string, save: boolean) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteTeachSessionAsync(key, teachSession, currentAppId, save))
        const blisClient = ClientFactory.getInstance(AT.DELETE_TEACH_SESSION_ASYNC)

        try {
            await blisClient.teachSessionsDelete(key, teachSession, save);
            dispatch(deleteTeachSessionFulfilled(key, teachSession.teachId, currentAppId));
            dispatch(fetchAllTrainDialogsAsync(key, currentAppId));
            dispatch(fetchApplicationTrainingStatusThunkAsync(currentAppId));
            return true;
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.DELETE_TRAIN_DIALOG_REJECTED))
            dispatch(fetchAllTrainDialogsAsync(key, currentAppId));
            return false;
        }
    }
}

// -----------------
// TRAIN DIALOG
// -----------------
export const deleteTrainDialogAsync = (trainDialogId: string, appId: string): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_ASYNC,
        appId,
        trainDialogId
    }
}

export const deleteTrainDialogRejected = (): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_REJECTED
    }
}

export const deleteTrainDialogFulfilled = (trainDialogId: string): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_FULFILLED,
        trainDialogId
    }
}

export const deleteTrainDialogThunkAsync = (userId: string, appId: string, trainDialogId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteTrainDialogAsync(trainDialogId, appId))
        const blisClient = ClientFactory.getInstance(AT.DELETE_TRAIN_DIALOG_ASYNC)

        try {
            await blisClient.trainDialogsDelete(appId, trainDialogId)
            dispatch(deleteTrainDialogFulfilled(trainDialogId))
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.DELETE_TRAIN_DIALOG_REJECTED))
            dispatch(deleteTrainDialogRejected())
            dispatch(fetchAllTrainDialogsAsync(userId, appId));
        }
    }
}

// -----------------
// LOG DIALOG
// -----------------
export const deleteLogDialogAsync = (appId: string, logDialogId: string): ActionObject => {
    return {
        type: AT.DELETE_LOG_DIALOG_ASYNC,
        appId,
        logDialogId
    }
}

export const deleteLogDialogFulfilled = (logDialogId: string): ActionObject => {
    return {
        type: AT.DELETE_LOG_DIALOG_FULFILLED,
        logDialogId
    }
}

export const deleteLogDialogRejected = (): ActionObject => {
    return {
        type: AT.DELETE_LOG_DIALOG_REJECTED
    }
}

export const deleteLogDialogThunkAsync = (userId: string, appId: string, logDialogId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteLogDialogAsync(appId, logDialogId))
        const blisClient = ClientFactory.getInstance(AT.DELETE_LOG_DIALOG_ASYNC)

        try {
            await blisClient.logDialogsDelete(appId, logDialogId)
            dispatch(deleteLogDialogFulfilled(logDialogId))
        }
        catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.message], AT.DELETE_LOG_DIALOG_ASYNC))
            dispatch(deleteLogDialogRejected())
            dispatch(fetchAllLogDialogsAsync(userId, appId));
        }
    }
}