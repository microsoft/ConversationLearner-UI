import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { UserInput, TrainExtractorStep, ExtractResponse } from 'blis-models';
import { putExtract, putScore, postScore } from "./apiHelpers";

export const runExtractorEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.RUN_EXTRACTOR_ASYNC)
        .flatMap((action: any) =>
            putExtract(action.key, action.appId, action.teachId, action.userInput)
        );
}

export const runScorerEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.RUN_SCORER_ASYNC)
        .flatMap((action: any) =>
            putScore(action.key, action.appId, action.teachId, action.uiScoreInput)
        );
}

export const scorerFeedbackEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.POST_SCORE_FEEDBACK_ASYNC)
        .flatMap((action: any) =>
            postScore(action.key, action.appId, action.teachId, action.trainScorerStep, action.waitForUser, action.uiScoreInput)
        );
}

// Score has been put, action was not terminal so put new score
export const postScoreFeedbackFulfilledWaitEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.POST_SCORE_FEEDBACK_FULFILLEDNOWAIT)
        .flatMap((action: any) =>
            putScore(action.key, action.appId, action.teachId, action.uiScoreInput)
        );
}
