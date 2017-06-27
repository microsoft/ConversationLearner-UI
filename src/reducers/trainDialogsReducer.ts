import { ActionObject } from '../types'
import { TrainDialog } from '../models/TrainDialog'
import { TrainDialogState } from '../types'

const initialState: TrainDialogState = {
    all: [],
    current: null
};

export default (state = initialState, action: ActionObject) => {
    switch (action.type) {
        case 'FETCH_TRAIN_DIALOGS':
            return { ...state, all: action.allTrainDialogs };
        case 'CREATE_TRAIN_DIALOG':
            return { ...state, all: [...state.all, action.trainDialog], current: action.trainDialog };
        case 'SET_CURRENT_TRAIN_DIALOG':
            return { ...state, current: action.currentTrainDialog };
        case 'DELETE_TRAIN_DIALOG':
        // return [...state, action.payload];
        case 'EDIT_TRAIN_DIALOG':
        // return [...state, action.payload];
        default:
            return state;
    }
}