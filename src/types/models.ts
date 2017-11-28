import { BlisAppBase } from "blis-models"

export interface App extends BlisAppBase {
    didPollingExpire: boolean
}