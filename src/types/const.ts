/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export enum ErrorType {
    Error,
    Warning
}

export enum AppCreatorType {
    NEW = "NEW",
    IMPORT = "IMPORT",
    COPY = "COPY"
}

// After an edit takes place which activity should I select in webchat
export enum SelectionType {
    CURRENT = "CURRENT",
    NEXT = "NEXT",
    NONE = "NONE"
}

export const CL_IMPORT_ID = '9c110735ea8b440d8f31c5c68ffb767d'

export const BOT_HOST_NAME : Readonly<string> = location.hostname

// if location.port is empty, the port will be set to 443 or 80 based on location.protocol
const LOCATION_PORT : Readonly<string> = location.port === '' ? location.protocol === 'https:' ? '443' : '80' : location.port

export const ports: Readonly<any> = {
    urlBotPort: parseInt(LOCATION_PORT, 10),
    defaultUiPort: 3000,
    defaultBotPort: 3978,
}