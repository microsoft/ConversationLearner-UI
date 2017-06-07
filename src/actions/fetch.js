export const FETCH_APPLICATIONS = 'FETCH_APPS';
export const FETCH_ENTITIES = 'FETCH_ENTITIES';
export const FETCH_ACTIONS = 'FETCH_ACTIONS';
export const FETCH_TRAIN_DIALOGS = 'FETCH_TRAIN_DIALOGS';

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