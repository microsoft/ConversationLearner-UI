/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as ClientFactory from '../services/clientFactory'
import * as HttpStatus from 'http-status-codes'
import { AT, ActionObject, ErrorType } from '../types'
import { Dispatch } from 'redux'
import { setErrorDisplay } from './displayActions'
import { AxiosError } from 'axios'

//-------------------------------------
// deleteLogDialog
//-------------------------------------
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

export const deleteLogDialogThunkAsync = (app: CLM.AppBase, logDialogId: string, packageId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteLogDialogAsync(app.appId, logDialogId))
        const clClient = ClientFactory.getInstance(AT.DELETE_LOG_DIALOG_ASYNC)

        try {
            await clClient.logDialogsDelete(app.appId, logDialogId)
            dispatch(deleteLogDialogFulfilled(logDialogId))
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.DELETE_LOG_DIALOG_ASYNC))
            dispatch(deleteLogDialogRejected())
            void dispatch(fetchAllLogDialogsThunkAsync(app, packageId));
        }
    }
}

const deleteLogDialogsAsync = (appId: string, logDialogIds: string[]): ActionObject => {
    return {
        type: AT.DELETE_LOG_DIALOGS_ASYNC,
        appId,
        logDialogIds,
    }
}

const deleteLogDialogsFulfilled = (): ActionObject => {
    return {
        type: AT.DELETE_LOG_DIALOGS_FULFILLED,
    }
}

const deleteLogDialogsRejected = (): ActionObject => {
    return {
        type: AT.DELETE_LOG_DIALOGS_REJECTED,
    }
}

export const deleteLogDialogsThunkAsync = (app: CLM.AppBase, logDialogIds: string[], packageId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteLogDialogsAsync(app.appId, logDialogIds))
        const clClient = ClientFactory.getInstance(AT.DELETE_LOG_DIALOGS_ASYNC)

        try {
            await clClient.logDialogsDeleteMany(app.appId, logDialogIds)
            dispatch(deleteLogDialogsFulfilled())
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.DELETE_LOG_DIALOGS_ASYNC))
            dispatch(deleteLogDialogsRejected())
        }
        finally {
            void dispatch(fetchAllLogDialogsThunkAsync(app, packageId))
        }
    }
}

// ----------------------------------------
// FetchLogDialog
// ----------------------------------------
const fetchLogDialogAsync = (noSpinnerDisplay: boolean): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOG_ASYNC,
        noSpinnerDisplay
    }
}

const fetchLogDialogFulfilled = (logDialog: CLM.LogDialog, replaceLocal: boolean): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOG_FULFILLED,
        logDialog,
        replaceLocal
    }
}

const fetchLogDialogNotFound = (): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOG_NOTFOUND
    }
}

/**
 * Fetch log dialog for the given logDialogId
 * @param appId Current application Id
 * @param logDialogId Id of log dialog to be fetched
 * @param replaceLocal Should fetched version replace local copy
 * @param nullOnNotFound Return null when not found (otherwise throw an error)
 * @param noSpinnerDisplay When true will not display a spinner while awaiting
 */
export const fetchLogDialogThunkAsync = (appId: string, logDialogId: string, replaceLocal: boolean, nullOnNotFound: boolean = false, noSpinnerDisplay: boolean = false) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_LOG_DIALOG_ASYNC)
        dispatch(fetchLogDialogAsync(noSpinnerDisplay))

        try {
            const logDialog = await clClient.logDialog(appId, logDialogId)
            dispatch(fetchLogDialogFulfilled(logDialog, replaceLocal))
            return logDialog
        } catch (e) {
            const error = e as AxiosError
            if (error.response?.status === HttpStatus.NOT_FOUND && nullOnNotFound) {
                dispatch(fetchLogDialogNotFound())
                return null
            }
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_LOG_DIALOG_ASYNC))
            throw e;
        }
    }
}

//-------------------------------------
// fetchAllLogDialogs
//-------------------------------------
const fetchAllLogDialogsAsync = (appId: string, packageIds: string[]): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOGS_ASYNC,
        appId,
        packageIds,
    }
}

const fetchAllLogDialogsFulfilled = (logDialogs: CLM.LogDialog[]): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOGS_FULFILLED,
        allLogDialogs: logDialogs
    }
}

export const fetchAllLogDialogsThunkAsync = (app: CLM.AppBase, packageId: string) => {
    return async (dispatch: Dispatch<any>) => {
        // Note: In future change fetch log dialogs to default to all package if packageId is dev
        const packageIds = (packageId === app.devPackageId)
            ? (app.packageVersions ?? []).map(pv => pv.packageId).concat(packageId)
            : [packageId]

        const clClient = ClientFactory.getInstance(AT.FETCH_LOG_DIALOGS_ASYNC)
        dispatch(fetchAllLogDialogsAsync(app.appId, packageIds))

        try {
            const logDialogs = await clClient.logDialogs(app.appId, packageIds)
            dispatch(fetchAllLogDialogsFulfilled(logDialogs))
            return logDialogs
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_LOG_DIALOGS_ASYNC))
            return null;
        }
    }
}