import 'rxjs';
import * as Rx from 'rxjs';
import { combineEpics, ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { fetchApplicationsEpic, fetchEntitiesEpic, fetchActionsEpic, fetchChatSessionsEpic, fetchTeachSessionsEpic } from './fetchEpics'
import { createNewApplicationEpic, createNewEntityEpic, createNewActionEpic, createNegativeEntity, createNewChatSessionEpic, createNewTeachSessionEpic } from './createEpics'
import { deleteActionEpic, deleteApplicationEpic, deleteEntityEpic, deleteReverseEntityEpic, deleteSessionEpic, deleteTeachEpic } from './deleteEpics'
import { editActionEpic, editApplicationEpic, editEntityEpic, setBlisApplicationEpic } from './updateEpics'
import { runExtractorEpic, extractorFeedbackEpic, runScorerEpic, scorerFeedbackEpic } from './teachEpics'

const rootEpic = combineEpics(
	fetchApplicationsEpic,
	fetchEntitiesEpic,
	fetchActionsEpic,
	createNewApplicationEpic,
	createNewEntityEpic,
	createNewActionEpic,
	createNegativeEntity,
	deleteApplicationEpic,
	deleteEntityEpic,
	deleteReverseEntityEpic,
	deleteActionEpic,
	editApplicationEpic,
	editActionEpic,
	editEntityEpic,
	fetchChatSessionsEpic,
	createNewChatSessionEpic,
	deleteSessionEpic,
	fetchTeachSessionsEpic,
	createNewTeachSessionEpic,
	deleteTeachEpic,
	setBlisApplicationEpic,
	runExtractorEpic,
	extractorFeedbackEpic,
	runScorerEpic,
	scorerFeedbackEpic
)

export default rootEpic;