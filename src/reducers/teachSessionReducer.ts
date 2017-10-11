import { ActionObject, TeachSessionState } from '../types'
import { Reducer } from 'redux'
import { Teach, ExtractResponse, UnscoredAction, ScoreReason } from 'blis-models'
import { TeachMode } from '../types/const'
import { AT } from '../types/ActionTypes'

const initialState: TeachSessionState = {
    all: [],
    current: null,
    mode: TeachMode.Wait,
    input: "",
    prevMemories: [],
    memories: [],
    scoreInput: null,
    uiScoreInput: null,
    extractResponses: [],
    scoreResponse: null,
    currentConversationStack: [],
    autoTeach: false
};

const teachSessionReducer: Reducer<TeachSessionState> = (state = initialState, action: ActionObject): TeachSessionState => {
    switch (action.type) {
        case AT.LOGOUT:
            return { ...initialState };
        case AT.FETCH_TEACH_SESSIONS_FULFILLED:
            return { ...state, all: action.allTeachSessions };
        case AT.CREATE_TEACH_SESSION_ASYNC:
            // Start with a clean slate
            return { ...initialState, all: state.all };
        case AT.CREATE_TEACH_SESSION_FULFILLED:
            let newSession = { ...action.teachSession, teachId: action.teachSessionId };
            let newState: TeachSessionState = { ...state, all: [...state.all, newSession], current: newSession, mode: TeachMode.Wait }
            return newState;
        case AT.DELETE_TEACH_SESSION_FULFILLED:
            return { ...initialState, all: state.all.filter((t: Teach) => t.teachId !== action.teachSessionGUID) }
        case AT.SET_CURRENT_TEACH_SESSION: // TODO - doesn't appear to do anything
            return { ...state, current: action.currentTeachSession };
        case AT.TEACH_MESSAGE_RECEIVED:
            return { ...state, currentConversationStack: [...state.currentConversationStack, action.message], input: action.message, scoreInput: null, scoreResponse: null, extractResponses: [] };
        case AT.RUN_EXTRACTOR_FULFILLED:
            // Replace existing extract response (if any) with new one
            let extractResponses: ExtractResponse[] = state.extractResponses.filter((e: ExtractResponse) => e.text != action.uiExtractResponse.extractResponse.text);
            extractResponses.push(action.uiExtractResponse.extractResponse);
            return { ...state, mode: TeachMode.Extractor, memories: action.uiExtractResponse.memories, prevMemories: action.uiExtractResponse.memories, extractResponses: extractResponses };
        case AT.UPDATE_EXTRACT_RESPONSE:
            // Replace existing extract response (if any) with new one and maintain ordering
            let index = state.extractResponses.findIndex((e: ExtractResponse) => e.text == action.extractResponse.text);
            // Should never happen, but protect just in case
            if (index < 0) {
                return { ...state };
            }
            let editedResponses = state.extractResponses.slice();
            editedResponses[index] = action.extractResponse;
            return { ...state, mode: TeachMode.Extractor, extractResponses: editedResponses };
        case AT.REMOVE_EXTRACT_RESPONSE:
            // Remove existing extract response
            let remainingResponses: ExtractResponse[] = state.extractResponses.filter((e: ExtractResponse) => e.text != action.extractResponse.text);
            return { ...state, mode: TeachMode.Extractor, extractResponses: remainingResponses };
        case AT.CLEAR_EXTRACT_RESPONSES:
            // Remove existing extract responses
             return { ...state, mode: TeachMode.Extractor, extractResponses: [] };
        case AT.RUN_SCORER_ASYNC:
            return { ...state, uiScoreInput: action.uiScoreInput }
        case AT.RUN_SCORER_FULFILLED:
            return { ...state, mode: TeachMode.Scorer, memories: action.uiScoreResponse.memories, prevMemories: state.memories, scoreInput: action.uiScoreResponse.scoreInput, scoreResponse: action.uiScoreResponse.scoreResponse };
        case AT.POST_SCORE_FEEDBACK_FULFILLEDWAIT:
            return { ...state, mode: TeachMode.Wait };
        case AT.POST_SCORE_FEEDBACK_FULFILLEDNOWAIT:
            return { ...state, mode: TeachMode.Scorer };
        case AT.TOGGLE_AUTO_TEACH:
            return { ...state, autoTeach: action.autoTeach }
        case AT.CREATE_ACTION_FULFILLED:
            // If action was created during scoring update available actions
            if (state.scoreResponse) {
                let unscoredAction = new UnscoredAction({
                    actionId: action.actionId,
                    payload: action.action.payload,
                    isTerminal: action.action.isTerminal,
                    metadata: action.action.metadata,
                    reason: ScoreReason.NotCalculated
                });
                let unscoredActions = [...state.scoreResponse.unscoredActions, unscoredAction];
                let scoreResponse = { ...state.scoreResponse, unscoredActions: unscoredActions };
                return { ...state, scoreResponse: scoreResponse };
            }
            else {
                return state;
            }
        default:
            return state;
    }
}

export default teachSessionReducer;