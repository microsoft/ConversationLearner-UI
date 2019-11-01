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
    // ActionBase or source, only care about ID for consistent labelAction 
    action: any | undefined,
}

export interface ImportedAction {
    text: string,
    buttons: string[],
    isTerminal: boolean,
    reprompt: boolean,
    isEntryNode?: boolean,
    lgName?: string,
    actionHash?: string
}

export interface ActivityHeight {
    sourceName: string
    index: number
    id: string,
    height: number | undefined,
    padding: number | undefined
}

export type PartialTrainDialog = Pick<CLM.TrainDialog, "trainDialogId" | "tags" | "description"> & Partial<CLM.TrainDialog>