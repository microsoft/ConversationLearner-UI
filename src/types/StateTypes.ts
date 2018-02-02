import {
    DialogMode,
    BlisAppBase,
    BotInfo,
    EntityBase,
    ActionBase,
    TrainDialog, LogDialog, Teach, Session,
    Memory, UIScoreInput, ScoreInput, ExtractResponse, ScoreResponse
} from 'blis-models';
import { ErrorType } from '../types/const'
import { AT } from '../types/ActionTypes'
import { TipType } from '../components/ToolTips'

export type ActionState = ActionBase[];
export type EntityState = EntityBase[];
export type ErrorState = {
    errorType: ErrorType,
    error: string,
    messages: string[],
    actionType: AT
}
export type TrainDialogState = TrainDialog[];

export type LogDialogState = {
    all: LogDialog[]
}
export type AppsState = {
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
    autoTeach: boolean
}
export type ChatSessionState = {
    all: Session[],
    current: Session
}
export type DisplayState = {
    displaySpinner: string[],
    tipType: TipType
}
export type UserState = {
    name: string,
    password: string,
    id: string,
}
export type State = {
    user: UserState,
    bot: BotState
    apps: AppsState,
    entities: EntityState,
    actions: ActionState,
    trainDialogs: TrainDialogState,
    display: DisplayState,
    error: ErrorState,
    logDialogs: LogDialogState,
    teachSessions: TeachSessionState,
    chatSessions: ChatSessionState
}

