import {
    BlisAppBase,
    BotInfo,
    EntityBase,
    ActionBase,
    TrainDialog, LogDialog, Teach, Session,
    Memory, UIScoreInput, ScoreInput, ExtractResponse, ScoreResponse
} from 'blis-models';
import { ErrorType, DisplayMode, DialogMode } from '../types/const'
import { AT } from '../types/ActionTypes'
import { TipType } from '../components/ToolTips'

export type ActionState = ActionBase[];
export type EntityState = EntityBase[];
export type ErrorState = {
    errorType: ErrorType,
    error: string,
    message: string,
    route: AT
}
export type TrainDialogState = TrainDialog[];

export type LogDialogState = {
    all: LogDialog[]
}
export type AppState = {
    all: BlisAppBase[]
}
export type BotState = {
    botInfo: BotInfo
}
export type TeachSessionState = {
    all: Teach[],
    current: Teach,
    mode: DialogMode,
    input: string,
    prevMemories: Memory[],
    memories: Memory[],
    scoreInput: ScoreInput,
    uiScoreInput: UIScoreInput,
    extractResponses: ExtractResponse[],
    scoreResponse: ScoreResponse,
    currentConversationStack: {}[],
    autoTeach: boolean
}
export type ChatSessionState = {
    all: Session[],
    current: Session,
    currentConversationStack: {}[]
}
export type DisplayState = {
    displayMode: DisplayMode,
    displaySpinner: string[],
    tipType: TipType
}
export type UserState = {
    name: string,
    password: string,
    id: string,
    key: string
}
export type State = {
    user: UserState,
    bot: BotState
    apps: AppState,
    entities: EntityState,
    actions: ActionState,
    trainDialogs: TrainDialogState,
    display: DisplayState,
    error: ErrorState,
    logDialogs: LogDialogState,
    teachSessions: TeachSessionState,
    chatSessions: ChatSessionState
}

