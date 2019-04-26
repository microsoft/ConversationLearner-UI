/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as ClientFactory from '../services/clientFactory'
import * as DialogUtils from '../Utils/dialogUtils'
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { Dispatch } from 'redux'
import { PartialTrainDialog } from '../types/models'
import { fetchApplicationTrainingStatusThunkAsync } from './appActions'
import { AxiosError } from 'axios'
import { setErrorDisplay } from './displayActions'
import { EntityLabelConflictError } from '../types/errors'

// --------------------------
// CreateTrainDialog
// --------------------------
export const createTrainDialogThunkAsync = (appId: string, trainDialog: CLM.TrainDialog) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.CREATE_TRAIN_DIALOG_ASYNC)
        dispatch(createTrainDialogAsync(appId, trainDialog))

        try {
            const createdTrainDialog = await clClient.trainDialogsCreate(appId, trainDialog)
            dispatch(createTrainDialogFulfilled(createdTrainDialog))
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            return createdTrainDialog
        }
        catch (e) {
            dispatch(createTrainDialogRejected())
            
            const error = e as AxiosError
            if (error.response && error.response.status === 409) {
                const textVariations: CLM.TextVariation[] = error.response.data.reason
                const conflictError = new EntityLabelConflictError(error.message, textVariations)
                throw conflictError
            }

            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.CREATE_TRAIN_DIALOG_ASYNC))
            throw error
        }
    }
}

const createTrainDialogAsync = (appId: string, trainDialog: CLM.TrainDialog): ActionObject =>
    ({
        type: AT.CREATE_TRAIN_DIALOG_ASYNC,
        appId,
        trainDialog
    })

const createTrainDialogFulfilled = (trainDialog: CLM.TrainDialog): ActionObject =>
    ({
        type: AT.CREATE_TRAIN_DIALOG_FULFILLED,
        trainDialog: trainDialog
    })

const createTrainDialogRejected = (): ActionObject =>
    ({
        type: AT.CREATE_TRAIN_DIALOG_REJECTED
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
            throw e;
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

const fetchTrainDialogFulfilled = (trainDialog: CLM.TrainDialog, replaceLocal: boolean): ActionObject => {
    return {
        type: AT.FETCH_TRAIN_DIALOG_FULFILLED,
        trainDialog,
        replaceLocal
    }
}

// --------------------------
// ScoreFromHistory
// --------------------------
export const scoreFromHistoryThunkAsync = (appId: string, trainDialog: CLM.TrainDialog) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_SCOREFROMHISTORY_ASYNC)
        dispatch(scoreFromHistoryAsync(appId, trainDialog))

        try {
            const uiScoreResponse = await clClient.trainDialogScoreFromHistory(appId, trainDialog)
            dispatch(scoreFromHistoryFulfilled(uiScoreResponse))
            return uiScoreResponse
        }
        catch (e) {
            dispatch(scoreFromHistoryRejected())

            const error = e as AxiosError
            if (error.response && error.response.status === 409) {
                const textVariations: CLM.TextVariation[] = error.response.data.reason
                const conflictError = new EntityLabelConflictError(error.message, textVariations)
                throw conflictError
            }

            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_SCOREFROMHISTORY_ASYNC))
            throw error
        }
    }
}

const scoreFromHistoryAsync = (appId: string, trainDialog: CLM.TrainDialog): ActionObject => {
    return {
        type: AT.FETCH_SCOREFROMHISTORY_ASYNC,
        appId,
        trainDialog
    }
}

const scoreFromHistoryFulfilled = (uiScoreResponse: CLM.UIScoreResponse): ActionObject => {
    return {
        type: AT.FETCH_SCOREFROMHISTORY_FULFILLED,
        uiScoreResponse
    }
}

const scoreFromHistoryRejected = (): ActionObject =>
    ({
        type: AT.FETCH_SCOREFROMHISTORY_REJECTED
    })

// --------------------------
// ExtractFromHistory
// --------------------------
export const extractFromHistoryThunkAsync = (appId: string, trainDialog: CLM.TrainDialog, userInput: CLM.UserInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_EXTRACTFROMHISTORY_ASYNC)
        dispatch(extractFromHistoryAsync(appId, trainDialog, userInput))

        try {
            const extractResponse = await clClient.trainDialogExtractFromHistory(appId, trainDialog, userInput)
            dispatch(extractFromHistoryFulfilled(extractResponse))
            return extractResponse
        }
        catch (e) {
            dispatch(extractFromHistoryRejected())
            
            const error = e as AxiosError
            if (error.response && error.response.status === 409) {
                const textVariations: CLM.TextVariation[] = error.response.data.reason
                const conflictError = new EntityLabelConflictError(error.message, textVariations)
                throw conflictError
            }
            
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_EXTRACTFROMHISTORY_ASYNC))
            throw error
        }
    }
}

const extractFromHistoryAsync = (appId: string, trainDialog: CLM.TrainDialog, userInput: CLM.UserInput): ActionObject => {
    return {
        type: AT.FETCH_EXTRACTFROMHISTORY_ASYNC,
        appId,
        trainDialog,
        userInput
    }
}

const extractFromHistoryFulfilled = (extractResponse: CLM.ExtractResponse): ActionObject => {
    return {
        type: AT.FETCH_EXTRACTFROMHISTORY_FULFILLED,
        extractResponse
    }
}

const  extractFromHistoryRejected = (): ActionObject =>
    ({
        type: AT.FETCH_EXTRACTFROMHISTORY_REJECTED
    })

// --------------------------
// TrainDialogMerge
// --------------------------
export const trainDialogMergeThunkAsync = (appId: string, newTrainDialog: CLM.TrainDialog, existingTrainDialog: CLM.TrainDialog, description: string, tags: string[], sourceTrainDialogId: string | null) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_TRAINDIALOG_MERGE_ASYNC)
        dispatch(trainDialogMergeAsync())

        try {
            const promises: Promise<any>[] = []

            // Create merged train dialog
            const mergedTrainDialog = DialogUtils.mergeTrainDialogs(newTrainDialog, existingTrainDialog)
            mergedTrainDialog.description = description
            mergedTrainDialog.tags = tags
            
            // If merged into exisiting TrainDialog (as it was longer)
            if (mergedTrainDialog.trainDialogId === existingTrainDialog.trainDialogId) {
                // Update existing train dialog with merged train dialog, and delete other dialogs
                mergedTrainDialog.lastModifiedDateTime = `${new Date().toISOString().slice(0, 19)}+00:00`
                promises.push(clClient.trainDialogEdit(appId, mergedTrainDialog))
                promises.push(clClient.trainDialogsDelete(appId, newTrainDialog.trainDialogId))

                // If newTrainDialog was an edit of an original, delete the original
                if (sourceTrainDialogId) {
                    promises.push(clClient.trainDialogsDelete(appId, sourceTrainDialogId))
                }
                await Promise.all(promises)
            }
            // Otherwise if merged into new TrainDialog (as it was longer)
            else {

                // If newTrainDialog was an edit of an original, replace that one and delete the others
                if (sourceTrainDialogId) {
                    // Created updated source dialog from new dialogs rounds
                    const updatedSourceDialog: CLM.TrainDialog = {
                        ...mergedTrainDialog,
                        trainDialogId: sourceTrainDialogId,
                    }
                    promises.push(clClient.trainDialogEdit(appId, updatedSourceDialog))
                    promises.push(clClient.trainDialogsDelete(appId, existingTrainDialog.trainDialogId))
                    await Promise.all(promises)
                }
                // Otherwise, replace the newTrainDialog with the merged one
                else {
                    // Created updated source dialog from new dialogs rounds
                    const updatedNewDialog: CLM.TrainDialog = {
                        ...mergedTrainDialog,
                        trainDialogId: newTrainDialog.trainDialogId,
                    }
                    promises.push(clClient.trainDialogEdit(appId, updatedNewDialog))
                    promises.push(clClient.trainDialogsDelete(appId, existingTrainDialog.trainDialogId))
                    await Promise.all(promises)
                }
            }
            
            // TODO: Make more efficient by deleting and loading only changed ones
            dispatch(fetchAllTrainDialogsThunkAsync(appId));
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            dispatch(trainDialogMergeFulfilled())
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.EDIT_TRAINDIALOG_MERGE_ASYNC))
            throw error
        }
    }
}

const trainDialogMergeAsync = (): ActionObject => {
    return {
        type: AT.EDIT_TRAINDIALOG_MERGE_ASYNC
    }
}

const trainDialogMergeFulfilled = (): ActionObject => {
    return {
        type: AT.EDIT_TRAINDIALOG_MERGE_FULFILLED
    }
}

// --------------------------
// TrainDialogReplace
// --------------------------
export const trainDialogReplaceThunkAsync = (appId: string,  destinationTrainDialogId: string, newTrainDialog: CLM.TrainDialog,) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_TRAINDIALOG_REPLACE_ASYNC)
        dispatch(trainDialogReplaceAsync())

        try {
            const promises: Promise<any>[] = []

            // Created updated source dialog from new dialogs rounds
            const updatedDestinationDialog: CLM.TrainDialog = {
                ...newTrainDialog,
                trainDialogId: destinationTrainDialogId,
            }

            // If not replacing same train dialog, delete the one being replaced
            const deleteDialogId = destinationTrainDialogId !== newTrainDialog.trainDialogId ? newTrainDialog.trainDialogId : null
            
            if (deleteDialogId) {
                promises.push(clClient.trainDialogsDelete(appId, newTrainDialog.trainDialogId))
            }
            promises.push(clClient.trainDialogEdit(appId, updatedDestinationDialog))
            await Promise.all(promises)

            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            dispatch(trainDialogReplaceFulfilled(updatedDestinationDialog, deleteDialogId))
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.EDIT_TRAINDIALOG_REPLACE_ASYNC))
            throw error
        }
    }
}

const trainDialogReplaceAsync = (): ActionObject => {
    return {
        type: AT.EDIT_TRAINDIALOG_REPLACE_ASYNC
    }
}

const trainDialogReplaceFulfilled = (updatedTrainDialog: CLM.TrainDialog, deletedTrainDialogId: string | null): ActionObject => {
    return {
        type: AT.EDIT_TRAINDIALOG_REPLACE_FULFILLED,
        updatedTrainDialog,
        deletedTrainDialogId
    }
}

// --------------------------
// TrainDialogReplay
// --------------------------
export const trainDialogReplayThunkAsync = (appId: string, trainDialog: CLM.TrainDialog) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_TRAINDIALOGREPLAY_ASYNC)
        dispatch(trainDialogReplayAsync(appId, trainDialog))

        try {
            const updatedTrainDialog = await clClient.trainDialogReplay(appId, trainDialog)
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

const trainDialogReplayAsync = (appId: string, trainDialog: CLM.TrainDialog): ActionObject => {
    return {
        type: AT.FETCH_TRAINDIALOGREPLAY_ASYNC,
        appId,
        trainDialog
    }
}

const trainDialogReplayFulfilled = (trainDialog: CLM.TrainDialog): ActionObject => {
    return {
        type: AT.FETCH_TRAINDIALOGREPLAY_FULFILLED,
        trainDialog
    }
}

// --------------------------
// fetchTextVariationConflict
// --------------------------
export const fetchTextVariationConflictThunkAsync = (appId: string, trainDialogId: string, textVariation: CLM.TextVariation, filteredDialogId: string | null) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_TEXTVARIATION_CONFLICT_ASYNC)
        dispatch(fetchTextVariationConflictAsync(appId, trainDialogId, textVariation))

        try {
            const conflict = await clClient.fetchTextVariationConflict(appId, trainDialogId, textVariation, filteredDialogId)
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

const fetchTextVariationConflictAsync = (appId: string, trainDialogId: string, textVariation: CLM.TextVariation): ActionObject => {
    return {
        type: AT.FETCH_TEXTVARIATION_CONFLICT_ASYNC,
        appId,
        trainDialogId,
        textVariation
    }
}

const fetchTextVariationConflictFulfilled = (extractResponse: CLM.ExtractResponse | null): ActionObject => {
    return {
        type: AT.FETCH_TEXTVARIATION_CONFLICT_FULFILLED,
        extractResponse
    }
}

export const setTextVariationConflict = (extractResponse: CLM.ExtractResponse): ActionObject => {
    return {
        type: AT.SET_TEXTVARIATION_CONFLICT,
        extractResponse
    }
}

// --------------------------
// DeleteTrainDialog
// --------------------------
export const deleteTrainDialogThunkAsync = (app: CLM.AppBase, trainDialogId: string) => {
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

const fetchAllTrainDialogsFulfilled = (trainDialogs: CLM.TrainDialog[]): ActionObject => {
    return {
        type: AT.FETCH_TRAIN_DIALOGS_FULFILLED,
        allTrainDialogs: trainDialogs
    }
}

// ----------------------------------------
// History
// ----------------------------------------
export const fetchHistoryThunkAsync = (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean = true) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_HISTORY_ASYNC)
        dispatch(fetchHistoryAsync(appId, trainDialog, userName, userId))

        try {
            const teachWithHistory = await clClient.history(appId, trainDialog, userName, userId, useMarkdown)
            dispatch(fetchHistoryFulfilled(teachWithHistory))
            return teachWithHistory
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_HISTORY_ASYNC))
            throw e
        }
    }
}

const fetchHistoryAsync = (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string): ActionObject => {
    return {
        type: AT.FETCH_HISTORY_ASYNC,
        appId: appId,
        userName: userName,
        userId: userId,
        trainDialog: trainDialog
    }
}

const fetchHistoryFulfilled = (teachWithHistory: CLM.TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_HISTORY_FULFILLED,
        teachWithHistory: teachWithHistory
    }
}