/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import * as React from 'react'
import * as Util from '../Utils/util'
import * as ActionPayloadRenderers from './actionPayloadRenderers'
import './ActionRenderers.css'

export function actionTypeRenderer(action: CLM.ActionBase | undefined): JSX.Element {
    let actionType = action ? action.actionType.toString() : "MISSING ACTION"
    let addedStyle = "cl-actionrenderers-font"
    if (actionType === CLM.ActionTypes.API_LOCAL) {
        if (CLM.ActionBase.isPlaceholderAPI(action)) {
            actionType = "API Placeholder"
            addedStyle = "cl-actionrenderers-font--warning"
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

export function actionListViewRenderer(
    action: CLM.ActionBase,
    entities: CLM.EntityBase[],
    callbacks: CLM.Callback[],
    onClickViewCard: (action: CLM.ActionBase, cardViewerShowOriginal: boolean) => void
): React.ReactNode {
    
    const defaultEntityMap = Util.getDefaultEntityMap(entities)

    if (action.actionType === CLM.ActionTypes.TEXT) {
        const textAction = new CLM.TextAction(action)
        return (
            <ActionPayloadRenderers.TextPayloadRendererWithHighlights
                textAction={textAction}
                entities={entities}
                showMissingEntities={true}
            />)
    }
    else if (action.actionType === CLM.ActionTypes.API_LOCAL) {
        const apiAction = new CLM.ApiAction(action)
        const callback = callbacks.find(t => t.name === apiAction.name)
        return (
            <ActionPayloadRenderers.ApiPayloadRendererWithHighlights
                apiAction={apiAction}
                entities={entities}
                callback={callback}
                showMissingEntities={true}
            />)
    }
    else if (action.actionType === CLM.ActionTypes.CARD) {
        const cardAction = new CLM.CardAction(action)
        return (
            <ActionPayloadRenderers.CardPayloadRendererWithHighlights
                isValidationError={false}
                cardAction={cardAction}
                entities={entities}
                onClickViewCard={(_, showOriginal) => onClickViewCard(action, showOriginal)}
                showMissingEntities={true}
            />)
    }
    else if (action.actionType === CLM.ActionTypes.END_SESSION) {
        const sessionAction = new CLM.SessionAction(action)
        return (
            <ActionPayloadRenderers.SessionPayloadRendererWithHighlights
                sessionAction={sessionAction}
                entities={entities}
                showMissingEntities={true}
            />)
    }
    else if (action.actionType === CLM.ActionTypes.SET_ENTITY) {
        const [name, value] = Util.setEntityActionDisplay(action, entities)
        return <span data-testid="action-scorer-action-set-entity" className={OF.FontClassNames.mediumPlus}>{name}: {value}</span>
    }
    else if (action.actionType === CLM.ActionTypes.DISPATCH) {
        const dispatchAction = new CLM.DispatchAction(action)
        return <span data-testid="action-scorer-action-dispatch" className={OF.FontClassNames.mediumPlus}>Dispatch to model: {dispatchAction.modelName}</span>
    }
    else if (action.actionType === CLM.ActionTypes.CHANGE_MODEL) {
        const changeModelAction = new CLM.ChangeModelAction(action)
        return <span data-testid="action-scorer-action-change-model" className={OF.FontClassNames.mediumPlus}>Change to model: {changeModelAction.modelName}</span>
    }

    return <span className={OF.FontClassNames.mediumPlus}>{CLM.ActionBase.GetPayload(action, defaultEntityMap)}</span>
}