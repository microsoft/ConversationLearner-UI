/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import './ApiPayloadRenderer.css'
import { RenderedActionArgument } from '@conversationlearner/models'

interface ICombinedActionArgument {
    original: RenderedActionArgument
    substituted: RenderedActionArgument
}

interface ICombinedActionArguments {
    argumentPairs: ICombinedActionArgument[]
    argumentsDiffer: boolean
}

interface Props {
    name: string
    originalLogicArguments: RenderedActionArgument[]
    substitutedLogicArguments: RenderedActionArgument[] | null
    originalRenderArguments: RenderedActionArgument[]
    substitutedRenderArguments: RenderedActionArgument[] | null
}

interface State {
    isOriginalVisible: boolean
}

export default class Component extends React.Component<Props, State> {
    state = {
        isOriginalVisible: false
    }

    onChangedVisible = () => {
        this.setState(prevState => ({
            isOriginalVisible: !prevState.isOriginalVisible
        }))
    }

    private getCombinedArguments (originalArguments: RenderedActionArgument[], substitutedArguments: RenderedActionArgument[] | null): ICombinedActionArguments {
        return substitutedArguments === null
            ? {
                argumentPairs: originalArguments.map(oa => ({
                    original: oa,
                    substituted: oa
                })),
                argumentsDiffer: false
            }
            : originalArguments.reduce<ICombinedActionArguments>((combined, originalArgument) => {
                const matchingSubstitutedArgument = substitutedArguments && substitutedArguments.find(sa => sa.parameter === originalArgument.parameter)
                if (matchingSubstitutedArgument) {
                    combined.argumentPairs.push({
                        original: originalArgument,
                        substituted: matchingSubstitutedArgument
                    })
                    
                    // If any of the arguments are different, set to true
                    combined.argumentsDiffer = combined.argumentsDiffer || (originalArgument.value !== matchingSubstitutedArgument.value)
                }

                return combined
            }, {
                    argumentPairs: [],
                    argumentsDiffer: false
                })
    }

    render() {
        const pairedLogicArguments = this.getCombinedArguments(this.props.originalLogicArguments, this.props.substitutedLogicArguments)
        const pairedRenderArguments = this.getCombinedArguments(this.props.originalRenderArguments, this.props.substitutedRenderArguments)
        const showToggle = pairedLogicArguments.argumentsDiffer

        return <div className="cl-api-payload">
            <div>
                <div className={OF.FontClassNames.mediumPlus}>{this.props.name}</div>
                <div className="cl-api-payload__fn">
                    <div className="cl-api-payload__signature">logic(memoryManager{pairedLogicArguments.argumentPairs.length !== 0 && `, ${pairedLogicArguments.argumentPairs.map(a => a.original.parameter).join(', ')}`})</div>
                    <div className="cl-api-payload__arguments ms-ListItem-primaryText">
                        {pairedLogicArguments.argumentPairs.length !== 0
                        && pairedLogicArguments.argumentPairs.map((argument, i) =>
                            <React.Fragment key={i}>
                                <div>{argument.original.parameter}:</div>
                                <div>"{`${(this.props.substitutedLogicArguments === null || this.state.isOriginalVisible)
                                    ? argument.original.value
                                    : argument.substituted.value}`
                                }"</div>
                            </React.Fragment>)}
                    </div>
                </div>

                <div className="cl-api-payload__fn">
                    <div className="cl-api-payload__signature">render(result, memoryManager{pairedRenderArguments.argumentPairs.length !== 0 && `, ${pairedRenderArguments.argumentPairs.map(a => a.original.parameter).join(', ')}`})</div>
                    <div className="cl-api-payload__arguments ms-ListItem-primaryText">
                        {pairedRenderArguments.argumentPairs.length !== 0
                        && pairedRenderArguments.argumentPairs.map((argument, i) =>
                            <React.Fragment key={i}>
                                <div>{argument.original.parameter}:</div>
                                <div>"{`${(this.props.substitutedLogicArguments === null || this.state.isOriginalVisible)
                                    ? argument.original.value
                                    : argument.substituted.value}`
                                }"</div>
                            </React.Fragment>)}
                    </div>
                </div>
            </div>
            {showToggle
                && <div>
                    <OF.Toggle
                        checked={this.state.isOriginalVisible}
                        onChanged={this.onChangedVisible}
                    />
                </div>}
        </div>
    }
}