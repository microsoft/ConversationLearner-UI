/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import { ErrorType } from './const'
import { AT } from './ActionTypes'
import { TipType } from '../components/ToolTips/ToolTips'

export type ActionState = CLM.ActionBase[];
export type EntityState = CLM.EntityBase[];
export type ErrorState = {
    type: ErrorType,
    title: string | null,
    message: string,
    actionType: AT | null,
    closeCallback: (() => void) | null
}
export type TrainDialogState = CLM.TrainDialog[];

export type LogDialogState = CLM.LogDialog[]

export type AppsState = {
    all: CLM.AppBase[],
    activeApps: { [appId: string]: string };  // appId: packageId
    selectedAppId: string | undefined
}
export type BotState = {
    botInfo: CLM.BotInfo | null
    browserId: string
}
export type TeachSessionState = {
    teach: CLM.Teach | undefined,
    dialogMode: CLM.DialogMode,
    input: string,
    prevMemories: CLM.Memory[],
    memories: CLM.Memory[],
    scoreInput: CLM.ScoreInput | undefined,
    uiScoreInput: CLM.UIScoreInput | undefined,
    extractResponses: CLM.ExtractResponse[],
    extractConflict: CLM.ExtractResponse | null,
    botAPIError: CLM.LogicAPIError | null,
    scoreResponse: CLM.ScoreResponse | undefined,
    autoTeach: boolean
}
export type ChatSessionState = {
    all: CLM.Session[],
    current: CLM.Session | null
}
export type DisplayState = {
    displaySpinner: string[],
    tipType: TipType,
    clearedBanner: CLM.Banner | null,
    webchatScrollPosition: number | undefined
}

export interface User {
    name: string
    id: string
}

export type UserState = {
    user: User | undefined
}

export interface ProfileState {
    current: any
}

export interface SettingsState {
    botPort: number
}

export type SourceState = { [appId: string]: CLM.AppDefinitionChange }

export type State = {
    profile: ProfileState,
    user: UserState,
    bot: BotState,
    apps: AppsState,
    entities: EntityState,
    actions: ActionState,
    trainDialogs: TrainDialogState,
    display: DisplayState,
    error: ErrorState,
    logDialogs: LogDialogState,
    teachSession: TeachSessionState,
    chatSessions: ChatSessionState,
    settings: SettingsState,
    source: SourceState
}
