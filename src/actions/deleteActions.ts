import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { Dispatch } from 'redux'
import { BlisAppBase, EntityBase, ActionBase, Session, Teach, TrainDialog } from 'blis-models'
import BlisClient from '../services/blisClient'
import ApiConfig from '../epics/config'

const blisClient = new BlisClient(ApiConfig.BlisClientEnpoint, () => '')

export const deleteBLISApplicationAsync = (key: string, blisApp: BlisAppBase): ActionObject => {

    return {
        type: AT.DELETE_BLIS_APPLICATION_ASYNC,
        key: key,
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
        key: key,
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
        key: key,
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


export const deleteTrainDialogAsync = (key: string, trainDialog: TrainDialog, currentAppId: string): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_ASYNC,
        key: key,
        currentAppId: currentAppId,
        trainDialog: trainDialog
    }
}

export const deleteTrainDialogRejected = (): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_REJECTED
    }
}

export const deleteTrainDialogFulfilled = (key: string, GUID: string): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_FULFILLED,
        key: key,
        trainDialogGUID: GUID
    }
}

export const deleteTrainDialogThunkAsync = (appId: string, trainDialog: TrainDialog, key: string) => {
    blisClient.key = key
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteTrainDialogAsync(key, trainDialog, appId))

        try {
            await blisClient.trainDialogsDelete(appId, trainDialog.trainDialogId)
            dispatch(deleteTrainDialogFulfilled(key, trainDialog.trainDialogId))
        }
        catch(e) {
            dispatch(deleteTrainDialogRejected())
            throw new Error(e)
        }
    }
}

export const deleteLogDialogAsync = (appId: string, logDialogId: string): ActionObject => {
    return {
        type: AT.DELETE_LOG_DIALOG_ASYNC,
        appId,
        logDialogId
    }
}

export const deleteLogDialogFulFilled = (logDialogId: string): ActionObject => {
    return {
        type: AT.DELETE_LOG_DIALOG_FULFILLED,
        logDialogId
    }
}