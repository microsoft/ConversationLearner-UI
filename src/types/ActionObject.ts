/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import {
    AppBase,
    BotInfo, Memory,
    AppDefinition,
    EntityBase,
    ActionBase, TeachWithHistory,
    TrainDialog, LogDialog, Session, Teach, ScoreInput,
    UserInput, ExtractResponse, DialogType,
    UIExtractResponse, UITrainScorerStep, DialogMode,
    UITeachResponse, UIScoreInput, UIScoreResponse, UIAppList, TrainingStatus
} from '@conversationlearner/models'
import { TipType } from '../components/ToolTips'
import { ErrorType } from '../types/const'
import { AT } from '../types/ActionTypes'

export type UpdateAction = {
    type: AT.EDIT_APPLICATION_ASYNC,
    app: AppBase,
} | {
    type: AT.EDIT_APPLICATION_FULFILLED,
    app: AppBase,
} | {
    type: AT.EDIT_ENTITY_ASYNC,
    appId: string,
    entity: EntityBase,
} | {
    type: AT.EDIT_ENTITY_FULFILLED,
    entity: EntityBase,
} | {
    type: AT.EDIT_ACTION_ASYNC,
    action: ActionBase,
    appId: string
} | {
    type: AT.EDIT_ACTION_FULFILLED,
    action: ActionBase
} | {
    type: AT.EDIT_TRAINDIALOG_ASYNC,
    appId: string,
    trainDialog: TrainDialog
} | {
    type: AT.EDIT_TRAINDIALOG_FULFILLED,
    trainDialog: TrainDialog
} | {
    type: AT.EDIT_CHAT_SESSION_EXPIRE_ASYNC,
    key: string,
    appId: string,
    sessionId: string,
} | {
    type: AT.EDIT_APP_LIVE_TAG_ASYNC,
    packageId: string,
    appId: string
} | {
    type: AT.EDIT_APP_LIVE_TAG_FULFILLED,
    app: AppBase
} | {
    type: AT.EDIT_APP_EDITING_TAG_ASYNC,
    packageId: string,
    appId: string
} | {
    type: AT.EDIT_APP_EDITING_TAG_FULFILLED,
    activeApps: { [appId: string]: string }
}

export type DisplayAction = {
    type: AT.SET_CURRENT_APP_ASYNC,
    key: string,
    app: AppBase,
} | {
    type: AT.SET_CURRENT_APP_FULFILLED,
    app: AppBase
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
    title: string,
    messages: string[],
    actionType: AT
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

export type FetchAction = {
    type: AT.FETCH_APPLICATION_TRAININGSTATUS_ASYNC,
    appId: string
} | {
    type: AT.FETCH_APPLICATION_TRAININGSTATUS_FULFILLED,
    appId: string,
    trainingStatus: TrainingStatus
} | {
    type: AT.FETCH_APPLICATION_TRAININGSTATUS_EXPIRED,
    appId: string
} | {
    type: AT.FETCH_APPLICATIONS_ASYNC,
    userId: string
} | {
    type: AT.FETCH_BOTINFO_ASYNC,
    browserId: string
} | {
    type: AT.FETCH_BOTINFO_FULFILLED,
    botInfo: BotInfo,
    browserId: string
} | {
    type: AT.FETCH_ENTITIES_ASYNC,
    clAppID: string
} | {
    type: AT.FETCH_ACTIONS_ASYNC,
    clAppID: string
} | {
    type: AT.FETCH_APPSOURCE_ASYNC,
    clAppID: string,
    packageId: string
} | {
    type: AT.FETCH_CHAT_SESSIONS_ASYNC,
    clAppID: string
} | {
    type: AT.FETCH_TRAIN_DIALOGS_ASYNC,
    clAppID: string
} | {
    type: AT.FETCH_TRAIN_DIALOGS_FULFILLED,
    allTrainDialogs: TrainDialog[],
} | {
    type: AT.FETCH_HISTORY_ASYNC,
    clAppID: string,
    userName: string,
    userId: string,
    trainDialog: TrainDialog
} | {
    type: AT.FETCH_HISTORY_FULFILLED,
    teachWithHistory: TeachWithHistory,
} | {
    type: AT.FETCH_LOG_DIALOGS_ASYNC,
    key: string,
    clAppID: string,
    packageId: string
} | {
    type: AT.FETCH_LOG_DIALOGS_FULFILLED,
    allLogDialogs: LogDialog[],
} | {
    type: AT.FETCH_APPLICATIONS_FULFILLED,
    uiAppList: UIAppList,
} | {
    type: AT.FETCH_ENTITIES_FULFILLED,
    allEntities: EntityBase[],
} | {
    type: AT.FETCH_APPSOURCE_FULFILLED,
    appDefinition: AppDefinition
} | {
    type: AT.FETCH_ACTIONS_FULFILLED,
    allActions: ActionBase[]
} | {
    type: AT.FETCH_CHAT_SESSIONS_FULFILLED,
    allSessions: Session[]
} | {
    type: AT.FETCH_TEACH_SESSIONS_FULFILLED,
    allTeachSessions: Teach[]
} | {
    type: AT.FETCH_TEACH_SESSIONS_ASYNC,
    key: string,
    clAppID: string
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
    entity: EntityBase
} | {
    type: AT.FETCH_ENTITY_EDIT_VALIDATION_FULFILLED
} | {
    type: AT.FETCH_ACTION_EDIT_VALIDATION_ASYNC,
    appId: string,
    packageId: string,
    action: ActionBase
} | {
    type: AT.FETCH_ACTION_EDIT_VALIDATION_FULFILLED
} | {
    type: AT.FETCH_TUTORIALS_ASYNC,
    userId: string
} | {
    type: AT.FETCH_TUTORIALS_FULFILLED,
    tutorials: AppBase[]
}

export type CreateAction = {
    type: AT.CREATE_APPLICATION_ASYNC,
    userId: string,
    app: AppBase,
} | {
    type: AT.COPY_APPLICATION_ASYNC,
    srcUserId: string, 
    destUserId: string,
    appId: string
} | {
    type: AT.COPY_APPLICATION_FULFILLED
} | {
    type: AT.CREATE_ENTITY_ASYNC,
    entity: EntityBase,
    appId: string
} | {
    type: AT.CREATE_ENTITY_FULFILLED,
    entity: EntityBase
} | {
    type: AT.CREATE_ACTION_ASYNC,
    action: ActionBase,
    appId: string
} | {
    type: AT.CREATE_ACTION_FULFILLED,
    action: ActionBase
} | {
    type: AT.CREATE_APP_TAG_ASYNC,
    tagName: string,
    makeLive: boolean,
    appId: string
} | {
    type: AT.CREATE_APP_TAG_FULFILLED,
    app: AppBase
} | {
    type: AT.CREATE_TRAIN_DIALOG_ASYNC,
    key: string,
    logDialogId: string,
    trainDialog: TrainDialog,
    appId: string
} | {
    type: AT.CREATE_TRAIN_DIALOG_FULFILLED,
    trainDialog: TrainDialog,
} | {
    type: AT.CREATE_LOG_DIALOG,
    logDialog: LogDialog,
} | {
    type: AT.CREATE_APPLICATION_FULFILLED,
    app: AppBase
} | {
    type: AT.CREATE_CHAT_SESSION_ASYNC
} | {
    type: AT.CREATE_CHAT_SESSION_REJECTED
} | {
    type: AT.CREATE_CHAT_SESSION_FULFILLED,
    session: Session
} | {
    type: AT.CREATE_TEACH_SESSION_ASYNC
} | {
    type: AT.CREATE_TEACH_SESSION_REJECTED
}| {
    type: AT.CREATE_TEACH_SESSION_FULFILLED,
    teachSession: Teach,
    memories: Memory[]
} | {
    type: AT.CREATE_TEACH_SESSION_FROMUNDOASYNC,
    clAppID: string,
    teach: Teach,
    popRound: boolean,
    userName: string,
    userId: string
} | {
    type: AT.CREATE_TEACH_SESSION_FROMUNDOFULFILLED,
    teachWithHistory: TeachWithHistory
} | {
    type: AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC,
    clAppID: string,
    userName: string,
    userId: string,
    trainDialog: TrainDialog
} | {
    type: AT.CREATE_TEACH_SESSION_FROMHISTORYFULFILLED,
    teachWithHistory: TeachWithHistory
}

export type DeleteAction = {
    type: AT.DELETE_APPLICATION_ASYNC,
    appId: string,
    app: AppBase
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
    key: string,
    session: Session,
    appId: string,
    packageId: string
} | {
    type: AT.DELETE_CHAT_SESSION_FULFILLED,
    sessionId: string,
} | {
    type: AT.DELETE_TEACH_SESSION_ASYNC,
    key: string,
    teachSession: Teach,
    appId: string,
    save: boolean
} | {
    type: AT.DELETE_TEACH_SESSION_FULFILLED,
    teachSessionGUID: string,
    sourceLogDialogId: string,
    trainDialogId: string,
    key: string,
    appId: string,
}| {
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
    key: string,
    appId: string,
    extractType: DialogType,
    turnIndex: number,
    sessionId: string,
    userInput: UserInput
} | {
    type: AT.RUN_EXTRACTOR_FULFILLED,
    key: string,
    appId: string,
    sessionId: string,
    uiExtractResponse: UIExtractResponse
} | {
    type: AT.UPDATE_EXTRACT_RESPONSE,
    extractResponse: ExtractResponse
} | {
    type: AT.REMOVE_EXTRACT_RESPONSE,
    extractResponse: ExtractResponse
} | {
    type: AT.CLEAR_EXTRACT_RESPONSES
} | {
    type: AT.GET_SCORES_ASYNC,
    key: string,
    appId: string,
    sessionId: string,
    scoreInput: ScoreInput
} | {
    type: AT.GET_SCORES_FULFILLED,
    key: string,
    appId: string,
    sessionId: string,
    uiScoreResponse: UIScoreResponse
} | {
    type: AT.RUN_SCORER_ASYNC,
    key: string,
    appId: string,
    sessionId: string,
    uiScoreInput: UIScoreInput
} | {
    type: AT.RUN_SCORER_FULFILLED,
    key: string,
    appId: string,
    sessionId: string,
    uiScoreResponse: UIScoreResponse
} | {
    type: AT.POST_SCORE_FEEDBACK_ASYNC,
    key: string,
    appId: string,
    sessionId: string,
    uiTrainScorerStep: UITrainScorerStep,
    uiScoreInput: UIScoreInput
    waitForUser: boolean
} | {
    type: AT.POST_SCORE_FEEDBACK_FULFILLED,
    key: string,
    appId: string,
    sessionId: string,
    dialogMode: DialogMode,
    uiTeachResponse: UITeachResponse,
    uiScoreInput: UIScoreInput
} | {
    type: AT.TEACH_MESSAGE_RECEIVED,
    message: string
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
    TeachAction;