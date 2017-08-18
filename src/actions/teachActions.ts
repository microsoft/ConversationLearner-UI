import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { UserInput, TrainExtractorStep, ExtractResponse, UIExtractResponse, UIScoreResponse, TrainScorerStep, TeachResponse } from 'blis-models'

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

export const postExtractorFeedbackAsync = (key: string, appId: string, teachId: string, trainExtractorStep: TrainExtractorStep) : ActionObject => { 
    return {
        type: AT.POST_EXTACT_FEEDBACK_ASYNC,
        key: key,
        appId: appId,
        teachId: teachId,
        trainExtractorStep: trainExtractorStep
    }
}

export const postExtractorFeedbackFulfilled = (key: string, appId: string, teachId: string, teachResponse: TeachResponse) : ActionObject => { 
    return {
        type: AT.POST_EXTACT_FEEDBACK_FULFILLED,
        key: key,
        appId: appId,
        teachId: teachId,
        teachResponse: teachResponse
    }
}

export const runScorerAsync = (key: string, appId: string, teachId: string, extractResponse: ExtractResponse) : ActionObject => { 
    return {
        type: AT.RUN_SCORER_ASYNC,
        key: key,
        appId: appId,
        teachId: teachId,
        extractResponse: extractResponse
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

export const postScorerFeedbackAsync = (key: string, appId: string, teachId: string, trainScorerStep: TrainScorerStep) : ActionObject => { 
    return {
        type: AT.POST_SCORE_FEEDBACK_ASYNC,
        key: key,
        appId: appId,
        teachId: teachId,
        trainScorerStep: trainScorerStep
    }
}

export const postScorerFeedbackFulfilled = (key: string, appId: string, teachId: string, teachResponse: TeachResponse) : ActionObject => { 
    return {
        type: AT.POST_SCORE_FEEDBACK_FULFILLED,
        key: key,
        appId: appId,
        teachId: teachId,
        teachResponse: teachResponse
    }
}