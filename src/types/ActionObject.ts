import {
    BlisAppBase,
    BotInfo,
    EntityBase,
    ActionBase, 
    TrainDialog, LogDialog, Session, Teach, ScoreInput,
    UserInput, ExtractResponse, DialogType,
    UIExtractResponse, UITrainScorerStep,
    UITeachResponse, UIScoreInput, UIScoreResponse, TrainingStatus
} from 'blis-models'
import { TipType } from '../components/ToolTips'
import { ErrorType } from '../types/const'
import { AT } from '../types/ActionTypes'
import { Activity } from 'botframework-directlinejs';

export type UpdateAction = {
    type: AT.EDIT_BLIS_APPLICATION_ASYNC,
    blisApp: BlisAppBase,
} | {
    type: AT.EDIT_BLIS_APPLICATION_FULFILLED,
    blisApp: BlisAppBase,
} | {
    type: AT.EDIT_ENTITY_ASYNC,
    entity: EntityBase,
} | {
    type: AT.EDIT_ENTITY_FULFILLED,
    entity: EntityBase,
} | {
    type: AT.EDIT_ACTION_ASYNC,
    blisAction: ActionBase,
    currentAppId: string
} | {
    type: AT.EDIT_ACTION_FULFILLED,
    blisAction: ActionBase
} | {
    type: AT.EDIT_TRAIN_DIALOG_ASYNC,
    trainDialog: TrainDialog,
    currentAppId: string
} | {
    type: AT.EDIT_TRAIN_DIALOG_FULFILLED,
    trainDialog: TrainDialog,
} | {
    type: AT.EDIT_LOG_DIALOG,
    logDialog: LogDialog,
}

export type DisplayAction = {
    type: AT.SET_CURRENT_BLIS_APP_ASYNC,
    key: string,
    app: BlisAppBase,
} | {
    type: AT.SET_CURRENT_BLIS_APP_FULFILLED,
    app: BlisAppBase
} | {
    // used for setting what tool tip is displayed
    type: AT.SET_TIP_TYPE,
    tipType: TipType,
} | {
    // used for setting whether the error popup is displayed
    type: AT.SET_ERROR_DISPLAY,
    errorType: ErrorType,
    title: string,
    description: string,
    route: AT
} | {
    type: AT.CLEAR_ERROR_DISPLAY
} | {
    type: AT.UPDATE_OPERATION_FULFILLED
} | {
    type: AT.SET_USER,
    name: string,
    password: string,
    id: string
} | {
    type: AT.LOGOUT
} | {
    type: AT.NO_OP
} | {
    type: AT.CHAT_MESSAGE_RECEIVED,
    message: {}
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
    type: AT.FETCH_BOTINFO_ASYNC
} | {
    type: AT.FETCH_BOTINFO_FULFILLED,
    botInfo: BotInfo,
} | {
    type: AT.FETCH_ENTITIES_ASYNC,
    blisAppID: string
} | {
    type: AT.FETCH_ACTIONS_ASYNC,
    blisAppID: string
} | {
    type: AT.FETCH_CHAT_SESSIONS_ASYNC,
    key: string,
    blisAppID: string
} | {
    type: AT.FETCH_TRAIN_DIALOGS_ASYNC,
    key: string,
    blisAppID: string
} | {
    type: AT.FETCH_TRAIN_DIALOGS_FULFILLED,
    allTrainDialogs: TrainDialog[],
} | {
    type: AT.FETCH_HISTORY_ASYNC,
    blisAppID: string,
    userName: string,
    userId: string,
    trainDialogId: string
} | {
    type: AT.FETCH_HISTORY_FULFILLED,
    activities: Activity[],
}| {
    type: AT.FETCH_LOG_DIALOGS_ASYNC,
    key: string,
    blisAppID: string
} | {
    type: AT.FETCH_LOG_DIALOGS_FULFILLED,
    allLogDialogs: LogDialog[],
} | {
    type: AT.FETCH_APPLICATIONS_FULFILLED,
    allBlisApps: BlisAppBase[],
} | {
    type: AT.FETCH_ENTITIES_FULFILLED,
    allEntities: EntityBase[],
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
    blisAppID: string
}

export type CreateAction = {
    type: AT.CREATE_BLIS_APPLICATION_ASYNC,
    key: string,
    userId: string,
    blisApp: BlisAppBase,
} | {
    type: AT.CREATE_ENTITY_ASYNC,
    key: string,
    entity: EntityBase,
    currentAppId: string
} | {
    type: AT.CREATE_ENTITY_FULFILLED,
    entityId: string,
    entity: EntityBase
} | {
    type: AT.CREATE_REVERSIBLE_ENTITY,
    key: string,
    entity: EntityBase,
    currentAppId: string
} | {
    type: AT.CREATE_ACTION_ASYNC,
    action: ActionBase,
    currentAppId: string
} | {
    type: AT.CREATE_ACTION_FULFILLED,
    actionId: string,
    action: ActionBase
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
    type: AT.CREATE_BLIS_APPLICATION_FULFILLED,
    blisApp: BlisAppBase
} | {
    type: AT.CREATE_ENTITY_FULFILLEDPOSITIVE,
    key: string,
    negativeEntity: EntityBase,
    positiveEntity: EntityBase,
    currentAppId: string
} | {
    type: AT.CREATE_ENTITY_FULFILLEDNEGATIVE,
    negativeEntity: EntityBase,
    positiveEntity: EntityBase,
    currentAppId: string
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
    teachSession: Teach
}

export type DeleteAction = {
    type: AT.DELETE_BLIS_APPLICATION_ASYNC,
    blisAppGUID: string,
    blisApp: BlisAppBase
} | {
    type: AT.DELETE_BLIS_APPLICATION_FULFILLED,
    blisAppGUID: string
} | {
    type: AT.DELETE_ENTITY_ASYNC,
    entityGUID: string,
    currentAppId: string,
    entity: EntityBase
} | {
    type: AT.DELETE_REVERSE_ENTITY_ASYNC,
    key: string,
    deletedEntityId: string,
    reverseEntityId: string,
    currentAppId: string
} | {
    type: AT.DELETE_ENTITY_FULFILLED,
    key: string,
    deletedEntityId: string,
    currentAppId: string
} | {
    type: AT.DELETE_ACTION_ASYNC,
    actionGUID: string,
    action: ActionBase,
    currentAppId: string
} | {
    type: AT.DELETE_ACTION_FULFILLED,
    actionGUID: string
} | {
    type: AT.DELETE_TRAIN_DIALOG_ASYNC,
    appId: string,
    trainDialog: TrainDialog
} | {
    type: AT.DELETE_TRAIN_DIALOG_FULFILLED,
    trainDialogId: string,
} | {
    type: AT.DELETE_TRAIN_DIALOG_REJECTED
} | DeleteLogDialogAsyncAction
| DeleteLogDialogAsyncAction2
| DeleteLogDialogFulfilledAction
| DeleteLogDialogRejectedAction
| {
    type: AT.DELETE_CHAT_SESSION_ASYNC,
    key: string,
    session: Session,
    currentAppId: string
} | {
    type: AT.DELETE_CHAT_SESSION_FULFILLED,
    sessionId: string,
} | {
    type: AT.DELETE_TEACH_SESSION_ASYNC,
    key: string,
    teachSession: Teach,
    currentAppId: string,
    save: boolean
} | {
    type: AT.DELETE_TEACH_SESSION_FULFILLED,
    teachSessionGUID: string,
    key: string,
    currentAppId: string,
} | {
    type: AT.DELETE_OPERATION_FULFILLED
}

export type DeleteLogDialogAsyncAction = {
    type: AT.DELETE_LOG_DIALOG_ASYNC,
    appId: string,
    logDialogId: string
}
export type DeleteLogDialogAsyncAction2 = {
    type: AT.DELETE_LOG_DIALOG_ASYNC2,
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
    type: AT.POST_SCORE_FEEDBACK_FULFILLEDWAIT,
    key: string,
    appId: string,
    sessionId: string
    uiTeachResponse: UITeachResponse
} | {
    type: AT.POST_SCORE_FEEDBACK_FULFILLEDNOWAIT,
    key: string,
    appId: string,
    sessionId: string
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