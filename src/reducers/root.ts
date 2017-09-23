import { combineReducers } from 'redux'
import appReducer from './appReducer'
import counterReducer from './counterReducer'
import { State } from '../types'

const rootReducer = combineReducers<State>({
    apps: appReducer,
    counter: counterReducer
})

export default rootReducer