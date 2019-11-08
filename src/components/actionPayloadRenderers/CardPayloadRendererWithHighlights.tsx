/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import { useMultiPayloadRenderer } from './payloadRendererHooks'
import PayloadRendererWithHighlights from './PayloadRendererWithHighlights'
import './CardPayloadRenderer.css'

interface Props {
    isValidationError: boolean
    cardAction: CLM.CardAction
    entities: CLM.EntityBase[]
    showMissingEntities: boolean
    memories?: CLM.Memory[]
    onClickViewCard: (cardAction: CLM.CardAction, showOriginal: boolean) => void
}

const Component: React.FC<Props> = (props) => {
    const payloadRenderData = useMultiPayloadRenderer(props.cardAction.arguments, props.entities, props.showMissingEntities, props.memories)

    const [isOriginalVisible, setIsOriginalVisivilble] = React.useState(false)
    const onChangeVisible = () => {
        setIsOriginalVisivilble(x => !x)
    }

    const onClickViewCard = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | OF.BaseButton | OF.Button, MouseEvent>) => {
        event.preventDefault()
        event.stopPropagation()
        props.onClickViewCard(props.cardAction, isOriginalVisible)
    }

    return (
        <div className="cl-card-payload">
            <div data-testid="action-scorer-card">
                <div className={OF.FontClassNames.mediumPlus} data-testid="action-scorer-card-name">{props.cardAction.templateName}</div>
                <div className="cl-card-payload__arguments ms-ListItem-primaryText">
                    {payloadRenderData.renderedArguments.map((argument, i) => {
                            const visibleSlateValue = isOriginalVisible
                                ? argument.valueShowingEntityNames
                                : argument.valueShowingCurrentMemory

                            return (
                                <React.Fragment key={i}>
                                    <div>{argument.parameter}:</div>
                                    <PayloadRendererWithHighlights
                                        hasEntities={argument.hasEntities}
                                        slateValue={visibleSlateValue}
                                    />
                                </React.Fragment>
                            )
                        })}
                </div>
            </div>
            <div>
                {payloadRenderData.showToggle
                    && <OF.Toggle
                        data-testid="action-scorer-entity-toggle"
                        checked={isOriginalVisible}
                        onChange={onChangeVisible}
                    />}
                <OF.IconButton
                    disabled={props.isValidationError}
                    className="ms-Button--primary cl-button--viewCard"
                    onClick={onClickViewCard}
                    ariaDescription="ViewCard"
                    iconProps={{ iconName: 'RedEye' }}
                />
            </div>
        </div>
    )
}

export default Component
