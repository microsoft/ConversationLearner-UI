/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import * as OF from 'office-ui-fabric-react'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import FormattedMessageId from '../FormattedMessageId'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import * as Util from '../../Utils/util'

interface ComponentState {
    userInputVal: string
}

class UserInputModal extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        userInputVal: '',
    }

    userInputChanged(text: string) {
        this.setState({
            userInputVal: text
        })
    }

    @OF.autobind
    onClickCancel() {
        this.setState({
            userInputVal: ""
        })
        this.props.onCancel()
    }

    @OF.autobind
    onClickSubmit() {
        this.setState({
            userInputVal: ""
        })
        this.props.onSubmit(this.state.userInputVal)
    }

    // TODO: Refactor to use default form submission instead of manually listening for keys
    // Also has benefit of native browser validation for required fields
    @OF.autobind
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
            return Util.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_REQUIREDVALUE)
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
            <Modal
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
                        onChanged={text => this.userInputChanged(text)}
                        placeholder={Util.formatMessageId(intl, FM.USERINPUT_PLACEHOLDER)}
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
                                ariaDescription={Util.formatMessageId(intl, FM.APPCREATOR_CREATEBUTTON_ARIADESCRIPTION)}
                                text={Util.formatMessageId(intl, FM.APPCREATOR_CREATEBUTTON_TEXT)}
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
            </Modal>
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
    onSubmit: (userInput: string) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(UserInputModal))