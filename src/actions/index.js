export const FETCH_APPLICATIONS = 'FETCH_APPS';
export const FETCH_ENTITIES = 'FETCH_ENTITIES';
export const FETCH_ACTIONS = 'FETCH_ACTIONS';
export const FETCH_TRAIN_DIALOGS = 'FETCH_TRAIN_DIALOGS';
export const CREATE_APPLICATION = 'CREATE_ENTITY';
export const CREATE_ENTITY = 'CREATE_ENTITY';
export const CREATE_ACTION = 'CREATE_ACTION';
export const CREATE_TRAIN_DIALOG = 'CREATE_TRAIN_DIALOG';

export const fetchPosts = () => {
    const request = axios.get(`${rootURL}/posts${apiKey}`);
    return {
        type: FETCH_POSTS,
        payload: request
    }
}