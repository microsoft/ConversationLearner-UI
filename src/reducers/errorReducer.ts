/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorState } from '../types'
import { ErrorType } from '../types/const'
import { Reducer } from 'redux'
import { AT } from '../types/ActionTypes'
import produce from 'immer'

const initialState: ErrorState = {
    type: ErrorType.Error,
    title: undefined,
    messages: [""],
    actionType: AT.NO_OP,
    closeCallback: undefined
}

const errorReducer: Reducer<ErrorState> = produce((state: ErrorState, action: ActionObject) => {
    switch (action.type) {
        case AT.CLEAR_ERROR_DISPLAY:
            return { ...initialState }
        case AT.SET_ERROR_DISPLAY:
            state.type = action.errorType
            state.title = action.title
            state.messages = action.messages
            state.actionType = action.actionType
            return
        case AT.SET_ERROR_DISMISS_CALLBACK:
            state.closeCallback = action.closeCallback
            return
        case AT.FETCH_BOTINFO_FULFILLED:
            if (action.botInfo.validationError) {
                return {
                    type: ErrorType.Error,
                    title: `Configuration Error`,
                    messages: [action.botInfo.validationError],
                    actionType: AT.FETCH_BOTINFO_ASYNC,
                    closeCallback: undefined
                }
            }
            return
        default:
            return
    }
}, initialState)

export default errorReducer