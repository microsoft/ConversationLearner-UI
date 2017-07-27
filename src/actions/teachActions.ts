import { ActionObject } from '../types'
import { UserInput, TrainExtractorStep, ExtractResponse, TrainScorerStep } from 'blis-models'

export const runExtractor = (key: string, appId: string, teachId: string, userInput: UserInput) : ActionObject => { 
    return {
        type: 'RUN_EXTRACTOR',
        key: key,
        appId: appId,
        teachId: teachId,
        userInput: userInput
    }
}

export const postExtractorFeedback = (key: string, appId: string, teachId: string, trainExtractorStep: TrainExtractorStep) : ActionObject => { 
    return {
        type: 'POST_EXTACT_FEEDBACK',
        key: key,
        appId: appId,
        teachId: teachId,
        trainExtractorStep: trainExtractorStep
    }
}

export const runScorer = (key: string, appId: string, teachId: string, extractResponse: ExtractResponse) : ActionObject => { 
    return {
        type: 'RUN_SCORER',
        key: key,
        appId: appId,
        teachId: teachId,
        extractResponse: extractResponse
    }
}

export const postScorerFeedback = (key: string, appId: string, teachId: string, trainScorerStep: TrainScorerStep) : ActionObject => { 
    return {
        type: 'POST_SCORE_FEEDBACK',
        key: key,
        appId: appId,
        teachId: teachId,
        trainScorerStep: trainScorerStep
    }
}
