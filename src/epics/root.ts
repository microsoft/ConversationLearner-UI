/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import 'rxjs';
import { combineEpics, Epic } from 'redux-observable'
import { State, ActionObject } from '../types'
import * as fetchEpics from './fetchEpics'
import * as createEpics from './createEpics'
import * as deleteEpics from './deleteEpics'
import * as updateEpics from './updateEpics'
import * as teachEpics from './teachEpics'

const rootEpic: Epic<ActionObject, State> = combineEpics(
	...Object.values(fetchEpics),
	...Object.values(createEpics),
	...Object.values(deleteEpics),
	...Object.values(updateEpics),
	...Object.values(teachEpics)
)

export default rootEpic;