
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { BlisAppBase, EntityBase, ActionBase, TrainDialog, LogDialog } from 'blis-models';

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

export const editTrainDialogAsync = (key: string, trainDialog: TrainDialog, currentAppId: string) : ActionObject => { 
    
    return {
        type: AT.EDIT_TRAIN_DIALOG_ASYNC,
        key: key,
        trainDialog: trainDialog,
        currentAppId: currentAppId
    }
}

export const editTrainDialogFulfilled = (trainDialog: TrainDialog) : ActionObject => { 
    
    return {
        type: AT.EDIT_TRAIN_DIALOG_FULFILLED,
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