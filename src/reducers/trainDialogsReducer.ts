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
        case "TOGGLE_TRAIN_DIALOG":
            let index: number = 0;
            for (let i = 0; i < state.all.length; i++) {
                if (state.all[i].id == state.current.id) {
                    index = i
                }
            }
            if (index == 0) {
                if (action.forward === false) {
                    return { ...state, current: state.all[state.all.length - 1] }
                }
            }
            if (index == state.all.length - 1) {
                if (action.forward === true) {
                    return { ...state, current: state.all[0] }
                }
            }
            let newState: TrainDialogState;
            if (action.forward === true) {
                newState = { ...state, current: state.all[index + 1] }
            } else {
                newState = { ...state, current: state.all[index - 1] }
            }
            return newState;
        case 'DELETE_TRAIN_DIALOG':
        // return [...state, action.payload];
        case 'EDIT_TRAIN_DIALOG':
        // return [...state, action.payload];
        default:
            return state;
    }
}