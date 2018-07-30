/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { Dispatch } from 'redux'
import * as ClientFactory from '../services/clientFactory'
import { setErrorDisplay } from './displayActions'
import * as models from '@conversationlearner/models'
import { AxiosError } from 'axios';
import { deleteTrainDialogThunkAsync, fetchAllTrainDialogsThunkAsync } from './trainActions'
import { fetchApplicationTrainingStatusThunkAsync } from './appActions';

export const createTeachSessionThunkAsync = (appId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_ASYNC)
        dispatch(createTeachSessionAsync())

        try {
            const teachResponse = await clClient.teachSessionsCreate(appId)
            dispatch(createTeachSessionFulfilled(teachResponse))
            return teachResponse
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.CREATE_TEACH_SESSION_ASYNC))
            dispatch(createTeachSessionRejected())
            throw error
        }
    }
}
const createTeachSessionAsync = (): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_ASYNC
    })

const createTeachSessionRejected = (): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_REJECTED
    })

const createTeachSessionFulfilled = (teachResponse: models.TeachResponse): ActionObject =>
    ({
        type: AT.CREATE_TEACH_SESSION_FULFILLED,
        teachSession: teachResponse as models.Teach
    })

// --------------------------
// TeachSessionFromHistory
// --------------------------
export const createTeachSessionFromHistoryThunkAsync = (app: models.AppBase, trainDialog: models.TrainDialog, userName: string, userId: string, scoreInput: models.UIScoreInput | null = null) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC)
        dispatch(createTeachSessionFromHistoryAsync(app.appId, trainDialog, userName, userId))

        try {
            const extractChanged = scoreInput !== null;
            const teachWithHistory = await clClient.teachSessionFromHistory(app.appId, trainDialog, userName, userId, extractChanged);
            dispatch(createTeachSessionFromHistoryFulfilled(teachWithHistory))
            return teachWithHistory
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC))
            dispatch(createTeachSessionRejected())
            throw error
        }
    }
}

const createTeachSessionFromHistoryAsync = (appId: string, trainDialog: models.TrainDialog, userName: string, userId: string): ActionObject => {
    return {
        type: AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC,
        appId: appId,
        userName: userName,
        userId: userId,
        trainDialog: trainDialog
    }
}

const createTeachSessionFromHistoryFulfilled = (teachWithHistory: models.TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.CREATE_TEACH_SESSION_FROMHISTORYFULFILLED,
        teachWithHistory: teachWithHistory
    }
}

// --------------------------
// TeachSessionFromUndo
// --------------------------
export const createTeachSessionFromUndoThunkAsync = (appId: string, teach: models.Teach, popRound: boolean, userName: string, userId: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.CREATE_TEACH_SESSION_FROMUNDOASYNC)
        dispatch(createTeachSessionFromUndoAsync(appId, teach, popRound, userName, userId))

        try {
            const teachWithHistory = await clClient.teachSessionFromUndo(appId, teach, popRound, userName, userId)
            dispatch(createTeachSessionFromUndoFulfilled(teachWithHistory))
            return teachWithHistory
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.CREATE_TEACH_SESSION_FROMUNDOASYNC))
            dispatch(createTeachSessionRejected())
            throw error
        }
    }
}

const createTeachSessionFromUndoAsync = (appId: string, teach: models.Teach, popRound: boolean, userName: string, userId: string): ActionObject => {
    return {
        type: AT.CREATE_TEACH_SESSION_FROMUNDOASYNC,
        appId: appId,
        teach: teach,
        popRound: popRound,
        userName: userName,
        userId: userId
    }
}

const createTeachSessionFromUndoFulfilled = (teachWithHistory: models.TeachWithHistory): ActionObject => {
    // Needs a fulfilled version to handle response from Epic
    return {
        type: AT.CREATE_TEACH_SESSION_FROMUNDOFULFILLED,
        teachWithHistory: teachWithHistory
    }
}

export const deleteTeachSessionThunkAsync = (
    key: string,
    teachSession: models.Teach,
    app: models.AppBase,
    packageId: string,
    save: boolean,
    sourceTrainDialogId: string | null,
    sourceLogDialogId: string | null) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(deleteTeachSessionAsync(key, teachSession, app.appId, save))
        const clClient = ClientFactory.getInstance(AT.DELETE_TEACH_SESSION_ASYNC)

        try {
            await clClient.teachSessionsDelete(app.appId, teachSession, save);
            dispatch(deleteTeachSessionFulfilled(key, teachSession, sourceLogDialogId, app.appId));

            // If saving to a TrainDialog, delete any source TrainDialog (LogDialogs not deleted)
            if (save && sourceTrainDialogId) {
                await dispatch(deleteTrainDialogThunkAsync(key, app, sourceTrainDialogId));
            }

            dispatch(fetchAllTrainDialogsThunkAsync(app.appId));
            dispatch(fetchApplicationTrainingStatusThunkAsync(app.appId));
            return true;
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.DELETE_TRAIN_DIALOG_REJECTED))
            dispatch(fetchAllTrainDialogsThunkAsync(app.appId));
            return false;
        }
    }
}

const deleteTeachSessionAsync = (key: string, teachSession: models.Teach, appId: string, save: boolean): ActionObject => {
    return {
        type: AT.DELETE_TEACH_SESSION_ASYNC,
        key: key,
        teachSession: teachSession,
        appId: appId,
        save: save
    }
}

const deleteTeachSessionFulfilled = (key: string, teachSession: models.Teach, sourceLogDialogId: string | null, appId: string): ActionObject => {
    return {
        type: AT.DELETE_TEACH_SESSION_FULFILLED,
        key: key,
        appId: appId,
        teachSessionGUID: teachSession.teachId,
        trainDialogId: teachSession.trainDialogId,
        sourceLogDialogId: sourceLogDialogId
    }
}

// --------------------------
// InitMemory
// --------------------------
export const initMemoryThunkAsync = (appId: string, sessionId: string, filledEntityMap: models.FilledEntityMap) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.INIT_MEMORY_ASYNC)
        dispatch(initMemoryAsync(appId, sessionId, filledEntityMap))

        try {
            let memories = await clClient.teachSessionsInitMemory(appId, sessionId, filledEntityMap)
            dispatch(initMemoryFulfilled(memories))
            return
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.INIT_MEMORY_ASYNC))
            throw error
        }
    }
}

const initMemoryAsync = (appId: string, sessionId: string, filledEntityMap: models.FilledEntityMap): ActionObject => {
    return {
        type: AT.INIT_MEMORY_ASYNC,
        appId: appId,
        sessionId: sessionId,
        filledEntityMap: filledEntityMap
    }
}

const initMemoryFulfilled = (memories: models.Memory[]): ActionObject => {
    return {
        type: AT.INIT_MEMORY_FULFILLED,
        memories: memories
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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.DELETE_MEMORY_ASYNC))
            return false;
        }
    }
}

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

// --------------------------
// RunExtractor
// --------------------------
export const runExtractorThunkAsync = (key: string, appId: string, extractType: models.DialogType, sessionId: string, turnIndex: number | null, userInput: models.UserInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.RUN_EXTRACTOR_ASYNC)
        dispatch(runExtractorAsync(appId, extractType, sessionId, turnIndex, userInput))

        try {
            let uiExtractResponse: models.UIExtractResponse | null = null 

            switch (extractType) {
                case models.DialogType.TEACH:
                    uiExtractResponse = await clClient.teachSessionsAddExtractStep(appId, sessionId, userInput)
                  break;
                case models.DialogType.TRAINDIALOG:
                    if (turnIndex === null) {
                        throw new Error(`Run extractor was called for a train dialog, but turnIndex was null. This should not be possible. Please open an issue.`)
                    }
                    uiExtractResponse = await clClient.trainDialogsUpdateExtractStep(appId, sessionId, turnIndex, userInput)
                  break;
                case models.DialogType.LOGDIALOG:
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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.RUN_EXTRACTOR_ASYNC))
            throw error
        }
    }
}

const runExtractorAsync = (appId: string, extractType: models.DialogType, sessionId: string, turnIndex: number | null, userInput: models.UserInput): ActionObject => {
    return {
        type: AT.RUN_EXTRACTOR_ASYNC,
        appId: appId,
        extractType: extractType,
        sessionId: sessionId,
        turnIndex: turnIndex,
        userInput: userInput
    }
}

const runExtractorFulfilled = (appId: string, sessionId: string, uiExtractResponse: models.UIExtractResponse): ActionObject => {
    return {
        type: AT.RUN_EXTRACTOR_FULFILLED,
        appId: appId,
        sessionId: sessionId,
        uiExtractResponse: uiExtractResponse
    }
}
//---------------------------------------------------------
// User makes an update to an extract response
export const updateExtractResponse = (extractResponse: models.ExtractResponse): ActionObject => {
    return {
        type: AT.UPDATE_EXTRACT_RESPONSE,
        extractResponse: extractResponse
    }
}

// User removes extract response
export const removeExtractResponse = (extractResponse: models.ExtractResponse): ActionObject => {
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

// --------------------------
// GetScores
// --------------------------
export const getScoresThunkAsync = (key: string, appId: string, sessionId: string, scoreInput: models.ScoreInput) => {
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
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.GET_SCORES_ASYNC))
            throw error
        }
    }
}

const getScoresAsync = (key: string, appId: string, sessionId: string, scoreInput: models.ScoreInput): ActionObject =>
    ({
        type: AT.GET_SCORES_ASYNC,
        key,
        appId,
        sessionId,
        scoreInput
    })

const getScoresFulfilled = (key: string, appId: string, sessionId: string, uiScoreResponse: models.UIScoreResponse): ActionObject =>
    ({
        type: AT.GET_SCORES_FULFILLED,
        key,
        appId,
        sessionId,
        uiScoreResponse,
    })

// --------------------------
// RunScorer
// --------------------------
export const runScorerThunkAsync = (key: string, appId: string, teachId: string, uiScoreInput: models.UIScoreInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.RUN_SCORER_ASYNC)
        dispatch(runScorerAsync(key, appId, teachId, uiScoreInput))

        try {
            let uiScoreResponse =  await clClient.teachSessionUpdateScorerStep(appId, teachId, uiScoreInput)
            dispatch(runScorerFulfilled(key, appId, teachId, uiScoreResponse))
            dispatch(fetchApplicationTrainingStatusThunkAsync(appId))
            return uiScoreResponse
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.RUN_SCORER_ASYNC))
            throw error
        }
    }
}

const runScorerAsync = (key: string, appId: string, teachId: string, uiScoreInput: models.UIScoreInput): ActionObject => {
    return {
        type: AT.RUN_SCORER_ASYNC,
        key: key,
        appId: appId,
        sessionId: teachId,
        uiScoreInput: uiScoreInput
    }
}
const runScorerFulfilled = (key: string, appId: string, teachId: string, uiScoreResponse: models.UIScoreResponse): ActionObject => {
    return {
        type: AT.RUN_SCORER_FULFILLED,
        key: key,
        appId: appId,
        sessionId: teachId,
        uiScoreResponse: uiScoreResponse
    }
}

// --------------------------
// PostScorerFeedback
// --------------------------
export const postScorerFeedbackThunkAsync = (key: string, appId: string, teachId: string, uiTrainScorerStep: models.UITrainScorerStep, waitForUser: boolean, uiScoreInput: models.UIScoreInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.POST_SCORE_FEEDBACK_ASYNC)
        dispatch(postScorerFeedbackAsync(key, appId, teachId, uiTrainScorerStep, waitForUser, uiScoreInput))

        try {
            let uiPostScoreResponse = await clClient.teachSessionAddScorerStep(appId, teachId, uiTrainScorerStep)

            if (!waitForUser) {
                // Don't re-send predicted entities on subsequent score call
                uiScoreInput.extractResponse.predictedEntities = [];
               //LARS todo - force end task to always be wait
                dispatch(postScorerFeedbackFulfilled(key, appId, teachId, models.DialogMode.Scorer, uiPostScoreResponse, uiScoreInput))     
                dispatch(runScorerThunkAsync(key, appId, teachId, uiScoreInput))
            }
            else {
                let dialogMode = uiPostScoreResponse.isEndTask ? models.DialogMode.EndSession : models.DialogMode.Wait
                dispatch(postScorerFeedbackFulfilled(key, appId, teachId, dialogMode, uiPostScoreResponse, null))
            }
            return uiPostScoreResponse
        }
        catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? [JSON.stringify(error.response, null, '  ')] : [], AT.POST_SCORE_FEEDBACK_ASYNC))
            throw error
        }
    }
}

const postScorerFeedbackAsync = (key: string, appId: string, teachId: string, uiTrainScorerStep: models.UITrainScorerStep, waitForUser: boolean, uiScoreInput: models.UIScoreInput): ActionObject => {
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
const postScorerFeedbackFulfilled = (key: string, appId: string, teachId: string, dialogMode: models.DialogMode, uiPostScoreResponse: models.UIPostScoreResponse, uiScoreInput: models.UIScoreInput | null): ActionObject => {
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

// --------------------------
// ToggleAutoTeach
// --------------------------
export const toggleAutoTeach = (autoTeach: boolean): ActionObject => {
    return {
        type: AT.TOGGLE_AUTO_TEACH,
        autoTeach: autoTeach
    }
}