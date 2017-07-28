import { ActionObject, TeachSessionState } from '../types'
import { Reducer } from 'redux'
import { Teach } from 'blis-models'
import { TeachMode } from '../types/const'

const initialState: TeachSessionState = {
    all: [],
    current: null,
    mode: TeachMode.Wait
};

const teachSessionReducer: Reducer<any> = (state = initialState, action: ActionObject) => {
    switch (action.type) {
        case 'FETCH_TEACH_SESSIONS_FULFILLED':
            return { ...state, all: action.allTeachSessions };
        case 'CREATE_TEACH_SESSION_FULFILLED':
            let newSession = { ...action.teachSession, teachId: action.teachSessionId };
            let newState: TeachSessionState = { all: [...state.all, newSession], current: newSession, mode: TeachMode.Wait }
            return newState;
        case 'DELETE_TEACH_SESSION_FULFILLED':
            return { ...state, all: state.all.filter((t: Teach) => t.teachId !== action.teachSessionGUID) }
        case 'SET_CURRENT_TEACH_SESSION':
            return { ...state, current: action.currentTeachSession };
        case 'RUN_EXTRACTOR_FULFILLED':
            return {...state, mode: TeachMode.Extractor};
        case 'RUN_SCORER_FULFILLED':
            return {...state, mode: TeachMode.Scorer};
        case 'POST_SCORE_FEEDBACK_FULFILLED':
            return {...state, mode: TeachMode.Wait};
        default:
            return state;
    }
}

export default teachSessionReducer;