import { BlisAppBase, BlisAppMetaData, BlisAppList, 
    EntityBase, EntityMetaData, EntityList, 
    ActionBase, ActionMetaData, ActionList, ActionTypes, 
    TrainDialog, LogDialog, Teach, Session,
    Memory, ScoreInput, ExtractResponse, ScoreResponse } from 'blis-models';
import { DisplayMode, TeachMode } from '../types/const'
import { AT } from '../types/ActionTypes'

export type ActionState = ActionBase[]
export type EntityState = EntityBase[]
export type ErrorState = {
    error: string,
    message: string,
    route: AT
};
export type TrainDialogState = {
    all: TrainDialog[],
    current: TrainDialog,
    roundNumber: number,
    scoreNumber: number,
    mode: TeachMode
}
export type LogDialogState = {
    all: LogDialog[],
    current: LogDialog
}
export type AppState = {
    all: BlisAppBase[],
    current: BlisAppBase
}
export type TeachSessionState = {
    all: Teach[],
    current: Teach,
    mode: TeachMode,
    input: string,
    memories: Memory[],
    scoreInput: ScoreInput
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
    displayWebchat: boolean,   // TOOD this can go away
    displayLogin: boolean,
    displaySpinner: string[]
};
export type UserState =
{
    name: string,
    password: string,
    id: string,
    key: string
}
export type TeachState =
{
    name: string,
    password: string,
    id: string,
    key: string
}
export type State = {
    user: UserState,
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

