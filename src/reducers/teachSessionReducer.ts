import { ActionObject, TeachSessionState } from '../types'
import { Reducer } from 'redux'
import { UnscoredAction, ScoreReason } from 'blis-models'
import { DialogMode } from '../types/const'
import { AT } from '../types/ActionTypes'

const initialState: TeachSessionState = {
    all: [],
    current: null,
    mode: DialogMode.Wait,
    input: '',
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
            return { ...state, all: [...state.all, action.teachSession], current: action.teachSession, mode: DialogMode.Wait }
        case AT.CREATE_TEACH_SESSION_FROM_BRANCH_FULFILLED:
            return { ...state, all: [...state.all, action.teachWithHistory.teach], memories: action.teachWithHistory.memories, current: action.teachWithHistory.teach, mode: DialogMode.Wait }
        case AT.CREATE_TEACH_SESSION_FROM_UNDO_FULFILLED:
            return { ...state, all: [...state.all, action.teachWithHistory.teach], memories: action.teachWithHistory.memories, current: action.teachWithHistory.teach, mode: DialogMode.Wait }
        case AT.DELETE_TEACH_SESSION_FULFILLED:
            return { ...initialState, all: state.all.filter(t => t.teachId !== action.teachSessionGUID) }
        case AT.TEACH_MESSAGE_RECEIVED:
            return { ...state, currentConversationStack: [...state.currentConversationStack, action.message], input: action.message, scoreInput: null, scoreResponse: null, extractResponses: [] };
        case AT.RUN_EXTRACTOR_FULFILLED:
            // Replace existing extract response (if any) with new one
            const extractResponses = state.extractResponses.filter(e => e.text !== action.uiExtractResponse.extractResponse.text);
            extractResponses.push(action.uiExtractResponse.extractResponse);
            return { ...state, mode: DialogMode.Extractor, memories: action.uiExtractResponse.memories, prevMemories: action.uiExtractResponse.memories, extractResponses: extractResponses };
        case AT.UPDATE_EXTRACT_RESPONSE:
            // Replace existing extract response (if any) with new one and maintain ordering
            let index = state.extractResponses.findIndex(e => e.text === action.extractResponse.text);
            // Should never happen, but protect just in case
            if (index < 0) {
                return { ...state };
            }
            let editedResponses = state.extractResponses.slice();
            editedResponses[index] = action.extractResponse;
            return { ...state, mode: DialogMode.Extractor, extractResponses: editedResponses };
        case AT.REMOVE_EXTRACT_RESPONSE:
            // Remove existing extract response
            let remainingResponses = state.extractResponses.filter(e => e.text !== action.extractResponse.text);
            return { ...state, mode: DialogMode.Extractor, extractResponses: remainingResponses };
        case AT.CLEAR_EXTRACT_RESPONSES:
            // Remove existing extract responses
            return { ...state, mode: DialogMode.Extractor, extractResponses: [] };
        case AT.RUN_SCORER_ASYNC:
            return { ...state, uiScoreInput: action.uiScoreInput }
        case AT.GET_SCORES_FULFILLED:
        case AT.RUN_SCORER_FULFILLED:
            return { ...state, mode: DialogMode.Scorer, memories: action.uiScoreResponse.memories, prevMemories: state.memories, scoreInput: action.uiScoreResponse.scoreInput, scoreResponse: action.uiScoreResponse.scoreResponse };
        case AT.POST_SCORE_FEEDBACK_FULFILLEDWAIT:
            return { ...state, mode: DialogMode.Wait, memories: action.uiTeachResponse.memories };
        case AT.POST_SCORE_FEEDBACK_FULFILLEDNOWAIT:
            return { ...state, mode: DialogMode.Scorer, memories: action.uiTeachResponse.memories };
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
            } else {
                return state;
            }
        default:
            return state;
    }
}

export default teachSessionReducer;