/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { Dispatch } from 'redux'
import * as ClientFactory from '../services/clientFactory'
import { setErrorDisplay } from './displayActions'
import * as CLM from '@conversationlearner/models'
import { AxiosError } from 'axios'
import { deleteTrainDialogThunkAsync, fetchAllTrainDialogsThunkAsync } from './trainActions'
import { fetchApplicationTrainingStatusThunkAsync } from './appActions'

// --------------------------
// createTeachSession
// --------------------------
const createTeachSessionAsync = (): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_ASYNC
    })

const createTeachSessionRejected = (): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_REJECTED
    })

const createTeachSessionFulfilled = (teachResponse: CLM.TeachResponse, memories: CLM.Memory[]): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_FULFILLED,
        teachSession: teachResponse as CLM.Teach,
        memories
    })

export const createTeachSessionThunkAsync = (appId: string, initialEntityMap: CLM.FilledEntityMap | null = null) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_ASYNC)
        dispatch(createTeachSessionAsync())

        try {
            const initialFilledEntities = initialEntityMap ? initialEntityMap.FilledEntities() : []
            const initialMemory = initialEntityMap ? initialEntityMap.ToMemory() : []
            const teachResponse = await clClient.teachSessionCreate(appId, initialFilledEntities)
            dispatch(createTeachSessionFulfilled(teachResponse, initialMemory))
            return teachResponse
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.CREATE_TEACH_SESSION_ASYNC))
            dispatch(createTeachSessionRejected())
            throw error
        }
    }
}

// --------------------------
// TeachSessionFromHistory
// --------------------------
const createTeachSessionFromHistoryAsync = (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string): ActionObject => {
    return {
        type: AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC,
        appId: appId,
        userName: userName,
        userId: userId,
        trainDialog: trainDialog
    }
}

const createTeachSessionFromHistoryFulfilled = (teachWithHistory: CLM.TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.CREATE_TEACH_SESSION_FROMHISTORYFULFILLED,
        teachWithHistory: teachWithHistory
    }
}

export const createTeachSessionFromHistoryThunkAsync = (app: CLM.AppBase, trainDialog: CLM.TrainDialog, userName: string, userId: string, initialUserInput: CLM.UserInput | null = null) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC)
        dispatch(createTeachSessionFromHistoryAsync(app.appId, trainDialog, userName, userId))

        try {
            const teachWithHistory = await clClient.teachSessionFromHistory(app.appId, trainDialog, initialUserInput, userName, userId)
            dispatch(createTeachSessionFromHistoryFulfilled(teachWithHistory))
            return teachWithHistory
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC))
            dispatch(createTeachSessionRejected())
            throw error
        }
    }
}

// --------------------------
// DeleteTeachSession
// --------------------------
const deleteTeachSessionAsync = (key: string, teachSession: CLM.Teach, appId: string, save: boolean): ActionObject => {
    return {
        type: AT.DELETE_TEACH_SESSION_ASYNC,
        key: key,
        teachSession: teachSession,
        appId: appId,
        save: save
    }
}

const deleteTeachSessionFulfilled = (key: string, teachSession: CLM.Teach, sourceLogDialogId: string | null, appId: string): ActionObject => {
    return {
        type: AT.DELETE_TEACH_SESSION_FULFILLED,
        key: key,
        appId: appId,
        teachSessionGUID: teachSession.teachId,
        trainDialogId: teachSession.trainDialogId,
        sourceLogDialogId: sourceLogDialogId
    }
}

export const clearTeachSession = (): ActionObject => {
    return {
        type: AT.CLEAR_TEACH_SESSION
    }
}

export const deleteTeachSessionThunkAsync = (
    key: string,
    teachSession: CLM.Teach,
    app: CLM.AppBase,
    packageId: string,
    save: boolean,
    sourceTrainDialogId: string | null,
    sourceLogDialogId: string | null) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteTeachSessionAsync(key, teachSession, app.appId, save))
        const clClient = ClientFactory.getInstance(AT.DELETE_TEACH_SESSION_ASYNC)

        try {
            await clClient.teachSessionDelete(app.appId, teachSession, save);
            dispatch(deleteTeachSessionFulfilled(key, teachSession, sourceLogDialogId, app.appId));

            // If saving to a TrainDialog
            if (save) {
                // If source train dialog exists for new dialog delete it (LogDialogs not deleted)
                if (sourceTrainDialogId) {
                    await dispatch(deleteTrainDialogThunkAsync(key, app, sourceTrainDialogId));
                }

                // If we're adding a new train dialog as consequence of the session save, refetch train dialogs and start poll for train status
                dispatch(fetchAllTrainDialogsThunkAsync(app.appId));
                dispatch(fetchApplicationTrainingStatusThunkAsync(app.appId));
            }

            return true;
        } catch (e) {
            const error = e as AxiosError
            dispatch(clearTeachSession())
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.DELETE_TRAIN_DIALOG_REJECTED))
            dispatch(fetchAllTrainDialogsThunkAsync(app.appId));
            return false;
        }
    }
}

// --------------------------
// deleteMemory
// --------------------------
const deleteMemoryAsync = (key: string, currentAppId: string): ActionObject => {
    return {
        type: AT.DELETE_MEMORY_ASYNC,
        key: key,
        appId: currentAppId
    }
}

const deleteMemoryFulfilled = (): ActionObject => {
    return {
        type: AT.DELETE_MEMORY_FULFILLED
    }
}
export const deleteMemoryThunkAsync = (key: string, currentAppId: string) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteMemoryAsync(key, currentAppId))
        const clClient = ClientFactory.getInstance(AT.DELETE_MEMORY_ASYNC)

        try {
            await clClient.memoryDelete(currentAppId);
            dispatch(deleteMemoryFulfilled());
            return true;
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.DELETE_MEMORY_ASYNC))
            return false;
        }
    }
}

// --------------------------
// RunExtractor
// --------------------------
const runExtractorAsync = (appId: string, extractType: CLM.DialogType, sessionId: string, turnIndex: number | null, userInput: CLM.UserInput): ActionObject => {
    return {
        type: AT.RUN_EXTRACTOR_ASYNC,
        appId: appId,
        extractType: extractType,
        sessionId: sessionId,
        turnIndex: turnIndex,
        userInput: userInput
    }
}

const runExtractorFulfilled = (appId: string, sessionId: string, uiExtractResponse: CLM.UIExtractResponse): ActionObject => {
    return {
        type: AT.RUN_EXTRACTOR_FULFILLED,
        appId: appId,
        sessionId: sessionId,
        uiExtractResponse: uiExtractResponse
    }
}

export const runExtractorThunkAsync = (appId: string, extractType: CLM.DialogType, sessionId: string, turnIndex: number | null, userInput: CLM.UserInput, filteredDialog: string | null) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.RUN_EXTRACTOR_ASYNC)
        dispatch(runExtractorAsync(appId, extractType, sessionId, turnIndex, userInput))

        try {
            let uiExtractResponse: CLM.UIExtractResponse | null = null

            switch (extractType) {
                case CLM.DialogType.TEACH:
                    uiExtractResponse = await clClient.teachSessionAddExtractStep(appId, sessionId, userInput, filteredDialog)
                    break;
                case CLM.DialogType.TRAINDIALOG:
                    if (turnIndex === null) {
                        throw new Error(`Run extractor was called for a train dialog, but turnIndex was null. This should not be possible. Please open an issue.`)
                    }
                    uiExtractResponse = await clClient.trainDialogsUpdateExtractStep(appId, sessionId, turnIndex, userInput)
                    break;
                case CLM.DialogType.LOGDIALOG:
                    if (turnIndex === null) {
                        throw new Error(`Run extractor was called for a log dialog, but turnIndex was null. This should not be possible. Please open an issue.`)
                    }
                    uiExtractResponse = await clClient.logDialogsUpdateExtractStep(appId, sessionId, turnIndex, userInput)
                    break;
                default:
                    throw new Error(`Could not handle unknown extract type: ${extractType}`)
            }

            dispatch(runExtractorFulfilled(appId, sessionId, uiExtractResponse))
            return uiExtractResponse
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.RUN_EXTRACTOR_ASYNC))
            throw error
        }
    }
}

//---------------------------------------------------------
// User makes an update to an extract response
export const updateExtractResponse = (extractResponse: CLM.ExtractResponse): ActionObject => {
    return {
        type: AT.UPDATE_EXTRACT_RESPONSE,
        extractResponse: extractResponse
    }
}

// User removes extract response
export const removeExtractResponse = (extractResponse: CLM.ExtractResponse): ActionObject => {
    return {
        type: AT.REMOVE_EXTRACT_RESPONSE,
        extractResponse: extractResponse
    }
}

// Clear extract responses
export const clearExtractResponses = (): ActionObject => {
    return {
        type: AT.CLEAR_EXTRACT_RESPONSES
    }
}

// Clear extract responses
export const clearExtractConflict = (): ActionObject => {
    return {
        type: AT.CLEAR_EXTRACT_CONFLICT
    }
}

// --------------------------
// GetScores
// --------------------------
const getScoresAsync = (key: string, appId: string, sessionId: string, scoreInput: CLM.ScoreInput): ActionObject =>
    ({
        type: AT.GET_SCORES_ASYNC,
        key,
        appId,
        sessionId,
        scoreInput
    })

const getScoresFulfilled = (key: string, appId: string, sessionId: string, uiScoreResponse: CLM.UIScoreResponse): ActionObject =>
    ({
        type: AT.GET_SCORES_FULFILLED,
        key,
        appId,
        sessionId,
        uiScoreResponse,
    })
export const getScoresThunkAsync = (key: string, appId: string, sessionId: string, scoreInput: CLM.ScoreInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.GET_SCORES_ASYNC)
        dispatch(getScoresAsync(key, appId, sessionId, scoreInput))

        try {
            let uiScoreResponse = await clClient.teachSessionRescore(appId, sessionId, scoreInput)
            dispatch(getScoresFulfilled(key, appId, sessionId, uiScoreResponse))
            return uiScoreResponse
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.GET_SCORES_ASYNC))
            throw error
        }
    }
}

// --------------------------
// RunScorer
// --------------------------
const runScorerAsync = (key: string, appId: string, teachId: string, uiScoreInput: CLM.UIScoreInput): ActionObject => {
    return {
        type: AT.RUN_SCORER_ASYNC,
        key: key,
        appId: appId,
        sessionId: teachId,
        uiScoreInput: uiScoreInput
    }
}
const runScorerFulfilled = (key: string, appId: string, teachId: string, uiScoreResponse: CLM.UIScoreResponse): ActionObject => {
    return {
        type: AT.RUN_SCORER_FULFILLED,
        key,
        appId,
        sessionId: teachId,
        uiScoreResponse
    }
}
export const runScorerThunkAsync = (key: string, appId: string, teachId: string, uiScoreInput: CLM.UIScoreInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.RUN_SCORER_ASYNC)
        dispatch(runScorerAsync(key, appId, teachId, uiScoreInput))

        try {
            let uiScoreResponse = await clClient.teachSessionUpdateScorerStep(appId, teachId, uiScoreInput)
            dispatch(runScorerFulfilled(key, appId, teachId, uiScoreResponse))
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            return uiScoreResponse
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.RUN_SCORER_ASYNC))
            throw error
        }
    }
}

// --------------------------
// PostScorerFeedback
// --------------------------
const postScorerFeedbackAsync = (key: string, appId: string, teachId: string, uiTrainScorerStep: CLM.UITrainScorerStep, waitForUser: boolean, uiScoreInput: CLM.UIScoreInput): ActionObject => {
    return {
        type: AT.POST_SCORE_FEEDBACK_ASYNC,
        key: key,
        appId: appId,
        sessionId: teachId,
        uiTrainScorerStep: uiTrainScorerStep,
        waitForUser: waitForUser,
        uiScoreInput: uiScoreInput
    }
}

// Score has been posted.  Action is Terminal
const postScorerFeedbackFulfilled = (key: string, appId: string, teachId: string, dialogMode: CLM.DialogMode, uiPostScoreResponse: CLM.UIPostScoreResponse, uiScoreInput: CLM.UIScoreInput | null): ActionObject => {
    return {
        type: AT.POST_SCORE_FEEDBACK_FULFILLED,
        key: key,
        appId: appId,
        sessionId: teachId,
        dialogMode: dialogMode,
        uiPostScoreResponse: uiPostScoreResponse,
        uiScoreInput: uiScoreInput
    }
}

export const postScorerFeedbackThunkAsync = (key: string, appId: string, teachId: string, uiTrainScorerStep: CLM.UITrainScorerStep, waitForUser: boolean, uiScoreInput: CLM.UIScoreInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.POST_SCORE_FEEDBACK_ASYNC)
        dispatch(postScorerFeedbackAsync(key, appId, teachId, uiTrainScorerStep, waitForUser, uiScoreInput))

        try {
            let uiPostScoreResponse = await clClient.teachSessionAddScorerStep(appId, teachId, uiTrainScorerStep)

            if (!waitForUser) {
                // Don't re-send predicted entities on subsequent score call
                uiScoreInput.extractResponse.predictedEntities = [];
                // TODO: Force end task to always be wait
                dispatch(postScorerFeedbackFulfilled(key, appId, teachId, CLM.DialogMode.Scorer, uiPostScoreResponse, uiScoreInput))
            }
            else {
                let dialogMode = uiPostScoreResponse.isEndTask ? CLM.DialogMode.EndSession : CLM.DialogMode.Wait
                dispatch(postScorerFeedbackFulfilled(key, appId, teachId, dialogMode, uiPostScoreResponse, null))
            }
            return uiPostScoreResponse
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.POST_SCORE_FEEDBACK_ASYNC))
            throw error
        }
    }
}
// --------------------------
// ToggleAutoTeach
// --------------------------
export const toggleAutoTeach = (autoTeach: boolean): ActionObject => {
    return {
        type: AT.TOGGLE_AUTO_TEACH,
        autoTeach: autoTeach
    }
}