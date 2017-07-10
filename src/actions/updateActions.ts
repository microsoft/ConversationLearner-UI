
import { TrainDialog } from '../models/TrainDialog'
import { ActionObject } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';

export const setCurrentBLISApp = (app: BlisAppBase) : ActionObject => { 
    return {
        type: 'SET_CURRENT_BLIS_APP',
        currentBLISApp: app
    }
}

export const setCurrentTrainDialog = (trainDialog: TrainDialog) : ActionObject => { 
    return {
        type: 'SET_CURRENT_TRAIN_DIALOG',
        currentTrainDialog: trainDialog
    }
}

export const setBLISAppDisplay = (text: string) : ActionObject => { 
    return {
        type: 'SET_BLIS_APP_DISPLAY',
        setDisplay: text
    }
}

export const editBLISApplication = (application: BlisAppBase) : ActionObject => { 
    //will need to make a call to BLIS to edit this application for this user
    return {
        type: 'EDIT_BLIS_APPLICATION',
        blisApp: application
    }
}

export const setWebchatDisplay = (isShown: boolean) : ActionObject => { 
    //will need to make a call to BLIS to edit this application for this user
    return {
        type: 'SET_WEBCHAT_DISPLAY',
        setWebchatDisplay: isShown
    }
}

export const editEntity = (entity: EntityBase) : ActionObject => { 
    //will need to make a call to BLIS to edit this entity for its application
    return {
        type: 'EDIT_ENTITY',
        entity: entity
    }
}

export const editAction = (action: ActionBase) : ActionObject => { 
    //will need to make a call to BLIS to edit this action for its application
    return {
        type: 'EDIT_ACTION',
        action: action
    }
}

export const editTrainDialog = (trainDialog: TrainDialog) : ActionObject => { 
    //currently any type because this creator hasnt been set up
    //will need to make a call to BLIS to edit this train dialog for its application
    return {
        type: 'EDIT_TRAIN_DIALOG',
        trainDialog: trainDialog
    }
}

export const toggleTrainDialog = (forward: boolean) => {
    return {
        type: "TOGGLE_TRAIN_DIALOG",
        forward: forward
    }
}