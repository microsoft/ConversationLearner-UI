/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, TeachSessionState } from '../types'
import { Reducer } from 'redux'
import { UnscoredAction, ScoreReason, DialogMode } from '@conversationlearner/models'
import { AT } from '../types/ActionTypes'
import produce from 'immer'

const initialState: TeachSessionState = {
    teach: undefined,
    dialogMode: DialogMode.Wait,
    input: '',
    prevMemories: [],
    memories: [],
    scoreInput: undefined,
    uiScoreInput: undefined,
    extractResponses: [],
    extractConflict: null,
    botAPIError: null,
    scoreResponse: undefined,
    autoTeach: false
};

const teachSessionReducer: Reducer<TeachSessionState> = produce((state: TeachSessionState, action: ActionObject) => {
    switch (action.type) {
        case AT.USER_LOGOUT:
            return { ...initialState }
        case AT.CREATE_TEACH_SESSION_ASYNC:
            // Start with a clean slate
            return { ...initialState }
        case AT.CREATE_TEACH_SESSION_FULFILLED:
            state.teach = action.teachSession
            state.dialogMode = DialogMode.Wait
            state.memories = action.memories
            return
        case AT.CREATE_TEACH_SESSION_FROMHISTORYFULFILLED:
            return {
                ...initialState,
                teach: action.teachWithHistory.teach,
                dialogMode: action.teachWithHistory.dialogMode,
                memories: action.teachWithHistory.memories,
                prevMemories: action.teachWithHistory.prevMemories,
                scoreResponse: action.teachWithHistory.scoreResponse,
                scoreInput: action.teachWithHistory.scoreInput,
                extractResponses: action.teachWithHistory.extractResponse ? [action.teachWithHistory.extractResponse] : [],
                uiScoreInput: action.teachWithHistory.uiScoreInput
            }
        case AT.DELETE_TEACH_SESSION_FULFILLED:
            if (state.teach && state.teach.teachId !== action.teachSessionGUID) {
                console.warn("Deleting Teach session that isn't the active one")
            }
            return { ...initialState }
        case AT.CLEAR_TEACH_SESSION:
            return { ...initialState }
        case AT.DELETE_MEMORY_FULFILLED:
            state.memories = []
            return
        case AT.RUN_EXTRACTOR_FULFILLED:
            // Replace existing extract response (if any) with new one
            const extractResponses = state.extractResponses.filter(e => e.text !== action.uiExtractResponse.extractResponse.text);
            extractResponses.push(action.uiExtractResponse.extractResponse);
            
            state.extractResponses = extractResponses
            state.dialogMode = DialogMode.Extractor
            state.memories = action.uiExtractResponse.memories
            state.prevMemories = action.uiExtractResponse.memories
            return
        case AT.UPDATE_EXTRACT_RESPONSE:
            // Replace existing extract response (if any) with new one and maintain ordering
            const index = state.extractResponses.findIndex(e => e.text === action.extractResponse.text);
            // Should never happen, but protect just in case
            if (index < 0) {
                return
            }
            
            state.extractResponses[index] = action.extractResponse
            state.dialogMode = DialogMode.Extractor
            return
        case AT.REMOVE_EXTRACT_RESPONSE:
            // Remove existing extract response
            state.dialogMode = DialogMode.Extractor
            state.extractResponses = state.extractResponses.filter(e => e.text !== action.extractResponse.text)
            return
        case AT.CLEAR_EXTRACT_RESPONSES:
            // Remove existing extract responses
            state.extractResponses = []
            return
        case AT.CLEAR_EXTRACT_CONFLICT:
            state.extractConflict = null
            return
        case AT.RUN_SCORER_ASYNC:
            state.uiScoreInput = action.uiScoreInput
            return
        case AT.GET_SCORES_FULFILLED:
            state.dialogMode =  DialogMode.Scorer,
            state.memories =  action.uiScoreResponse.memories!,
            state.prevMemories = state.memories,
            state.scoreInput =  action.uiScoreResponse!.scoreInput,
            state.scoreResponse =  action.uiScoreResponse!.scoreResponse
            return
        case AT.FETCH_TEXTVARIATION_CONFLICT_FULFILLED:
            if (action.extractResponse) {
                state.extractConflict = action.extractResponse
            }
            else {
                state.extractConflict = null
            }
            return
        case AT.SET_TEXTVARIATION_CONFLICT:
            state.extractConflict = action.extractResponse
            return
        case AT.RUN_SCORER_FULFILLED:
            if (action.uiScoreResponse.extractConflict) {
                state.extractConflict = action.uiScoreResponse.extractConflict
            }
            else if (action.uiScoreResponse.botAPIError) {
                state.botAPIError = action.uiScoreResponse.botAPIError
            }
            else {
                state.dialogMode = DialogMode.Scorer
                state.memories = action.uiScoreResponse.memories!
                state.prevMemories = state.memories
                state.scoreInput = action.uiScoreResponse.scoreInput
                state.scoreResponse = action.uiScoreResponse.scoreResponse
                state.extractConflict = null
                state.botAPIError = null
            }
            return
        case AT.POST_SCORE_FEEDBACK_FULFILLED:
            state.dialogMode = action.dialogMode
            state.memories = action.uiPostScoreResponse.memories
            state.extractResponses = []
            return
        case AT.TOGGLE_AUTO_TEACH:
            state.autoTeach = action.autoTeach
            return
        case AT.CREATE_ACTION_FULFILLED:
            // If action was created during scoring update available actions
            if (state.scoreResponse) {
                const unscoredAction: UnscoredAction = {
                    actionId: action.action.actionId,
                    payload: action.action.payload,
                    isTerminal: action.action.isTerminal,
                    actionType: action.action.actionType,
                    reason: ScoreReason.NotCalculated
                }
                state.scoreResponse.unscoredActions.push(unscoredAction)
                return
            }

            return
        default:
            return
    }
}, initialState)

export default teachSessionReducer