import { BlisAppBase, BlisAppMetaData } from "blis-models"

export interface App extends BlisAppBase {
    didPollingExpire: boolean
}

export interface AppInput {
    appName: string
    locale: string
    metadata: BlisAppMetaData
}