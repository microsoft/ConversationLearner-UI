export const SET_CURRENT_BLIS_APP = 'SET_CURRENT_BLIS_APP';
import { BLISApplication } from '../models/Application'
import { Entity } from '../models/Entity'
import { Action } from '../models/Action'
import { TrainDialog } from '../models/TrainDialog'
import ActionObject from './ActionObject'
export const setCurrentBLISApp = (app: BLISApplication) : ActionObject<BLISApplication> => { 
    return {
        type: SET_CURRENT_BLIS_APP,
        payload: app
    }
}
export const SET_BLIS_APP_DISPLAY = 'SET_BLIS_APP_DISPLAY';
export const setBLISAppDisplay = (text: string) : ActionObject<string> => { 
    return {
        type: SET_BLIS_APP_DISPLAY,
        payload: text
    }
}