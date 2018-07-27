/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as action from './actionActions'
import * as app from './appActions'
import * as bot from './botActions'
// delete is a reserved word, so we must use alternative
import * as chat from './chatActions'
import * as entity from './entityActions'
import * as display from './displayActions'
import * as log from './logActions'
import * as settings from './settingsActions'
import * as teach from './teachActions'
import * as train from './trainActions'

export default {
    action,
    app,
    bot,
    chat,
    entity,
    display,
    log,
    settings,
    teach,
    train,
}