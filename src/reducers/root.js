import { combineReducers } from 'redux';
import appsReducer from './appsReducer';
import entitiesReducer from './entitiesReducer';
import actionsReducer from './actionsReducer';
import trainDialogsReducer from './trainDialogsReducer';
const rootReducer = combineReducers({
    apps: appsReducer,
    entities: entitiesReducer,
    actions: actionsReducer,
    trainDialogs: trainDialogsReducer
});

export default rootReducer;