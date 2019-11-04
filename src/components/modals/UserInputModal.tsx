/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import FormattedMessageId from '../FormattedMessageId'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { autobind } from 'core-decorators';

interface ComponentState {
    userInputVal: string
}

class UserInputModal extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        userInputVal: '',
    }

    componentDidMount() {
        if (this.props.initialInput) {
            this.setState({userInputVal: this.props.initialInput})
        }
    }

    @autobind
    onChangeUserInputChange(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string) {
        this.setState({
            userInputVal: text
        })
    }

    @autobind
    onClickCancel() {
        this.setState({
            userInputVal: ""
        })
        this.props.onCancel()
    }

    @autobind
    onClickSubmit() {
        this.setState({
            userInputVal: ""
        })
        this.props.onSubmit(this.state.userInputVal)
    }

    // TODO: Refactor to use default form submission instead of manually listening for keys
    // Also has benefit of native browser validation for required fields
    @autobind
    onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        // On enter attempt to create the model if required fields are set
        // Not on import as explicit button press is required to pick the file
        if ((this.onGetInputErrorMessage(this.state.userInputVal) === "") && (event.key === 'Enter') && this.state.userInputVal) {
            this.onClickSubmit();
        }
    }

    onGetInputErrorMessage(value: string, max_supported = 125 /* Quarter of LUIS's 500 limit */): string {
        const { intl } = this.props
        if (value.length === 0) {
            return Util.formatMessageId(intl, FM.FIELDERROR_REQUIREDVALUE)
        }

        if (value.length > max_supported) {
            return Util.formatMessageId(intl, FM.ERROR_TOOMANYCHARACTERS)
        }

        return ""
    }

    render() {
        const { intl } = this.props
        const invalidName = this.onGetInputErrorMessage(this.state.userInputVal) !== ""
        return (
            <OF.Modal
                isOpen={this.props.open}
                onDismiss={() => this.onClickCancel()}
                isBlocking={false}
                containerClassName='cl-modal cl-modal--small'
            >
                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        {<FormattedMessageId id={this.props.titleFM} />}
                    </span>
                </div>
                <div className="cl-fieldset">
                    <OF.TextField
                        data-testid="user-input-modal-new-message-input"
                        onGetErrorMessage={value => this.onGetInputErrorMessage(value)}
                        onChange={this.onChangeUserInputChange}
                        placeholder={Util.formatMessageId(intl, this.props.placeholderFM)}
                        onKeyDown={key => this.onKeyDown(key)}
                        value={this.state.userInputVal}
                    />
                </div>
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary" />
                        <div className="cl-modal-buttons_primary">

                            <OF.PrimaryButton
                                disabled={invalidName}
                                data-testid="app-create-button-submit"
                                onClick={this.onClickSubmit}
                                ariaDescription={Util.formatMessageId(intl, this.props.submitButtonFM || FM.BUTTON_CREATE)}
                                text={Util.formatMessageId(intl, this.props.submitButtonFM || FM.BUTTON_CREATE)}
                                iconProps={{ iconName: 'Accept' }}
                            />
                            <OF.DefaultButton
                                onClick={this.onClickCancel}
                                ariaDescription={Util.formatMessageId(intl, FM.BUTTON_CANCEL)}
                                text={Util.formatMessageId(intl, FM.BUTTON_CANCEL)}
                                iconProps={{ iconName: 'Cancel' }}
                            />
                        </div>
                    </div>
                </div>
            </OF.Modal>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        apps: state.apps.all
    }
}

export interface ReceivedProps {
    open: boolean
    titleFM: FM
    placeholderFM: FM
    submitButtonFM?: FM
    initialInput?: string
    onSubmit: (userInput: string) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>;
type dispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = stateProps & dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<stateProps, dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(UserInputModal))