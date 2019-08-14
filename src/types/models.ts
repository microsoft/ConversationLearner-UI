/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'

export interface App extends CLM.AppBase {
    didPollingExpire: boolean
}

export interface SourceModel {
    source: CLM.AppDefinition,
    model: CLM.AppBase,
}

export type PartialTrainDialog = Pick<CLM.TrainDialog, "trainDialogId" | "tags" | "description"> & Partial<CLM.TrainDialog>