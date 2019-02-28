/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { Dispatch } from 'redux'
import * as ClientFactory from '../services/clientFactory'
import { TrainDialog, AppBase, TeachWithHistory, UIScoreResponse, ExtractResponse, UserInput, TextVariation } from '@conversationlearner/models'
import { PartialTrainDialog } from '../types/models'
import { fetchApplicationTrainingStatusThunkAsync } from './appActions'
import { AxiosError } from 'axios'
import { setErrorDisplay } from './displayActions'

// --------------------------
// CreateTrainDialog
// --------------------------
export const createTrainDialogThunkAsync = (appId: string, trainDialog: TrainDialog) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.CREATE_TRAIN_DIALOG_ASYNC)
        dispatch(createTrainDialogAsync(appId, trainDialog))

        try {
            let createdTrainDialog = await clClient.trainDialogsCreate(appId, trainDialog)
            dispatch(createTrainDialogFulfilled(createdTrainDialog))
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            return createdTrainDialog
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.CREATE_TRAIN_DIALOG_ASYNC))
            throw error
        }
    }
}

const createTrainDialogAsync = (appId: string, trainDialog: TrainDialog): ActionObject =>
    ({
        type: AT.CREATE_TRAIN_DIALOG_ASYNC,
        appId,
        trainDialog
    })

const createTrainDialogFulfilled = (trainDialog: TrainDialog): ActionObject =>
    ({
        type: AT.CREATE_TRAIN_DIALOG_FULFILLED,
        trainDialog: trainDialog
    })

// --------------------------
// EditTrainDialog
// --------------------------
export const editTrainDialogThunkAsync = (appId: string, trainDialog: PartialTrainDialog) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_TRAINDIALOG_ASYNC)
        trainDialog.lastModifiedDateTime = `${new Date().toISOString().slice(0, 19)}+00:00`
        dispatch(editTrainDialogAsync(appId, trainDialog))

        try {
            await clClient.trainDialogEdit(appId, trainDialog)
            dispatch(editTrainDialogFulfilled(appId, trainDialog))
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            return trainDialog
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.EDIT_TRAINDIALOG_ASYNC))
            throw error
        }
    }
}

const editTrainDialogAsync = (appId: string, trainDialog: PartialTrainDialog): ActionObject => {
    return {
        type: AT.EDIT_TRAINDIALOG_ASYNC,
        appId: appId,
        trainDialog: trainDialog
    }
}

const editTrainDialogFulfilled = (appId: string, trainDialog: PartialTrainDialog): ActionObject => {
    return {
        type: AT.EDIT_TRAINDIALOG_FULFILLED,
        appId,
        trainDialog: trainDialog
    }
}

// ----------------------------------------
// FetchTrainDialog
// ----------------------------------------
export const fetchTrainDialogThunkAsync = (appId: string, trainDialogId: string, replaceLocal: boolean) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_TRAIN_DIALOG_ASYNC)
        dispatch(fetchTrainDialogAsync(appId, trainDialogId))

        try {
            const trainDialog = await clClient.trainDialog(appId, trainDialogId)
            dispatch(fetchTrainDialogFulfilled(trainDialog, replaceLocal))
            return trainDialog
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_TRAIN_DIALOG_ASYNC))
            return null;
        }
    }
}

const fetchTrainDialogAsync = (appId: string, trainDialogId: string): ActionObject => {
    return {
        type: AT.FETCH_TRAIN_DIALOG_ASYNC,
        appId: appId,
        trainDialogId: trainDialogId
    }
}

const fetchTrainDialogFulfilled = (trainDialog: TrainDialog, replaceLocal: boolean): ActionObject => {
    return {
        type: AT.FETCH_TRAIN_DIALOG_FULFILLED,
        trainDialog,
        replaceLocal
    }
}

// --------------------------
// ScoreFromHistory
// --------------------------
export const scoreFromHistoryThunkAsync = (appId: string, trainDialog: TrainDialog) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_SCOREFROMHISTORY_ASYNC)
        dispatch(scoreFromHistoryAsync(appId, trainDialog))

        try {
            let uiScoreResponse = await clClient.trainDialogScoreFromHistory(appId, trainDialog)
            dispatch(scoreFromHistoryFulfilled(uiScoreResponse))
            return uiScoreResponse
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_SCOREFROMHISTORY_ASYNC))
            throw error
        }
    }
}

const scoreFromHistoryAsync = (appId: string, trainDialog: TrainDialog): ActionObject => {
    return {
        type: AT.FETCH_SCOREFROMHISTORY_ASYNC,
        appId,
        trainDialog
    }
}

const scoreFromHistoryFulfilled = (uiScoreResponse: UIScoreResponse): ActionObject => {
    return {
        type: AT.FETCH_SCOREFROMHISTORY_FULFILLED,
        uiScoreResponse
    }
}

// --------------------------
// ExtractFromHistory
// --------------------------
export const extractFromHistoryThunkAsync = (appId: string, trainDialog: TrainDialog, userInput: UserInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_EXTRACTFROMHISTORY_ASYNC)
        dispatch(extractFromHistoryAsync(appId, trainDialog, userInput))

        try {
            let extractResponse = await clClient.trainDialogExtractFromHistory(appId, trainDialog, userInput)
            dispatch(extractFromHistoryFulfilled(extractResponse))
            return extractResponse
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_EXTRACTFROMHISTORY_ASYNC))
            throw error
        }
    }
}

const extractFromHistoryAsync = (appId: string, trainDialog: TrainDialog, userInput: UserInput): ActionObject => {
    return {
        type: AT.FETCH_EXTRACTFROMHISTORY_ASYNC,
        appId,
        trainDialog,
        userInput
    }
}

const extractFromHistoryFulfilled = (extractResponse: ExtractResponse): ActionObject => {
    return {
        type: AT.FETCH_EXTRACTFROMHISTORY_FULFILLED,
        extractResponse
    }
}

// --------------------------
// TrainDialogReplay
// --------------------------
export const trainDialogReplayThunkAsync = (appId: string, trainDialog: TrainDialog) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_TRAINDIALOGREPLAY_ASYNC)
        dispatch(trainDialogReplayAsync(appId, trainDialog))

        try {
            let updatedTrainDialog = await clClient.trainDialogReplay(appId, trainDialog)
            dispatch(trainDialogReplayFulfilled(updatedTrainDialog))
            return updatedTrainDialog
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_TRAINDIALOGREPLAY_ASYNC))
            throw error
        }
    }
}

const trainDialogReplayAsync = (appId: string, trainDialog: TrainDialog): ActionObject => {
    return {
        type: AT.FETCH_TRAINDIALOGREPLAY_ASYNC,
        appId,
        trainDialog
    }
}

const trainDialogReplayFulfilled = (trainDialog: TrainDialog): ActionObject => {
    return {
        type: AT.FETCH_TRAINDIALOGREPLAY_FULFILLED,
        trainDialog
    }
}

// --------------------------
// fetchTextVariationConflict
// --------------------------
export const fetchTextVariationConflictThunkAsync = (appId: string, trainDialogId: string, textVariation: TextVariation, filteredDialogId: string | null) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_TEXTVARIATION_CONFLICT_ASYNC)
        dispatch(fetchTextVariationConflictAsync(appId, trainDialogId, textVariation))

        try {
            let conflict = await clClient.fetchTextVariationConflict(appId, trainDialogId, textVariation, filteredDialogId)
            dispatch(fetchTextVariationConflictFulfilled(conflict))
            return conflict
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_TEXTVARIATION_CONFLICT_ASYNC))
            throw error
        }
    }
}

const fetchTextVariationConflictAsync = (appId: string, trainDialogId: string, textVariation: TextVariation): ActionObject => {
    return {
        type: AT.FETCH_TEXTVARIATION_CONFLICT_ASYNC,
        appId,
        trainDialogId,
        textVariation
    }
}

const fetchTextVariationConflictFulfilled = (extractResponse: ExtractResponse | null): ActionObject => {
    return {
        type: AT.FETCH_TEXTVARIATION_CONFLICT_FULFILLED,
        extractResponse
    }
}

export const setTextVariationConflict = (extractResponse: ExtractResponse): ActionObject => {
    return {
        type: AT.SET_TEXTVARIATION_CONFLICT,
        extractResponse
    }
}

// --------------------------
// DeleteTrainDialog
// --------------------------
export const deleteTrainDialogThunkAsync = (userId: string, app: AppBase, trainDialogId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteTrainDialogAsync(trainDialogId, app.appId))
        const clClient = ClientFactory.getInstance(AT.DELETE_TRAIN_DIALOG_ASYNC)

        try {
            await clClient.trainDialogsDelete(app.appId, trainDialogId)
            dispatch(deleteTrainDialogFulfilled(trainDialogId))
            dispatch(fetchApplicationTrainingStatusThunkAsync(app.appId));
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.DELETE_TRAIN_DIALOG_REJECTED))
            dispatch(deleteTrainDialogRejected())
            dispatch(fetchAllTrainDialogsThunkAsync(app.appId));
        }
    }
}
const deleteTrainDialogAsync = (trainDialogId: string, appId: string): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_ASYNC,
        appId,
        trainDialogId
    }
}

const deleteTrainDialogRejected = (): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_REJECTED
    }
}

const deleteTrainDialogFulfilled = (trainDialogId: string): ActionObject => {
    return {
        type: AT.DELETE_TRAIN_DIALOG_FULFILLED,
        trainDialogId
    }
}

// ----------------------------------------
// Fetch AllTrainDialogs
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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_TRAIN_DIALOGS_ASYNC))
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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_HISTORY_ASYNC))
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