import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import {
    UserInput, ExtractResponse, ScoreInput, UIScoreInput, UIExtractResponse,
    UIScoreResponse, UITrainScorerStep, UITeachResponse,
    DialogType
} from 'blis-models'

export const runExtractorAsync = (key: string, appId: string, extractType: DialogType, sessionId: string, turnIndex: number, userInput: UserInput): ActionObject => {
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

export const runExtractorFulfilled = (key: string, appId: string, sessionId: string, uiExtractResponse: UIExtractResponse): ActionObject => {
    return {
        type: AT.RUN_EXTRACTOR_FULFILLED,
        key: key,
        appId: appId,
        sessionId: sessionId,
        uiExtractResponse: uiExtractResponse
    }
}

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

export const getScoresAsync = (key: string, appId: string, sessionId: string, scoreInput: ScoreInput): ActionObject =>
    ({
        type: AT.GET_SCORES_ASYNC,
        key,
        appId,
        sessionId,
        scoreInput
    })

export const getScoresFulfilled = (key: string, appId: string, sessionId: string, uiScoreResponse: UIScoreResponse): ActionObject =>
    ({
        type: AT.GET_SCORES_FULFILLED,
        key,
        appId,
        sessionId,
        uiScoreResponse,
    })

export const runScorerAsync = (key: string, appId: string, teachId: string, uiScoreInput: UIScoreInput): ActionObject => {
    return {
        type: AT.RUN_SCORER_ASYNC,
        key: key,
        appId: appId,
        sessionId: teachId,
        uiScoreInput: uiScoreInput
    }
}

export const runScorerFulfilled = (key: string, appId: string, teachId: string, uiScoreResponse: UIScoreResponse): ActionObject => {
    return {
        type: AT.RUN_SCORER_FULFILLED,
        key: key,
        appId: appId,
        sessionId: teachId,
        uiScoreResponse: uiScoreResponse
    }
}

export const postScorerFeedbackAsync = (key: string, appId: string, teachId: string, uiTrainScorerStep: UITrainScorerStep, waitForUser: boolean, uiScoreInput: UIScoreInput): ActionObject => {
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
export const postScorerFeedbackWaitFulfilled = (key: string, appId: string, teachId: string, uiTeachResponse: UITeachResponse): ActionObject => {
    return {
        type: AT.POST_SCORE_FEEDBACK_FULFILLEDWAIT,
        key: key,
        appId: appId,
        sessionId: teachId,
        uiTeachResponse: uiTeachResponse
    }
}

// Score has been posted.  Action is not Terminal
export const postScorerFeedbackNoWaitFulfilled = (key: string, appId: string, teachId: string, uiTeachResponse: UITeachResponse, uiScoreInput: UIScoreInput): ActionObject => {
    return {
        type: AT.POST_SCORE_FEEDBACK_FULFILLEDNOWAIT,
        key: key,
        appId: appId,
        sessionId: teachId,
        uiTeachResponse: uiTeachResponse,
        uiScoreInput: uiScoreInput
    }
}

export const toggleAutoTeach = (autoTeach: boolean): ActionObject => {
    return {
        type: AT.TOGGLE_AUTO_TEACH,
        autoTeach: autoTeach
    }
}