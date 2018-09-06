/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, BotState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import * as uuid from 'uuid'

const initialState: BotState = {
    botInfo: null,

    // Each instance of UI opened has a different key used for the bot's state storage
    // This allow multiple version of the UI to be open simultaneously
    browserId: uuid.v4()
};

const botReducer: Reducer<BotState> = (state = initialState, action: ActionObject): BotState => {
    switch (action.type) {
        case AT.FETCH_BOTINFO_FULFILLED:
            return {
                ...state,
                botInfo: action.botInfo,
                browserId: action.browserId
            }
        default:
            return state
    }
}
export default botReducer