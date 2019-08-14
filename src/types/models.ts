/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'

export interface App extends CLM.AppBase {
    didPollingExpire: boolean
}

export interface SourceAndModelPair {
    source: CLM.AppDefinition,
    model: CLM.AppBase,
    action: any | undefined, // ActionBase source,
}

export type DispatchInfo = {
    type: 'dispatcher',
    models: [string, string][]
}

export type PartialTrainDialog = Pick<CLM.TrainDialog, "trainDialogId" | "tags" | "description"> & Partial<CLM.TrainDialog>