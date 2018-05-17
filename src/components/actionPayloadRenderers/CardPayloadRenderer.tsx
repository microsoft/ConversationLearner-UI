import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import './CardPayloadRenderer.css'
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
    isValidationError: boolean
    name: string
    onClickViewCard: () => void
    originalArguments: RenderedActionArgument[]
    substitutedArguments: RenderedActionArgument[] | null
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
        const pairedArguments = this.props.substitutedArguments === null
            ? {
                argumentPairs: this.props.originalArguments.map(oa => ({
                    original: oa,
                    substituted: null
                })),
                argumentsDiffer: false
            }
            : this.props.originalArguments.reduce<ICombinedActionArguments>((combined, originalArgument) => {
                const matchingSubstitutedArgument = this.props.substitutedArguments.find(sa => sa.parameter === originalArgument.parameter)
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

        return <div className="cl-card-payload">
            <div className="cl-card-payload__string">
                <div className={OF.FontClassNames.mediumPlus}>{this.props.name}</div>
                <div>
                    {pairedArguments.argumentPairs.length !== 0 && pairedArguments.argumentPairs.map((argument, i) =>
                        <div className="ms-ListItem-primaryText" key={i}>{`${argument.original.parameter}: ${(this.props.substitutedArguments === null || this.state.isOriginalVisible)
                            ? argument.original.value
                            : argument.substituted.value}`
                        }</div>)}
                </div>
            </div>
            <div>
                {showToggle
                    && <OF.Toggle
                        checked={this.state.isOriginalVisible}
                        onChanged={this.onChangedVisible}
                    />}
                <OF.PrimaryButton
                    disabled={this.props.isValidationError}
                    className="cl-button--viewCard"
                    onClick={() => this.props.onClickViewCard()}
                    ariaDescription="ViewCard"
                    text=""
                    iconProps={{ iconName: 'RedEye' }}
                />
            </div>
        </div>
    }
}