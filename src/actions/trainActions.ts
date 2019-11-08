/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as ClientFactory from '../services/clientFactory'
import * as Client from '../services/client'
import * as DialogUtils from '../Utils/dialogUtils'
import * as DispatchUtils from '../Utils/dispatchUtils'
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { Dispatch } from 'redux'
import { PartialTrainDialog, SourceAndModelPair } from '../types/models'
import { fetchApplicationTrainingStatusThunkAsync } from './appActions'
import { AxiosError } from 'axios'
import { setErrorDisplay } from './displayActions'
import { EntityLabelConflictError } from '../types/errors'
import { ActionTypes } from '@conversationlearner/models';
import { DispatcherAlgorithmType } from '../components/modals/DispatcherCreator';

// --------------------------
// CreateTrainDialog
// --------------------------
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
            if (error.response?.status === 409) {
                const textVariations: CLM.TextVariation[] = error.response.data.reason
                const conflictError = new EntityLabelConflictError(error.message, textVariations)
                throw conflictError
            }

            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.CREATE_TRAIN_DIALOG_ASYNC))
            throw error
        }
    }
}

// --------------------------
// EditTrainDialog
// --------------------------
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

export const editTrainDialogThunkAsync = (appId: string, trainDialog: PartialTrainDialog, options?: Partial<Client.TrainDialogUpdateQueryParams>) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_TRAINDIALOG_ASYNC)
        trainDialog.lastModifiedDateTime = `${new Date().toISOString().slice(0, 19)}+00:00`
        dispatch(editTrainDialogAsync(appId, trainDialog))

        try {
            await clClient.trainDialogEdit(appId, trainDialog, options)
            dispatch(editTrainDialogFulfilled(appId, trainDialog))
            if (trainDialog.rounds) {
                dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            }
            return trainDialog
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.EDIT_TRAINDIALOG_ASYNC))
            throw error
        }
    }
}

// ----------------------------------------
// FetchTrainDialog
// ----------------------------------------
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

// --------------------------
// ScoreFromTrainDialog
// --------------------------
const scoreFromTrainDialogAsync = (appId: string, trainDialog: CLM.TrainDialog): ActionObject => {
    return {
        type: AT.FETCH_SCOREFROMTRAINDIALOG_ASYNC,
        appId,
        trainDialog
    }
}

const scoreFromTrainDialogFulfilled = (uiScoreResponse: CLM.UIScoreResponse): ActionObject => {
    return {
        type: AT.FETCH_SCOREFROMTRAINDIALOG_FULFILLED,
        uiScoreResponse
    }
}

const scoreFromTrainDialogRejected = (): ActionObject =>
    ({
        type: AT.FETCH_SCOREFROMTRAINDIALOG_REJECTED
    })

export const scoreFromTrainDialogThunkAsync = (appId: string, trainDialog: CLM.TrainDialog) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_SCOREFROMTRAINDIALOG_ASYNC)
        dispatch(scoreFromTrainDialogAsync(appId, trainDialog))

        try {
            const uiScoreResponse = await clClient.trainDialogScoreFromTrainDialog(appId, trainDialog)
            dispatch(scoreFromTrainDialogFulfilled(uiScoreResponse))
            return uiScoreResponse
        }
        catch (e) {
            dispatch(scoreFromTrainDialogRejected())

            const error = e as AxiosError
            if (error.response?.status === 409) {
                const textVariations: CLM.TextVariation[] = error.response.data.reason
                const conflictError = new EntityLabelConflictError(error.message, textVariations)
                throw conflictError
            }

            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_SCOREFROMTRAINDIALOG_ASYNC))
            throw error
        }
    }
}

// --------------------------
// ExtractFromTrainDialog
// --------------------------
const extractFromTrainDialogAsync = (appId: string, trainDialog: CLM.TrainDialog, userInput: CLM.UserInput): ActionObject => {
    return {
        type: AT.FETCH_EXTRACTFROMTRAINDIALOG_ASYNC,
        appId,
        trainDialog,
        userInput
    }
}

const extractFromTrainDialogFulfilled = (extractResponse: CLM.ExtractResponse): ActionObject => {
    return {
        type: AT.FETCH_EXTRACTFROMTRAINDIALOG_FULFILLED,
        extractResponse
    }
}

const extractFromTrainDialogRejected = (): ActionObject =>
    ({
        type: AT.FETCH_EXTRACTFROMTRAINDIALOG_REJECTED
    })

export const extractFromTrainDialogThunkAsync = (appId: string, trainDialog: CLM.TrainDialog, userInput: CLM.UserInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_EXTRACTFROMTRAINDIALOG_ASYNC)
        dispatch(extractFromTrainDialogAsync(appId, trainDialog, userInput))

        try {
            const extractResponse = await clClient.trainDialogExtractFromTrainDialog(appId, trainDialog, userInput)
            dispatch(extractFromTrainDialogFulfilled(extractResponse))
            return extractResponse
        }
        catch (e) {
            dispatch(extractFromTrainDialogRejected())

            const error = e as AxiosError
            if (error.response?.status === 409) {
                const textVariations: CLM.TextVariation[] = error.response.data.reason
                const conflictError = new EntityLabelConflictError(error.message, textVariations)
                throw conflictError
            }

            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_EXTRACTFROMTRAINDIALOG_ASYNC))
            throw error
        }
    }
}

// ----------------------------------------
// Fetch AllTrainDialogs
// ----------------------------------------
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

const regenerateDispatchDialogsAsync = (): ActionObject => {
    return {
        type: AT.REGENERATE_DISPATCH_DIALOGS_ASYNC,
    }
}

const regenerateDispatchDialogsFulfilled = (trainDialogs: CLM.TrainDialog[]): ActionObject => {
    return {
        type: AT.REGENERATE_DISPATCH_DIALOGS_FULFILLED,
        trainDialogs
    }
}

export const regenerateDispatchTrainDialogsAsync = (dispatchModelId: string, algorithmType: DispatcherAlgorithmType, actions: CLM.ActionBase[], existingTrainDialogs: CLM.TrainDialog[]) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.REGENERATE_DISPATCH_DIALOGS_ASYNC)
        dispatch(regenerateDispatchDialogsAsync())

        try {
            // Associate existing DISPATCH actions with sources model pairs to preserve GUID references
            // Otherwise, will have to delete and recreate Actions as well as Dialogs
            // generateDispatcherSource, only generates actions if it was undefined
            const sourceModelPairs = await Promise.all(actions
                .filter(a => a.actionType === ActionTypes.DISPATCH)
                .map<Promise<SourceAndModelPair>>(async a => {
                    const dispatchAction = new CLM.DispatchAction(a)

                    // TODO: Might be able to skip loading models since we don't need them.
                    const model = await clClient.appGet(dispatchAction.modelId)
                    // TODO: Throw error if models needed upgrade
                    const appDefinitionChange = await clClient.source(model.appId, model.devPackageId)

                    return {
                        model,
                        source: appDefinitionChange.currentAppDefinition,
                        action: a,
                    }
                }))

            const dispatcherSource = DispatchUtils.generateDispatcherSource(sourceModelPairs, algorithmType)

            // Delete all existing dialogs
            await Promise.all(existingTrainDialogs.map(td => clClient.trainDialogsDelete(dispatchModelId, td.trainDialogId)))

            // Create all new dialogs
            await Promise.all(dispatcherSource.trainDialogs.map(td => clClient.trainDialogsCreate(dispatchModelId, td)))

            dispatch(regenerateDispatchDialogsFulfilled(dispatcherSource.trainDialogs))
            return dispatcherSource.trainDialogs
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(
                ErrorType.Error,
                error.message,
                error.response
                    ? JSON.stringify(error.response, null, '  ')
                    : "",
                AT.REGENERATE_DISPATCH_DIALOGS_ASYNC))

            return []
        }
    }
}

// --------------------------
// TrainDialogMerge
// --------------------------
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

export const trainDialogMergeThunkAsync = (appId: string, newTrainDialog: CLM.TrainDialog, existingTrainDialog: CLM.TrainDialog, newDescription: string | null, newTags: string[] | null, sourceTrainDialogId: string | null) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_TRAINDIALOG_MERGE_ASYNC)
        dispatch(trainDialogMergeAsync())

        try {
            const promises: Promise<any>[] = []

            // Create merged train dialog
            const mergedTrainDialog = DialogUtils.mergeTrainDialogs(newTrainDialog, existingTrainDialog)
            mergedTrainDialog.description = newDescription ?? mergedTrainDialog.description
            mergedTrainDialog.tags = newTags ?? mergedTrainDialog.tags

            // If merged into existing TrainDialog (as it was longer)
            if (mergedTrainDialog.trainDialogId === existingTrainDialog.trainDialogId) {
                // Update existing train dialog with merged train dialog, and delete other dialogs
                mergedTrainDialog.lastModifiedDateTime = `${new Date().toISOString().slice(0, 19)}+00:00`
                promises.push(clClient.trainDialogEdit(appId, mergedTrainDialog))

                if (newTrainDialog.trainDialogId) {
                    promises.push(clClient.trainDialogsDelete(appId, newTrainDialog.trainDialogId))
                }
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
                    if (existingTrainDialog.trainDialogId) {
                        promises.push(clClient.trainDialogsDelete(appId, existingTrainDialog.trainDialogId))
                    }
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

// --------------------------
// TrainDialogReplace
// --------------------------
const trainDialogReplaceAsync = (enableSpinner: boolean): ActionObject => {
    return {
        type: AT.EDIT_TRAINDIALOG_REPLACE_ASYNC,
        enableSpinner
    }
}

const trainDialogReplaceFulfilled = (updatedTrainDialog: CLM.TrainDialog, deletedTrainDialogId: string | null): ActionObject => {
    return {
        type: AT.EDIT_TRAINDIALOG_REPLACE_FULFILLED,
        updatedTrainDialog,
        deletedTrainDialogId
    }
}

export const trainDialogReplaceThunkAsync = (appId: string, destinationTrainDialogId: string, newTrainDialog: CLM.TrainDialog, enableSpinner = true) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.EDIT_TRAINDIALOG_REPLACE_ASYNC)
        dispatch(trainDialogReplaceAsync(enableSpinner))

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

// --------------------------
// TrainDialogReplay
// --------------------------
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

// --------------------------
// fetchTextVariationConflict
// --------------------------
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

export const setTextVariationConflict = (extractResponse: CLM.ExtractResponse): ActionObject => {
    return {
        type: AT.SET_TEXTVARIATION_CONFLICT,
        extractResponse
    }
}

// --------------------------
// DeleteTrainDialog
// --------------------------
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

// ----------------------------------------
// Activities
// ----------------------------------------
const fetchActivitiesAsync = (noSpinnerDisplay: boolean): ActionObject => {
    return {
        type: AT.FETCH_ACTIVITIES_ASYNC,
        noSpinnerDisplay
    }
}

const fetchActivitiesFulfilled = (teachWithActivities: CLM.TeachWithActivities): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.FETCH_ACTIVITIES_FULFILLED,
        teachWithActivities,
    }
}

/**
 * Return list of rendered Activities for the given TrainDialog
 * @param appId Current application
 * @param trainDialog Train dialog for which Activities will be returned
 * @param userName Name of the active user
 * @param userId Id of the active user
 * @param useMarkdown If true will add markdown to highlight entites in user utterance
 * @param noSpinnerDisplay If true will not display a spinner when awaiting
 */
export const fetchActivitiesThunkAsync = (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean = true, noSpinnerDisplay: boolean = false) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_ACTIVITIES_ASYNC)
        dispatch(fetchActivitiesAsync(noSpinnerDisplay))

        try {
            const teachWithActivities = await clClient.history(appId, trainDialog, userName, userId, useMarkdown)
            dispatch(fetchActivitiesFulfilled(teachWithActivities))
            return teachWithActivities
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_ACTIVITIES_ASYNC))
            throw e
        }
    }
}