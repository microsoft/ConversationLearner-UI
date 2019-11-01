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
    COPY = "COPY",
    OBI = "OBI",
}

// After an edit takes place which activity should I select in webchat
export enum SelectionType {
    CURRENT = "CURRENT",
    NEXT = "NEXT",
    NONE = "NONE"
}

// Type of dialog being edited.
export enum EditDialogType {
    NEW = 'NEW',
    TRAIN_EDITED = 'TRAIN_EDITED',
    TRAIN_ORIGINAL = 'TRAIN_ORIGINAL',
    LOG_EDITED = 'LOG_EDITED',
    LOG_ORIGINAL = 'LOG_ORIGINAL',
    BRANCH = 'BRANCH',
    IMPORT = 'IMPORT'
}

// State of current edited dialog.
export enum EditState {
    CAN_EDIT = 'CAN_EDIT',
    // Running bot not compatible with Model.
    INVALID_BOT = 'INVALID_BOT',
    // Attempting to edit older package id.
    INVALID_PACKAGE = 'INVALID_PACKAGE'
}

export const CL_IMPORT_TUTORIALS_USER_ID = '9c110735ea8b440d8f31c5c68ffb767d'

export const BOT_HOST_NAME: Readonly<string> = location.hostname

export const REPROMPT_SELF = "SELF"

// if location.port is empty, the port will be set to 443 or 80 based on location.protocol
const LOCATION_PORT: Readonly<string> = location.port === '' ? location.protocol === 'https:' ? '443' : '80' : location.port

export const ports: Readonly<any> = {
    urlBotPort: parseInt(LOCATION_PORT, 10),
    defaultUiPort: 3000,
    defaultBotPort: 3978,
}

export enum FeatureStrings {
    CCI = "CCI",
    DISPATCHER = "DISPATCHER",
}

export const fromLogTag = 'from-log'
