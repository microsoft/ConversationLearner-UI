import 'rxjs';
import * as Rx from 'rxjs';
import { combineEpics, ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { fetchApplications, fetchEntities, fetchActions } from './fetchEpics'

const rootEpic = combineEpics(
	fetchApplications,
	fetchEntities,
	fetchActions
)

export default rootEpic;