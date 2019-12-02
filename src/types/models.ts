/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react'

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

// Used to add id for running UI tests
export interface ChoiceGroupOptionWithTestId extends OF.IChoiceGroupOption {
    'data-testid': string
}

export type PartialTrainDialog = Pick<CLM.TrainDialog, "trainDialogId" | "tags" | "description"> & Partial<CLM.TrainDialog>