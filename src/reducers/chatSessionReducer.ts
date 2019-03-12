/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ChatSessionState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import produce from 'immer'

const initialState: ChatSessionState = {
    all: [],
    current: null
};

const chatSessionReducer: Reducer<ChatSessionState> = produce((state: ChatSessionState, action: ActionObject) => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return { ...initialState };
        case AT.FETCH_CHAT_SESSIONS_FULFILLED:
            state.all = action.allSessions
            return
        case AT.CREATE_CHAT_SESSION_FULFILLED:
            state.all.push(action.session)
            state.current = action.session
            return
        case AT.DELETE_CHAT_SESSION_FULFILLED:
            state.all = state.all.filter(s => s.sessionId !== action.sessionId)
            state.current = (!state.current || state.current.sessionId === action.sessionId)
                ? null
                : state.current
            return
        default:
            return
    }
}, initialState)

export default chatSessionReducer