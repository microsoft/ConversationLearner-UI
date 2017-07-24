import { ActionObject, ChatSessionState } from '../types'
import { Reducer } from 'redux'
import { Session } from 'blis-models'

const initialState: ChatSessionState = {
    all: [],
    current: null
};

const chatSessionReducer: Reducer<ChatSessionState> = (state = initialState, action: ActionObject) => {
    switch (action.type) {
        case 'FETCH_CHAT_SESSIONS_FULFILLED':
            return { ...state, all: action.allSessions };
        case 'CREATE_CHAT_SESSION_FULFILLED':
            let newSession = { ...action.session, sessionId: action.sessionId };
            let newState: ChatSessionState = {all: [...state.all, newSession ], current: newSession }
            return newState;
        case 'DELETE_CHAT_SESSION_FULFILLED':
            return { ...state, all: state.all.filter((s: Session) => s.sessionId !== action.sessionGUID) }
        case 'SET_CURRENT_CHAT_SESSION':
            return { ...state, current: action.currentSession };
        default:
            return state;
    }
}

export default chatSessionReducer;