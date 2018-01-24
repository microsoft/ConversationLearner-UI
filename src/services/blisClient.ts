import * as models from 'blis-models'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { AppInput } from '../types/models';
import { Activity } from 'botframework-directlinejs';

interface TypedAxiosResponse<T> extends AxiosResponse {
    data: T
}

// shape of client
/*
const blisClient = new BlisClient(getAccessToken, { ... })

const apps = await blisClient.apps.list()
const app = await blisClient.apps(appId)
const app = await blisClient.apps.create({ ... })

const app = await blisClient.apps(appId).update({ ... })
await blisClient.apps(appId).delete()

const entities = await blisClient.apps(appId).entries()
const actions = await blisClient.apps(appId).actions()
const logDialogs = await blisClient.apps(appId).logDialogs()
const trainDialogs = await blisClient.apps(appId).trainDialogs()
*/

export default class BlisClient {
    baseUrl: string
    defaultConfig: AxiosRequestConfig = {
        method: 'get',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    forceError: boolean = false

    getAccessToken: () => string
    // The memory is key is used by BLIS-SDK to access the memory partition for a particular user
    // TODO: Need to further find out why this is required. (I would expect this to also partition on session)
    getMemoryKey: () => string

    constructor(baseUrl: string, getAccessToken: () => string, getMemoryKey: () => string, defaultHeaders?: { [x: string]: string }, forceError: boolean = false) {
        this.baseUrl = baseUrl
        this.getAccessToken = getAccessToken
        this.getMemoryKey = getMemoryKey
        this.defaultConfig.headers = { ...this.defaultConfig.headers, ...defaultHeaders }
        this.forceError = forceError
    }

    send<T = any>(config: AxiosRequestConfig) {

        if (this.forceError) {
            return Promise.reject(new Error("Injected Error"));
        }

        const joinCharacter = /\?/g.test(config.url) ? '&' : '?'
        const urlWithKey = `${config.url}${joinCharacter}key=${this.getMemoryKey()}`

        const finalConfig = {
            ...this.defaultConfig,
            ...config,
            url: urlWithKey
        }

        finalConfig.headers.Authorization = `Bearer ${this.getAccessToken()}`

        return axios(finalConfig) as Promise<TypedAxiosResponse<T>>
    }

    setBlisApp(app: models.BlisAppBase): Promise<void> {
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/state/app`,
            data: app
        })
            .then(response => { })
    }

    getBotInfo(): Promise<models.BotInfo> {
        return this.send<models.BotInfo>({
            url: `${this.baseUrl}/bot`
        })
            .then(response => response.data)
    }

    apps(userId: string): Promise<models.BlisAppBase[]> {
        return this.send<models.BlisAppList>({
            url: `${this.baseUrl}/apps?userId=${userId}`
        }).then(response => response.data.apps)
    }

    appGet(appId: string): Promise<models.BlisAppBase> {
        return this.send<models.BlisAppBase>({
            url: `${this.baseUrl}/app/${appId}`
        })
            .then(response => response.data)
    }

    appGetTrainingStatus(appId: string): Promise<models.TrainingStatus> {
        return this.send<models.TrainingStatus>({
            url: `${this.baseUrl}/app/${appId}/trainingstatus`
        })
            .then(response => response.data)
    }

    appsCreate(userId: string, appInput: AppInput): Promise<models.BlisAppBase> {
        return this.send<string>({
            method: 'post',
            url: `${this.baseUrl}/app?userId=${userId}`,
            data: appInput
        }).then(response => {
            // TODO: Fix API to return full object instead of faking it
            // Alternative is to send another request for app
            return {
                ...appInput,
                appId: response.data,
                datetime: new Date(),
                trainingFailureMessage: null,
                trainingStatus: models.TrainingStatusCode.Completed,
                latestPackageId: 0
            }
        })
    }

    appsDelete(appId: string): Promise<void> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}`
        })
            .then(response => { })
    }

    appsUpdate(appId: string, app: models.BlisAppBase): Promise<models.BlisAppBase> {
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}`,
            data: app
        })
            .then(response => app)
    }

    entities(appId: string): Promise<models.EntityBase[]> {
        return this.send<models.EntityList>({
            url: `${this.baseUrl}/app/${appId}/entities`
        }).then(response => response.data.entities)
    }

    entitiesCreate(appId: string, entity: models.EntityBase): Promise<models.EntityBase> {
        return this.send<string>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/entity`,
            data: entity
        }).then(response => {
                entity.entityId = response.data
                return entity
            })
    }

    entitiesDelete(appId: string, entityId: string): Promise<void> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/entity/${entityId}`
        })
            .then(response => { })
    }

    entitiesUpdate(appId: string, entity: models.EntityBase): Promise<models.EntityBase> {
        const { version, packageCreationId, packageDeletionId, ...entityToSend } = entity;
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/entity/${entity.entityId}`,
            data: entityToSend
        })
            .then(response => entity)
    }

    source(appId: string): Promise<models.AppDefinition> {
        return this.send<models.AppDefinition>({
            url: `${this.baseUrl}/app/${appId}/source`
        }).then(response => response.data)
    }

    actions(appId: string): Promise<models.ActionBase[]> {
        return this.send<models.ActionList>({
            url: `${this.baseUrl}/app/${appId}/actions`
        }).then(response => response.data.actions)
    }

    actionsCreate(appId: string, action: models.ActionBase): Promise<models.ActionBase> {
        return this.send<string>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/action`,
            data: action
        })
            .then(response => {
                action.actionId = response.data
                return action
            })
    }

    actionsDelete(appId: string, actionId: string): Promise<void> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/action/${actionId}`
        })
            .then(response => { })
    }

    actionsUpdate(appId: string, action: models.ActionBase): Promise<models.ActionBase> {
        const { actionId, version, packageCreationId, packageDeletionId, ...actionToSend } = action
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/action/${action.actionId}`,
            data: actionToSend
        })
            .then(response => action)
    }

    trainDialogs(appId: string): Promise<models.TrainDialog[]> {
        return this.send<models.TrainDialogList>({
            url: `${this.baseUrl}/app/${appId}/traindialogs`
        }).then(response => response.data.trainDialogs)
    }

    trainDialogsDelete(appId: string, trainDialogId: string): Promise<void> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}`
        })
            .then(response => { })
    }

    trainDialogsUpdateExtractStep(appId: string, trainDialogId: string, turnIndex: number, userInput: models.UserInput): Promise<models.UIExtractResponse> {
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}/extractor/${turnIndex}`,
            data: userInput
        })
            .then(response => response.data)
    }

    history(appId: string, trainDialog: models.TrainDialog, userName: string, userId: string): Promise<Activity[]> {
        return this.send<Activity[]>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/history?username=${userName}&userid=${userId}`,
            data: trainDialog
        }).then(response => response.data)
    }

    logDialogs(appId: string): Promise<models.LogDialog[]> {
        return this.send<models.LogDialogList>({
            url: `${this.baseUrl}/app/${appId}/logdialogs`
        }).then(response => response.data.logDialogs)
    }

    logDialogsCreate(appId: string, logDialog: models.LogDialog): Promise<models.LogDialog> {
        return this.send<string>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/logdialog`,
            data: logDialog
        })
            .then(response => {
                logDialog.logDialogId = response.data
                return logDialog
            })
    }

    logDialogsDelete(appId: string, logDialogId: string): Promise<void> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/logdialog/${logDialogId}`
        })
            .then(response => { })
    }

    logDialogsUpdateExtractStep(appId: string, logDialogId: string, turnIndex: number, userInput: models.UserInput): Promise<models.UIExtractResponse> {
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/logdialog/${logDialogId}/extractor/${turnIndex}`,
            data: userInput
        })
            .then(response => response.data)
    }

    chatSessions(appId: string): Promise<models.Session[]> {
        return this.send<models.SessionList>({
            url: `${this.baseUrl}/app/${appId}/sessions`
        })
            .then(response => response.data.sessions)
    }

    chatSessionsCreate(appId: string): Promise<models.Session> {
        return this.send<models.Session>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/session`
        })
            .then(response => new models.Session(response.data))
    }

    chatSessionsDelete(appId: string, sessionId: string): Promise<void> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/session/${sessionId}`
        })
            .then(rsponse => { })
    }

    teachSessions(appId: string): Promise<models.Teach[]> {
        return this.send<models.TeachList>({
            url: `${this.baseUrl}/app/${appId}/teaches`
        })
            .then(response => response.data.teaches)
    }

    teachSessionsCreate(appId: string): Promise<models.Teach> {
        return this.send<models.Teach>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teach`
        })
            .then(response => new models.Teach(response.data))
    }

    teachSessionsDelete(appId: string, teachSession: models.Teach, save: boolean): Promise<void> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/teach/${teachSession.teachId}?save=${save}`
        })
            .then(response => { })
    }

    teachSessionsAddExtractStep(appId: string, sessionId: string, userInput: models.UserInput): Promise<models.UIExtractResponse> {
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/teach/${sessionId}/extractor`,
            data: userInput
        })
            .then(response => response.data)
    }

    teachSessionRescore(appId: string, teachId: string, scoreInput: models.ScoreInput): Promise<models.UIScoreResponse> {
        return this.send<models.UIScoreResponse>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/teach/${teachId}/rescore`,
            data: scoreInput
        })
            .then(response => response.data)
    }

    // AT.POST_SCORE_FEEDBACK_ASYNC
    teachSessionAddScorerStep(appId: string, teachId: string, uiTrainScorerStep: models.UITrainScorerStep): Promise<models.UITeachResponse> {
        return this.send<models.UITeachResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teach/${teachId}/scorer`,
            data: uiTrainScorerStep
        })
            .then(response => response.data)
    }

    // AT.RUN_SCORER_ASYNC
    teachSessionUpdateScorerStep(appId: string, teachId: string, uiScoreInput: models.UIScoreInput): Promise<models.UIScoreResponse> {
        return this.send<models.UIScoreResponse>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/teach/${teachId}/scorer`,
            data: uiScoreInput
        })
            .then(response => response.data)
    }

    teachSessionFromUndo(appId: string, teach: models.Teach, userName: string, userId: string): Promise<models.TeachWithHistory> {
        return this.send<models.TeachWithHistory>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teach/${teach.teachId}/undo?username=${userName}&userid=${userId}`,
            data: teach
        }).then(response => response.data)
    }

    teachSessionFromBranch(appId: string, trainDialogId: string, userName: string, userId: string, turnIndex: number): Promise<models.TeachWithHistory> {
        return this.send<models.TeachWithHistory>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}/branch/${turnIndex}?username=${userName}&userid=${userId}`
        }).then(response => response.data)
    }

    //AT.CREATE_TEACH_SESSION_FROMLOGASYNC
    teachSessionFromHistory(appId: string, trainDialog: models.TrainDialog, userName: string, userId: string): Promise<models.TeachWithHistory> {
        return this.send<models.TeachWithHistory>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teachwithhistory?username=${userName}&userid=${userId}`,
            data: trainDialog
        }).then(response => response.data)
    }
}
