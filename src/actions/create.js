export const CREATE_BLIS_APPLICATION = 'CREATE_ENTITY';
export const CREATE_ENTITY = 'CREATE_ENTITY';
export const CREATE_ACTION = 'CREATE_ACTION';
export const CREATE_TRAIN_DIALOG = 'CREATE_TRAIN_DIALOG';

export const createBLISApplication = () => { 
    return {
        type: CREATE_BLIS_APPLICATION,
        payload: {}
    }
}
export const createEntity = () => { 
    return {
        type: CREATE_ENTITY,
        payload: {}
    }
}
export const createAction = () => { 
    return {
        type: CREATE_ACTION,
        payload: {}
    }
}
export const createTrainDialog = () => { 
    return {
        type: CREATE_TRAIN_DIALOG,
        payload: {}
    }
}