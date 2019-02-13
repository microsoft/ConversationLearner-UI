/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { AppBase, AppMetaData, TrainDialog } from '@conversationlearner/models'

export interface App extends AppBase {
    didPollingExpire: boolean
}

export interface AppInput {
    appName: string
    locale: string
    metadata: AppMetaData
}

export type PartialTrainDialog = Pick<TrainDialog, "trainDialogId"> & Partial<TrainDialog>