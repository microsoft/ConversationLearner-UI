export const FETCH_APPLICATIONS = 'FETCH_APPS';
export const FETCH_ENTITIES = 'FETCH_ENTITIES';
export const FETCH_ACTIONS = 'FETCH_ACTIONS';
export const FETCH_TRAIN_DIALOGS = 'FETCH_TRAIN_DIALOGS';
export const CREATE_APPLICATION = 'CREATE_ENTITY';
export const CREATE_ENTITY = 'CREATE_ENTITY';
export const CREATE_ACTION = 'CREATE_ACTION';
export const CREATE_TRAIN_DIALOG = 'CREATE_TRAIN_DIALOG';

/*-----------------------------------------------------------------------------------------
--------------------- FETCH CALLS ---------------------------------------------------------
-----------------------------------------------------------------------------------------*/

export const fetchApplications = () => { 
    return {
        type: FETCH_APPLICATIONS,
        payload: request
    }
}
export const fetchAllEntities = () => { 
    return {
        type: FETCH_ENTITIES,
        payload: request
    }
}
export const fetchAllActions = () => { 
    return {
        type: FETCH_ACTIONS,
        payload: request
    }
}
export const fetchTrainDialogs = () => { 
    return {
        type: FETCH_TRAIN_DIALOGS,
        payload: request
    }
}

/*-----------------------------------------------------------------------------------------
--------------------- CREATE CALLS ---------------------------------------------------------
-----------------------------------------------------------------------------------------*/

export const createBLISApplication = () => { 
    return {
        type: CREATE_APPLICATION,
        payload: request
    }
}
export const createEntity = () => { 
    return {
        type: CREATE_ENTITY,
        payload: request
    }
}
export const createAction = () => { 
    return {
        type: CREATE_ACTION,
        payload: request
    }
}
export const createTrainDialog = () => { 
    return {
        type: CREATE_TRAIN_DIALOG,
        payload: request
    }
}