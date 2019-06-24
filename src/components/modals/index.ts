/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import ActionCreatorEditor from './ActionCreatorEditor'
import ActionDeleteModal from './ActionDeleteModal'
import AppCreator from './AppCreator'
import ConfirmCancelModal from './ConfirmCancelModal'
import ChatSessionModal from './ChatSessionModal'
import EntityCreatorEditor from './EntityCreatorEditor'
import EditDialogModal from './EditDialogModal'
import EditDialogAdmin from './EditDialogAdmin'
import ErrorPanel from './ErrorPanel'
import ErrorInjectionEditor from './ErrorInjectionEditor'
import Expando from './Expando'
import LogConversionConflictModal from './LogConversionConflictModal'
import MergeModal from './MergeModal'
import SpinnerWindow from './SpinnerWindow'
import TeachSessionModal from './TeachSessionModal'
import TutorialImporterModal from './TutorialImporter'
import TextboxRestrictable from './TextboxRestrictable'
import PackageCreator from './PackageCreator'
import PackageTable from './PackageTable'

// What is being edited
export enum EditDialogType {
    NEW = 'NEW',
    TRAIN_EDITED = 'TRAIN_EDITED',
    TRAIN_ORIGINAL = 'TRAIN_ORIGINAL',
    LOG_EDITED = 'LOG_EDITED',
    LOG_ORIGINAL = 'LOG_ORIGINAL',
    BRANCH = 'BRANCH',
    IMPORT = 'IMPORT'
}

// State of current edited dialog
export enum EditState {
    CAN_EDIT = 'CAN_EDIT',
    // Running bot not compatible with Model
    INVALID_BOT = 'INVALID_BOT',
    // Attempting to edit older package id
    INVALID_PACKAGE = 'INVALID_PACKAGE'
}

export {
    ActionCreatorEditor,
    ActionDeleteModal,
    AppCreator,
    ConfirmCancelModal,
    ChatSessionModal,
    EntityCreatorEditor,
    EditDialogAdmin,
    EditDialogModal,
    ErrorPanel,
    ErrorInjectionEditor,
    Expando,
    LogConversionConflictModal,
    MergeModal,
    PackageCreator,
    PackageTable,
    SpinnerWindow,
    TeachSessionModal,
    TutorialImporterModal,
    TextboxRestrictable,
}