import { ActionObject } from '../types'
import { Reducer } from 'redux'

const initialState: any = {
	all: []
};

const teachSessionReducer: Reducer<any> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {        
        default:
            return state;
    }
}

export default teachSessionReducer;