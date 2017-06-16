export const CREATE_BLIS_APPLICATION = 'CREATE_ENTITY';
export const CREATE_ENTITY = 'CREATE_ENTITY';
export const CREATE_ACTION = 'CREATE_ACTION';
export const CREATE_TRAIN_DIALOG = 'CREATE_TRAIN_DIALOG';
import { BLISApplication } from '../models/Application'
import { Entity } from '../models/Entity'
import { Action } from '../models/Action'
import { TrainDialog } from '../models/TrainDialog'
import ActionObject from './ActionObject'
export const createBLISApplication = (application: BLISApplication) : ActionObject<BLISApplication> => { 
    //will need to make a call to BLIS to add this application for this user
    return {
        type: CREATE_BLIS_APPLICATION,
        payload: application
    }
}
export const createEntity = (entity: Entity) : ActionObject<Entity> => { 
    //will need to make a call to BLIS to add this entity for its application
    return {
        type: CREATE_ENTITY,
        payload: entity
    }
}
export const createAction = (action: Action) : ActionObject<Action> => { 
    //will need to make a call to BLIS to add this action for its application
    return {
        type: CREATE_ACTION,
        payload: action
    }
}
export const createTrainDialog = () : ActionObject<any> => { 
    //currently any type because this creator hasnt been set up
    //will need to make a call to BLIS to add this train dialog for its application
    return {
        type: CREATE_TRAIN_DIALOG,
        payload: {}
    }
}