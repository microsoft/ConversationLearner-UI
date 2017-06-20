import { BLISApplication } from '../models/Application';
import { Action, ActionMetadata } from '../models/Action';
import { Entity, EntityMetadata } from '../models/Entity';
import { TrainDialog, Dialog, Turn, Input } from '../models/TrainDialog';
import { ActionTypes, EntityTypes } from '../models/Constants'; 
import { CREATE_ACTION, CREATE_BLIS_APPLICATION, CREATE_ENTITY, CREATE_TRAIN_DIALOG } from '../actions/create';
import { FETCH_ACTIONS, FETCH_APPLICATIONS, FETCH_ENTITIES, FETCH_TRAIN_DIALOGS } from '../actions/fetch';
import { DELETE_ACTION, DELETE_BLIS_APPLICATION, DELETE_ENTITY, DELETE_TRAIN_DIALOG } from '../actions/delete';
import { SET_CURRENT_BLIS_APP, SET_BLIS_APP_DISPLAY, EDIT_BLIS_APPLICATION, EDIT_ACTION, EDIT_TRAIN_DIALOG, EDIT_ENTITY } from '../actions/update';


export type UpdateAction = {
    type: 'EDIT_BLIS_APPLICATION',
    blisApp: BLISApplication,
} | {
    type: 'EDIT_ENTITY',
    entity: Entity,
} | {
    type: 'EDIT_ACTION',
    action: Action,
} | {
    type: 'EDIT_TRAIN_DIALOG',
    trainDialog: TrainDialog,
} | {
    type: 'SET_CURRENT_BLIS_APP',
    currentBLISApp: BLISApplication,
} | {
    //used for setting whether the app list or app homepage (trainingGround) is displayed
    type: 'SET_BLIS_APP_DISPLAY',
    setDisplay: string,
}

export type FetchAction = {
    type: 'FETCH_APPLICATIONS',
    allBlisApps: BLISApplication[],
} | {
    type: 'FETCH_ENTITIES',
    allEntities: Entity[],
} | {
    type: 'FETCH_ACTIONS',
    allActions: Action[],
} | {
    type: 'FETCH_TRAIN_DIALOGS',
    allTrainDialogs: TrainDialog[],
}

export type CreateAction = {
    type: 'CREATE_BLIS_APPLICATION',
    blisApp: BLISApplication,
} | {
    type: 'CREATE_ENTITY',
    entity: Entity,
} | {
    type: 'CREATE_ACTION',
    action: Action,
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