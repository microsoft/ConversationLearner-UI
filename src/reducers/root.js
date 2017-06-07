import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    apps: appsReducer,
    entities: entitiesReducer,
    actions: actionsReducer,
    trainDialogs: trainDialogsReducer
});

export default rootReducer;