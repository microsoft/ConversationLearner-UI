/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { Dispatch } from 'redux'
import * as ClientFactory from '../services/clientFactory' 
import { setErrorDisplay } from './displayActions'
import { fetchApplicationTrainingStatusThunkAsync } from './fetchActions'
import {
    UserInput, ExtractResponse, ScoreInput, UIScoreInput, UIExtractResponse,
    UIScoreResponse, UITrainScorerStep, UIPostScoreResponse,
    DialogType, DialogMode, FilledEntityMap, Memory
} from '@conversationlearner/models'
import { AxiosError } from 'axios';

// --------------------------
// InitMemory
// --------------------------
export const initMemoryThunkAsync = (appId: string, sessionId: string, filledEntityMap: FilledEntityMap) => {
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

const initMemoryAsync = (appId: string, sessionId: string, filledEntityMap: FilledEntityMap): ActionObject => {
    return {
        type: AT.INIT_MEMORY_ASYNC,
        appId: appId,
        sessionId: sessionId,
        filledEntityMap: filledEntityMap
    }
}

const initMemoryFulfilled = (memories: Memory[]): ActionObject => {
    return {
        type: AT.INIT_MEMORY_FULFILLED,
        memories: memories
    }
}

// --------------------------
// RunExtractor
// --------------------------
export const runExtractorThunkAsync = (key: string, appId: string, extractType: DialogType, sessionId: string, turnIndex: number, userInput: UserInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.RUN_EXTRACTOR_ASYNC)
        dispatch(runExtractorAsync(appId, extractType, sessionId, turnIndex, userInput))

        try {
            let uiExtractResponse: UIExtractResponse = null 

            switch (extractType) {
                case DialogType.TEACH:
                    uiExtractResponse = await clClient.teachSessionsAddExtractStep(appId, sessionId, userInput)
                  break;
                case DialogType.TRAINDIALOG:
                    uiExtractResponse = await clClient.trainDialogsUpdateExtractStep(appId, sessionId, turnIndex, userInput)
                  break;
                case DialogType.LOGDIALOG:
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

const runExtractorAsync = (appId: string, extractType: DialogType, sessionId: string, turnIndex: number, userInput: UserInput): ActionObject => {
    return {
        type: AT.RUN_EXTRACTOR_ASYNC,
        appId: appId,
        extractType: extractType,
        sessionId: sessionId,
        turnIndex: turnIndex,
        userInput: userInput
    }
}

const runExtractorFulfilled = (appId: string, sessionId: string, uiExtractResponse: UIExtractResponse): ActionObject => {
    return {
        type: AT.RUN_EXTRACTOR_FULFILLED,
        appId: appId,
        sessionId: sessionId,
        uiExtractResponse: uiExtractResponse
    }
}
//---------------------------------------------------------
// User makes an update to an extract response
export const updateExtractResponse = (extractResponse: ExtractResponse): ActionObject => {
    return {
        type: AT.UPDATE_EXTRACT_RESPONSE,
        extractResponse: extractResponse
    }
}

// User removes extract response
export const removeExtractResponse = (extractResponse: ExtractResponse): ActionObject => {
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
export const getScoresThunkAsync = (key: string, appId: string, sessionId: string, scoreInput: ScoreInput) => {
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

const getScoresAsync = (key: string, appId: string, sessionId: string, scoreInput: ScoreInput): ActionObject =>
    ({
        type: AT.GET_SCORES_ASYNC,
        key,
        appId,
        sessionId,
        scoreInput
    })

const getScoresFulfilled = (key: string, appId: string, sessionId: string, uiScoreResponse: UIScoreResponse): ActionObject =>
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
export const runScorerThunkAsync = (key: string, appId: string, teachId: string, uiScoreInput: UIScoreInput) => {
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

const runScorerAsync = (key: string, appId: string, teachId: string, uiScoreInput: UIScoreInput): ActionObject => {
    return {
        type: AT.RUN_SCORER_ASYNC,
        key: key,
        appId: appId,
        sessionId: teachId,
        uiScoreInput: uiScoreInput
    }
}
const runScorerFulfilled = (key: string, appId: string, teachId: string, uiScoreResponse: UIScoreResponse): ActionObject => {
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
export const postScorerFeedbackThunkAsync = (key: string, appId: string, teachId: string, uiTrainScorerStep: UITrainScorerStep, waitForUser: boolean, uiScoreInput: UIScoreInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.POST_SCORE_FEEDBACK_ASYNC)
        dispatch(postScorerFeedbackAsync(key, appId, teachId, uiTrainScorerStep, waitForUser, uiScoreInput))

        try {
            let uiPostScoreResponse = await clClient.teachSessionAddScorerStep(appId, teachId, uiTrainScorerStep)

            if (!waitForUser) {
                // Don't re-send predicted entities on subsequent score call
                uiScoreInput.extractResponse.predictedEntities = [];
               //LARS todo - force end task to always be wait
                dispatch(postScorerFeedbackFulfilled(key, appId, teachId, DialogMode.Scorer, uiPostScoreResponse, uiScoreInput))     
                dispatch(runScorerThunkAsync(key, appId, teachId, uiScoreInput))
            }
            else {
                let dialogMode = uiPostScoreResponse.isEndTask ? DialogMode.EndSession : DialogMode.Wait
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

const postScorerFeedbackAsync = (key: string, appId: string, teachId: string, uiTrainScorerStep: UITrainScorerStep, waitForUser: boolean, uiScoreInput: UIScoreInput): ActionObject => {
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
const postScorerFeedbackFulfilled = (key: string, appId: string, teachId: string, dialogMode: DialogMode, uiPostScoreResponse: UIPostScoreResponse, uiScoreInput: UIScoreInput): ActionObject => {
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