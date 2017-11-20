import * as models from 'blis-models'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

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

    // TODO: Remove after I find out where this is used and why it's needed
    // Blis service doesn't use the key, but it seems the BLIS-SDK relies on it for certain operations
    // Removing it will break teach/chat sessions
    key: string

    constructor(baseUrl: string, getAccessToken: () => string, defaultHeaders?: { [x: string]: string }) {
        this.baseUrl = baseUrl
        this.defaultConfig.headers = { ...this.defaultConfig.headers, ...defaultHeaders }
    }

    send<T = any>(config: AxiosRequestConfig) {
        const joinCharacter = /\?/g.test(config.url) ? '&' : '?'
        const urlWithKey = `${config.url}${joinCharacter}key=${this.key}`
        return axios({
            ...this.defaultConfig,
            ...config,
            url: urlWithKey
        }) as Promise<TypedAxiosResponse<T>>
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

    appsCreate(userId: string, app: models.BlisAppBase): Promise<models.BlisAppBase> {
        return this.send<string>({
            method: 'post',
            url: `${this.baseUrl}/app?userId=${userId}`,
            data: app
        }).then(response => {
            app.appId = response.data
            return app
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
        })
            .then(response => {
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

    trainDialogsCreate(appId: string, trainDialog: models.TrainDialog): Promise<models.TrainDialog> {
        return this.send<string>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/traindialog`,
            data: trainDialog
        })
            .then(response => {
                trainDialog.trainDialogId = response.data
                return trainDialog
            })
    }

    trainDialogsDelete(appId: string, trainDialogId: string): Promise<void> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}`
        })
            .then(response => { })
    }

    trainDialogsUpdate(appId: string, trainDialog: models.TrainDialog): Promise<models.TrainDialog> {
        const { trainDialogId, ...trainDialogToSend } = trainDialog;
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialog.trainDialogId}`,
            data: trainDialogToSend
        })
            .then(response => trainDialog)
    }

    trainDialogsUpdateExtractStep(appId: string, trainDialogId: string, turnIndex: number, userInput: models.UserInput): Promise<models.UIExtractResponse> {
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}/extractor/${turnIndex}`,
            data: userInput
        })
            .then(response => response.data)
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

    teachSessionAddScorerStep(appId: string, teachId: string, uiTrainScorerStep: models.UITrainScorerStep): Promise<models.UITeachResponse> {
        return this.send<models.UITeachResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teach/${teachId}/scorer`,
            data: uiTrainScorerStep
        })
            .then(response => response.data)
    }

    teachSessionUpdateScorerStep(appId: string, teachId: string, uiScoreInput: models.UIScoreInput): Promise<models.UIScoreResponse> {
        return this.send<models.UIScoreResponse>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/teach/${teachId}/scorer`,
            data: uiScoreInput
        })
            .then(response => response.data)
    }
}
