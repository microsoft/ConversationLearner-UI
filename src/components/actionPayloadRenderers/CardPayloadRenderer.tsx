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
    onClickViewCard: (showOriginal: boolean) => void
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
            <div>
                <div className={OF.FontClassNames.mediumPlus}>{this.props.name}</div>
                <div className="cl-card-payload__arguments ms-ListItem-primaryText">
                    {pairedArguments.argumentPairs.length !== 0
                    && pairedArguments.argumentPairs.map((argument, i) =>
                        <React.Fragment key={i}>
                            <div>{argument.original.parameter}:</div>
                            <div>{`${(this.props.substitutedArguments === null || this.state.isOriginalVisible)
                                ? argument.original.value
                                : argument.substituted.value}`
                            }</div>
                        </React.Fragment>)}
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
                    onClick={() => this.props.onClickViewCard(this.state.isOriginalVisible)}
                    ariaDescription="ViewCard"
                    text=""
                    iconProps={{ iconName: 'RedEye' }}
                />
            </div>
        </div>
    }
}