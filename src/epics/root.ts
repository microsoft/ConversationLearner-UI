/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { combineEpics, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import * as fetchEpics from './fetchEpics'
import * as deleteEpics from './deleteEpics'
import * as updateEpics from './updateEpics'

const rootEpic: Epic<ActionObject, State> = combineEpics(
	...Object.values(fetchEpics),
	...Object.values(deleteEpics),
	...Object.values(updateEpics)
)

export default rootEpic;