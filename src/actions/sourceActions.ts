/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActionObject, ErrorType } from '../types'
import { AT } from '../types/ActionTypes'
import { AppDefinitionChange, AppDefinition } from '@conversationlearner/models'
import { Dispatch } from 'redux'
import { setErrorDisplay } from './displayActions'
import * as ClientFactory from '../services/clientFactory'
import { AxiosError } from 'axios';

export const setUpdatedAppDefinition = (appId: string, appDefinitionChange: AppDefinitionChange): ActionObject =>
    ({
        type: AT.SOURCE_SET_UPDATED_APP_DEFINITION,
        appId,
        appDefinitionChange
    })

const promoteUpdatedAppDefinition = (appId: string, updatedAppDefinition: AppDefinition): ActionObject =>
    ({
        type: AT.SOURCE_PROMOTE_UPDATED_APP_DEFINITION,
        appId,
        updatedAppDefinition
    })

export const promoteUpdatedAppDefinitionThunkAsync = (appId: string, updatedAppDefinition: AppDefinition) => {
    return async (dispatch: Dispatch<any>) => {
        const clClient = ClientFactory.getInstance(AT.SOURCE_PROMOTE_UPDATED_APP_DEFINITION)

        try {
            await clClient.sourcepost(appId, updatedAppDefinition)
            dispatch(promoteUpdatedAppDefinition(appId, updatedAppDefinition))
            return updatedAppDefinition
        } catch (e) {
            const error = e as AxiosError
            dispatch(setErrorDisplay(ErrorType.Error, error.message, error.response ? JSON.stringify(error.response, null, '  ') : "", AT.SOURCE_PROMOTE_UPDATED_APP_DEFINITION))
            return null;
        }
    }
}