import { TrainDialog, Dialog, Turn, Input } from '../types';
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models'


export type UpdateAction = {
    type: 'EDIT_BLIS_APPLICATION',
    blisApp: BlisAppBase,
} | {
    type: 'EDIT_ENTITY',
    entity: EntityBase,
} | {
    type: 'EDIT_ACTION',
    blisAction: ActionBase,
    currentAppId: string
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
} | {
    type: "UPDATE_OPERATION_FULFILLED"
} | {
    type: 'SET_USER',
    name: string,
    password: string,
    id: string
} | {
    type: "EMPTY_STATE_PROPERTIES"
}

export type FetchAction = {
    type: 'FETCH_APPLICATIONS',
    userId: string
} | {
    type: 'FETCH_ENTITIES',
    blisAppID: string
} | {
    type: 'FETCH_ACTIONS',
    blisAppID: string
} | {
    type: 'FETCH_TRAIN_DIALOGS',
    allTrainDialogs: TrainDialog[],
} | {
    type: 'FETCH_APPLICATIONS_FULFILLED',
    allBlisApps: BlisAppBase[],
} | {
    type: 'FETCH_ENTITIES_FULFILLED',
    allEntities: EntityBase[],
} | {
    type: 'FETCH_ACTIONS_FULFILLED',
    allActions: ActionBase[]
}

export type CreateAction = {
    type: 'CREATE_BLIS_APPLICATION',
    userId: string,
    blisApp: BlisAppBase,
} | {
    type: 'CREATE_ENTITY',
    entity: EntityBase,
    currentAppId: string
} | {
    type: 'CREATE_REVERSIBLE_ENTITY',
    entity: EntityBase,
    currentAppId: string
} | {
    type: 'CREATE_ACTION',
    action: ActionBase,
    currentAppId: string
} | {
    type: 'CREATE_TRAIN_DIALOG',
    trainDialog: TrainDialog,
} | {
    type: "CREATE_OPERATION_FULFILLED"
} | {
    type: 'CREATE_BLIS_APPLICATION_FULFILLED',
    blisAppId: string
} | {
    type: 'CREATE_POSITIVE_ENTITY_FULFILLED',
    negativeEntity: EntityBase,
    positiveEntity: EntityBase,
    currentAppId: string
} | {
    type: 'CREATE_NEGATIVE_ENTITY_FULFILLED',
    negativeEntity: EntityBase,
    positiveEntity: EntityBase,
    currentAppId: string
}


export type DeleteAction = {
    type: 'DELETE_BLIS_APPLICATION',
    blisAppGUID: string,
    blisApp: BlisAppBase
} | {
    type: 'DELETE_ENTITY',
    entityGUID: string,
    currentAppId: string,
    entity: EntityBase
} | {
    type: 'DELETE_ACTION',
    actionGUID: string,
    action: ActionBase,
    currentAppId: string
} | {
    type: 'DELETE_TRAIN_DIALOG',
    trainDialogGUID: string,
} | {
    type: "DELETE_OPERATION_FULFILLED"
}

export type ActionObject = FetchAction | CreateAction | UpdateAction | DeleteAction;