export const CREATE_BLIS_APPLICATION = 'CREATE_ENTITY';
export const CREATE_ENTITY = 'CREATE_ENTITY';
export const CREATE_ACTION = 'CREATE_ACTION';
export const CREATE_TRAIN_DIALOG = 'CREATE_TRAIN_DIALOG';

export const createBLISApplication = (application) => { 
    //will need to make a call to BLIS to add this application for this user
    return {
        type: CREATE_BLIS_APPLICATION,
        payload: application
    }
}
export const createEntity = (entity) => { 
    //will need to make a call to BLIS to add this entity for its application
    return {
        type: CREATE_ENTITY,
        payload: entity
    }
}
export const createAction = () => { 
    //will need to make a call to BLIS to add this action for its application
    return {
        type: CREATE_ACTION,
        payload: {}
    }
}
export const createTrainDialog = () => { 
    //will need to make a call to BLIS to add this train dialog for its application
    return {
        type: CREATE_TRAIN_DIALOG,
        payload: {}
    }
}