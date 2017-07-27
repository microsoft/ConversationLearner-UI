import 'rxjs';
import * as Rx from 'rxjs';
import { combineEpics, ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { fetchApplications, fetchEntities, fetchActions, fetchChatSessions, fetchTeachSessions } from './fetchEpics'
import { createNewApplication, createNewEntity, createNewAction, createNegativeEntity, createNewChatSession, createNewTeachSession } from './createEpics'
import { deleteAction, deleteApplication, deleteEntity, deleteReverseEntity, deleteSession, deleteTeach } from './deleteEpics'
import { editAction, editApplication, editEntity, setBlisApplication } from './updateEpics'
import { runExtractor, extractorFeedback, runScorer, scorerFeedback } from './teachEpics'

const rootEpic = combineEpics(
	fetchApplications,
	fetchEntities,
	fetchActions,
	createNewApplication,
	createNewEntity,
	createNewAction,
	createNegativeEntity,
	deleteApplication,
	deleteEntity,
	deleteReverseEntity,
	deleteAction,
	editApplication,
	editAction,
	editEntity,
	fetchChatSessions,
	createNewChatSession,
	deleteSession,
	fetchTeachSessions,
	createNewTeachSession,
	deleteTeach,
	setBlisApplication,
	runExtractor,
	extractorFeedback,
	runScorer,
	scorerFeedback
)

export default rootEpic;