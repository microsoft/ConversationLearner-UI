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
import * as ClientFactory from '../services/clientFactory'
import { Activity } from 'botframework-directlinejs';

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
        const blisClient = ClientFactory.getInstance(AT.FETCH_HISTORY_ASYNC,)
        dispatch(fetchHistoryAsync(appId, trainDialog, userName, userId))

        const activities = await blisClient.history(appId, trainDialog, userName, userId)
        dispatch(fetchHistoryFulfilled(activities))
        return activities
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

export const fetchHistoryFulfilled = (activities: Activity[]): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_HISTORY_FULFILLED,
        activities: activities
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

