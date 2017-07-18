
import { ActionObject, TrainDialog } from '../types'
import { BlisAppBase, BlisAppMetaData, BlisAppList, EntityBase, EntityMetaData, EntityList, ActionBase, ActionMetaData, ActionList, ActionTypes } from 'blis-models';

export const setCurrentBLISApp = (key: string, app: BlisAppBase) : ActionObject => { 
    return {
        type: 'SET_CURRENT_BLIS_APP',
        key: key,
        currentBLISApp: app
    }
}

export const emptyStateProperties = () : ActionObject => { 
    return {
        type: 'EMPTY_STATE_PROPERTIES'
    }
}

export const setCurrentTrainDialog = (key: string, trainDialog: TrainDialog) : ActionObject => { 
    return {
        type: 'SET_CURRENT_TRAIN_DIALOG',
        key: key,
        currentTrainDialog: trainDialog
    }
}

export const toggleTrainDialog = (forward: boolean) => {
    return {
        type: "TOGGLE_TRAIN_DIALOG",
        forward: forward
    }
}

export const setBLISAppDisplay = (text: string) : ActionObject => { 
    return {
        type: 'SET_BLIS_APP_DISPLAY',
        setDisplay: text
    }
}

export const setWebchatDisplay = (isShown: boolean) : ActionObject => { 
    return {
        type: 'SET_WEBCHAT_DISPLAY',
        setWebchatDisplay: isShown
    }
}

export const editBLISApplication = (key: string, application: BlisAppBase) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'EDIT_BLIS_APPLICATION',
        key: key,
        blisApp: application
    }
}

export const editEntity = (key: string, entity: EntityBase) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'EDIT_ENTITY',
        key: key,
        entity: entity
    }
}

export const editAction = (key: string, action: ActionBase, currentAppId: string) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'EDIT_ACTION',
        key: key,
        blisAction: action,
        currentAppId: currentAppId
    }
}

export const editTrainDialog = (key: string, trainDialog: TrainDialog) : ActionObject => { 
    //needs to make a call to an Epic to send data to BLIS
    return {
        type: 'EDIT_TRAIN_DIALOG',
        key: key,
        trainDialog: trainDialog
    }
}

export const setUser = (name: string, password: string, id: string) : ActionObject => { 
    return {
        type: 'SET_USER',
        name: name,
        password: password,
        id: id
    }
}

export const setUserKey = (key: string) : ActionObject => { 
    return {
        type: 'SET_USER_KEY',
        key: key
    }
}