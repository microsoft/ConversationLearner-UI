/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import {
    DialogMode,
    AppBase,
    Banner,
    BotInfo,
    EntityBase,
    ActionBase,
    TrainDialog, LogDialog, Teach, Session,
    Memory, UIScoreInput, ScoreInput, ExtractResponse, ScoreResponse, AppDefinitionChange
} from '@conversationlearner/models'
import { ErrorType } from './const'
import { AT } from './ActionTypes'
import { TipType } from '../components/ToolTips/ToolTips'

export type ActionState = ActionBase[];
export type EntityState = EntityBase[];
export type ErrorState = {
    type: ErrorType,
    title: string | null,
    messages: string[],
    actionType: AT | null
}
export type TrainDialogState = TrainDialog[];

export type LogDialogState = LogDialog[]

export type AppsState = {
    all: AppBase[],
    activeApps: { [appId: string]: string };  // appId: packageId
}
export type BotState = {
    botInfo: BotInfo | null
    browserId: string
}
export type TeachSessionState = {
    all: Teach[],
    current: Teach | undefined,
    mode: DialogMode,
    input: string,
    prevMemories: Memory[],
    memories: Memory[],
    scoreInput: ScoreInput | undefined,
    uiScoreInput: UIScoreInput | undefined,
    extractResponses: ExtractResponse[],
    scoreResponse: ScoreResponse | undefined,
    autoTeach: boolean
}
export type ChatSessionState = {
    all: Session[],
    current: Session | null
}
export type DisplayState = {
    displaySpinner: string[],
    tipType: TipType,
    clearedBanner: Banner | null,
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

export type SourceState = { [appId: string]: AppDefinitionChange }

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
    teachSessions: TeachSessionState,
    chatSessions: ChatSessionState,
    settings: SettingsState,
    source: SourceState
}
