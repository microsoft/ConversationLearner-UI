import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase, EntityBase, ActionBase, TrainDialog } from 'blis-models';
import * as ClientFactory from '../services/clientFactory'
import { setErrorDisplay } from './displayActions'
import { Dispatch } from 'redux'
import { fetchAllTrainDialogsAsync, fetchApplicationTrainingStatusThunkAsync } from './fetchActions';

// ----------------------------------------
// App
// ----------------------------------------
export const editBLISApplicationAsync = (application: BlisAppBase): ActionObject => {

    return {
        type: AT.EDIT_BLIS_APPLICATION_ASYNC,
        blisApp: application
    }
}

export const editBLISApplicationFulfilled = (application: BlisAppBase): ActionObject => {

    return {
        type: AT.EDIT_BLIS_APPLICATION_FULFILLED,
        blisApp: application
    }
}

// ----------------------------------------
// Entity
// ----------------------------------------
export const editEntityThunkAsync = (appId: string, entity: EntityBase) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.EDIT_ENTITY_ASYNC)
        dispatch(editEntityAsync(appId, entity))

        try {
            let posEntity = await blisClient.entitiesUpdate(appId, entity)

            // If it's a negatable entity
            if (posEntity.isNegatible) {
                // Re-create negative entity from pos
                let negEntity = {
                    ...entity, 
                    entityId: entity.negativeId,
                    entityName: `~${entity.entityName}`,
                    positiveId: posEntity.entityId,
                }
                // Clear neg ref
                delete negEntity.negativeId;

                negEntity = await blisClient.entitiesUpdate(appId, negEntity);
                dispatch(editEntityFulfilled(negEntity));
            }

            dispatch(editEntityFulfilled(posEntity))
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            return entity
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.EDIT_ENTITY_ASYNC))
            throw error
        }
    }
}

const editEntityAsync = (appId: string, entity: EntityBase): ActionObject => {
    return {
        type: AT.EDIT_ENTITY_ASYNC,
        appId,
        entity
    }
}

const editEntityFulfilled = (entity: EntityBase): ActionObject => {
    return {
        type: AT.EDIT_ENTITY_FULFILLED,
        entity: entity
    }
}

// ----------------------------------------
// Action
// ----------------------------------------
export const editActionThunkAsync = (appId: string, action: ActionBase) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.EDIT_ACTION_ASYNC)
        dispatch(editActionAsync(appId, action))

        try {
            let deleteEditResponse = await blisClient.actionsUpdate(appId, action)
            dispatch(editActionFulfilled(action))

            // Fetch train dialogs if any train dialogs were impacted
            if (deleteEditResponse.trainDialogIds && deleteEditResponse.trainDialogIds.length > 0) {
                dispatch(fetchAllTrainDialogsAsync(appId));
            }
            
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            return action
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.EDIT_ACTION_ASYNC))
            throw error
        }
    }
}

const editActionAsync = (appId: string, action: ActionBase): ActionObject => {
    return {
        type: AT.EDIT_ACTION_ASYNC,
        blisAction: action,
        appId: appId
    }
}

const editActionFulfilled = (action: ActionBase): ActionObject => {
    return {
        type: AT.EDIT_ACTION_FULFILLED,
        blisAction: action,
    }
}

// ----------------------------------------
// TrainDialog
// ----------------------------------------
export const editTrainDialogThunkAsync = (appId: string, trainDialog: TrainDialog) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.EDIT_TRAINDIALOG_ASYNC)
        dispatch(editTrainDialogAsync(appId, trainDialog))

        try {
            await blisClient.trainDialogEdit(appId, trainDialog)
            dispatch(editTrainDialogFulfilled(trainDialog))
            return trainDialog
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.EDIT_TRAINDIALOG_ASYNC))
            throw error
        }
    }
}

const editTrainDialogAsync = (blisAppId: string, trainDialog: TrainDialog): ActionObject => {
    return {
        type: AT.EDIT_TRAINDIALOG_ASYNC,
        blisAppId: blisAppId,
        trainDialog: trainDialog
    }
}

const editTrainDialogFulfilled = (trainDialog: TrainDialog): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.EDIT_TRAINDIALOG_FULFILLED,
        trainDialog: trainDialog
    }
}

// --------------------------
// SessionExpire
// --------------------------
export const editChatSessionExpireAsync = (key: string, appId: string, sessionId: string): ActionObject => {
    return {
        type: AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC,
        key: key,
        appId: appId,
        sessionId: sessionId
    }
}

// --------------------------
// AppLiveTag
// --------------------------
export const editAppLiveTagThunkAsync = (appId: string, tagId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.EDIT_APP_LIVE_TAG_ASYNC)
        dispatch(editAppLiveTagAsync(appId, tagId))

        try {
            const updatedApp = await blisClient.appSetLiveTag(appId, tagId)
            dispatch(editAppLiveTagFulfilled(updatedApp))
            return updatedApp
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.EDIT_APP_LIVE_TAG_ASYNC))
            throw error
        }
    }
}

const editAppLiveTagAsync = (appId: string, packageId: string): ActionObject =>
    ({
        type: AT.EDIT_APP_LIVE_TAG_ASYNC,
        packageId: packageId,
        appId: appId
    })

const editAppLiveTagFulfilled = (app: BlisAppBase): ActionObject => {
    return {
        type: AT.EDIT_APP_LIVE_TAG_FULFILLED,
        blisApp: app
    }
}

// --------------------------
// AppEditingTag
// --------------------------
export const editAppEditingTagThunkAsync = (appId: string, packageId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.EDIT_APP_EDITING_TAG_ASYNC)
        dispatch(editAppEditingTagAsync(appId, packageId))

        try {
            const activeApps = await blisClient.appSetEditingTag(appId, packageId)
            dispatch(editAppEditingTagFulfilled(activeApps))
            return activeApps
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.EDIT_APP_EDITING_TAG_ASYNC))
            throw error
        }
    }
}

const editAppEditingTagAsync = (currentAppId: string, packageId: string): ActionObject =>
    ({
        type: AT.EDIT_APP_EDITING_TAG_ASYNC,
        packageId: packageId,
        appId: currentAppId
    })

const editAppEditingTagFulfilled = (activeApps: { [appId: string]: string }): ActionObject => {
    return {
        type: AT.EDIT_APP_EDITING_TAG_FULFILLED,
        activeApps: activeApps
    }
}