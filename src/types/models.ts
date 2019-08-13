/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { AppBase, TrainDialog } from '@conversationlearner/models'

export interface App extends AppBase {
    didPollingExpire: boolean
}

export type PartialTrainDialog = Pick<TrainDialog, "trainDialogId" | "tags" | "description"> & Partial<TrainDialog>