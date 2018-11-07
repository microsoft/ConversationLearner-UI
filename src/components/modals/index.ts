/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import ActionCreatorEditor from './ActionCreatorEditor'
import AppCreator from './AppCreator'
import EntityCreatorEditor from './EntityCreatorEditor'
import ConfirmCancelModal from './ConfirmCancelModal'
import ChatSessionModal from './ChatSessionModal'
import TeachSessionModal from './TeachSessionModal'
import EditDialogModal from './EditDialogModal'
import EditDialogAdmin from './EditDialogAdmin'
import TutorialImporterModal from './TutorialImporter'
import ErrorPanel from './ErrorPanel'
import SpinnerWindow from './SpinnerWindow'
import Expando from './Expando'

// What is being edited
export enum EditDialogType {
    NEW = 'NEW',
    TRAIN_EDITED = 'TRAIN_EDITED',
    TRAIN_ORIGINAL = 'TRAIN_ORIGINAL',
    LOG_EDITED = 'LOG_EDITED',
    LOG_ORIGINAL = 'LOG_ORIGINAL',
    BRANCH = 'BRANCH'
}

// State of current edited dialog
export enum EditState {
    CAN_EDIT = 'CAN_EDIT',
    // Runing bot not compatible with Model
    INVALID_BOT = 'INVALID_BOT',
    // Attemping to edit older package id
    INVALID_PACKAGE = 'INVALID_PACKAGE'
}

export {
    ActionCreatorEditor,
    AppCreator,
    EntityCreatorEditor,
    ConfirmCancelModal,
    ChatSessionModal,
    TeachSessionModal,
    EditDialogAdmin,
    EditDialogModal,
    TutorialImporterModal,
    ErrorPanel,
    SpinnerWindow,
    Expando
}