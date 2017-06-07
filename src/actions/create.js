export const CREATE_APPLICATION = 'CREATE_ENTITY';
export const CREATE_ENTITY = 'CREATE_ENTITY';
export const CREATE_ACTION = 'CREATE_ACTION';
export const CREATE_TRAIN_DIALOG = 'CREATE_TRAIN_DIALOG';

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