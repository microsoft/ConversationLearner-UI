/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as BB from 'botbuilder'
import { deepCopy } from './util'
import { User } from '../types'

export async function toTranscripts(
    appDefinition: CLM.AppDefinition, 
    appId: string,
    user: User,
    fetchHistoryAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean) => Promise<CLM.TeachWithHistory>
    ): Promise<BB.Transcript[]> {

    const definitions = {
        entities: appDefinition.entities,
        actions: appDefinition.actions,
        trainDialogs: []
    }

    return Promise.all(appDefinition.trainDialogs.map(td => getHistory(appId, td, user, definitions, fetchHistoryAsync)))
}

async function getHistory(appId: string, trainDialog: CLM.TrainDialog, user: User, definitions: CLM.AppDefinition,
    fetchHistoryAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string, useMarkdown: boolean) => Promise<CLM.TeachWithHistory>
    ): Promise<BB.Transcript> {
    const newTrainDialog = deepCopy(trainDialog)
    newTrainDialog.definitions = definitions

    const teachWithHistory = await fetchHistoryAsync(appId, newTrainDialog, user.name, user.id, false)
    return { activities: teachWithHistory.history }
}