import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { UserInput, ExtractResponse, UIScoreInput, UIExtractResponse, UIScoreResponse, UITrainScorerStep, TeachResponse } from 'blis-models'

export const runExtractorAsync = (key: string, appId: string, teachId: string, userInput: UserInput) : ActionObject => { 
    return {
        type: AT.RUN_EXTRACTOR_ASYNC,
        key: key,
        appId: appId,
        teachId: teachId,
        userInput: userInput
    }
}

export const runExtractorFulfilled = (key: string, appId: string, teachId: string, uiExtractResponse: UIExtractResponse) : ActionObject => { 
    return {
        type: AT.RUN_EXTRACTOR_FULFILLED,
        key: key,
        appId: appId,
        teachId: teachId,
        uiExtractResponse: uiExtractResponse
    }
}

// User makes an update to an extract response
export const updateExtractResponse = (extractResponse: ExtractResponse) : ActionObject => { 
    return {
        type: AT.UPDATE_EXTRACT_RESPONSE,
        extractResponse: extractResponse
    }
}

// User removes extract response
export const removeExtractResponse = (extractResponse: ExtractResponse) : ActionObject => { 
    return {
        type: AT.REMOVE_EXTRACT_RESPONSE,
        extractResponse: extractResponse
    }
}

export const runScorerAsync = (key: string, appId: string, teachId: string, uiScoreInput: UIScoreInput) : ActionObject => { 
    return {
        type: AT.RUN_SCORER_ASYNC,
        key: key,
        appId: appId,
        teachId: teachId,
        uiScoreInput: uiScoreInput
    }
}

export const runScorerFulfilled = (key: string, appId: string, teachId: string, uiScoreResponse: UIScoreResponse) : ActionObject => { 
    return {
        type: AT.RUN_SCORER_FULFILLED,
        key: key,
        appId: appId,
        teachId: teachId,
        uiScoreResponse: uiScoreResponse
    }
}

export const postScorerFeedbackAsync = (key: string, appId: string, teachId: string, uiTrainScorerStep: UITrainScorerStep, waitForUser: boolean, uiScoreInput: UIScoreInput) : ActionObject => { 
    return {
        type: AT.POST_SCORE_FEEDBACK_ASYNC,
        key: key,
        appId: appId,
        teachId: teachId,
        uiTrainScorerStep: uiTrainScorerStep,
        waitForUser: waitForUser,
        uiScoreInput: uiScoreInput
    }
}

// Score has been posted.  Action is Terminal
export const postScorerFeedbackWaitFulfilled = (key: string, appId: string, teachId: string, teachResponse: TeachResponse) : ActionObject => { 
    return {
        type: AT.POST_SCORE_FEEDBACK_FULFILLEDWAIT,
        key: key,
        appId: appId,
        teachId: teachId,
        teachResponse: teachResponse
    }
}

// Score has been posted.  Action is not Terminal
export const postScorerFeedbackNoWaitFulfilled = (key: string, appId: string, teachId: string, teachResponse: TeachResponse, uiScoreInput: UIScoreInput) : ActionObject => { 
    return {
        type: AT.POST_SCORE_FEEDBACK_FULFILLEDNOWAIT,
        key: key,
        appId: appId,
        teachId: teachId,
        teachResponse: teachResponse, 
        uiScoreInput: uiScoreInput
    }
}


export const toggleAutoTeach = (autoTeach: boolean): ActionObject => {
    return {
        type: AT.TOGGLE_AUTO_TEACH,
        autoTeach: autoTeach
    }
}