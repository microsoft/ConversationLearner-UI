/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import { useMultiPayloadRenderer } from './payloadRendererHooks'
import PayloadRendererWithHighlights from './PayloadRendererWithHighlights'
import './ApiPayloadRenderer.css'

interface Props {
    apiAction: CLM.ApiAction
    entities: CLM.EntityBase[]
    showMissingEntities: boolean
    memories?: CLM.Memory[]
    callback?: CLM.Callback
}

const Component: React.FC<Props> = (props) => {
    const logicPayloadRenderData = useMultiPayloadRenderer(props.apiAction.logicArguments, props.entities, props.showMissingEntities, props.memories)
    const renderPayloadRenderData = useMultiPayloadRenderer(props.apiAction.renderArguments, props.entities, props.showMissingEntities, props.memories)

    const showToggle = logicPayloadRenderData.showToggle
        || renderPayloadRenderData.showToggle

    const showLogicFunction = !props.callback
        ? true
        : props.callback.isLogicFunctionProvided
    // && callback.logicArguments.length > 0

    const showRenderFunction = !props.callback
        ? true
        : props.callback.isRenderFunctionProvided
    // && callback.renderArguments.length > 0

    const isPlaceholder = (props.apiAction.isPlaceholder || false)
    const [isOriginalVisible, setIsOriginalVisivilble] = React.useState(false)
    const onChangeVisible = () => {
        setIsOriginalVisivilble(x => !x)
    }

    return (
        <div className="cl-api-payload">
            <div data-testid="action-scorer-api">
                <div className={OF.FontClassNames.mediumPlus} data-testid="action-scorer-api-name">{props.apiAction.name}</div>
                {showLogicFunction && !isPlaceholder &&
                    <div className="cl-api-payload__fn">
                        <div className="cl-api-payload__signature">logic(memoryManager{logicPayloadRenderData.renderedArguments.length !== 0 && `, ${logicPayloadRenderData.renderedArguments.map(a => a.parameter).join(', ')}`})</div>
                        <div className="cl-api-payload__arguments ms-ListItem-primaryText">
                            {logicPayloadRenderData.renderedArguments.length !== 0
                                && logicPayloadRenderData.renderedArguments.map((argument, i) => {
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
                }
                {showRenderFunction && !isPlaceholder &&
                    <div className="cl-api-payload__fn">
                        <div className="cl-api-payload__signature">render(result, memoryManager{renderPayloadRenderData.renderedArguments.length !== 0 && `, ${renderPayloadRenderData.renderedArguments.map(a => a.parameter).join(', ')}`})</div>
                        <div className="cl-api-payload__arguments ms-ListItem-primaryText">
                            {renderPayloadRenderData.renderedArguments.length !== 0
                                && renderPayloadRenderData.renderedArguments.map((argument, i) => {
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
                }
            </div>
            {showToggle
                && <div>
                    <OF.Toggle
                        checked={isOriginalVisible}
                        onChange={onChangeVisible}
                    />
                </div>}
        </div>
    )
}

export default Component