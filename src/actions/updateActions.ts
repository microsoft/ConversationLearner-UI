/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { AppBase, EntityBase, ActionBase, TrainDialog, AppDefinition } from '@conversationlearner/models';
import * as ClientFactory from '../services/clientFactory'
import { setErrorDisplay } from './displayActions'
import { Dispatch } from 'redux'
import { fetchAllTrainDialogsAsync, fetchApplicationTrainingStatusThunkAsync } from './fetchActions'
import { deleteEntityFulfilled } from './deleteActions'
import { AxiosError } from 'axios';
import { createEntityFulfilled } from './createActions';

// ----------------------------------------
// App
// ----------------------------------------
const editApplicationAsync = (application: AppBase): ActionObject => {
    return {
        type: AT.EDIT_APPLICATION_ASYNC,
        app: application
    }
}

const editApplicationFulfilled = (application: AppBase): ActionObject => {
    return {
        type: AT.EDIT_APPLICATION_FULFILLED,
        app: application
    }
}

export const editApplicationThunkAsync = (app: AppBase) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_APPLICATION_ASYNC)
        dispatch(editApplicationAsync(app))

        try {
            const updatedApp = await clClient.appsUpdate(app.appId, app)
            dispatch(editApplicationFulfilled(updatedApp))
            return updatedApp
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.EDIT_APPLICATION_ASYNC))
            throw error
        }
    }
}

// ----------------------------------------
// Entity'
// ----------------------------------------
export const editEntityThunkAsync = (appId: string, entity: EntityBase, prevEntity: EntityBase) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_ENTITY_ASYNC)
        dispatch(editEntityAsync(appId, entity))

        try {
            const posEntity = await clClient.entitiesUpdate(appId, entity)
            dispatch(editEntityFulfilled(posEntity))

            // If we're setting negatable flag
            if (entity.isNegatible && !prevEntity.isNegatible) {
                // Need to fetch negative entity in order to load it into memory
                const negEntity = await clClient.entitiesGetById(appId, posEntity.negativeId!)
                dispatch(createEntityFulfilled(negEntity))
            }
            // If we're UNsetting negatable flag
            else if (!entity.isNegatible && prevEntity.isNegatible) {
                // Need to remove negative entity from memory
                dispatch(deleteEntityFulfilled(prevEntity.negativeId!))
            }

            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            return entity
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.EDIT_ENTITY_ASYNC))
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
        const clClient = ClientFactory.getInstance(AT.EDIT_ACTION_ASYNC)
        dispatch(editActionAsync(appId, action))

        try {
            let deleteEditResponse = await clClient.actionsUpdate(appId, action)
            dispatch(editActionFulfilled(action))

            // Fetch train dialogs if any train dialogs were impacted
            if (deleteEditResponse.trainDialogIds && deleteEditResponse.trainDialogIds.length > 0) {
                dispatch(fetchAllTrainDialogsAsync(appId));
            }
            
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            return action
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.EDIT_ACTION_ASYNC))
            throw error
        }
    }
}

const editActionAsync = (appId: string, action: ActionBase): ActionObject => {
    return {
        type: AT.EDIT_ACTION_ASYNC,
        action: action,
        appId: appId
    }
}

const editActionFulfilled = (action: ActionBase): ActionObject => {
    return {
        type: AT.EDIT_ACTION_FULFILLED,
        action: action,
    }
}

// ----------------------------------------
// TrainDialog
// ----------------------------------------
export const editTrainDialogThunkAsync = (appId: string, trainDialog: TrainDialog) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_TRAINDIALOG_ASYNC)
        dispatch(editTrainDialogAsync(appId, trainDialog))

        try {
            await clClient.trainDialogEdit(appId, trainDialog)
            dispatch(editTrainDialogFulfilled(trainDialog))
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            return trainDialog
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.EDIT_TRAINDIALOG_ASYNC))
            throw error
        }
    }
}

const editTrainDialogAsync = (appId: string, trainDialog: TrainDialog): ActionObject => {
    return {
        type: AT.EDIT_TRAINDIALOG_ASYNC,
        appId: appId,
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
const editChatSessionExpireAsync = (appId: string, sessionId: string): ActionObject => {
    return {
        type: AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC,
        appId: appId,
        sessionId: sessionId
    }
}

export const editChatSessionExpireThunkAsync = (appId: string, sessionId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_APP_LIVE_TAG_ASYNC)
        dispatch(editChatSessionExpireAsync(appId, sessionId))

        try {
            await clClient.chatSessionsExpire(appId, sessionId)
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.EDIT_APP_LIVE_TAG_ASYNC))
            throw error
        }
    }
}



// --------------------------
// AppLiveTag
// --------------------------
export const editAppLiveTagThunkAsync = (appId: string, tagId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_APP_LIVE_TAG_ASYNC)
        dispatch(editAppLiveTagAsync(appId, tagId))

        try {
            const updatedApp = await clClient.appSetLiveTag(appId, tagId)
            dispatch(editAppLiveTagFulfilled(updatedApp))
            return updatedApp
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.EDIT_APP_LIVE_TAG_ASYNC))
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

const editAppLiveTagFulfilled = (app: AppBase): ActionObject => {
    return {
        type: AT.EDIT_APP_LIVE_TAG_FULFILLED,
        app: app
    }
}

// --------------------------
// AppEditingTag
// --------------------------
export const editAppEditingTagThunkAsync = (appId: string, packageId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_APP_EDITING_TAG_ASYNC)
        dispatch(editAppEditingTagAsync(appId, packageId))

        try {
            const activeApps = await clClient.appSetEditingTag(appId, packageId)
            dispatch(editAppEditingTagFulfilled(activeApps))
            return activeApps
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.EDIT_APP_EDITING_TAG_ASYNC))
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

// --------------------------
// Source
// --------------------------
export const setAppSourceThunkAsync = (appId: string, appDefinition: AppDefinition) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_APPSOURCE_ASYNC)
        try {
            dispatch(setAppSourceAsync(appId, appDefinition))
            await clClient.sourcepost(appId, appDefinition)
            dispatch(setAppSourceFulfilled())
            return true
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.CREATE_APPLICATION_ASYNC))
            throw error
        }
    }
}
const setAppSourceAsync = (appId: string, source: AppDefinition): ActionObject => {
    return {
        type: AT.EDIT_APPSOURCE_ASYNC,
        appId: appId,
        source: source,
    }
}

const setAppSourceFulfilled = (): ActionObject => {
    return {
        type: AT.EDIT_APPSOURCE_FULFILLED
    }
}


export const settingsReset = (): ActionObject =>
    ({
        type: AT.SETTINGS_RESET
    })

export const settingsUpdate = (botPort: number): ActionObject =>
    ({
        type: AT.SETTINGS_UPDATE,
        botPort
    })
