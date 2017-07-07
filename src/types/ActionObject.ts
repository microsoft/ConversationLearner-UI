import { TrainDialog, Dialog, Turn, Input } from '../models/TrainDialog';
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models'


export type UpdateAction = {
    type: 'EDIT_BLIS_APPLICATION',
    blisApp: BlisAppBase,
} | {
    type: 'EDIT_ENTITY',
    entity: EntityBase,
} | {
    type: 'EDIT_ACTION',
    action: ActionBase,
} | {
    type: 'EDIT_TRAIN_DIALOG',
    trainDialog: TrainDialog,
} | {
    type: 'SET_CURRENT_BLIS_APP',
    currentBLISApp: BlisAppBase,
} | {
    type: 'SET_CURRENT_TRAIN_DIALOG',
    currentTrainDialog: TrainDialog,
} | {
    //used for setting whether the app list or app homepage (trainingGround) is displayed
    type: 'SET_BLIS_APP_DISPLAY',
    setDisplay: string,
} | {
    //used for setting whether the app list or app homepage (trainingGround) is displayed
    type: 'SET_WEBCHAT_DISPLAY',
    setWebchatDisplay: boolean,
} | {
    type: "TOGGLE_TRAIN_DIALOG",
    forward: boolean
}

export type FetchAction = {
    type: 'FETCH_APPLICATIONS',
    allBlisApps: BlisAppList,
} | {
    type: 'FETCH_ENTITIES',
    allEntities: EntityList,
} | {
    type: 'FETCH_ACTIONS',
    allActions: ActionList
} | {
    type: 'FETCH_TRAIN_DIALOGS',
    allTrainDialogs: TrainDialog[],
}

export type CreateAction = {
    type: 'CREATE_BLIS_APPLICATION',
    blisApp: BlisAppBase,
} | {
    type: 'CREATE_ENTITY',
    entity: EntityBase,
} | {
    type: 'CREATE_ACTION',
    action: ActionBase,
} | {
    type: 'CREATE_TRAIN_DIALOG',
    trainDialog: TrainDialog,
}

export type DeleteAction = {
    type: 'DELETE_BLIS_APPLICATION',
    blisAppGUID: string,
} | {
    type: 'DELETE_ENTITY',
    entityGUID: string,
} | {
    type: 'DELETE_ACTION',
    actionGUID: string,
} | {
    type: 'DELETE_TRAIN_DIALOG',
    trainDialogGUID: string,
}

export type ActionObject = FetchAction | CreateAction | UpdateAction | DeleteAction;