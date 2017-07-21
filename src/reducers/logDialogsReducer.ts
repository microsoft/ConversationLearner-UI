import { ActionObject } from '../types'
import { LogDialogState } from '../types'
import { LogDialog } from 'blis-models'
import { Reducer } from 'redux'

const initialState: LogDialogState = {
    all: [],
    current: null
};

const logDialogsReducer: Reducer<LogDialogState> =  (state = initialState, action: ActionObject) => {
    switch (action.type) {
        default:
			console.log('in reducer ')
            return state;
    }
}
export default logDialogsReducer;