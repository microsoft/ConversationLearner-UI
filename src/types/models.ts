import { AppBase, AppMetaData } from "conversationlearner-models"

export interface App extends AppBase {
    didPollingExpire: boolean
}

export interface AppInput {
    appName: string
    locale: string
    metadata: AppMetaData
}