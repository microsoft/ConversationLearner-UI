export const FETCH_APPLICATIONS = 'FETCH_APPS';
export const FETCH_ENTITIES = 'FETCH_ENTITIES';
export const FETCH_ACTIONS = 'FETCH_ACTIONS';
export const FETCH_TRAIN_DIALOGS = 'FETCH_TRAIN_DIALOGS';

export const fetchApplications = () => { 
    return {
        type: FETCH_APPLICATIONS,
        payload: {}
    }
}
export const fetchAllEntities = () => { 
    return {
        type: FETCH_ENTITIES,
        payload: {}
    }
}
export const fetchAllActions = () => { 
    return {
        type: FETCH_ACTIONS,
        payload: {}
    }
}
export const fetchTrainDialogs = () => { 
    return {
        type: FETCH_TRAIN_DIALOGS,
        payload: {}
    }
}