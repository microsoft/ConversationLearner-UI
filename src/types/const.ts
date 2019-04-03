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
export const devUiPort = 5050
export const defaultBotPort = 3978

// Allow developers who run UI on 5050 to use Bot running on 3987
// But still allow customers to run Bot and UI on any other port than 5050
export const botPort = location.port === devUiPort.toString()
    ? defaultBotPort
    : location.port
