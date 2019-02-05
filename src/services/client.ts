/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { AppInput } from '../types/models'

export interface ClientHeaders {
    botChecksum: string
    memoryKey: string
}

interface TypedAxiosResponse<T> extends AxiosResponse {
    data: T
}

// shape of client
/*
const clClient = new CLClient(getAccessToken, { ... })

const apps = await clClient.apps.list()
const app = await clClient.apps(appId)
const app = await clClient.apps.create({ ... })

const app = await clClient.apps(appId).update({ ... })
await clClient.apps(appId).delete()

const entities = await clClient.apps(appId).entries()
const actions = await clClient.apps(appId).actions()
const logDialogs = await clClient.apps(appId).logDialogs()
const trainDialogs = await clClient.apps(appId).trainDialogs()
*/

interface IActionCreationResponse {
    actionId: string
    packageId: string
    trainingStatus: string
}

export default class ClClient {
    baseUrl: string
    defaultConfig: AxiosRequestConfig = {
        method: 'get',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    forceError: boolean = false

    // The memory is key is used by ConversationLearner-SDK to access the memory partition for a particular user and check consistency of running bot
    getClientHeaders: () => ClientHeaders

    constructor(baseUrl: string, getClientHeaders: () => ClientHeaders, defaultHeaders?: { [x: string]: string }, forceError: boolean = false) {
        this.baseUrl = baseUrl
        this.getClientHeaders = getClientHeaders
        this.defaultConfig.headers = { ...this.defaultConfig.headers, ...defaultHeaders }
        this.forceError = forceError
    }

    send<T = any>(config: AxiosRequestConfig) {
        if (this.forceError) {
            return Promise.reject(new Error("Injected Error"));
        }

        const clientHeaders = this.getClientHeaders()
        const finalConfig = {
            ...this.defaultConfig,
            ...config
        }

        finalConfig.headers[CLM.MEMORY_KEY_HEADER_NAME] = clientHeaders.memoryKey
        finalConfig.headers[CLM.BOT_CHECKSUM_HEADER_NAME] = clientHeaders.botChecksum

        return Axios(finalConfig) as Promise<TypedAxiosResponse<T>>
    }

    setApp(app: CLM.AppBase): Promise<void> {
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/state/app`,
            data: app
        })
            .then(response => { })
    }

    setConversationId(userName: string, userId: string, conversationId: string): Promise<void> {
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/state/conversationId?userName=${userName}&conversationId=${conversationId}`,
        })
            .then(response => { })
    }

    // Each browser instance has a different browserId
    getBotInfo(browserId: string, appId?: string): Promise<CLM.BotInfo> {
        return this.send<CLM.BotInfo>({
            url: `${this.baseUrl}/bot?browserId=${browserId}${appId ? `&appId=${appId}` : ''}`
        })
            .then(response => response.data)
    }

    apps(userId: string): Promise<CLM.UIAppList> {
        return this.send<CLM.UIAppList>({
            url: `${this.baseUrl}/apps?userId=${userId}`
        }).then(response => response.data)
    }

    appGet(appId: string): Promise<CLM.AppBase> {
        return this.send<CLM.AppBase>({
            url: `${this.baseUrl}/app/${appId}`
        })
            .then(response => response.data)
    }

    appGetTrainingStatus(appId: string): Promise<CLM.TrainingStatus> {
        return this.send<CLM.TrainingStatus>({
            url: `${this.baseUrl}/app/${appId}/trainingstatus`
        })
            .then(response => response.data)
    }

    // AT.CREATE_APPLICATION_ASYNC
    appsCreate(userId: string, appInput: AppInput): Promise<CLM.AppBase> {
        return this.send<CLM.AppBase>({
            method: 'post',
            url: `${this.baseUrl}/app?userId=${userId}`,
            data: appInput
        }).then(response => response.data)
    }

    // AT.COPY_APPLICATION_ASYNC
    appCopy(srcUserId: string, destUserId: string, appId: string): Promise<void> {
        return this.send<string>({
            method: 'post',
            url: `${this.baseUrl}/apps/copy?srcUserId=${srcUserId}&destUserId=${destUserId}&appId=${appId}`
        }).then(response => { })
    }

    appsDelete(appId: string): Promise<void> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}`
        })
            .then(response => { })
    }

    appsUpdate(appId: string, app: CLM.AppBase): Promise<CLM.AppBase> {
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}`,
            data: app
        })
            .then(response => app)
    }

    appCreateTag(appId: string, tagName: string, makeLive: boolean): Promise<CLM.AppBase> {
        return this.send<CLM.AppBase>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/publish?version=${tagName}&makeLive=${makeLive}`
        })
            .then(response => response.data)
    }

    appSetLiveTag(appId: string, tagName: string): Promise<CLM.AppBase> {
        return this.send<CLM.AppBase>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/publish/${tagName}`
        })
            .then(response => response.data)
    }

    appSetEditingTag(appId: string, tagName: string): Promise<{ [appId: string]: string }> {
        return this.send<{ [appId: string]: string }>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/edit/${tagName}`
        })
            .then(response => response.data)
    }

    entitiesGetById(appId: string, entityId: string): Promise<CLM.EntityBase> {
        return this.send<CLM.EntityBase>({
            url: `${this.baseUrl}/app/${appId}/entity/${entityId}`
        }).then(response => response.data)
    }

    entities(appId: string): Promise<CLM.EntityBase[]> {
        return this.send<CLM.EntityList>({
            url: `${this.baseUrl}/app/${appId}/entities`
        }).then(response => response.data.entities)
    }

    entitiesCreate(appId: string, entity: CLM.EntityBase): Promise<CLM.EntityBase> {
        return this.send<CLM.ChangeEntityResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/entity`,
            data: entity
        }).then(response => {
            const changeEntityResponse = response.data
            entity.entityId = changeEntityResponse.entityId
            entity.negativeId = changeEntityResponse.negativeEntityId
            return entity
        })
    }

    entitiesDelete(appId: string, entityId: string): Promise<CLM.DeleteEditResponse> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/entity/${entityId}`
        })
            .then(response => response.data)
    }

    entitiesDeleteValidation(appId: string, packageId: string, entityId: string): Promise<string[]> {
        return this.send({
            method: 'get',
            url: `${this.baseUrl}/app/${appId}/entity/${entityId}/deleteValidation?packageId=${packageId}`
        })
            .then(response => response.data)
    }

    entitiesUpdate(appId: string, entity: CLM.EntityBase): Promise<CLM.ChangeEntityResponse> {
        const { version, packageCreationId, packageDeletionId, ...entityToSend } = entity;
        return this.send<CLM.ChangeEntityResponse>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/entity/${entity.entityId}`,
            data: entityToSend
        })
            .then(response => {
                const changeEntityResponse = response.data
                entity.entityId = changeEntityResponse.entityId
                entity.negativeId = changeEntityResponse.negativeEntityId
                return changeEntityResponse
            })
    }

    entitiesUpdateValidation(appId: string, packageId: string, entity: CLM.EntityBase): Promise<string[]> {
        const { version, packageCreationId, packageDeletionId, ...entityToSend } = entity;
        return this.send({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/entity/${entity.entityId}/editValidation?packageId=${packageId}`,
            data: entityToSend
        })
            .then(response => response.data)
    }

    source(appId: string, packageId: string): Promise<CLM.AppDefinitionChange> {
        return this.send<CLM.AppDefinitionChange>({
            url: `${this.baseUrl}/app/${appId}/source?packageId=${packageId}`
        }).then(response => response.data)
    }

    sourcepost(appId: string, source: CLM.AppDefinition): Promise<any> {
        return this.send({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/source`,
            data: source
        }).then(response => response.data)
    }

    actions(appId: string): Promise<CLM.ActionBase[]> {
        return this.send<CLM.ActionList>({
            url: `${this.baseUrl}/app/${appId}/actions`
        }).then(response => response.data.actions)
    }

    actionsCreate(appId: string, action: CLM.ActionBase): Promise<CLM.ActionBase> {
        return this.send<IActionCreationResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/action`,
            data: action
        })
            .then(response => {
                action.actionId = response.data.actionId
                return action
            })
    }

    actionsDelete(appId: string, actionId: string): Promise<CLM.DeleteEditResponse> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/action/${actionId}`
        })
            .then(response => response.data)
    }

    actionsDeleteValidation(appId: string, packageId: string, actionId: string): Promise<string[]> {
        return this.send({
            method: 'get',
            url: `${this.baseUrl}/app/${appId}/action/${actionId}/deleteValidation?packageId=${packageId}`
        })
            .then(response => response.data)
    }

    actionsUpdate(appId: string, action: CLM.ActionBase): Promise<CLM.DeleteEditResponse> {
        const { version, packageCreationId, packageDeletionId, ...actionToSend } = action
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/action/${action.actionId}`,
            data: actionToSend
        })
            .then(response => response.data)
    }

    actionsUpdateValidation(appId: string, packageId: string, action: CLM.ActionBase): Promise<string[]> {
        const { version, packageCreationId, packageDeletionId, ...actionToSend } = action
        return this.send({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/action/${action.actionId}/editValidation?packageId=${packageId}`,
            data: actionToSend
        })
            .then(response => response.data)
    }

    //AT.EDIT_TRAINDIALOG_ASYNC
    trainDialogEdit(appId: string, trainDialog: CLM.TrainDialog): Promise<CLM.TrainResponse> {
        return this.send<CLM.TrainResponse>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialog.trainDialogId}`,
            data: trainDialog
        }).then(response => response.data)
    }

    //AT.FETCH_TRAIN_DIALOG_ASYNC
    trainDialog(appId: string, trainDialogId: string): Promise<CLM.TrainDialog> {
        return this.send<CLM.TrainDialog>({
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}`
        }).then(response => response.data)
    }

    trainDialogs(appId: string): Promise<CLM.TrainDialog[]> {
        return this.send<CLM.TrainDialogList>({
            url: `${this.baseUrl}/app/${appId}/traindialogs?includeDefinitions=false`
        }).then(response => response.data.trainDialogs)
    }

    trainDialogsCreate(appId: string, trainDialog: CLM.TrainDialog): Promise<CLM.TrainDialog> {
        return this.send({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/traindialog`,
            data: trainDialog
        })
            .then(response => {
                trainDialog.trainDialogId = response.data.trainDialogId
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

    //AT.FETCH_SCOREFROMHISTORY_ASYNC
    trainDialogScoreFromHistory(appId: string, trainDialog: CLM.TrainDialog): Promise<CLM.UIScoreResponse> {
        return this.send<CLM.UIScoreResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/scorefromhistory`,
            data: trainDialog
        }).then(response => response.data)
    }

    //AT.FETCH_EXTRACTFROMHISTORY_ASYNC
    trainDialogExtractFromHistory(appId: string, trainDialog: CLM.TrainDialog, userInput: CLM.UserInput): Promise<CLM.ExtractResponse> {
        return this.send<CLM.ExtractResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/extractfromhistory`,
            data: { trainDialog, userInput }
        }).then(response => response.data)
    }

    //AT.FETCH_TRAINDIALOGREPLAY_ASYNC
    trainDialogReplay(appId: string, trainDialog: CLM.TrainDialog): Promise<CLM.TrainDialog> {
        return this.send<CLM.TrainDialog>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/traindialogreplay`,
            data: trainDialog
        }).then(response => response.data)
    }

    trainDialogsUpdateExtractStep(appId: string, trainDialogId: string, turnIndex: number, userInput: CLM.UserInput): Promise<CLM.UIExtractResponse> {
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}/extractor/${turnIndex}?includeDefinitions=true`,
            data: userInput
        })
            .then(response => response.data)
    }

    //AT.FETCH_TEXTVARIATIONCONFLICT_ASYNC
    // If there is a conflicting text variation, returns corresponding extractresponse, otherwise null
    // filteredDialog = dialog to ignore when checking for conflicting labels
    fetchTextVariationConflict(appId: string, trainDialogId: string, textVariation: CLM.TextVariation, filteredDialog: string | null): Promise<CLM.ExtractResponse | null> {
        let url = `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}/extractor/textvariation`
        if (filteredDialog) {
            url = `${url}?filteredDialog=${filteredDialog}`
        }
        return this.send<CLM.ExtractResponse>({
            method: 'post',
            url,
            data: textVariation
        }).then(response => response.data)
    }

    tutorials(userId: string): Promise<CLM.AppBase[]> {
        return this.send<CLM.UIAppList>({
            url: `${this.baseUrl}/apps?userId=${userId}`
        }).then(response => response.data.appList.apps)
    }

    history(appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string): Promise<CLM.TeachWithHistory> {
        return this.send<CLM.TeachWithHistory>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/history?username=${userName}&userid=${userId}`,
            data: trainDialog
        }).then(response => response.data)
    }

    logDialogs(appId: string, packageId: string): Promise<CLM.LogDialog[]> {
        return this.send<CLM.LogDialogList>({
            url: `${this.baseUrl}/app/${appId}/logdialogs?packageId=${packageId}`
        }).then(response => response.data.logDialogs)
    }

    logDialogsCreate(appId: string, logDialog: CLM.LogDialog): Promise<CLM.LogDialog> {
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

    logDialogsUpdateExtractStep(appId: string, logDialogId: string, turnIndex: number, userInput: CLM.UserInput): Promise<CLM.UIExtractResponse> {
        return this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/logdialog/${logDialogId}/extractor/${turnIndex}`,
            data: userInput
        })
            .then(response => response.data)
    }

    chatSessions(appId: string): Promise<CLM.Session[]> {
        return this.send<CLM.SessionList>({
            url: `${this.baseUrl}/app/${appId}/sessions`
        })
            .then(response => response.data.sessions)
    }

    chatSessionsCreate(appId: string, sessionCreateParams: CLM.SessionCreateParams): Promise<CLM.Session> {
        return this.send<CLM.Session>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/session`,
            data: sessionCreateParams
        })
            .then(response => response.data)
    }

    chatSessionsExpire(appId: string): Promise<void> {
        return this.send<void>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/session`
        })
            .then(response => { })
    }

    // AT.DELETE_CHAT_SESSION_ASYNC
    chatSessionsDelete(appId: string): Promise<void> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/session`
        })
            .then(rsponse => { })
    }

    teachSessions(appId: string): Promise<CLM.Teach[]> {
        return this.send<CLM.TeachList>({
            url: `${this.baseUrl}/app/${appId}/teaches`
        })
            .then(response => response.data.teaches)
    }

    teachSessionCreate(appId: string, initialFilledEntities: CLM.FilledEntity[] = []): Promise<CLM.TeachResponse> {
        return this.send<CLM.TeachResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teach`,
            data: initialFilledEntities
        })
            .then(response => response.data)
    }

    // DELETE_TEACH_SESSION_ASYNC
    teachSessionDelete(appId: string, teachSession: CLM.Teach, save: boolean, tags: string[], description: string): Promise<void> {
        return this.send({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teach/${teachSession.teachId}/delete?save=${save}`,
            data: {
                tags,
                description
            }
        })
            .then(response => { })
    }

    // filteredDialog = dialog to ignore when checking for conflicting labels
    teachSessionAddExtractStep(appId: string, sessionId: string, userInput: CLM.UserInput, filteredDialog: string | null): Promise<CLM.UIExtractResponse> {
        let url = `${this.baseUrl}/app/${appId}/teach/${sessionId}/extractor`
        if (filteredDialog) {
            url = `${url}?filteredDialog=${filteredDialog}`
        }
        return this.send({
            method: 'put',
            url,
            data: userInput
        })
            .then(response => response.data)
    }

    teachSessionRescore(appId: string, teachId: string, scoreInput: CLM.ScoreInput): Promise<CLM.UIScoreResponse> {
        return this.send<CLM.UIScoreResponse>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/teach/${teachId}/rescore`,
            data: scoreInput
        })
            .then(response => response.data)
    }

    // AT.POST_SCORE_FEEDBACK_ASYNC
    teachSessionAddScorerStep(appId: string, teachId: string, uiTrainScorerStep: CLM.UITrainScorerStep): Promise<CLM.UIPostScoreResponse> {
        return this.send<CLM.UIPostScoreResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teach/${teachId}/scorer`,
            data: uiTrainScorerStep
        })
            .then(response => response.data)
    }

    // AT.RUN_SCORER_ASYNC
    teachSessionUpdateScorerStep(appId: string, teachId: string, uiScoreInput: CLM.UIScoreInput): Promise<CLM.UIScoreResponse> {
        return this.send<CLM.UIScoreResponse>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/teach/${teachId}/scorer`,
            data: uiScoreInput
        })
            .then(response => response.data)
    }

    teachSessionFromBranch(appId: string, trainDialogId: string, userName: string, userId: string, turnIndex: number): Promise<CLM.TeachWithHistory> {
        return this.send<CLM.TeachWithHistory>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}/branch/${turnIndex}?username=${userName}&userid=${userId}`
        }).then(response => response.data)
    }

    //AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC
    teachSessionFromHistory(appId: string, trainDialog: CLM.TrainDialog, userInput: CLM.UserInput | null, userName: string, userId: string): Promise<CLM.TeachWithHistory> {
        return this.send<CLM.TeachWithHistory>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teachwithhistory?username=${userName}&userid=${userId}`,
            data: {
                trainDialog,
                userInput
            }
        }).then(response => response.data)
    }

    // AT.DELETE_MEMORY_ASYNC
    memoryDelete(appId: string): Promise<void> {
        return this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/botmemory`
        })
            .then(response => { })
    }
}
