/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import {
    BotInfo,
    EntityBase,
    ActionBase,
    TrainDialog,
    LogDialog,
    Session,
    Teach,
    TrainingStatus,
    TrainingStatusCode,
    AppDefinition, 
    UIAppList,
    TeachWithHistory,
    AppBase
} from '@conversationlearner/models'
import { Dispatch } from 'redux'
import * as ClientFactory from '../services/clientFactory'
import { setErrorDisplay } from './displayActions'
import { Poller, IPollConfig } from '../services/poller';
import { delay } from '../util';
import { AxiosError } from 'axios';

// ----------------------------------------
// Train Dialogs
// ----------------------------------------
export const fetchAllTrainDialogsThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_TRAIN_DIALOGS_ASYNC)
        dispatch(fetchAllTrainDialogsAsync(appId))

        try {
            const trainDialogs = await clClient.trainDialogs(appId)
            dispatch(fetchAllTrainDialogsFulfilled(trainDialogs))
            return trainDialogs
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_TRAIN_DIALOGS_ASYNC))
            return null;
        }
    }
}

const fetchAllTrainDialogsAsync = (appId: string): ActionObject => {
    return {
        type: AT.FETCH_TRAIN_DIALOGS_ASYNC,
        appId: appId
    }
}

const fetchAllTrainDialogsFulfilled = (trainDialogs: TrainDialog[]): ActionObject => {
    return {
        type: AT.FETCH_TRAIN_DIALOGS_FULFILLED,
        allTrainDialogs: trainDialogs
    }
}

// ----------------------------------------
// History
// ----------------------------------------
export const fetchHistoryThunkAsync = (appId: string, trainDialog: TrainDialog, userName: string, userId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_HISTORY_ASYNC)
        dispatch(fetchHistoryAsync(appId, trainDialog, userName, userId))

        try {
            const teachWithHistory = await clClient.history(appId, trainDialog, userName, userId)
            dispatch(fetchHistoryFulfilled(teachWithHistory))
            return teachWithHistory
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_HISTORY_ASYNC))
            return null;
        }
    }
}

const fetchHistoryAsync = (appId: string, trainDialog: TrainDialog, userName: string, userId: string): ActionObject => {
    return {
        type: AT.FETCH_HISTORY_ASYNC,
        appId: appId,
        userName: userName,
        userId: userId,
        trainDialog: trainDialog
    }
}

const fetchHistoryFulfilled = (teachWithHistory: TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_HISTORY_FULFILLED,
        teachWithHistory: teachWithHistory
    }
}

// ----------------------------------------
// Log Dialogs
// ----------------------------------------
export const fetchAllLogDialogsThunkAsync = (app: AppBase, packageId: string) => {
    return async (dispatch: Dispatch<any>) => {
        // Note: In future change fetch log dialogs to default to all package if packageId is dev
        const commaSeparatedPackageIds = (packageId === app.devPackageId)
            ? (app.packageVersions || []).map(pv => pv.packageId).concat(packageId).join(',')
            : packageId

        const clClient = ClientFactory.getInstance(AT.FETCH_LOG_DIALOGS_ASYNC)
        dispatch(fetchAllLogDialogsAsync(app.appId, commaSeparatedPackageIds))

        try {
            const logDialogs = await clClient.logDialogs(app.appId, commaSeparatedPackageIds)
            dispatch(fetchAllLogDialogsFulfilled(logDialogs))
            return logDialogs
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_LOG_DIALOGS_ASYNC))
            return null;
        }
    }
}

const fetchAllLogDialogsAsync = (appId: string, packageId: string): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOGS_ASYNC,
        appId: appId,
        packageId: packageId
    }
}

const fetchAllLogDialogsFulfilled = (logDialogs: LogDialog[]): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOGS_FULFILLED,
        allLogDialogs: logDialogs
    }
}

// ----------------------------------------
// Bot Info
// ----------------------------------------
const fetchBotInfoAsync = (browserId: string, appId?: string): ActionObject => {
    return {
        type: AT.FETCH_BOTINFO_ASYNC,
        browserId,
        appId
    }
}

const fetchBotInfoFulfilled = (botInfo: BotInfo, browserId: string): ActionObject => {
    return {
        type: AT.FETCH_BOTINFO_FULFILLED,
        botInfo,
        browserId
    }
}

export const fetchBotInfoThunkAsync = (browserId: string, appId?: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_BOTINFO_ASYNC)
        dispatch(fetchBotInfoAsync(browserId, appId))

        try {
            const botInfo = await clClient.getBotInfo(browserId, appId)
            dispatch(fetchBotInfoFulfilled(botInfo, browserId))
            return botInfo
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_BOTINFO_ASYNC))
            throw error
        }
    }
}

// ----------------------------------------
// Applications
// ----------------------------------------
const fetchApplicationsAsync = (userId: string): ActionObject => {
    return {
        type: AT.FETCH_APPLICATIONS_ASYNC,
        userId: userId
    }
}

const fetchApplicationsFulfilled = (uiAppList: UIAppList): ActionObject => {
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

            // Initialize datatime property since trainingStatus comes with app
            uiAppList.appList.apps.forEach(app => app.datetime = new Date())
            dispatch(fetchApplicationsFulfilled(uiAppList))
            return uiAppList
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_APPLICATIONS_ASYNC))
            return null;
        }
    }
}

// ----------------------------------------
// Tutorials
// ----------------------------------------
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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_TUTORIALS_ASYNC))
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

const fetchTutorialsFulfilled = (tutorials: AppBase[]): ActionObject => {
    return {
        type: AT.FETCH_TUTORIALS_FULFILLED,
        tutorials: tutorials
    }
}

// ----------------------------------------
// Training Status
// ----------------------------------------
const poller = new Poller({ interval: 2000 })

export const fetchApplicationTrainingStatusThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(fetchApplicationTrainingStatusAsync(appId))
        // Wait 1 second before polling to ensure service has time to change status from previous to queued / running
        await delay(1000)

        const clClient = ClientFactory.getInstance(AT.FETCH_APPLICATION_TRAININGSTATUS_ASYNC)
        const pollConfig: IPollConfig<TrainingStatus> = {
            id: appId,
            maxDuration: 30000,
            request: async () => {
                const trainingStatus = await clClient.appGetTrainingStatus(appId)
                console.log(`${new Date().getTime()} Poll app: ${appId}: `, trainingStatus.trainingStatus)
                return trainingStatus
            },
            isResolved: trainingStatus => [TrainingStatusCode.Completed, TrainingStatusCode.Failed].includes(trainingStatus.trainingStatus),
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

const fetchApplicationTrainingStatusFulfilled = (appId: string, trainingStatus: TrainingStatus): ActionObject => {
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

// -------------------------
//  Entities
// -------------------------
const fetchAllEntitiesAsync = (appId: string): ActionObject => {
    return {
        type: AT.FETCH_ENTITIES_ASYNC,
        appId: appId
    }
}

const fetchAllEntitiesFulfilled = (entities: EntityBase[]): ActionObject => {
    return {
        type: AT.FETCH_ENTITIES_FULFILLED,
        allEntities: entities
    }
}

export const fetchAllEntitiesThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_ENTITIES_ASYNC)
        dispatch(fetchAllEntitiesAsync(appId))

        try {
            const entities = await clClient.entities(appId)
            dispatch(fetchAllEntitiesFulfilled(entities))
            return entities
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_ENTITIES_ASYNC))
            return null;
        }
    }
}

// -------------------------
//  App Source
// -------------------------
export const fetchAppSourceThunkAsync = (appId: string, packageId: string, updateState = true) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_APPSOURCE_ASYNC)
        dispatch(fetchAppSourceAsync(appId, packageId))

        try {
            const appDefinition = await clClient.source(appId, packageId)
            dispatch(fetchAppSourceFulfilled(appDefinition))
            return appDefinition
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_APPSOURCE_ASYNC))
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

const fetchAppSourceFulfilled = (appDefinition: AppDefinition): ActionObject => {
    return {
        type: AT.FETCH_APPSOURCE_FULFILLED,
        appDefinition: appDefinition
    }
}

// -------------------------
//  Actions
// -------------------------
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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_ACTIONS_ASYNC))
            return null;
        }
    }
}

// -------------------------
//  Chat Sessions
// -------------------------
export const fetchAllChatSessionsThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_TEACH_SESSIONS_ASYNC)
        dispatch(fetchAllChatSessionsAsync(appId))

        try {
            const chatSessions = await clClient.chatSessions(appId)
            dispatch(fetchAllChatSessionsFulfilled(chatSessions))
            return chatSessions
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_TEACH_SESSIONS_ASYNC))
            return null;
        }
    }
}

const fetchAllChatSessionsAsync = (appId: string): ActionObject => {
    return {
        type: AT.FETCH_CHAT_SESSIONS_ASYNC,
        appId: appId
    }
}

const fetchAllChatSessionsFulfilled = (sessions: Session[]): ActionObject => {
    return {
        type: AT.FETCH_CHAT_SESSIONS_FULFILLED,
        allSessions: sessions
    }
}

// -------------------------
//  Teach Sessions
// -------------------------
export const fetchAllTeachSessionsThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_TEACH_SESSIONS_ASYNC)
        dispatch(fetchAllTeachSessionsAsync(appId))

        try {
            const teachSessions = await clClient.teachSessions(appId)
            dispatch(fetchAllTeachSessionsFulfilled(teachSessions))
            return teachSessions
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_TEACH_SESSIONS_ASYNC))
            return null;
        }
    }
}

const fetchAllTeachSessionsAsync = (appId: string): ActionObject => {
    return {
        type: AT.FETCH_TEACH_SESSIONS_ASYNC,
        appId: appId
    }
}

const fetchAllTeachSessionsFulfilled = (teachSessions: Teach[]): ActionObject => {
    return {
        type: AT.FETCH_TEACH_SESSIONS_FULFILLED,
        allTeachSessions: teachSessions
    }
}

// ---------------------------------------
// Validation Checks
// --------------------------------------
export const fetchEntityDeleteValidationThunkAsync = (appId: string, packageId: string, entityId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_ENTITY_DELETE_VALIDATION_ASYNC)
        dispatch(fetchEntityDeleteValidationAsync(appId, packageId, entityId))

        try {
            const invalidTrainDialogIds = await clClient.entitiesDeleteValidation(appId, packageId, entityId)
            dispatch(fetchEntityDeleteValidationFulfilled())
            return invalidTrainDialogIds
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_ENTITY_DELETE_VALIDATION_ASYNC))
            return null;
        }
    }
}

const fetchEntityDeleteValidationAsync = (appId: string, packageId: string, entityId: string): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_DELETE_VALIDATION_ASYNC,
        appId: appId,
        packageId: packageId,
        entityId: entityId
    }
}

const fetchEntityDeleteValidationFulfilled = (): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_DELETE_VALIDATION_FULFILLED
    }
}

// -------------------------
//  Entity Edit Validation
// -------------------------
export const fetchEntityEditValidationThunkAsync = (appId: string, packageId: string, entity: EntityBase) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_ENTITY_EDIT_VALIDATION_ASYNC)
        dispatch(fetchEntityEditValidationAsync(appId, packageId, entity))

        try {
            const invalidTrainDialogIds = await clClient.entitiesUpdateValidation(appId, packageId, entity)
            dispatch(fetchEntityEditValidationFulfilled())
            return invalidTrainDialogIds
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_ENTITY_EDIT_VALIDATION_ASYNC))
            return null;
        }
    }
}

const fetchEntityEditValidationAsync = (appId: string, packageId: string, entity: EntityBase): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_EDIT_VALIDATION_ASYNC,
        appId: appId,
        packageId: packageId,
        entity: entity
    }
}

const fetchEntityEditValidationFulfilled = (): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_EDIT_VALIDATION_FULFILLED
    }
}

// --------------------------
//  Action Delete Validation
// --------------------------
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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_ACTION_DELETE_VALIDATION_ASYNC))
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

// -------------------------
//  Action Edit Validation
// -------------------------
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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.FETCH_ACTION_EDIT_VALIDATION_ASYNC))
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