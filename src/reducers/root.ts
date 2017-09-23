import { combineReducers } from 'redux'
import counterReducer from './counterReducer'
import { State } from '../types'

const rootReducer = combineReducers<State>({
    counter: counterReducer
})

export default rootReducer