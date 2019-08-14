/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { AppBase, AppMetaData, TrainDialog, AppDefinition } from '@conversationlearner/models'

export interface App extends AppBase {
    didPollingExpire: boolean
}

export interface SourceAndModelPair {
    source: AppDefinition,
    model: AppBase,
    action: any | undefined, // ActionBase source,
}

export type DispatchInfo = {
    type: 'dispatcher',
    models: [string, string][]
}

export interface AppInput {
    appName: string
    locale: string
    metadata: AppMetaData
}

export type PartialTrainDialog = Pick<TrainDialog, "trainDialogId" | "tags" | "description"> & Partial<TrainDialog>