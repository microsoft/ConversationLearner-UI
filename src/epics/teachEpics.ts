import 'rxjs';
import * as Rx from 'rxjs';
import { ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { putExtract, putScore, postScore } from "./apiHelpers";

const assertNever = () => { throw Error(`Should not reach here`) }

export const runExtractorEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.RUN_EXTRACTOR_ASYNC)
        .flatMap(action => 
            (action.type === AT.RUN_EXTRACTOR_ASYNC) ? putExtract(action.key, action.appId, action.extractType, action.sessionId, action.turnIndex, action.userInput) : assertNever()
        );
}

export const runScorerEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.RUN_SCORER_ASYNC)
        .flatMap((action: any) =>
            putScore(action.key, action.appId, action.sessionId, action.uiScoreInput)
        );
}

export const scorerFeedbackEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.POST_SCORE_FEEDBACK_ASYNC)
        .flatMap((action: any) =>
            postScore(action.key, action.appId, action.sessionId, action.uiTrainScorerStep, action.waitForUser, action.uiScoreInput)
        );
}

// Score has been put, action was not terminal so put new score
export const postScoreFeedbackFulfilledWaitEpic: Epic<ActionObject, State> = (action$: ActionsObservable<ActionObject>): Rx.Observable<ActionObject> => {
    return action$.ofType(AT.POST_SCORE_FEEDBACK_FULFILLEDNOWAIT)
        .flatMap((action: any) =>
            putScore(action.key, action.appId, action.sessionId, action.uiScoreInput)
        );
}
