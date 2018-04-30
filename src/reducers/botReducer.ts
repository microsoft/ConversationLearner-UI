/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, BotState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: BotState = {
    botInfo: null
};

const botReducer: Reducer<BotState> = (state = initialState, action: ActionObject): BotState => {
    switch (action.type) {
        case AT.FETCH_BOTINFO_FULFILLED:
            return { ...state, botInfo: action.botInfo };
        default:
            return state;
    }
}
export default botReducer;