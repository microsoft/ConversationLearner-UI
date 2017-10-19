import { ActionObject, ChatSessionState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: ChatSessionState = {
    all: [],
    current: null,
    currentConversationStack: []
};

const chatSessionReducer: Reducer<ChatSessionState> = (state = initialState, action: ActionObject): ChatSessionState => {
    switch (action.type) {
        case AT.LOGOUT:
            return { ...initialState };
        case AT.FETCH_CHAT_SESSIONS_FULFILLED:
            return { ...state, all: action.allSessions };
        case AT.CREATE_CHAT_SESSION_FULFILLED:
            return { ...state, all: [...state.all, action.session], current: action.session }
        case AT.DELETE_CHAT_SESSION_FULFILLED:
            return {
                ...state,
                all: state.all.filter(s => s.sessionId !== action.sessionId),
                current: state.current.sessionId === action.sessionId ? null : state.current
            }
        case AT.SET_CURRENT_CHAT_SESSION:
            return { ...state, current: action.currentSession };
        case AT.CHAT_MESSAGE_RECEIVED:
            return { ...state, currentConversationStack: [...state.currentConversationStack, action.message] };
        default:
            return state;
    }
}

export default chatSessionReducer;