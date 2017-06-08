export const SET_CURRENT_BLIS_APP = 'SET_CURRENT_BLIS_APP';
export const setCurrentBLISApp = (app) => { 
    return {
        type: SET_CURRENT_BLIS_APP,
        payload: app
    }
}