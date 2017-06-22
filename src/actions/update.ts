import { BLISApplication } from '../models/Application'
import { Entity } from '../models/Entity'
import { Action } from '../models/Action'
import { TrainDialog } from '../models/TrainDialog'
import { ActionObject } from './ActionObject'

export const setCurrentBLISApp = (app: BLISApplication) : ActionObject => { 
    return {
        type: 'SET_CURRENT_BLIS_APP',
        currentBLISApp: app
    }
}
export const setBLISAppDisplay = (text: string) : ActionObject => { 
    return {
        type: 'SET_BLIS_APP_DISPLAY',
        setDisplay: text
    }
}
export const editBLISApplication = (application: BLISApplication) : ActionObject => { 
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
export const editEntity = (entity: Entity) : ActionObject => { 
    //will need to make a call to BLIS to edit this entity for its application
    return {
        type: 'EDIT_ENTITY',
        entity: entity
    }
}
export const editAction = (action: Action) : ActionObject => { 
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