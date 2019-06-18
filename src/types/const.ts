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

export const LOCATION_HOST : Readonly<string> = location.hostname

const LOCATION_PORT : string = location.port === '' ? '80' : location.port

export const ports: Readonly<any> = {
    urlBotPort: parseInt(LOCATION_PORT, 10),
    defaultUiPort: 3000,
    defaultBotPort: 3978,
}