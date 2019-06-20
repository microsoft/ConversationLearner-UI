/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { ActionBase } from '@conversationlearner/models'
import { Dispatch } from 'redux'
import { setErrorDisplay } from './displayActions'
import * as ClientFactory from '../services/clientFactory'
import { fetchApplicationTrainingStatusThunkAsync } from './appActions'
import { fetchAllTrainDialogsThunkAsync } from './trainActions'
import { AxiosError } from 'axios';

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

export const createActionThunkAsync = (appId: string, action: ActionBase) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(createActionAsync(appId, action))
        const clClient = ClientFactory.getInstance(AT.CREATE_ACTION_ASYNC)

        try {
            const newAction = await clClient.actionsCreate(appId, action);
            dispatch(createActionFulfilled(newAction));
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId));
            return newAction;
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.CREATE_ACTION_ASYNC))
            return null;
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

export const editActionThunkAsync = (appId: string, action: ActionBase) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_ACTION_ASYNC)
        dispatch(editActionAsync(appId, action))

        try {
            const deleteEditResponse = await clClient.actionsUpdate(appId, action)
            dispatch(editActionFulfilled(action))

            // Fetch train dialogs if any train dialogs were impacted
            if (deleteEditResponse.trainDialogIds && deleteEditResponse.trainDialogIds.length > 0) {
                dispatch(fetchAllTrainDialogsThunkAsync(appId))
            }

            dispatch(fetchApplicationTrainingStatusThunkAsync(appId)).catch()
            return action
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.EDIT_ACTION_ASYNC))
            throw error
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

export const deleteActionThunkAsync = (appId: string, actionId: string, removeFromDialogs: boolean) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteActionAsync(appId, actionId))
        const clClient = ClientFactory.getInstance(AT.DELETE_ACTION_ASYNC)

        try {
            const deleteEditResponse = await clClient.actionsDelete(appId, actionId, removeFromDialogs);
            dispatch(deleteActionFulfilled(actionId));

            // Fetch train dialogs if any train dialogs were impacted
            if (deleteEditResponse.trainDialogIds && deleteEditResponse.trainDialogIds.length > 0) {
                dispatch(fetchAllTrainDialogsThunkAsync(appId));
            }

            dispatch(fetchApplicationTrainingStatusThunkAsync(appId));
            return true;
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.DELETE_ACTION_ASYNC))
            return false;
        }
    }
}

const fetchAllActionsAsync = (appId: string): ActionObject => {
    return {
        type: AT.FETCH_ACTIONS_ASYNC,
        appId: appId
    }
}

const fetchAllActionsFulfilled = (actions: ActionBase[]): ActionObject => {
    return {
        type: AT.FETCH_ACTIONS_FULFILLED,
        allActions: actions
    }
}

export const fetchAllActionsThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_ACTIONS_ASYNC)
        dispatch(fetchAllActionsAsync(appId))

        try {
            const actions = await clClient.actions(appId)
            dispatch(fetchAllActionsFulfilled(actions))
            return actions
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_ACTIONS_ASYNC))
            return null;
        }
    }
}

const fetchActionDeleteValidationAsync = (appId: string, packageId: string, actionId: string): ActionObject => {
    return {
        type: AT.FETCH_ACTION_DELETE_VALIDATION_ASYNC,
        appId: appId,
        packageId: packageId,
        actionId: actionId
    }
}

const fetchActionDeleteValidationFulfilled = (): ActionObject => {
    return {
        type: AT.FETCH_ACTION_DELETE_VALIDATION_FULFILLED
    }
}

export const fetchActionDeleteValidationThunkAsync = (appId: string, packageId: string, actionId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_ACTION_DELETE_VALIDATION_ASYNC)
        dispatch(fetchActionDeleteValidationAsync(appId, packageId, actionId))

        try {
            const invalidTrainDialogIds = await clClient.actionsDeleteValidation(appId, packageId, actionId)
            dispatch(fetchActionDeleteValidationFulfilled())
            return invalidTrainDialogIds
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_ACTION_DELETE_VALIDATION_ASYNC))
            return null;
        }
    }
}

const fetchActionEditValidationAsync = (appId: string, packageId: string, action: ActionBase): ActionObject => {
    return {
        type: AT.FETCH_ACTION_EDIT_VALIDATION_ASYNC,
        appId: appId,
        packageId: packageId,
        action: action
    }
}

const fetchActionEditValidationFulfilled = (): ActionObject => {
    return {
        type: AT.FETCH_ACTION_EDIT_VALIDATION_FULFILLED
    }
}

export const fetchActionEditValidationThunkAsync = (appId: string, packageId: string, action: ActionBase) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_ACTION_EDIT_VALIDATION_ASYNC)
        dispatch(fetchActionEditValidationAsync(appId, packageId, action))

        try {
            const invalidTrainDialogIds = await clClient.actionsUpdateValidation(appId, packageId, action)
            dispatch(fetchActionEditValidationFulfilled())
            return invalidTrainDialogIds
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_ACTION_EDIT_VALIDATION_ASYNC))
            return null;
        }
    }
}