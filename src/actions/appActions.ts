/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as ClientFactory from '../services/clientFactory'
import { Dispatch } from 'redux'
import { setErrorDisplay } from './displayActions'
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { AxiosError } from 'axios'
import { Poller, IPollConfig } from '../services/poller'
import { delay } from '../Utils/util'
import { setUpdatedAppDefinition } from './sourceActions'

export const createApplicationThunkAsync = (userId: string, application: CLM.AppBase, source: CLM.AppDefinition | null = null) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.CREATE_APPLICATION_ASYNC)
        try {
            dispatch(createApplicationAsync(userId, application))
            const { appId, ...appToSend } = application
            const newApp = await clClient.appsCreate(userId, appToSend as CLM.AppBase)

            if (source) {
                await clClient.sourcepost(newApp.appId, source)
            }
            dispatch(createApplicationFulfilled(newApp))
            dispatch(fetchApplicationTrainingStatusThunkAsync(newApp.appId));
            return newApp
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.CREATE_APPLICATION_ASYNC))
            throw error
        }
    }
}

const createApplicationAsync = (userId: string, application: CLM.AppBase): ActionObject => {
    return {
        type: AT.CREATE_APPLICATION_ASYNC,
        userId: userId,
        app: application,
    }
}

const createApplicationFulfilled = (app: CLM.AppBase): ActionObject => {
    return {
        type: AT.CREATE_APPLICATION_FULFILLED,
        app: app
    }
}

const editApplicationAsync = (application: CLM.AppBase): ActionObject => {
    return {
        type: AT.EDIT_APPLICATION_ASYNC,
        app: application
    }
}

const editApplicationFulfilled = (application: CLM.AppBase): ActionObject => {
    return {
        type: AT.EDIT_APPLICATION_FULFILLED,
        app: application
    }
}

export const editApplicationThunkAsync = (app: CLM.AppBase) => {
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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.EDIT_APPLICATION_ASYNC))
            throw error
        }
    }
}

export const editAppLiveTagThunkAsync = (app: CLM.AppBase, tagId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_APP_LIVE_TAG_ASYNC)
        dispatch(editAppLiveTagAsync(app.appId, tagId))

        try {
            await clClient.appSetLiveTag(app.appId, tagId)
            const newApp = { ...app, livePackageId: tagId }
            dispatch(editAppLiveTagFulfilled(newApp))
            return newApp
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.EDIT_APP_LIVE_TAG_ASYNC))
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

const editAppLiveTagFulfilled = (app: CLM.AppBase): ActionObject => {
    return {
        type: AT.EDIT_APP_LIVE_TAG_FULFILLED,
        app: app
    }
}

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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.EDIT_APP_EDITING_TAG_ASYNC))
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

export const setAppSourceThunkAsync = (appId: string, appDefinition: CLM.AppDefinition) => {
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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.CREATE_APPLICATION_ASYNC))
            throw error
        }
    }
}

const setAppSourceAsync = (appId: string, source: CLM.AppDefinition): ActionObject => {
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

export const copyApplicationThunkAsync = (srcUserId: string, destUserId: string, appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.COPY_APPLICATION_ASYNC)
        try {
            dispatch(copyApplicationAsync(srcUserId, destUserId, appId))
            await clClient.appCopy(srcUserId, destUserId, appId)
            dispatch(fetchApplicationsThunkAsync(destUserId))
            dispatch(copyApplicationFulfilled())
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.COPY_APPLICATION_ASYNC))
            throw error
        }
        return;
    }
}

const copyApplicationAsync = (srcUserId: string, destUserId: string, appId: string): ActionObject => {
    return {
        type: AT.COPY_APPLICATION_ASYNC,
        srcUserId: srcUserId,
        destUserId: destUserId,
        appId: appId
    }
}

const copyApplicationFulfilled = (): ActionObject => {
    return {
        type: AT.COPY_APPLICATION_FULFILLED
    }
}

export const createAppTagThunkAsync = (appId: string, tagName: string, makeLive: boolean) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_ASYNC)
        dispatch(createAppTagAsync(appId, tagName, makeLive))

        try {
            const updatedApp = await clClient.appCreateTag(appId, tagName, makeLive)
            dispatch(createAppTagFulfilled(updatedApp))
            return updatedApp
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.CREATE_APP_TAG_ASYNC))
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

const createAppTagFulfilled = (app: CLM.AppBase): ActionObject => {
    return {
        type: AT.CREATE_APP_TAG_FULFILLED,
        app: app
    }
}

const deleteApplicationAsync = (appId: string): ActionObject => {
    return {
        type: AT.DELETE_APPLICATION_ASYNC,
        appId: appId
    }
}

const deleteApplicationFulfilled = (appId: string): ActionObject => {
    return {
        type: AT.DELETE_APPLICATION_FULFILLED,
        appId: appId
    }
}

export const deleteApplicationThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteApplicationAsync(appId))
        const clClient = ClientFactory.getInstance(AT.DELETE_APPLICATION_ASYNC)

        try {
            await clClient.appsDelete(appId)
            poller.removePoll(appId)
            dispatch(deleteApplicationFulfilled(appId))
            return true;
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.DELETE_APPLICATION_ASYNC))
            return false;
        }
    }
}

const fetchApplicationsAsync = (userId: string): ActionObject => {
    return {
        type: AT.FETCH_APPLICATIONS_ASYNC,
        userId: userId
    }
}

const fetchApplicationsFulfilled = (uiAppList: CLM.UIAppList): ActionObject => {
    return {
        type: AT.FETCH_APPLICATIONS_FULFILLED,
        uiAppList: uiAppList
    }
}

export const fetchApplicationsThunkAsync = (userId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_APPLICATIONS_ASYNC)
        dispatch(fetchApplicationsAsync(userId))

        try {
            const uiAppList = await clClient.apps(userId)

            // Initialize datetime property since trainingStatus comes with app
            uiAppList.appList.apps.forEach(app => app.datetime = new Date())
            dispatch(fetchApplicationsFulfilled(uiAppList))
            return uiAppList
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_APPLICATIONS_ASYNC))
            return null
        }
    }
}

const poller = new Poller({ interval: 2000 })

export const fetchApplicationTrainingStatusThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(fetchApplicationTrainingStatusAsync(appId))
        // Wait 1 second before polling to ensure service has time to change status from previous to queued / running
        await delay(1000)

        const clClient = ClientFactory.getInstance(AT.FETCH_APPLICATION_TRAININGSTATUS_ASYNC)
        const pollConfig: IPollConfig<CLM.TrainingStatus> = {
            id: appId,
            maxDuration: 30000,
            request: async () => {
                const trainingStatus = await clClient.appGetTrainingStatus(appId)
                console.debug(`${new Date().getTime()} Poll app: ${appId}: `, trainingStatus.trainingStatus)
                return trainingStatus
            },
            isResolved: trainingStatus => [CLM.TrainingStatusCode.Completed, CLM.TrainingStatusCode.Failed].includes(trainingStatus.trainingStatus),
            onExpired: () => {
                console.warn(`Polling for app ${appId} exceeded max duration. Stopping`)
                dispatch(fetchApplicationTrainingStatusExpired(appId))
            },
            onUpdate: trainingStatus => dispatch(fetchApplicationTrainingStatusFulfilled(appId, trainingStatus)),
        }

        poller.addPoll(pollConfig)
    }
}

const fetchApplicationTrainingStatusAsync = (appId: string): ActionObject => {
    return {
        type: AT.FETCH_APPLICATION_TRAININGSTATUS_ASYNC,
        appId
    }
}

const fetchApplicationTrainingStatusFulfilled = (appId: string, trainingStatus: CLM.TrainingStatus): ActionObject => {
    return {
        type: AT.FETCH_APPLICATION_TRAININGSTATUS_FULFILLED,
        appId,
        trainingStatus
    }
}

const fetchApplicationTrainingStatusExpired = (appId: string): ActionObject => {
    return {
        type: AT.FETCH_APPLICATION_TRAININGSTATUS_EXPIRED,
        appId
    }
}

export const fetchAppSourceThunkAsync = (appId: string, packageId: string, updateState = true) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_APPSOURCE_ASYNC)
        dispatch(fetchAppSourceAsync(appId, packageId))

        try {
            const appDefinitionChange = await clClient.source(appId, packageId)

            if (appDefinitionChange.isChanged) {
                dispatch(setUpdatedAppDefinition(appId, appDefinitionChange))
                dispatch(fetchAppSourceFulfilled(appDefinitionChange.updatedAppDefinition))
                return appDefinitionChange.updatedAppDefinition
            }
            else {
                dispatch(fetchAppSourceFulfilled(appDefinitionChange.currentAppDefinition))
                return appDefinitionChange.currentAppDefinition
            }
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_APPSOURCE_ASYNC))
            return null;
        }
    }
}

const fetchAppSourceAsync = (appId: string, packageId: string): ActionObject => {
    return {
        type: AT.FETCH_APPSOURCE_ASYNC,
        appId: appId,
        packageId: packageId
    }
}

const fetchAppSourceFulfilled = (appDefinition: CLM.AppDefinition): ActionObject => {
    return {
        type: AT.FETCH_APPSOURCE_FULFILLED,
        appDefinition: appDefinition
    }
}

export const fetchTutorialsThunkAsync = (userId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_TUTORIALS_ASYNC)
        dispatch(fetchTutorialsAsync(userId))

        try {
            const tutorials = await clClient.tutorials(userId)
            dispatch(fetchTutorialsFulfilled(tutorials))
            return tutorials
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_TUTORIALS_ASYNC))
            return null;
        }
    }
}

const fetchTutorialsAsync = (userId: string): ActionObject => {
    return {
        type: AT.FETCH_TUTORIALS_ASYNC,
        userId: userId
    }
}

const fetchTutorialsFulfilled = (tutorials: CLM.AppBase[]): ActionObject => {
    return {
        type: AT.FETCH_TUTORIALS_FULFILLED,
        tutorials: tutorials
    }
}

// --------------------------
// appExtract
// --------------------------
const fetchExtractionsAsync = (): ActionObject => {
    return {
        type: AT.FETCH_EXTRACTIONS_ASYNC
    }
}

const fetchExtractionsFulfilled = (extractResponses: CLM.ExtractResponse[]): ActionObject => {
    return {
        type: AT.FETCH_EXTRACTIONS_FULFILLED,
        extractResponses
    }
}
export const fetchExtractionsThunkAsync = (appId: string, userUtterances: string[]) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_EXTRACTIONS_ASYNC)
        dispatch(fetchExtractionsAsync())

        try {
            const extractResponses = await clClient.appExtract(appId, userUtterances);
            dispatch(fetchExtractionsFulfilled(extractResponses));
            return extractResponses;
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_EXTRACTIONS_ASYNC))
            return false;
        }
    }
}