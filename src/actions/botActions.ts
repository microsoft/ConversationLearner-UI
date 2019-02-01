/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { Dispatch } from 'redux'
import { setErrorDisplay } from './displayActions'
import * as ClientFactory from '../services/clientFactory'
import { AxiosError } from 'axios'
import { BotInfo } from '@conversationlearner/models'

const fetchBotInfoAsync = (browserId: string, appId?: string): ActionObject => {
    return {
        type: AT.FETCH_BOTINFO_ASYNC,
        browserId,
        appId
    }
}

const fetchBotInfoFulfilled = (botInfo: BotInfo, browserId: string): ActionObject => {
    return {
        type: AT.FETCH_BOTINFO_FULFILLED,
        botInfo,
        browserId
    }
}

export const fetchBotInfoThunkAsync = (browserId: string, appId?: string) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.FETCH_BOTINFO_ASYNC)
        dispatch(fetchBotInfoAsync(browserId, appId))

        try {
            const botInfo = await clClient.getBotInfo(browserId, appId)
            dispatch(fetchBotInfoFulfilled(botInfo, browserId))
            return botInfo
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.FETCH_BOTINFO_ASYNC))
            throw error
        }
    }
}