export const SET_CURRENT_BLIS_APP = 'SET_CURRENT_BLIS_APP';
export const SET_BLIS_APP_DISPLAY = 'SET_BLIS_APP_DISPLAY';
export const EDIT_BLIS_APPLICATION = 'EDIT_BLIS_APPLICATION';
export const EDIT_ENTITY = 'EDIT_ENTITY';
export const EDIT_ACTION = 'EDIT_ACTION';
export const EDIT_TRAIN_DIALOG = 'EDIT_TRAIN_DIALOG';
import { BLISApplication } from '../models/Application'
import { Entity } from '../models/Entity'
import { Action } from '../models/Action'
import { TrainDialog } from '../models/TrainDialog'
import { UpdateAction } from './ActionObject'

export const setCurrentBLISApp = (app: BLISApplication) : UpdateAction => { 
    return {
        type: SET_CURRENT_BLIS_APP,
        currentBLISApp: app
    }
}
export const setBLISAppDisplay = (text: string) : UpdateAction => { 
    return {
        type: SET_BLIS_APP_DISPLAY,
        setDisplay: text
    }
}
export const editBLISApplication = (application: BLISApplication) : UpdateAction => { 
    //will need to make a call to BLIS to edit this application for this user
    return {
        type: EDIT_BLIS_APPLICATION,
        blisApp: application
    }
}
export const editEntity = (entity: Entity) : UpdateAction => { 
    //will need to make a call to BLIS to edit this entity for its application
    return {
        type: EDIT_ENTITY,
        entity: entity
    }
}
export const editAction = (action: Action) : UpdateAction => { 
    //will need to make a call to BLIS to edit this action for its application
    return {
        type: EDIT_ACTION,
        action: action
    }
}
export const editTrainDialog = (trainDialog: TrainDialog) : UpdateAction => { 
    //currently any type because this creator hasnt been set up
    //will need to make a call to BLIS to edit this train dialog for its application
    return {
        type: EDIT_TRAIN_DIALOG,
        trainDialog: trainDialog
    }
}