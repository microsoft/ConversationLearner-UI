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
    TeachWithHistory
} from 'blis-models'
import { Dispatch } from 'redux'
import * as ClientFactory from '../services/clientFactory'
import { setErrorDisplay } from './displayActions'

export const fetchAllTrainDialogsAsync = (key: string, blisAppID: string): ActionObject => {
    return {
        type: AT.FETCH_TRAIN_DIALOGS_ASYNC,
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllTrainDialogsFulfilled = (trainDialogs: TrainDialog[]): ActionObject => {
    return {
        type: AT.FETCH_TRAIN_DIALOGS_FULFILLED,
        allTrainDialogs: trainDialogs
    }
}

export const fetchHistoryThunkAsync = (appId: string, trainDialog: TrainDialog, userName: string, userId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.FETCH_HISTORY_ASYNC)
        dispatch(fetchHistoryAsync(appId, trainDialog, userName, userId))

        const teachWithHistory = await blisClient.history(appId, trainDialog, userName, userId)
        dispatch(fetchHistoryFulfilled(teachWithHistory))
        return teachWithHistory
    }
}

export const fetchHistoryAsync = (blisAppID: string, trainDialog: TrainDialog, userName: string, userId: string): ActionObject => {
    return {
        type: AT.FETCH_HISTORY_ASYNC,
        blisAppID: blisAppID,
        userName: userName,
        userId: userId,
        trainDialog: trainDialog
    }
}

export const fetchHistoryFulfilled = (teachWithHistory: TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_HISTORY_FULFILLED,
        teachWithHistory: teachWithHistory
    }
}

export const fetchAllLogDialogsAsync = (key: string, blisAppID: string, packageId: string): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOGS_ASYNC,
        key: key,
        blisAppID: blisAppID,
        packageId: packageId
    }
}

export const fetchAllLogDialogsFulfilled = (logDialogs: LogDialog[]): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOGS_FULFILLED,
        allLogDialogs: logDialogs
    }
}

export const fetchBotInfoAsync = (): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_BOTINFO_ASYNC
    }
}

export const fetchBotInfoFulfilled = (botInfo: BotInfo): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_BOTINFO_FULFILLED,
        botInfo: botInfo
    }
}

export const fetchApplicationsAsync = (key: string, userId: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
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

export const fetchApplicationTrainingStatusAsync = (appId: string): ActionObject => {
    return {
        type: AT.FETCH_APPLICATION_TRAININGSTATUS_ASYNC,
        appId
    }
}

export const fetchApplicationTrainingStatusFulfilled = (appId: string, trainingStatus: TrainingStatus): ActionObject => {
    return {
        type: AT.FETCH_APPLICATION_TRAININGSTATUS_FULFILLED,
        appId,
        trainingStatus
    }
}

export const fetchApplicationTrainingStatusExpired = (appId: string): ActionObject => {
    return {
        type: AT.FETCH_APPLICATION_TRAININGSTATUS_EXPIRED,
        appId
    }
}

const pollTrainingStatusUntilResolvedOrMaxDuration = (dispatch: Dispatch<any>, appId: string, resolvedStates: TrainingStatusCode[], interval: number, maxDuration: number): Promise<void> => {
    const start = new Date()
    const end = start.getTime() + maxDuration
    const blisClient = ClientFactory.getInstance(null)
    
    return new Promise<void>((resolve, reject) => {
        const timerId = setInterval(async () => {
            // If current time is after max allowed polling duration then resolve
            const now = (new Date()).getTime()
            if (now >= end) {
                console.warn(`Polling exceeded max duration. Stopping`)
                
                if (timerId) {
                    clearInterval(timerId)
                }

                dispatch(fetchApplicationTrainingStatusExpired(appId))
                resolve()
            }

            // Get training status and if it's one of the resolved states resolve promise
            const trainingStatus = await blisClient.appGetTrainingStatus(appId)
            console.log(`Poll app: ${appId} training status: `, end, now, trainingStatus.trainingStatus)
            dispatch(fetchApplicationTrainingStatusFulfilled(appId, trainingStatus))

            if (resolvedStates.includes(trainingStatus.trainingStatus)) {
                if (timerId) {
                    clearInterval(timerId)
                }
                resolve()
            }
        }, interval)
    })
}

const delay = <T>(ms: number, value: T = null): Promise<T> => new Promise<T>(resolve => setTimeout(() => resolve(value), ms))

export const fetchApplicationTrainingStatusThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(fetchApplicationTrainingStatusAsync(appId))
        // Wait 1 second before polling to ensure service has time to change status from previous to queued / running
        await delay(1000)
        pollTrainingStatusUntilResolvedOrMaxDuration(dispatch, appId, [TrainingStatusCode.Completed, TrainingStatusCode.Failed], 2000, 30000)
    }
}

export const fetchAllEntitiesAsync = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_ENTITIES_ASYNC,
        blisAppID: blisAppID
    }
}

export const fetchAllEntitiesFulfilled = (entities: EntityBase[]): ActionObject => {
    return {
        type: AT.FETCH_ENTITIES_FULFILLED,
        allEntities: entities
    }
}

export const fetchAppSourceAsync = (key: string, blisAppID: string, packageId: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_APPSOURCE_ASYNC,
        blisAppID: blisAppID,
        packageId: packageId
    }
}

export const fetchAppSourceFulfilled = (appDefinition: AppDefinition): ActionObject => {
    return {
        type: AT.FETCH_APPSOURCE_FULFILLED,
        appDefinition: appDefinition
    }
}

export const fetchAllActionsAsync = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_ACTIONS_ASYNC,
        blisAppID: blisAppID
    }
}

export const fetchAllActionsFulfilled = (actions: ActionBase[]): ActionObject => {
    return {
        type: AT.FETCH_ACTIONS_FULFILLED,
        allActions: actions
    }
}

export const fetchAllChatSessionsAsync = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_CHAT_SESSIONS_ASYNC,
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllChatSessionsFulfilled = (sessions: Session[]): ActionObject => {
    return {
        type: AT.FETCH_CHAT_SESSIONS_FULFILLED,
        allSessions: sessions
    }
}

export const fetchAllTeachSessionsAsync = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_TEACH_SESSIONS_ASYNC,
        key: key,
        blisAppID: blisAppID
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
        const blisClient = ClientFactory.getInstance(AT.FETCH_ENTITY_DELETE_VALIDATION_ASYNC)
        dispatch(fetchEntityDeleteValidationAsync(appId, packageId, entityId))

        try {
            const invalidTrainDialogIds = await blisClient.entitiesDeleteValidation(appId, packageId, entityId)
            dispatch(fetchEntityDeleteValidationFulfilled())
            return invalidTrainDialogIds
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.FETCH_ENTITY_DELETE_VALIDATION_ASYNC))
            return null;
        }
    }
}

export const fetchEntityDeleteValidationAsync = (appId: string, packageId: string, entityId: string): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_DELETE_VALIDATION_ASYNC,
        appId: appId,
        packageId: packageId,
        entityId: entityId
    }
}

export const fetchEntityDeleteValidationFulfilled = (): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_DELETE_VALIDATION_FULFILLED
    }
}

// -----------------------------------------------

export const fetchEntityEditValidationThunkAsync = (appId: string, packageId: string, entity: EntityBase) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.FETCH_ENTITY_EDIT_VALIDATION_ASYNC)
        dispatch(fetchEntityEditValidationAsync(appId, packageId, entity))

        try {
            const invalidTrainDialogIds = await blisClient.entitiesUpdateValidation(appId, packageId, entity)
            dispatch(fetchEntityEditValidationFulfilled())
            return invalidTrainDialogIds
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.FETCH_ENTITY_EDIT_VALIDATION_ASYNC))
            return null;
        }
    }
}

export const fetchEntityEditValidationAsync = (appId: string, packageId: string, entity: EntityBase): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_EDIT_VALIDATION_ASYNC,
        appId: appId,
        packageId: packageId,
        entity: entity
    }
}

export const fetchEntityEditValidationFulfilled = (): ActionObject => {
    return {
        type: AT.FETCH_ENTITY_EDIT_VALIDATION_FULFILLED
    }
}

// -----------------------------------------------
export const fetchActionDeleteValidationThunkAsync = (appId: string, packageId: string, actionId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.FETCH_ACTION_DELETE_VALIDATION_ASYNC)
        dispatch(fetchActionDeleteValidationAsync(appId, packageId, actionId))

        try {
            const invalidTrainDialogIds = await blisClient.actionsDeleteValidation(appId, packageId, actionId)
            dispatch(fetchActionDeleteValidationFulfilled())
            return invalidTrainDialogIds
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.FETCH_ACTION_DELETE_VALIDATION_ASYNC))
            return null;
        }
    }
}

export const fetchActionDeleteValidationAsync = (appId: string, packageId: string, actionId: string): ActionObject => {
    return {
        type: AT.FETCH_ACTION_DELETE_VALIDATION_ASYNC,
        appId: appId,
        packageId: packageId,
        actionId: actionId
    }
}

export const fetchActionDeleteValidationFulfilled = (): ActionObject => {
    return {
        type: AT.FETCH_ACTION_DELETE_VALIDATION_FULFILLED
    }
}

// -----------------------------------------------

export const fetchActionEditValidationThunkAsync = (appId: string, packageId: string, action: ActionBase) => {
    return async (dispatch: Dispatch<any>) => {
        const blisClient = ClientFactory.getInstance(AT.FETCH_ACTION_EDIT_VALIDATION_ASYNC)
        dispatch(fetchActionEditValidationAsync(appId, packageId, action))

        try {
            const invalidTrainDialogIds = await blisClient.actionsUpdateValidation(appId, packageId, action)
            dispatch(fetchActionEditValidationFulfilled())
            return invalidTrainDialogIds
        } catch (e) {
            const error = e as Error
            dispatch(setErrorDisplay(ErrorType.Error, error.name, [error.message], AT.FETCH_ACTION_EDIT_VALIDATION_ASYNC))
            return null;
        }
    }
}

export const fetchActionEditValidationAsync = (appId: string, packageId: string, action: ActionBase): ActionObject => {
    return {
        type: AT.FETCH_ACTION_EDIT_VALIDATION_ASYNC,
        appId: appId,
        packageId: packageId,
        action: action
    }
}

export const fetchActionEditValidationFulfilled = (): ActionObject => {
    return {
        type: AT.FETCH_ACTION_EDIT_VALIDATION_FULFILLED
    }
}

// -----------------------------------------------
