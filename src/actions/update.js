export const SET_CURRENT_BLIS_APP = 'SET_CURRENT_BLIS_APP';
export const setCurrentBLISApp = (app) => { 
    return {
        type: SET_CURRENT_BLIS_APP,
        payload: app
    }
}
export const SET_BLIS_APP_DISPLAY = 'SET_BLIS_APP_DISPLAY';
export const setBLISAppDisplay = (text) => { 
    return {
        type: SET_BLIS_APP_DISPLAY,
        payload: text
    }
}