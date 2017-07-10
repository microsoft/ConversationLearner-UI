import 'rxjs';
import * as Rx from 'rxjs';
import { combineEpics, ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { fetchApplications } from './fetchEpics'

const rootEpic = combineEpics(
	fetchApplications
)

export default rootEpic;