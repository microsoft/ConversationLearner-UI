import { TrainDialog } from './TrainDialog'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';

export type ActionState = ActionBase[]
export type EntityState = EntityBase[]
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
    displayWebchat: boolean
};
export type State = {
    apps: AppState,
    entities: EntityState,
    actions: ActionState,
    trainDialogs: TrainDialogState,
    display: DisplayState
}
