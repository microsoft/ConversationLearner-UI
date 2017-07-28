import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, 
    ActionMetaData, ActionList, ActionTypes, TrainDialog, LogDialog, Teach, Session } from 'blis-models';
import { DisplayMode, TeachMode } from '../types/const'

export type ActionState = ActionBase[]
export type EntityState = EntityBase[]
export type ErrorState = {
    error: string,
    message: string,
    route: string
};
export type TrainDialogState = {
    all: TrainDialog[],
    current: TrainDialog
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
    mode: TeachMode
}
export type ChatSessionState = {
    all: Session[],
    current: Session
}
export type DisplayState = {
    displayMode: DisplayMode,
    displayWebchat: boolean,
    webchatTeachMode: boolean,
    displayLogin: boolean
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

