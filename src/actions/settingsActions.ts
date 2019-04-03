/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'

export const settingsReset = (): ActionObject =>
    ({
        type: AT.SETTINGS_RESET
    })

export const settingsUpdate = (botPort: number, key: string | undefined): ActionObject =>
    ({
        type: AT.SETTINGS_UPDATE,
        botPort,
        key
    })