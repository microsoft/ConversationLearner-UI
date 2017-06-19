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
import ActionObject from './ActionObject'

export const setCurrentBLISApp = (app: BLISApplication) : ActionObject<BLISApplication> => { 
    return {
        type: SET_CURRENT_BLIS_APP,
        payload: app
    }
}
export const setBLISAppDisplay = (text: string) : ActionObject<string> => { 
    return {
        type: SET_BLIS_APP_DISPLAY,
        payload: text
    }
}
export const editBLISApplication = (application: BLISApplication) : ActionObject<BLISApplication> => { 
    //will need to make a call to BLIS to edit this application for this user
    return {
        type: EDIT_BLIS_APPLICATION,
        payload: application
    }
}
export const editEntity = (entity: Entity) : ActionObject<Entity> => { 
    //will need to make a call to BLIS to edit this entity for its application
    return {
        type: EDIT_ENTITY,
        payload: entity
    }
}
export const editAction = (action: Action) : ActionObject<Action> => { 
    //will need to make a call to BLIS to edit this action for its application
    return {
        type: EDIT_ACTION,
        payload: action
    }
}
export const editTrainDialog = () : ActionObject<any> => { 
    //currently any type because this creator hasnt been set up
    //will need to make a call to BLIS to edit this train dialog for its application
    return {
        type: EDIT_TRAIN_DIALOG,
        payload: {}
    }
}