/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'

interface ComponentState {
    userInputVal: string
}

class UserInputModal extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        userInputVal: '',
    }

    constructor(p: Props) {
        super(p)

        this.onKeyDown = this.onKeyDown.bind(this)
        this.onClickSubmit = this.onClickSubmit.bind(this)
        this.onClickCancel = this.onClickCancel.bind(this)
    }

    userInputChanged(text: string) {
        this.setState({
            userInputVal: text
        })
    }

    onClickCancel() {
        this.setState({
            userInputVal: ""
        })
        this.props.onCancel()
    }

    onClickSubmit = () => {
        this.setState({
            userInputVal: ""
        })
        this.props.onSubmit(this.state.userInputVal)
    }

    // TODO: Refactor to use default form submission instead of manually listening for keys
    // Also has benefit of native browser validation for required fields
    onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        // On enter attempt to create the model if required fields are set
        // Not on import as explicit button press is required to pick the file
        if (event.key === 'Enter' && this.state.userInputVal) {
            this.onClickSubmit();
        }
    }

    onGetInputErrorMessage(value: string): string {
        const { intl } = this.props
        if (value.length === 0) {
            return intl.formatMessage({
                id: FM.APPCREATOR_FIELDERROR_REQUIREDVALUE,
                defaultMessage: "Required Value"
            })
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
                        {                    
                        <FormattedMessage
                            id={FM.USERINPUT_TITLE}
                            defaultMessage="Add User Input"
                        />}
                    </span>
                </div>
                <div className="cl-action-creator-fieldset">
                    <OF.TextField
                        data-testid="app-create-input-name"
                        onGetErrorMessage={value => this.onGetInputErrorMessage(value)}
                        onChanged={text => this.userInputChanged(text)}
                        placeholder={intl.formatMessage({
                            id: FM.USERINPUT_PLACEHOLDER,
                            defaultMessage: "User Input..."
                        })}
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
                                    ariaDescription={intl.formatMessage({
                                        id: FM.APPCREATOR_CREATEBUTTON_ARIADESCRIPTION,
                                        defaultMessage: 'Create'
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.APPCREATOR_CREATEBUTTON_TEXT,
                                        defaultMessage: 'Create'
                                    })}
                                />
                            <OF.DefaultButton
                                onClick={this.onClickCancel}
                                ariaDescription={intl.formatMessage({
                                    id: FM.BUTTON_CANCEL,
                                    defaultMessage: 'Cancel'
                                })}
                                text={intl.formatMessage({
                                    id: FM.BUTTON_CANCEL,
                                    defaultMessage: 'Cancel'
                                })}
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
    onSubmit: (userInput: string) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(UserInputModal))