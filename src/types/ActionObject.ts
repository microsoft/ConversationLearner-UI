import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes, TrainDialog } from 'blis-models'


export type UpdateAction = {
    type: 'EDIT_BLIS_APPLICATION',
    blisApp: BlisAppBase,
} | {
    type: 'EDIT_BLIS_APPLICATION_FULFILLED',
    blisApp: BlisAppBase,
} | {
    type: 'EDIT_ENTITY',
    entity: EntityBase,
} | {
    type: 'EDIT_ENTITY_FULFILLED',
    entity: EntityBase,
} | {
    type: 'EDIT_ACTION',
    blisAction: ActionBase,
    currentAppId: string
} | {
    type: 'EDIT_ACTION_FULFILLED',
    blisAction: ActionBase
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
    teachMode: boolean
} | {
    //used for setting whether the login popup is displayed
    type: 'SET_LOGIN_DISPLAY',
    setLoginDisplay: boolean,
} | {
    //used for setting whether the error popup is displayed
    type: 'SET_ERROR_DISPLAY',
    error: string,
    message: string,
    route: string
} | {
    type: 'CLEAR_ERROR_DISPLAY'
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
    type: 'SET_USER_KEY',
    key: string
} | {
    type: "EMPTY_STATE_PROPERTIES"
}| {
    type: "NO_OP"
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
    key: string,
    userId: string,
    blisApp: BlisAppBase,
} | {
    type: 'CREATE_ENTITY',
    key: string,
    entity: EntityBase,
    currentAppId: string
} | {
    type: 'CREATE_ENTITY_FULFILLED',
    entityId: string,
    entity: EntityBase
} | {
    type: 'CREATE_REVERSIBLE_ENTITY',
    key: string,
    entity: EntityBase,
    currentAppId: string
} | {
    type: 'CREATE_ACTION',
    action: ActionBase,
    currentAppId: string
} | {
    type: 'CREATE_ACTION_FULFILLED',
    actionId: string,
    action: ActionBase
} | {
    type: 'CREATE_TRAIN_DIALOG',
    trainDialog: TrainDialog,
} | {
    type: 'CREATE_BLIS_APPLICATION_FULFILLED',
    blisApp: BlisAppBase,
    blisAppId: string
} | {
    type: 'CREATE_POSITIVE_ENTITY_FULFILLED',
    key: string,
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
    type: 'DELETE_BLIS_APPLICATION_FULFILLED',
    blisAppGUID: string
} | {
    type: 'DELETE_ENTITY',
    entityGUID: string,
    currentAppId: string,
    entity: EntityBase
} | {
    type: 'DELETE_REVERSE_ENTITY',
    key: string,
    deletedEntityId: string,
    reverseEntityId: string,
    currentAppId: string
} | {
    type: 'DELETE_ENTITY_FULFILLED',
    key: string,
    deletedEntityId: string,
    currentAppId: string
} | {
    type: 'DELETE_ACTION',
    actionGUID: string,
    action: ActionBase,
    currentAppId: string
}| {
    type: 'DELETE_ACTION_FULFILLED',
    actionGUID: string
} | {
    type: 'DELETE_TRAIN_DIALOG',
    trainDialogGUID: string,
} | {
    type: "DELETE_OPERATION_FULFILLED"
}

export type ActionObject = FetchAction | CreateAction | UpdateAction | DeleteAction;