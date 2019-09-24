/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import { usePayloadRenderer } from './payloadRendererHooks'
import PayloadRendererWithHighlights from './PayloadRendererWithHighlights'
import './SessionPayloadRendererWithHighlights.css'

interface Props {
    sessionAction: CLM.SessionAction
    entities: CLM.EntityBase[]
    showMissingEntities: boolean
    memories?: CLM.Memory[]
}

const Component: React.FC<Props> = (props) => {
    const payloadRenderData = usePayloadRenderer(props.sessionAction.value, props.entities, props.showMissingEntities, props.memories)

    const [isOriginalVisible, setIsOriginalVisivilble] = React.useState(false)
    const onChangeVisible = () => {
        setIsOriginalVisivilble(x => !x)
    }

    const visibleSlateValue = isOriginalVisible
        ? payloadRenderData.slateValueShowingNames
        : payloadRenderData.slateValueShowingMemory

    return (
        <div className={`cl-sesson-payload ${OF.FontClassNames.mediumPlus}`}>
            <div>
                <div className="cl-sesson-payload__header">
                    EndSession
                </div>
                <div data-testid="action-scorer-session-response-user">
                    <PayloadRendererWithHighlights
                        slateValue={visibleSlateValue}
                        hasEntities={payloadRenderData.hasEntities}
                    />
                </div>
            </div>
            {payloadRenderData.showToggle && <div className="cl-sesson-payload__toggle">
                <OF.Toggle
                    checked={isOriginalVisible}
                    onChange={onChangeVisible}
                />
            </div>}
        </div>
    )
}

export default Component