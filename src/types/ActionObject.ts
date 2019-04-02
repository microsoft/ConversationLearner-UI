/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import { PartialTrainDialog } from '../types/models'
import { TipType } from '../components/ToolTips/ToolTips'
import { ErrorType } from './const'
import { AT } from './ActionTypes'

export type UpdateAction = {
    type: AT.EDIT_APPLICATION_ASYNC,
    app: CLM.AppBase,
} | {
    type: AT.EDIT_APPLICATION_FULFILLED,
    app: CLM.AppBase,
} | {
    type: AT.EDIT_APPSOURCE_ASYNC,
    appId: string,
    source: CLM.AppDefinition,
} | {
    type: AT.EDIT_APPSOURCE_FULFILLED
} | {
    type: AT.EDIT_ENTITY_ASYNC,
    appId: string,
    entity: CLM.EntityBase,
} | {
    type: AT.EDIT_ENTITY_FULFILLED,
    entity: CLM.EntityBase,
} | {
    type: AT.EDIT_ACTION_ASYNC,
    action: CLM.ActionBase,
    appId: string
} | {
    type: AT.EDIT_ACTION_FULFILLED,
    action: CLM.ActionBase
} | {
    type: AT.EDIT_TRAINDIALOG_ASYNC,
    appId: string,
    trainDialog: PartialTrainDialog
} | {
    type: AT.EDIT_TRAINDIALOG_FULFILLED,
    appId: string,
    trainDialog: PartialTrainDialog
} | {
    type: AT.EDIT_TRAINDIALOG_MERGE_ASYNC
} | {
    type: AT.EDIT_TRAINDIALOG_MERGE_FULFILLED
} | {
    type: AT.EDIT_TRAINDIALOG_REPLACE_ASYNC
} | {
    type: AT.EDIT_TRAINDIALOG_REPLACE_FULFILLED,
    updatedTrainDialog: CLM.TrainDialog,
    deletedTrainDialogId: string | null
} | {
    type: AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC,
    appId: string,
    sessionId: string,
} | {
    type: AT.EDIT_APP_LIVE_TAG_ASYNC,
    packageId: string,
    appId: string
} | {
    type: AT.EDIT_APP_LIVE_TAG_FULFILLED,
    app: CLM.AppBase
} | {
    type: AT.EDIT_APP_EDITING_TAG_ASYNC,
    packageId: string,
    appId: string
} | {
    type: AT.EDIT_APP_EDITING_TAG_FULFILLED,
    activeApps: { [appId: string]: string }
} | {
    type: AT.SETTINGS_UPDATE,
    botPort: number
} | {
    type: AT.SETTINGS_RESET
}

export type DisplayAction = {
    type: AT.SET_CURRENT_APP_ASYNC,
    app: CLM.AppBase,
} | {
    type: AT.SET_CURRENT_APP_FULFILLED,
    app: CLM.AppBase
} | {
    type: AT.SET_CONVERSATION_ID_ASYNC,
    userName: string,
    userId: string,
    conversationId: string
} | {
    // used for setting what tool tip is displayed
    type: AT.SET_TIP_TYPE,
    tipType: TipType,
} | {
    // used for setting whether the error popup is displayed
    type: AT.SET_ERROR_DISPLAY,
    errorType: ErrorType,
    title: string | null,
    message: string,
    actionType: AT | null
} | {
    // fuction to call when error display is closeed
    type: AT.SET_ERROR_DISMISS_CALLBACK
    closeCallback: (() => void) | null
} | {
    type: AT.SET_WEBCHAT_SCROLL_POSITION,
    position: number
} | {
    type: AT.CLEAR_WEBCHAT_SCROLL_POSITION
} | {
    type: AT.CLEAR_BANNER
    clearedBanner: CLM.Banner,
} | {
    type: AT.CLEAR_ERROR_DISPLAY
} | {
    type: AT.UPDATE_OPERATION_FULFILLED
} | {
    type: AT.USER_LOGIN,
    name: string,
    id: string
} | {
    type: AT.USER_LOGOUT
} | {
    type: AT.NO_OP
}

export type SourceAction = {
    type: AT.SOURCE_SET_UPDATED_APP_DEFINITION,
    appId: string,
    appDefinitionChange: CLM.AppDefinitionChange
} | {
    type: AT.SOURCE_PROMOTE_UPDATED_APP_DEFINITION,
    appId: string,
    updatedAppDefinition: CLM.AppDefinition
}

export type FetchAction = {
    type: AT.FETCH_APPLICATION_TRAININGSTATUS_ASYNC,
    appId: string
} | {
    type: AT.FETCH_APPLICATION_TRAININGSTATUS_FULFILLED,
    appId: string,
    trainingStatus: CLM.TrainingStatus
} | {
    type: AT.FETCH_APPLICATION_TRAININGSTATUS_EXPIRED,
    appId: string
} | {
    type: AT.FETCH_APPLICATIONS_ASYNC,
    userId: string
} | {
    type: AT.FETCH_BOTINFO_ASYNC,
    browserId: string,
    appId?: string
} | {
    type: AT.FETCH_BOTINFO_FULFILLED,
    botInfo: CLM.BotInfo,
    browserId: string
} | {
    type: AT.FETCH_ENTITIES_ASYNC,
    appId: string
} | {
    type: AT.FETCH_ACTIONS_ASYNC,
    appId: string
} | {
    type: AT.FETCH_APPSOURCE_ASYNC,
    appId: string,
    packageId: string
} | {
    type: AT.FETCH_CHAT_SESSIONS_ASYNC,
    appId: string
} | {
    type: AT.FETCH_TRAIN_DIALOG_ASYNC,
    appId: string,
    trainDialogId: string
} | {
    type: AT.FETCH_TRAIN_DIALOG_FULFILLED,
    trainDialog: CLM.TrainDialog,
    replaceLocal: boolean
} | {
    type: AT.FETCH_TRAIN_DIALOGS_ASYNC,
    appId: string
} | {
    type: AT.FETCH_TRAIN_DIALOGS_FULFILLED,
    allTrainDialogs: CLM.TrainDialog[],
} | {
    type: AT.FETCH_HISTORY_ASYNC,
    appId: string,
    userName: string,
    userId: string,
    trainDialog: CLM.TrainDialog
} | {
    type: AT.FETCH_HISTORY_FULFILLED,
    teachWithHistory: CLM.TeachWithHistory,
} | {
    type: AT.FETCH_LOG_DIALOGS_ASYNC,
    appId: string,
    packageId: string
} | {
    type: AT.FETCH_LOG_DIALOGS_FULFILLED,
    allLogDialogs: CLM.LogDialog[],
} | {
    type: AT.FETCH_APPLICATIONS_FULFILLED,
    uiAppList: CLM.UIAppList,
} | {
    type: AT.FETCH_ENTITIES_FULFILLED,
    allEntities: CLM.EntityBase[],
} | {
    type: AT.FETCH_APPSOURCE_FULFILLED,
    appDefinition: CLM.AppDefinition
} | {
    type: AT.FETCH_ACTIONS_FULFILLED,
    allActions: CLM.ActionBase[]
} | {
    type: AT.FETCH_CHAT_SESSIONS_FULFILLED,
    allSessions: CLM.Session[]
} | {
    type: AT.FETCH_PROFILE_ASYNC
} | {
    type: AT.FETCH_PROFILE_FULFILLED,
    profile: any
} | {
    type: AT.FETCH_ENTITY_DELETE_VALIDATION_ASYNC,
    appId: string,
    packageId: string,
    entityId: string
} | {
    type: AT.FETCH_ENTITY_DELETE_VALIDATION_FULFILLED
} | {
    type: AT.FETCH_ACTION_DELETE_VALIDATION_ASYNC,
    appId: string,
    packageId: string,
    actionId: string
} | {
    type: AT.FETCH_ACTION_DELETE_VALIDATION_FULFILLED
} | {
    type: AT.FETCH_ENTITY_EDIT_VALIDATION_ASYNC,
    appId: string,
    packageId: string,
    entity: CLM.EntityBase
} | {
    type: AT.FETCH_ENTITY_EDIT_VALIDATION_FULFILLED
} | {
    type: AT.FETCH_ACTION_EDIT_VALIDATION_ASYNC,
    appId: string,
    packageId: string,
    action: CLM.ActionBase
} | {
    type: AT.FETCH_ACTION_EDIT_VALIDATION_FULFILLED
} | {
    type: AT.FETCH_SCOREFROMHISTORY_ASYNC,
    appId: string,
    trainDialog: CLM.TrainDialog
} | {
    type: AT.FETCH_SCOREFROMHISTORY_FULFILLED,
    uiScoreResponse: CLM.UIScoreResponse
} | {
    type: AT.FETCH_SCOREFROMHISTORY_REJECTED
} | {
    type: AT.FETCH_EXTRACTFROMHISTORY_ASYNC,
    appId: string,
    trainDialog: CLM.TrainDialog,
    userInput: CLM.UserInput
} | {
    type: AT.FETCH_EXTRACTFROMHISTORY_FULFILLED,
    extractResponse: CLM.ExtractResponse
} | {
    type: AT.FETCH_EXTRACTFROMHISTORY_REJECTED
} | {
    type: AT.FETCH_TRAINDIALOGREPLAY_ASYNC,
    appId: string,
    trainDialog: CLM.TrainDialog
} | {
    type: AT.FETCH_TRAINDIALOGREPLAY_FULFILLED,
    trainDialog: CLM.TrainDialog
} | {
    type: AT.FETCH_TEXTVARIATION_CONFLICT_ASYNC,
    appId: string,
    trainDialogId: string,
    textVariation: CLM.TextVariation
} | {
    type: AT.FETCH_TEXTVARIATION_CONFLICT_FULFILLED,
    extractResponse: CLM.ExtractResponse | null
} | {
    type: AT.SET_TEXTVARIATION_CONFLICT,
    extractResponse: CLM.ExtractResponse
} | {
    type: AT.FETCH_TUTORIALS_ASYNC,
    userId: string
} | {
    type: AT.FETCH_TUTORIALS_FULFILLED,
    tutorials: CLM.AppBase[]
}

export type CreateAction = {
    type: AT.CREATE_APPLICATION_ASYNC,
    userId: string,
    app: CLM.AppBase,
} | {
    type: AT.COPY_APPLICATION_ASYNC,
    srcUserId: string,
    destUserId: string,
    appId: string
} | {
    type: AT.COPY_APPLICATION_FULFILLED
} | {
    type: AT.CREATE_ENTITY_ASYNC,
    entity: CLM.EntityBase,
    appId: string
} | {
    type: AT.CREATE_ENTITY_FULFILLED,
    entity: CLM.EntityBase
} | {
    type: AT.CREATE_ACTION_ASYNC,
    action: CLM.ActionBase,
    appId: string
} | {
    type: AT.CREATE_ACTION_FULFILLED,
    action: CLM.ActionBase
} | {
    type: AT.CREATE_APP_TAG_ASYNC,
    tagName: string,
    makeLive: boolean,
    appId: string
} | {
    type: AT.CREATE_APP_TAG_FULFILLED,
    app: CLM.AppBase
} | {
    type: AT.CREATE_TRAIN_DIALOG_ASYNC,
    appId: string,
    trainDialog: CLM.TrainDialog
} | {
    type: AT.CREATE_TRAIN_DIALOG_FULFILLED,
    trainDialog: CLM.TrainDialog,
} | {
    type: AT.CREATE_TRAIN_DIALOG_REJECTED
} | {
    type: AT.CREATE_LOG_DIALOG,
    logDialog: CLM.LogDialog,
} | {
    type: AT.CREATE_APPLICATION_FULFILLED,
    app: CLM.AppBase
} | {
    type: AT.CREATE_CHAT_SESSION_ASYNC
} | {
    type: AT.CREATE_CHAT_SESSION_REJECTED
} | {
    type: AT.CREATE_CHAT_SESSION_FULFILLED,
    session: CLM.Session
} | {
    type: AT.CREATE_TEACH_SESSION_ASYNC
} | {
    type: AT.CREATE_TEACH_SESSION_REJECTED
} | {
    type: AT.CREATE_TEACH_SESSION_FULFILLED,
    teachSession: CLM.Teach,
    memories: CLM.Memory[]
} | {
    type: AT.CREATE_TEACH_SESSION_FROMHISTORY_ASYNC,
    appId: string,
    userName: string,
    userId: string,
    trainDialog: CLM.TrainDialog
} | {
    type: AT.CREATE_TEACH_SESSION_FROMHISTORY_FULFILLED,
    teachWithHistory: CLM.TeachWithHistory
} | {
    type: AT.CREATE_TEACH_SESSION_FROMHISTORY_REJECTED
}

export type DeleteAction = {
    type: AT.DELETE_APPLICATION_ASYNC,
    appId: string
} | {
    type: AT.DELETE_APPLICATION_FULFILLED,
    appId: string
} | {
    type: AT.DELETE_ENTITY_ASYNC,
    entityId: string,
    appId: string
} | {
    type: AT.DELETE_ENTITY_FULFILLED,
    entityId: string
} | {
    type: AT.DELETE_ACTION_ASYNC,
    actionId: string,
    appId: string
} | {
    type: AT.DELETE_ACTION_FULFILLED,
    actionId: string
} | {
    type: AT.DELETE_TRAIN_DIALOG_ASYNC,
    appId: string,
    trainDialogId: string
} | {
    type: AT.DELETE_TRAIN_DIALOG_FULFILLED,
    trainDialogId: string,
} | {
    type: AT.DELETE_TRAIN_DIALOG_REJECTED
} | DeleteLogDialogAsyncAction
| DeleteLogDialogFulfilledAction
| DeleteLogDialogRejectedAction
| {
    type: AT.DELETE_CHAT_SESSION_ASYNC,
    session: CLM.Session,
    appId: string,
    packageId: string
} | {
    type: AT.DELETE_CHAT_SESSION_FULFILLED,
    sessionId: string,
} | {
    type: AT.DELETE_TEACH_SESSION_ASYNC,
    teachSession: CLM.Teach,
    appId: string,
    save: boolean
} | {
    type: AT.DELETE_TEACH_SESSION_FULFILLED,
    teachSessionGUID: string,
    newTrainDialog: CLM.TrainDialog | null,
    sourceTrainDialogId: string | null
} | {
    type: AT.CLEAR_TEACH_SESSION
} | {
    type: AT.DELETE_MEMORY_ASYNC,
    key: string,
    appId: string
} | {
    type: AT.DELETE_MEMORY_FULFILLED
} | {
    type: AT.DELETE_OPERATION_FULFILLED
}

export type DeleteLogDialogAsyncAction = {
    type: AT.DELETE_LOG_DIALOG_ASYNC,
    appId: string,
    logDialogId: string
}
export type DeleteLogDialogFulfilledAction = {
    type: AT.DELETE_LOG_DIALOG_FULFILLED,
    logDialogId: string,
}
export type DeleteLogDialogRejectedAction = {
    type: AT.DELETE_LOG_DIALOG_REJECTED,
}

export type TeachAction = {
    type: AT.RUN_EXTRACTOR_ASYNC,
    appId: string,
    extractType: CLM.DialogType,
    turnIndex: number | null,
    sessionId: string,
    userInput: CLM.UserInput
} | {
    type: AT.RUN_EXTRACTOR_FULFILLED,
    appId: string,
    sessionId: string,
    uiExtractResponse: CLM.UIExtractResponse
} | {
    type: AT.UPDATE_EXTRACT_RESPONSE,
    extractResponse: CLM.ExtractResponse
} | {
    type: AT.UPDATE_SOURCE_LOG_DIALOG,
    sourceLogDialogId: string,
    trainDialogId: string
} | {
    type: AT.REMOVE_EXTRACT_RESPONSE,
    extractResponse: CLM.ExtractResponse
} | {
    type: AT.CLEAR_EXTRACT_RESPONSES
} | {
    type: AT.CLEAR_EXTRACT_CONFLICT
} | {
    type: AT.GET_SCORES_ASYNC,
    key: string,
    appId: string,
    sessionId: string,
    scoreInput: CLM.ScoreInput
} | {
    type: AT.GET_SCORES_FULFILLED,
    key: string,
    appId: string,
    sessionId: string,
    uiScoreResponse: CLM.UIScoreResponse
} | {
    type: AT.RUN_SCORER_ASYNC,
    key: string,
    appId: string,
    sessionId: string,
    uiScoreInput: CLM.UIScoreInput
} | {
    type: AT.RUN_SCORER_FULFILLED,
    key: string,
    appId: string,
    sessionId: string,
    uiScoreResponse: CLM.UIScoreResponse
} | {
    type: AT.POST_SCORE_FEEDBACK_ASYNC,
    key: string,
    appId: string,
    sessionId: string,
    uiTrainScorerStep: CLM.UITrainScorerStep,
    uiScoreInput: CLM.UIScoreInput
    waitForUser: boolean
} | {
    type: AT.POST_SCORE_FEEDBACK_FULFILLED,
    key: string,
    appId: string,
    sessionId: string,
    dialogMode: CLM.DialogMode,
    uiPostScoreResponse: CLM.UIPostScoreResponse,
    // TODO: Why allow null here? Just make different Action
    uiScoreInput: CLM.UIScoreInput | null
} | {
    type: AT.TOGGLE_AUTO_TEACH,
    autoTeach: boolean
}

export type ActionObject =
    FetchAction |
    DisplayAction |
    CreateAction |
    UpdateAction |
    DeleteAction |
    TeachAction |
    SourceAction