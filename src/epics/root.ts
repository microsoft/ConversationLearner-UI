import 'rxjs';
import * as Rx from 'rxjs';
import { combineEpics, ActionsObservable, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import { fetchApplicationsEpic, fetchEntitiesEpic, fetchActionsEpic, fetchChatSessionsEpic, fetchTeachSessionsEpic, fetchTrainDialogsEpic, fetchLogDialogsEpic } from './fetchEpics'
import { createNewApplicationEpic, createNewEntityEpic, createNewActionEpic, createNegativeEntity, createNewChatSessionEpic, createNewTeachSessionEpic } from './createEpics'
import { deleteActionEpic, deleteApplicationEpic, deleteEntityEpic, deleteReverseEntityEpic, deleteSessionEpic, deleteTeachEpic } from './deleteEpics'
import { editActionEpic, editApplicationEpic, editEntityEpic, setBlisApplicationEpic } from './updateEpics'
import { runExtractorEpic, runScorerEpic, scorerFeedbackEpic } from './teachEpics'

const rootEpic = combineEpics(
	fetchApplicationsEpic,
	fetchEntitiesEpic,
	fetchActionsEpic,
	fetchTrainDialogsEpic,
	fetchLogDialogsEpic,
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
	runScorerEpic,
	scorerFeedbackEpic
)

export default rootEpic;