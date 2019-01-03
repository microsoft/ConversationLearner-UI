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
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ComponentState {
    value: string
}

class TextboxRestrictableModal extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        value: '',
    }

    userInputChanged(text: string) {
        this.setState({
            value: text
        })
    }

    isContinueDisabled() {
        return (this.props.matched_text != null) && this.props.matched_text !== this.state.value
    }

    @OF.autobind
    onClickOK() {
        this.setState({
            value: ""
        })
        this.props.onOK(this.state.value)
    }

    @OF.autobind
    onClickCancel() {
        this.setState({
            value: ""
        })
        this.props.onCancel()
    }

    @OF.autobind
    onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        if ((event.key === 'Enter') && !this.isContinueDisabled()) {
            this.onClickOK();
        }
    }

    render() {
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={() => this.onClickCancel()}
                isBlocking={false}
                containerClassName='cl-modal cl-modal--small'
            >
                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.mediumPlus}>
                        {this.props.message}
                    </span>
                </div>
                <div className="cl-action-creator-fieldset">
                    <OF.TextField
                        data-testid="user-input-modal-new-message-input"
                        onChanged={text => this.userInputChanged(text)}
                        placeholder={this.props.placeholder}
                        onKeyDown={key => this.onKeyDown(key)}
                        value={this.state.value}
                    />
                </div>
                <div className='cl-modal_footer'>
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary" />
                        <div className="cl-modal-buttons_primary">

                            <OF.PrimaryButton
                                disabled={this.isContinueDisabled()}
                                data-testid="app-modal-continue-button"
                                onClick={this.onClickOK}
                                ariaDescription={this.props.button_ok}
                                text={this.props.button_ok}
                            />
                            <OF.DefaultButton
                                onClick={this.onClickCancel}
                                ariaDescription={this.props.button_cancel}
                                text={this.props.button_cancel}
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
    message: string
    placeholder: string
    matched_text: any
    button_ok: string
    button_cancel: string
    onOK: (userInput: string) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TextboxRestrictableModal))