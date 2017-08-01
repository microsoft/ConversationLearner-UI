import { ActionObject, TeachSessionState } from '../types'
import { Reducer } from 'redux'
import { Teach } from 'blis-models'
import { TeachMode } from '../types/const'
import { AT } from '../types/ActionTypes'

const initialState: TeachSessionState = {
    all: [],
    current: null,
    mode: TeachMode.Wait,
    currentConversationStack: []
};

const teachSessionReducer: Reducer<any> = (state = initialState, action: ActionObject) => {
    switch (action.type) {
        case AT.FETCH_TEACH_SESSIONS_FULFILLED:
            return { ...state, all: action.allTeachSessions };
        case AT.CREATE_TEACH_SESSION_FULFILLED:
            let newSession = { ...action.teachSession, teachId: action.teachSessionId };
            let newState: TeachSessionState = {...state, all: [...state.all, newSession], current: newSession, mode: TeachMode.Wait }
            return newState;
        case AT.DELETE_TEACH_SESSION_FULFILLED:
            return { ...state, all: state.all.filter((t: Teach) => t.teachId !== action.teachSessionGUID) }
        case AT.SET_CURRENT_TEACH_SESSION:
            return { ...state, current: action.currentTeachSession };
        case AT.RUN_EXTRACTOR_FULFILLED:
            return {...state, mode: TeachMode.Extractor};
        case AT.RUN_SCORER_FULFILLED:
            return {...state, mode: TeachMode.Scorer};
        case AT.POST_SCORE_FEEDBACK_FULFILLED:
            return {...state, mode: TeachMode.Wait};
        case AT.TEACH_MESSAGE_RECEIVED:
            return {...state, currentConversationStack: [...state.currentConversationStack, action.message]};
        default:
            return state;
    }
}

export default teachSessionReducer;