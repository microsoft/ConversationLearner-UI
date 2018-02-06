import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'

const messages = defineMessages({
    fieldErrorRequired: {
        id: FM.APPCREATOR_FIELDERROR_REQUIREDVALUE,
        defaultMessage: 'Required Value'
    }
})

interface ComponentState {
    luisKeyVal: string
}

class DemoImporter extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        luisKeyVal: ''
    }

    constructor(p: Props) {
        super(p)

        this.luisKeyChanged = this.luisKeyChanged.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.onClickCreate = this.onClickCreate.bind(this)
        this.onClickCancel = this.onClickCancel.bind(this)
    }

    resetState() {
        this.setState({
            luisKeyVal: ''
        })
    }

    luisKeyChanged(text: string) {
        this.setState({
            luisKeyVal: text
        })
    }

    onClickCancel() {
        this.resetState();
        this.props.onCancel();
    }

    onClickCreate() {
       this.resetState();
       this.props.onSubmit(this.state.luisKeyVal);
    }

    // TODO: Refactor to use default form submission instead of manually listening for keys
    // Also has benefit of native browser validation for required fields
    onKeyDown(key: React.KeyboardEvent<HTMLElement>) {
        // On enter attempt to create the app if required fields are set
        if (key.keyCode === 13 && this.state.luisKeyVal) {
            this.onClickCreate();
        }
    }

    onGetKeyErrorMessage(value: string): string {
        return value ? '' : this.props.intl.formatMessage(messages.fieldErrorRequired);
    }

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={() => this.onClickCancel()}
                isBlocking={false}
                containerClassName="blis-modal blis-modal--small blis-modal--border"
            >
                <div className="blis-modal_header">
                    <span className={OF.FontClassNames.xxLarge}>
                        <FormattedMessage
                            id={FM.DEMOIMPORT_TITLE}
                            defaultMessage="Import Demo Applications"
                        />
                    </span>
                </div>
                <div>
                    <OF.Label>
                        <FormattedMessage
                            id={FM.APPCREATOR_FIELDS_LUISKEY_LABEL}
                            defaultMessage="LUIS Key"
                        /> <a href="https://www.luis.ai/user/settings" tabIndex={-1} className={OF.FontClassNames.xSmall} target="_blank">
                            (<FormattedMessage
                                id={FM.APPCREATOR_FIELDS_LUISKEY_HELPTEXT}
                                defaultMessage="Find your key"
                            />)
                        </a>
                    </OF.Label>
                    <OF.TextField
                        onGetErrorMessage={value => this.onGetKeyErrorMessage(value)}
                        onChanged={this.luisKeyChanged}
                        placeholder={intl.formatMessage({
                            id: FM.APPCREATOR_FIELDS_LUISKEY_PLACEHOLDER,
                            defaultMessage: 'Key...'
                        })}
                        type="password"
                        onKeyDown={this.onKeyDown}
                        value={this.state.luisKeyVal} 
                    />
                </div>
                <div className="blis-modal_footer">
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary">
                            <OF.PrimaryButton
                                disabled={!this.state.luisKeyVal}
                                onClick={this.onClickCreate}
                                ariaDescription={intl.formatMessage({
                                    id: FM.DEMOIMPORT_BUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Import'
                                })}
                                text={intl.formatMessage({
                                    id: FM.DEMOIMPORT_BUTTON_TEXT,
                                    defaultMessage: 'Import'
                                })}
                            />
                            <OF.DefaultButton
                                onClick={this.onClickCancel}
                                ariaDescription={intl.formatMessage({
                                    id: FM.APPCREATOR_CANCELBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Cancel'
                                })}
                                text={intl.formatMessage({
                                    id: FM.APPCREATOR_CANCELBUTTON_TEXT,
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
    onSubmit: (luisKey: string) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(DemoImporter))