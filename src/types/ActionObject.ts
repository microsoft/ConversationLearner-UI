import { BlisAppBase, BlisAppMetaData, BlisAppList, 
    EntityBase, EntityMetaData, EntityList, 
    ActionBase, ActionMetaData, ActionList, ActionTypes, 
    TrainDialog, LogDialog, Session, Teach,
    UserInput, TrainExtractorStep, ExtractResponse, UIExtractResponse, TrainScorerStep,
    TeachResponse, UIScoreResponse } from 'blis-models'
import { DisplayMode } from '../types/const'
import { AT } from '../types/ActionTypes'

export type UpdateAction = {
    type: AT.EDIT_BLIS_APPLICATION,
    blisApp: BlisAppBase,
} | {
    type: AT.EDIT_BLIS_APPLICATION_FULFILLED,
    blisApp: BlisAppBase,
} | {
    type: AT.EDIT_ENTITY,
    entity: EntityBase,
} | {
    type: AT.EDIT_ENTITY_FULFILLED,
    entity: EntityBase,
} | {
    type: AT.EDIT_ACTION,
    blisAction: ActionBase,
    currentAppId: string
} | {
    type: AT.EDIT_ACTION_FULFILLED,
    blisAction: ActionBase
} | {
    type: AT.EDIT_TRAIN_DIALOG,
    trainDialog: TrainDialog,
} | {
    type: AT.EDIT_LOG_DIALOG,
    logDialog: LogDialog,
} | {
    type: AT.SET_CURRENT_BLIS_APP,
    key: string,
    currentBLISApp: BlisAppBase,
} | {
    type: AT.SET_CURRENT_BLIS_APP_FULFILLED,
    currentBLISApp: BlisAppBase,
} | {
    type: AT.SET_CURRENT_TRAIN_DIALOG,
    currentTrainDialog: TrainDialog,
} | {
    type: AT.SET_CURRENT_LOG_DIALOG,
    currentLogDialog: LogDialog,
} | {
    type: AT.SET_CURRENT_CHAT_SESSION,
    currentSession: Session,
} | {
    type: AT.SET_CURRENT_TEACH_SESSION,
    currentTeachSession: Teach,
} | {
    //used for setting whether the app list or app homepage (AppAdmin) is displayed
    type: AT.SET_DISPLAY_MODE,
    setDisplay: DisplayMode,
} | {
    //used for setting whether the login popup is displayed
    type: AT.SET_LOGIN_DISPLAY,
    setLoginDisplay: boolean,
} | {
    //used for setting whether the error popup is displayed
    type: AT.SET_ERROR_DISPLAY,
    error: string,
    message: string,
    route: AT
} | {
    type: AT.CLEAR_ERROR_DISPLAY
} | {
    type: AT.TOGGLE_TRAIN_DIALOG,
    forward: boolean
} | {
    type: AT.TOGGLE_LOG_DIALOG,
    forward: boolean
} | {
    type: AT.UPDATE_OPERATION_FULFILLED
} | {
    type: AT.SET_USER,
    name: string,
    password: string,
    id: string
} | {
    type: AT.SET_USER_KEY,
    key: string
} | {
    type: AT.LOGOUT
} | {
    type: AT.EMPTY_STATE_PROPERTIES
} | {
    type: AT.NO_OP
} | {
    type: AT.CHAT_MESSAGE_RECEIVED,
    message: {}
}

export type FetchAction = {
        type: AT.FETCH_APPLICATIONS,
        userId: string
    } | {
        type: AT.FETCH_ENTITIES,
        blisAppID: string
    } | {
        type: AT.FETCH_ACTIONS,
        blisAppID: string
    } | {
        type: AT.FETCH_CHAT_SESSIONS,
        key: string,
        blisAppID: string
    } | {
        type: AT.FETCH_TRAIN_DIALOGS,
        allTrainDialogs: TrainDialog[],
    } | {
        type: AT.FETCH_LOG_DIALOGS,
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
        type: AT.FETCH_TEACH_SESSIONS,
        key: string,
        blisAppID: string
}

export type CreateAction = {
        type: AT.CREATE_BLIS_APPLICATION,
        key: string,
        userId: string,
        blisApp: BlisAppBase,
    } | {
        type: AT.CREATE_ENTITY,
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
        type: AT.CREATE_ACTION,
        action: ActionBase,
        currentAppId: string
    } | {
        type: AT.CREATE_ACTION_FULFILLED,
        actionId: string,
        action: ActionBase
    } | {
        type: AT.CREATE_TRAIN_DIALOG,
        trainDialog: TrainDialog,
    } | {
        type: AT.CREATE_LOG_DIALOG,
        logDialog: LogDialog,
    } | {
        type: AT.CREATE_BLIS_APPLICATION_FULFILLED,
        blisApp: BlisAppBase,
        blisAppId: string
    } | {
        type: AT.CREATE_POSITIVE_ENTITY_FULFILLED,
        key: string,
        negativeEntity: EntityBase,
        positiveEntity: EntityBase,
        currentAppId: string
    } | {
        type: AT.CREATE_NEGATIVE_ENTITY_FULFILLED,
        negativeEntity: EntityBase,
        positiveEntity: EntityBase,
        currentAppId: string
    } | {
        type: AT.CREATE_CHAT_SESSION,
        key: string,
        currentAppId: string,
        session: Session
    } | {
        type: AT.CREATE_CHAT_SESSION_FULFILLED,
        sessionId: string,
        session: Session
    } | {
        type: AT.CREATE_TEACH_SESSION,
        key: string,
        currentAppId: string,
        teachSession: Teach
    } | {
        type: AT.CREATE_TEACH_SESSION_FULFILLED,
        teachSessionId: string,
        teachSession: Teach
}


export type DeleteAction = {
        type: AT.DELETE_BLIS_APPLICATION,
        blisAppGUID: string,
        blisApp: BlisAppBase
    } | {
        type: AT.DELETE_BLIS_APPLICATION_FULFILLED,
        blisAppGUID: string
    } | {
        type: AT.DELETE_ENTITY,
        entityGUID: string,
        currentAppId: string,
        entity: EntityBase
    } | {
        type: AT.DELETE_REVERSE_ENTITY,
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
        type: AT.DELETE_ACTION,
        actionGUID: string,
        action: ActionBase,
        currentAppId: string
    } | {
        type: AT.DELETE_ACTION_FULFILLED,
        actionGUID: string
    } | {
        type: AT.DELETE_TRAIN_DIALOG,
        trainDialogGUID: string,
    } | {
        type: AT.DELETE_LOG_DIALOG,
        logDialogGUID: string,
    } | {
        type: AT.DELETE_CHAT_SESSION,
        key: string,
        session: Session,
        currentAppId: string
    } | {
        type: AT.DELETE_CHAT_SESSION_FULFILLED,
        sessionGUID: string,
    } | {
        type: AT.DELETE_TEACH_SESSION,
        key: string,
        teachSession: Teach,
        currentAppId: string
    } | {
        type: AT.DELETE_TEACH_SESSION_FULFILLED,
        teachSessionGUID: string,
    } | {
        type: AT.DELETE_OPERATION_FULFILLED
}

export type TeachAction = {
    type: AT.RUN_EXTRACTOR,
    key: string,
    appId: string,
    teachId: string,
    userInput: UserInput
} | {
    type: AT.RUN_EXTRACTOR_FULFILLED,
    key: string,
    appId: string,
    teachId: string,
    uiExtractResponse: UIExtractResponse
} | {
    type: AT.POST_EXTACT_FEEDBACK,
    key: string,
    appId: string,
    teachId: string,
    trainExtractorStep: TrainExtractorStep
} | {
    type: AT.POST_EXTACT_FEEDBACK_FULFILLED,
    key: string,
    appId: string,
    teachId: string,
    teachResponse: TeachResponse
} | {
    type: AT.RUN_SCORER,
    key: string,
    appId: string,
    teachId: string,
    extractResponse: ExtractResponse
} | {
    type: AT.RUN_SCORER_FULFILLED,
    key: string,
    appId: string,
    teachId: string,
    uiScoreResponse: UIScoreResponse
} | {
    type: AT.POST_SCORE_FEEDBACK,
    key: string,
    appId: string,
    teachId: string,
    trainScorerStep: TrainScorerStep
} | {
    type: AT.POST_SCORE_FEEDBACK_FULFILLED,
    key: string,
    appId: string,
    teachId: string,
    teachResponse: TeachResponse
} | {
    type: AT.TEACH_MESSAGE_RECEIVED,
    message: string
}

export type ActionObject = FetchAction | CreateAction | UpdateAction | DeleteAction | TeachAction;