import 'rxjs';
import * as Rx from 'rxjs';
import { combineEpics, ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { fetchApplications, fetchEntities, fetchActions } from './fetchEpics'
import { createNewApplication, createNewEntity, createNewAction, createReversibleEntity, createNegativeEntity } from './createEpics'
import { deleteAction, deleteApplication, deleteEntity } from './deleteEpics'
import { editAction, editApplication } from './updateEpics'

const rootEpic = combineEpics(
	fetchApplications,
	fetchEntities,
	fetchActions,
	createNewApplication,
	createNewEntity,
	createNewAction,
	createReversibleEntity,
	createNegativeEntity,
	deleteApplication,
	deleteEntity,
	deleteAction,
	editApplication,
	editAction
)

export default rootEpic;