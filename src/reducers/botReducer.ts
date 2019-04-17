/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, BotState } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'
import * as CLM from '@conversationlearner/models'
import produce from 'immer'

const initialState: BotState = {
    botInfo: null,

    // Each instance of UI opened has a different key used for the bot's state storage
    // This allow multiple version of the UI to be open simultaneously
    browserId: CLM.ModelUtils.generateGUID()
};

const botReducer: Reducer<BotState> = produce((state: BotState, action: ActionObject) => {
    switch (action.type) {
        case AT.FETCH_BOTINFO_FULFILLED:
            state.botInfo = action.botInfo
            state.browserId = action.browserId
            return
    }
}, initialState)
export default botReducer