import { ActionObject } from '../types'
import { Reducer } from 'redux'

const initialState: any = {
	all: []
};

const chatSessionReducer: Reducer<any> =  (state = initialState, action: ActionObject) => {
    switch(action.type) {        
        default:
            return state;
    }
}

export default chatSessionReducer;