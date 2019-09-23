/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import { usePayloadRenderer } from './payloadRendererHooks'
import PayloadRendererWithHighlights from './PayloadRendererWithHighlights'

interface Props {
    textAction: CLM.TextAction
    entities: CLM.EntityBase[]
    showMissingEntities: boolean
    memories?: CLM.Memory[]
}


const Component: React.FC<Props> = (props) => {
    const payloadRenderData = usePayloadRenderer(props.textAction.value, props.entities, props.showMissingEntities, props.memories)

    const [isOriginalVisible, setIsOriginalVisivilble] = React.useState(false)
    const onChangeVisible = () => {
        setIsOriginalVisivilble(x => !x)
    }

    const visibleSlateValue = isOriginalVisible
        ? payloadRenderData.slateValueShowingNames
        : payloadRenderData.slateValueShowingMemory

    return (
        <div className={`cl-text-payload ${OF.FontClassNames.mediumPlus}`}>
            <div data-testid="action-scorer-text-response">
                <PayloadRendererWithHighlights
                    slateValue={visibleSlateValue}
                    hasEntities={payloadRenderData.hasEntities}
                />
            </div>
            {payloadRenderData.showToggle && <div>
                <OF.Toggle
                    checked={isOriginalVisible}
                    onChange={onChangeVisible}
                />
            </div>}
        </div>
    )
}

export default Component