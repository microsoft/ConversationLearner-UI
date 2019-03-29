/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import ActionCreatorEditor from './ActionCreatorEditor'
import AppCreator from './AppCreator'
import ConfirmCancelModal from './ConfirmCancelModal'
import ChatSessionModal from './ChatSessionModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import EditDialogModal from './EditDialogModal'
import EditDialogAdmin from './EditDialogAdmin'
import ErrorPanel from './ErrorPanel'
import Expando from './Expando'
import LogConversionConflictModal from './LogConversionConflictModal'
import MergeModal from './MergeModal'
import SpinnerWindow from './SpinnerWindow'
import TeachSessionModal from './TeachSessionModal'
import TutorialImporterModal from './TutorialImporter'

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
    ConfirmCancelModal,
    ChatSessionModal,
    EntityCreatorEditor,
    EditDialogAdmin,
    EditDialogModal,
    ErrorPanel,
    Expando,
    LogConversionConflictModal,
    MergeModal,
    SpinnerWindow,
    TeachSessionModal,
    TutorialImporterModal,
}