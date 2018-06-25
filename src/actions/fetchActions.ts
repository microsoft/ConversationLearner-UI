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

// ----------------------------------------
// Train Dialogs
// ----------------------------------------
export const fetchAllTrainDialogsAsync = (clAppID: string): ActionObject => {
    return {
        type: AT.FETCH_TRAIN_DIALOGS_ASYNC,
        clAppID: clAppID
    }
}

export const fetchAllTrainDialogsFulfilled = (trainDialogs: TrainDialog[]): ActionObject => {
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
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.FETCH_HISTORY_ASYNC))
            return null;
        }
    }
}

const fetchHistoryAsync = (clAppID: string, trainDialog: TrainDialog, userName: string, userId: string): ActionObject => {
    return {
        type: AT.FETCH_HISTORY_ASYNC,
        clAppID: clAppID,
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
export const fetchAllLogDialogsAsync = (key: string, app: AppBase, packageId: string): ActionObject => {
      
    // Note: In future change fetch log dialogs to default to all package if packageId is dev
    let allPackages = (packageId === app.devPackageId)
            ? app.packageVersions.map(pv => pv.packageId).concat(packageId).join(',')
            : packageId
    
    return {
        type: AT.FETCH_LOG_DIALOGS_ASYNC,
        key: key,
        clAppID: app.appId,
        packageId: allPackages
    }
}

export const fetchAllLogDialogsFulfilled = (logDialogs: LogDialog[]): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOGS_FULFILLED,
        allLogDialogs: logDialogs
    }
}

// ----------------------------------------
// Bot Info
// ----------------------------------------
export const fetchBotInfoAsync = (browserId: string): ActionObject => {
    return {
        type: AT.FETCH_BOTINFO_ASYNC,
        browserId: browserId
    }
}

export const fetchBotInfoFulfilled = (botInfo: BotInfo, browserId: string): ActionObject => {
    return {
        type: AT.FETCH_BOTINFO_FULFILLED,
        botInfo: botInfo,
        browserId: browserId
    }
}

// ----------------------------------------
// Applications
// ----------------------------------------
export const fetchApplicationsAsync = (userId: string): ActionObject => {
    return {
        type: AT.FETCH_APPLICATIONS_ASYNC,
        userId: userId
    }
}

export const fetchApplicationsFulfilled = (uiAppList: UIAppList): ActionObject => {
    return {
        type: AT.FETCH_APPLICATIONS_FULFILLED,
        uiAppList: uiAppList
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
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.FETCH_TUTORIALS_ASYNC))
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
export const fetchAllEntitiesAsync = (clAppID: string): ActionObject => {
    return {
        type: AT.FETCH_ENTITIES_ASYNC,
        clAppID: clAppID
    }
}

export const fetchAllEntitiesFulfilled = (entities: EntityBase[]): ActionObject => {
    return {
        type: AT.FETCH_ENTITIES_FULFILLED,
        allEntities: entities
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
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.FETCH_APPSOURCE_ASYNC))
            return null;
        }
    }
}

const fetchAppSourceAsync = (appId: string, packageId: string): ActionObject => {
    return {
        type: AT.FETCH_APPSOURCE_ASYNC,
        clAppID: appId,
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
export const fetchAllActionsAsync = (clAppID: string): ActionObject => {
    return {
        type: AT.FETCH_ACTIONS_ASYNC,
        clAppID: clAppID
    }
}

export const fetchAllActionsFulfilled = (actions: ActionBase[]): ActionObject => {
    return {
        type: AT.FETCH_ACTIONS_FULFILLED,
        allActions: actions
    }
}

// -------------------------
//  Chat Sessions
// -------------------------
export const fetchAllChatSessionsAsync = (clAppID: string): ActionObject => {
    return {
        type: AT.FETCH_CHAT_SESSIONS_ASYNC,
        clAppID: clAppID
    }
}

export const fetchAllChatSessionsFulfilled = (sessions: Session[]): ActionObject => {
    return {
        type: AT.FETCH_CHAT_SESSIONS_FULFILLED,
        allSessions: sessions
    }
}

// -------------------------
//  Teach Sessions
// -------------------------
export const fetchAllTeachSessionsAsync = (key: string, clAppID: string): ActionObject => {
    return {
        type: AT.FETCH_TEACH_SESSIONS_ASYNC,
        key: key,
        clAppID: clAppID
    }
}

export const fetchAllTeachSessionsFulfilled = (teachSessions: Teach[]): ActionObject => {
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
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.FETCH_ENTITY_DELETE_VALIDATION_ASYNC))
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
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.FETCH_ENTITY_EDIT_VALIDATION_ASYNC))
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
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.FETCH_ACTION_DELETE_VALIDATION_ASYNC))
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
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.FETCH_ACTION_EDIT_VALIDATION_ASYNC))
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