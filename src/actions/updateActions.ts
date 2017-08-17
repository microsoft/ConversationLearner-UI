
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { DisplayMode } from '../types/const'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes, TrainDialog, LogDialog, Session, Teach } from 'blis-models';

export const editBLISApplicationAsync = (key: string, application: BlisAppBase) : ActionObject => { 
    
    return {
        type: AT.EDIT_BLIS_APPLICATION_ASYNC,
        key: key,
        blisApp: application
    }
}

export const editBLISApplicationFulfilled = (application: BlisAppBase) : ActionObject => { 
    
    return {
        type: AT.EDIT_BLIS_APPLICATION_FULFILLED,
        blisApp: application
    }
}

export const editEntityAsync = (key: string, entity: EntityBase) : ActionObject => { 
    
    return {
        type: AT.EDIT_ENTITY_ASYNC,
        key: key,
        entity: entity
    }
}

export const editEntityFulfilled = (entity: EntityBase) : ActionObject => { 
    
    return {
        type: AT.EDIT_ENTITY_FULFILLED,
        entity: entity
    }
}

export const editActionAsync = (key: string, action: ActionBase, currentAppId: string) : ActionObject => { 
    
    return {
        type: AT.EDIT_ACTION_ASYNC,
        key: key,
        blisAction: action,
        currentAppId: currentAppId
    }
}

export const editActionFulfilled = (action: ActionBase) : ActionObject => { 
    
    return {
        type: AT.EDIT_ACTION_FULFILLED,
        blisAction: action,
    }
}

// TODO: should be async with fulfillment
export const editTrainDialog = (key: string, trainDialog: TrainDialog) : ActionObject => { 
    
    return {
        type: AT.EDIT_TRAIN_DIALOG,
        key: key,
        trainDialog: trainDialog
    }
}

// TODO: should be async with fulfillment
export const editLogDialog = (key: string, logDialog: LogDialog) : ActionObject => { 
    
    return {
        type: AT.EDIT_LOG_DIALOG,
        key: key,
        logDialog: logDialog
    }
}