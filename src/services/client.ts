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
            return Promise.reject(new Error("Injected Error"))
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

    async setApp(app: CLM.AppBase): Promise<void> {
        await this.send({
            method: 'put',
            url: `${this.baseUrl}/state/app`,
            data: app
        })
    }

    async setConversationId(userName: string, userId: string, conversationId: string): Promise<void> {
        await this.send({
            method: 'put',
            url: `${this.baseUrl}/state/conversationId?userName=${userName}&conversationId=${conversationId}`,
        })
    }

    // Each browser instance has a different browserId
    async getBotInfo(browserId: string, appId?: string): Promise<CLM.BotInfo> {
        const response = await this.send<CLM.BotInfo>({
            url: `${this.baseUrl}/bot?browserId=${browserId}${appId ? `&appId=${appId}` : ''}`
        })
        return response.data
    }

    async apps(userId: string): Promise<CLM.UIAppList> {
        const response = await this.send<CLM.UIAppList>({
            url: `${this.baseUrl}/apps?userId=${userId}`
        })
        return response.data
    }

    async appGet(appId: string): Promise<CLM.AppBase> {
        const response = await this.send<CLM.AppBase>({
            url: `${this.baseUrl}/app/${appId}`
        })
        return response.data
    }

    async appGetTrainingStatus(appId: string): Promise<CLM.TrainingStatus> {
        const response = await this.send<CLM.TrainingStatus>({
            url: `${this.baseUrl}/app/${appId}/trainingstatus`
        })
        return response.data
    }

    // AT.CREATE_APPLICATION_ASYNC
    async appsCreate(userId: string, appInput: AppInput): Promise<CLM.AppBase> {
        const response = await this.send<CLM.AppBase>({
            method: 'post',
            url: `${this.baseUrl}/app?userId=${userId}`,
            data: appInput
        })
        return response.data
    }

    // AT.COPY_APPLICATION_ASYNC
    async appCopy(srcUserId: string, destUserId: string, appId: string): Promise<void> {
        await this.send<string>({
            method: 'post',
            url: `${this.baseUrl}/apps/copy?srcUserId=${srcUserId}&destUserId=${destUserId}&appId=${appId}`
        })
    }

    async appsDelete(appId: string): Promise<void> {
        await this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}`
        })
    }

    async appsUpdate(appId: string, app: CLM.AppBase): Promise<CLM.AppBase> {
        await this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}`,
            data: app
        })
        return app
    }

    async appCreateTag(appId: string, tagName: string, makeLive: boolean): Promise<CLM.AppBase> {
        const response = await this.send<CLM.AppBase>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/publish?version=${tagName}&makeLive=${makeLive}`
        })
        return response.data
    }

    async appSetLiveTag(appId: string, tagName: string): Promise<CLM.AppBase> {
        const response = await this.send<CLM.AppBase>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/publish/${tagName}`
        })
        return response.data
    }

    async appSetEditingTag(appId: string, tagName: string): Promise<{ [appId: string]: string }> {
        const response = await this.send<{
            [appId: string]: string;
        }>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/edit/${tagName}`
        })
        return response.data
    }

    async entitiesGetById(appId: string, entityId: string): Promise<CLM.EntityBase> {
        const response = await this.send<CLM.EntityBase>({
            url: `${this.baseUrl}/app/${appId}/entity/${entityId}`
        })
        return response.data
    }

    async entities(appId: string): Promise<CLM.EntityBase[]> {
        const response = await this.send<CLM.EntityList>({
            url: `${this.baseUrl}/app/${appId}/entities`
        })
        return response.data.entities
    }

    async entitiesCreate(appId: string, entity: CLM.EntityBase): Promise<CLM.EntityBase> {
        const response = await this.send<CLM.ChangeEntityResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/entity`,
            data: entity
        })
        const changeEntityResponse = response.data;
        entity.entityId = changeEntityResponse.entityId;
        entity.negativeId = changeEntityResponse.negativeEntityId;
        return entity
    }

    async entitiesDelete(appId: string, entityId: string): Promise<CLM.DeleteEditResponse> {
        const response = await this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/entity/${entityId}`
        })
        return response.data
    }

    async entitiesDeleteValidation(appId: string, packageId: string, entityId: string): Promise<string[]> {
        const response = await this.send({
            method: 'get',
            url: `${this.baseUrl}/app/${appId}/entity/${entityId}/deleteValidation?packageId=${packageId}`
        })
        return response.data
    }

    async entitiesUpdate(appId: string, entity: CLM.EntityBase): Promise<CLM.ChangeEntityResponse> {
        const { version, packageCreationId, packageDeletionId, ...entityToSend } = entity;
        const response = await this.send<CLM.ChangeEntityResponse>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/entity/${entity.entityId}`,
            data: entityToSend
        })
        const changeEntityResponse = response.data;
        entity.entityId = changeEntityResponse.entityId;
        entity.negativeId = changeEntityResponse.negativeEntityId;
        return changeEntityResponse
    }

    async entitiesUpdateValidation(appId: string, packageId: string, entity: CLM.EntityBase): Promise<string[]> {
        const { version, packageCreationId, packageDeletionId, ...entityToSend } = entity;
        const response = await this.send({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/entity/${entity.entityId}/editValidation?packageId=${packageId}`,
            data: entityToSend
        })
        return response.data
    }

    async source(appId: string, packageId: string): Promise<CLM.AppDefinitionChange> {
        const response = await this.send<CLM.AppDefinitionChange>({
            url: `${this.baseUrl}/app/${appId}/source?packageId=${packageId}`
        })
        return response.data
    }

    async sourcepost(appId: string, source: CLM.AppDefinition): Promise<any> {
        const response = await this.send({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/source`,
            data: source
        })
        return response.data
    }

    async actions(appId: string): Promise<CLM.ActionBase[]> {
        const response = await this.send<CLM.ActionList>({
            url: `${this.baseUrl}/app/${appId}/actions`
        })
        return response.data.actions
    }

    async actionsCreate(appId: string, action: CLM.ActionBase): Promise<CLM.ActionBase> {
        const response = await this.send<IActionCreationResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/action`,
            data: action
        })
        action.actionId = response.data.actionId;
        return action
    }

    async actionsDelete(appId: string, actionId: string): Promise<CLM.DeleteEditResponse> {
        const response = await this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/action/${actionId}`
        })
        return response.data
    }

    async actionsDeleteValidation(appId: string, packageId: string, actionId: string): Promise<string[]> {
        const response = await this.send({
            method: 'get',
            url: `${this.baseUrl}/app/${appId}/action/${actionId}/deleteValidation?packageId=${packageId}`
        })
        return response.data
    }

    async actionsUpdate(appId: string, action: CLM.ActionBase): Promise<CLM.DeleteEditResponse> {
        const { version, packageCreationId, packageDeletionId, ...actionToSend } = action
        const response = await this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/action/${action.actionId}`,
            data: actionToSend
        })
        return response.data
    }

    async actionsUpdateValidation(appId: string, packageId: string, action: CLM.ActionBase): Promise<string[]> {
        const { version, packageCreationId, packageDeletionId, ...actionToSend } = action
        const response = await this.send({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/action/${action.actionId}/editValidation?packageId=${packageId}`,
            data: actionToSend
        })
        return response.data
    }

    //AT.EDIT_TRAINDIALOG_ASYNC
    async trainDialogEdit(appId: string, trainDialog: CLM.TrainDialog): Promise<CLM.TrainResponse> {
        const response = await this.send<CLM.TrainResponse>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialog.trainDialogId}`,
            data: trainDialog
        })
        return response.data
    }

    //AT.FETCH_TRAIN_DIALOG_ASYNC
    async trainDialog(appId: string, trainDialogId: string): Promise<CLM.TrainDialog> {
        const response = await this.send<CLM.TrainDialog>({
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}`
        })
        return response.data
    }

    async trainDialogs(appId: string): Promise<CLM.TrainDialog[]> {
        const response = await this.send<CLM.TrainDialogList>({
            url: `${this.baseUrl}/app/${appId}/traindialogs?includeDefinitions=false`
        })
        return response.data.trainDialogs
    }

    async trainDialogsCreate(appId: string, trainDialog: CLM.TrainDialog): Promise<CLM.TrainDialog> {
        const response = await this.send({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/traindialog`,
            data: trainDialog
        })
        trainDialog.trainDialogId = response.data.trainDialogId;
        return trainDialog
    }

    async trainDialogsDelete(appId: string, trainDialogId: string): Promise<void> {
        await this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}`
        })
    }

    //AT.FETCH_SCOREFROMHISTORY_ASYNC
    async trainDialogScoreFromHistory(appId: string, trainDialog: CLM.TrainDialog): Promise<CLM.UIScoreResponse> {
        const response = await this.send<CLM.UIScoreResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/scorefromhistory`,
            data: trainDialog
        })
        return response.data
    }

    //AT.FETCH_EXTRACTFROMHISTORY_ASYNC
    async trainDialogExtractFromHistory(appId: string, trainDialog: CLM.TrainDialog, userInput: CLM.UserInput): Promise<CLM.ExtractResponse> {
        const response = await this.send<CLM.ExtractResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/extractfromhistory`,
            data: { trainDialog, userInput }
        })
        return response.data
    }

    //AT.FETCH_TRAINDIALOGREPLAY_ASYNC
    async trainDialogReplay(appId: string, trainDialog: CLM.TrainDialog): Promise<CLM.TrainDialog> {
        const response = await this.send<CLM.TrainDialog>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/traindialogreplay`,
            data: trainDialog
        })
        return response.data
    }

    async trainDialogsUpdateExtractStep(appId: string, trainDialogId: string, turnIndex: number, userInput: CLM.UserInput): Promise<CLM.UIExtractResponse> {
        const response = await this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}/extractor/${turnIndex}?includeDefinitions=true`,
            data: userInput
        })
        return response.data
    }

    //AT.FETCH_TEXTVARIATIONCONFLICT_ASYNC
    // If there is a conflicting text variation, returns corresponding extractresponse, otherwise null
    // filteredDialog = dialog to ignore when checking for conflicting labels
    async fetchTextVariationConflict(appId: string, trainDialogId: string, textVariation: CLM.TextVariation, filteredDialog: string | null): Promise<CLM.ExtractResponse | null> {
        let url = `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}/extractor/textvariation`
        if (filteredDialog) {
            url = `${url}?filteredDialog=${filteredDialog}`
        }
        const response = await this.send<CLM.ExtractResponse>({
            method: 'post',
            url,
            data: textVariation
        })
        return response.data
    }

    async tutorials(userId: string): Promise<CLM.AppBase[]> {
        const response = await this.send<CLM.UIAppList>({
            url: `${this.baseUrl}/apps?userId=${userId}`
        })
        return response.data.appList.apps
    }

    async history(appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string): Promise<CLM.TeachWithHistory> {
        const response = await this.send<CLM.TeachWithHistory>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/history?username=${userName}&userid=${userId}`,
            data: trainDialog
        })
        return response.data
    }

    async logDialogs(appId: string, packageId: string): Promise<CLM.LogDialog[]> {
        const response = await this.send<CLM.LogDialogList>({
            url: `${this.baseUrl}/app/${appId}/logdialogs?packageId=${packageId}`
        })
        return response.data.logDialogs
    }

    async logDialogsCreate(appId: string, logDialog: CLM.LogDialog): Promise<CLM.LogDialog> {
        const response = await this.send<string>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/logdialog`,
            data: logDialog
        })
        logDialog.logDialogId = response.data;
        return logDialog
    }

    async logDialogsDelete(appId: string, logDialogId: string): Promise<void> {
        await this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/logdialog/${logDialogId}`
        })
    }

    async logDialogsUpdateExtractStep(appId: string, logDialogId: string, turnIndex: number, userInput: CLM.UserInput): Promise<CLM.UIExtractResponse> {
        const response = await this.send({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/logdialog/${logDialogId}/extractor/${turnIndex}`,
            data: userInput
        })
        return response.data
    }

    async chatSessions(appId: string): Promise<CLM.Session[]> {
        const response = await this.send<CLM.SessionList>({
            url: `${this.baseUrl}/app/${appId}/sessions`
        })
        return response.data.sessions
    }

    async chatSessionsCreate(appId: string, sessionCreateParams: CLM.SessionCreateParams): Promise<CLM.Session> {
        const response = await this.send<CLM.Session>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/session`,
            data: sessionCreateParams
        })
        return response.data
    }

    async chatSessionsExpire(appId: string): Promise<void> {
        await this.send<void>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/session`
        })
    }

    // AT.DELETE_CHAT_SESSION_ASYNC
    async chatSessionsDelete(appId: string): Promise<void> {
        await this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/session`
        })
    }

    async teachSessions(appId: string): Promise<CLM.Teach[]> {
        const response = await this.send<CLM.TeachList>({
            url: `${this.baseUrl}/app/${appId}/teaches`
        })
        return response.data.teaches
    }

    async teachSessionCreate(appId: string, initialFilledEntities: CLM.FilledEntity[] = []): Promise<CLM.TeachResponse> {
        const response = await this.send<CLM.TeachResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teach`,
            data: initialFilledEntities
        })
        return response.data
    }

    // DELETE_TEACH_SESSION_ASYNC
    async teachSessionDelete(appId: string, teachSession: CLM.Teach, save: boolean): Promise<void> {
        await this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/teach/${teachSession.teachId}?save=${save}`
        })
    }

    // filteredDialog = dialog to ignore when checking for conflicting labels
    async teachSessionAddExtractStep(appId: string, sessionId: string, userInput: CLM.UserInput, filteredDialog: string | null): Promise<CLM.UIExtractResponse> {
        let url = `${this.baseUrl}/app/${appId}/teach/${sessionId}/extractor`
        if (filteredDialog) {
            url = `${url}?filteredDialog=${filteredDialog}`
        }
        const response = await this.send({
            method: 'put',
            url,
            data: userInput
        })
        return response.data
    }

    async teachSessionRescore(appId: string, teachId: string, scoreInput: CLM.ScoreInput): Promise<CLM.UIScoreResponse> {
        const response = await this.send<CLM.UIScoreResponse>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/teach/${teachId}/rescore`,
            data: scoreInput
        })
        return response.data
    }

    // AT.POST_SCORE_FEEDBACK_ASYNC
    async teachSessionAddScorerStep(appId: string, teachId: string, uiTrainScorerStep: CLM.UITrainScorerStep): Promise<CLM.UIPostScoreResponse> {
        const response = await this.send<CLM.UIPostScoreResponse>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teach/${teachId}/scorer`,
            data: uiTrainScorerStep
        })
        return response.data
    }

    // AT.RUN_SCORER_ASYNC
    async teachSessionUpdateScorerStep(appId: string, teachId: string, uiScoreInput: CLM.UIScoreInput): Promise<CLM.UIScoreResponse> {
        const response = await this.send<CLM.UIScoreResponse>({
            method: 'put',
            url: `${this.baseUrl}/app/${appId}/teach/${teachId}/scorer`,
            data: uiScoreInput
        })
        return response.data
    }

    async teachSessionFromBranch(appId: string, trainDialogId: string, userName: string, userId: string, turnIndex: number): Promise<CLM.TeachWithHistory> {
        const response = await this.send<CLM.TeachWithHistory>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/traindialog/${trainDialogId}/branch/${turnIndex}?username=${userName}&userid=${userId}`
        })
        return response.data
    }

    //AT.CREATE_TEACH_SESSION_FROMHISTORYASYNC
    async teachSessionFromHistory(appId: string, trainDialog: CLM.TrainDialog, userInput: CLM.UserInput | null, userName: string, userId: string): Promise<CLM.TeachWithHistory> {
        const response = await this.send<CLM.TeachWithHistory>({
            method: 'post',
            url: `${this.baseUrl}/app/${appId}/teachwithhistory?username=${userName}&userid=${userId}`,
            data: {
                trainDialog,
                userInput
            }
        })
        return response.data
    }

    // AT.DELETE_MEMORY_ASYNC
    async memoryDelete(appId: string): Promise<void> {
        await this.send({
            method: 'delete',
            url: `${this.baseUrl}/app/${appId}/botmemory`
        })
    }
}
