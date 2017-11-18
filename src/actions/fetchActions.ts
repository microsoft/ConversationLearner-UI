import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import {
    BlisAppBase,
    BotInfo,
    EntityBase,
    ActionBase,
    TrainDialog,
    LogDialog,
    Session,
    Teach,
    TrainingStatus,
    TrainingStatusCode
} from 'blis-models'
import { Dispatch } from 'redux'

// TODO: Need to isolate usage of blis client to single layer
import BlisClient from '../services/blisClient'
import ApiConfig from '../epics/config'

const blisClient = new BlisClient(ApiConfig.BlisClientEnpoint, () => '')

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

export const fetchAllLogDialogsAsync = (key: string, blisAppID: string): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOGS_ASYNC,
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllLogDialogsFulfilled = (logDialogs: LogDialog[]): ActionObject => {
    return {
        type: AT.FETCH_LOG_DIALOGS_FULFILLED,
        allLogDialogs: logDialogs
    }
}

export const fetchBotInfoAsync = (): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_BOTINFO_ASYNC
    }
}

export const fetchBotInfoFulfilled = (botInfo: BotInfo): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_BOTINFO_FULFILLED,
        botInfo: botInfo
    }
}

export const fetchApplicationsAsync = (key: string, userId: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_APPLICATIONS_ASYNC,
        key: key,
        userId: userId
    }
}

export const fetchApplicationsFulfilled = (apps: BlisAppBase[]): ActionObject => {
    return {
        type: AT.FETCH_APPLICATIONS_FULFILLED,
        allBlisApps: apps
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

const delay = <T>(ms: number, value: T = null): Promise<T> => new Promise<T>(resolve => setTimeout(() => resolve(value), ms))

export const fetchApplicationTrainingStatusThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(fetchApplicationTrainingStatusAsync(appId))

        // Simulate queued
        await delay(1000)
        const trainingStatus1: TrainingStatus = {
            trainingStatus: TrainingStatusCode.Queued,
            trainingFailureMessage: null
        }

        dispatch(fetchApplicationTrainingStatusFulfilled(appId, trainingStatus1))

        // Simulate running
        await delay(1000)
        const trainingStatus2: TrainingStatus = {
            trainingStatus: TrainingStatusCode.Running,
            trainingFailureMessage: null
        }

        dispatch(fetchApplicationTrainingStatusFulfilled(appId, trainingStatus2))

        // Simulate running
        await delay(1000)
        const trainingStatus3: TrainingStatus = {
            trainingStatus: TrainingStatusCode.Completed,
            trainingFailureMessage: null
        }

        dispatch(fetchApplicationTrainingStatusFulfilled(appId, trainingStatus3))

        // Simulate actual
        await delay(1000)
        const trainingStatus = await blisClient.appGetTrainingStatus(appId)
        dispatch(fetchApplicationTrainingStatusFulfilled(appId, trainingStatus))
    }
}

export const fetchAllEntitiesAsync = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_ENTITIES_ASYNC,
        key: key,
        blisAppID: blisAppID
    }
}

export const fetchAllEntitiesFulfilled = (entities: EntityBase[]): ActionObject => {
    return {
        type: AT.FETCH_ENTITIES_FULFILLED,
        allEntities: entities
    }
}

export const fetchAllActionsAsync = (key: string, blisAppID: string): ActionObject => {
    //needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_ACTIONS_ASYNC,
        key: key,
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

