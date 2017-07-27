import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { UserInput, TrainExtractorStep, ExtractResponse, TrainScorerStep } from 'blis-models';
import { putExtract, postExtraction, putScore, postScore } from "./apiHelpers";

export const runExtractor: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("RUN_EXTRACTOR")
        .flatMap((action: any) =>
            putExtract(action.key, action.appId, action.teachId, action.userInput)
        );
}

export const extractorFeedback: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("POST_EXTACT_FEEDBACK")
        .flatMap((action: any) =>
            postExtraction(action.key, action.appId, action.teachId, action.trainExtractorStep)
        );
}

export const runScorer: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("RUN_SCORER")
        .flatMap((action: any) =>
            putScore(action.key, action.appId, action.teachId, action.extractResponse)
        );
}

export const scorerFeedback: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType("POST_SCORE_FEEDBACK")
        .flatMap((action: any) =>
            postScore(action.key, action.appId, action.teachId, action.trainScorerStep)
        );
}
