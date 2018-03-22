import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase, EntityBase, ActionBase, TrainDialog } from 'blis-models';
import * as ClientFactory from '../services/clientFactory'
import { setErrorDisplay } from './displayActions'
import { Dispatch } from 'redux'

export const editBLISApplicationAsync = (key: string, application: BlisAppBase): ActionObject => {

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

export const editEntityAsync = (appId: string, entity: EntityBase): ActionObject => {
    return {
        type: AT.EDIT_ENTITY_ASYNC,
        appId,
        entity
    }
}

export const editEntityFulfilled = (entity: EntityBase): ActionObject => {

    return {
        type: AT.EDIT_ENTITY_FULFILLED,
        entity: entity
    }
}

export const editActionAsync = (key: string, action: ActionBase, currentAppId: string): ActionObject => {

    return {
        type: AT.EDIT_ACTION_ASYNC,
        blisAction: action,
        currentAppId: currentAppId
    }
}

export const editActionFulfilled = (action: ActionBase): ActionObject => {

    return {
        type: AT.EDIT_ACTION_FULFILLED,
        blisAction: action,
    }
}

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
  //        dispatch(editTrainDialogRejected()) TODO: needed?
            throw error
        }
    }
}

export const editTrainDialogAsync = (blisAppId: string, trainDialog: TrainDialog): ActionObject => {
    return {
        type: AT.EDIT_TRAINDIALOG_ASYNC,
        blisAppId: blisAppId,
        trainDialog: trainDialog
    }
}

export const editTrainDialogFulfilled = (trainDialog: TrainDialog): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.EDIT_TRAINDIALOG_FULFILLED,
        trainDialog: trainDialog
    }
}

export const editChatSessionExpireAsync = (key: string, appId: string, sessionId: string): ActionObject => {
    return {
        type: AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC,
        key: key,
        appId: appId,
        sessionId: sessionId
    }
}

// --------------------------
// editAppLiveTag
// --------------------------
export const editAppLiveTagAsync = (currentAppId: string, packageId: string): ActionObject =>
    ({
        type: AT.EDIT_APP_LIVE_TAG_ASYNC,
        packageId: packageId,
        currentAppId: currentAppId
    })

export const editAppLiveTagFulfilled = (app: BlisAppBase): ActionObject => {
    return {
        type: AT.EDIT_APP_LIVE_TAG_FULFILLED,
        blisApp: app
    }
}

export const editAppLiveTagThunkAsync = (key: string, appId: string, tagId: string) => {
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

// --------------------------
// editAppEditingTag
// --------------------------
export const editAppEditingTagAsync = (currentAppId: string, packageId: string): ActionObject =>
    ({
        type: AT.EDIT_APP_EDITING_TAG_ASYNC,
        packageId: packageId,
        currentAppId: currentAppId
    })

export const editAppEditingTagFulfilled = (activeApps: { [appId: string]: string }): ActionObject => {
    return {
        type: AT.EDIT_APP_EDITING_TAG_FULFILLED,
        activeApps: activeApps
    }
}

export const editAppEditingTagThunkAsync = (key: string, appId: string, packageId: string) => {
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