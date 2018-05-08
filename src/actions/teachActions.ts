/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { Dispatch } from 'redux'
import * as ClientFactory from '../services/clientFactory' 
import { setErrorDisplay } from './displayActions'
import {
    UserInput, ExtractResponse, ScoreInput, UIScoreInput, UIExtractResponse,
    UIScoreResponse, UITrainScorerStep, UITeachResponse,
    DialogType, DialogMode
} from '@conversationlearner/models'

// --------------------------
// RunExtractor
// --------------------------
export const runExtractorThunkAsync = (key: string, appId: string, extractType: DialogType, sessionId: string, turnIndex: number, userInput: UserInput) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.RUN_EXTRACTOR_ASYNC)
        dispatch(runExtractorAsync(key, appId, extractType, sessionId, turnIndex, userInput))

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

            dispatch(runExtractorFulfilled(key, appId, sessionId, uiExtractResponse))
            return uiExtractResponse
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.RUN_EXTRACTOR_ASYNC))
            throw error
        }
    }
}

const runExtractorAsync = (key: string, appId: string, extractType: DialogType, sessionId: string, turnIndex: number, userInput: UserInput): ActionObject => {
    return {
        type: AT.RUN_EXTRACTOR_ASYNC,
        key: key,
        appId: appId,
        extractType: extractType,
        sessionId: sessionId,
        turnIndex: turnIndex,
        userInput: userInput
    }
}

const runExtractorFulfilled = (key: string, appId: string, sessionId: string, uiExtractResponse: UIExtractResponse): ActionObject => {
    return {
        type: AT.RUN_EXTRACTOR_FULFILLED,
        key: key,
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
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.GET_SCORES_ASYNC))
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
            return uiScoreResponse
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.RUN_SCORER_ASYNC))
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
            let uiTeachResponse = await clClient.teachSessionAddScorerStep(appId, teachId, uiTrainScorerStep)

            if (!waitForUser) {
                // Don't re-send predicted entities on subsequent score call
                uiScoreInput.extractResponse.predictedEntities = [];
                dispatch(postScorerFeedbackFulfilled(key, appId, teachId, DialogMode.Scorer, uiTeachResponse, uiScoreInput))     
                dispatch(runScorerThunkAsync(key, appId, teachId, uiScoreInput))
            }
            else {
                dispatch(postScorerFeedbackFulfilled(key, appId, teachId, DialogMode.Wait, uiTeachResponse, null))
            }
            return uiTeachResponse
        }
        catch (error) {
            dispatch(setErrorDisplay(ErrorType.Error, error.message, [error.response], AT.POST_SCORE_FEEDBACK_ASYNC))
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
const postScorerFeedbackFulfilled = (key: string, appId: string, teachId: string, dialogMode: DialogMode, uiTeachResponse: UITeachResponse, uiScoreInput: UIScoreInput): ActionObject => {
    return {
        type: AT.POST_SCORE_FEEDBACK_FULFILLED,
        key: key,
        appId: appId,
        sessionId: teachId,
        dialogMode: dialogMode,
        uiTeachResponse: uiTeachResponse,
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