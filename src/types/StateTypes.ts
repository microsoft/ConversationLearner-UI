import { TrainDialog } from './TrainDialog'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';

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
export type AppState = {
    all: BlisAppBase[],
    current: BlisAppBase
}
export type DisplayState = {
    myAppsDisplay: string,
    displayWebchat: boolean,
    displayLogin: boolean
};
export type UserState =
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
    error: ErrorState
}

