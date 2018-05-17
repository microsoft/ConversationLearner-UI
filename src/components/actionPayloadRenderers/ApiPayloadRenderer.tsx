import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import './TextPayloadRenderer.css'
import { RenderedActionArgument } from '@conversationlearner/models';


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
    originalArguments: RenderedActionArgument[]
    substitutedArguments: RenderedActionArgument[]
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

    render() {
        const pairedArguments = this.props.originalArguments.reduce<ICombinedActionArguments>((combined, originalArgument) => {
            const matchingSubstitutedArgument = this.props.substitutedArguments.find(sa => sa.parameter ===  originalArgument.parameter)
            combined.argumentPairs.push({
                original: originalArgument,
                substituted: matchingSubstitutedArgument
            })

            // If any of the arguments are different, set to true
            combined.argumentsDiffer = combined.argumentsDiffer || (originalArgument.value !== matchingSubstitutedArgument.value)

            return combined
        }, {
            argumentPairs: [],
            argumentsDiffer: false
        })

        const showToggle = pairedArguments.argumentsDiffer

        return <div className={`${OF.FontClassNames.mediumPlus} cl-apipayload`}>
            <div className="cl-apipayload__string">
                <div className={OF.FontClassNames.mediumPlus}>{this.props.name}(memoryManager{pairedArguments.argumentPairs.length !== 0 && `, ${pairedArguments.argumentPairs.map(a => a.original.parameter).join(', ')}`})</div>
                <div>
                    {pairedArguments.argumentPairs.length !== 0 && pairedArguments.argumentPairs.map((argument, i) =>
                        <div className="ms-ListItem-primaryText" key={i}>{`${argument.original.parameter}: ${this.state.isOriginalVisible
                            ? argument.original.value
                            : argument.substituted.value}`
                        }</div>)}
                </div>
            }</div>
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