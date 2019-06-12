/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import * as React from 'react'
import './ActionTypeRenderer.css'

export default function actionTypeRenderer(action: CLM.ActionBase | undefined): JSX.Element {
    let actionType = action ? action.actionType.toString() : "MISSING ACTION"
    let addedStyle = "cl-actiontype-font"
    if (actionType === CLM.ActionTypes.API_LOCAL) {
        if (CLM.ActionBase.isStubbedAPI(action)) {
            actionType = "API STUB"
            addedStyle = "cl-actiontype-font--warning"
        } else {
            actionType = "API"
        }
    } 
    return <span 
        className={`${OF.FontClassNames.mediumPlus} ${addedStyle}`} 
        data-testid="action-details-action-type"
    >
        {actionType}
    </span>
}