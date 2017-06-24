import { Action } from '../models/Action'
import { TrainDialog } from '../models/TrainDialog'
import { Entity } from '../models/Entity'
import { BLISApplication } from '../models/Application';

export type ActionState = Action[]
export type EntityState = Entity[]
export type TrainDialogState = TrainDialog[]
export type AppState = {
    all: BLISApplication[],
    current: BLISApplication
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
