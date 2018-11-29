/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import { FM } from '../react-intl-messages'

// Returns className to use for different validity states
export function validityColorClassName(validity: CLM.Validity): string {
    switch (validity) {
        case CLM.Validity.INVALID: 
            return 'cl-color-error'
        case CLM.Validity.UNKNOWN:
            return 'cl-color-caution'
        case CLM.Validity.WARNING:
            return 'cl-color-warning' 
        default:
            return ""
    }
}

// Returns className to use for different validity states
export function validityBorderClassName(validity: CLM.Validity): string {
    switch (validity) {
        case CLM.Validity.INVALID: 
            return 'wc-border-warning-from-'
        case CLM.Validity.UNKNOWN:
            return 'wc-border-warning-from-'
        case CLM.Validity.WARNING:
            return 'wc-border-warning-from-'
        default:
            return ""
    }
}

// Returns tooltip to use for different validity states
export function validityToolTip(validity: CLM.Validity): string {
    switch (validity) {
        case CLM.Validity.INVALID: 
            return FM.TOOLTIP_TRAINDIALOG_INVALID
        case CLM.Validity.UNKNOWN:
            return FM.TOOLTIP_TRAINDIALOG_UNKNOWN
        case CLM.Validity.WARNING:
            return FM.TOOLTIP_TRAINDIALOG_WARNING 
        default:
            return ""
    }
}