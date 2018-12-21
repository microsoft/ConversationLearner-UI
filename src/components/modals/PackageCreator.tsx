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
import { PackageReference } from '@conversationlearner/models'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import FormattedMessageId from '../FormattedMessageId'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import * as TC from '../tipComponents'
import * as ToolTips from '../ToolTips/ToolTips'
import * as Util from '../../Utils/util'

interface ComponentState {
    tagNameVal: string
    isLiveVal: boolean
}

class PackageCreator extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        tagNameVal: '',
        isLiveVal: false
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState({
            tagNameVal: '',
            isLiveVal: false
        })
    }

    nameChanged(text: string) {
        this.setState({
            tagNameVal: text
        })
    }

    @OF.autobind
    onClickCancel() {
        this.props.onCancel()
    }

    @OF.autobind
    onClickCreate() {
        this.props.onSubmit(this.state.tagNameVal, this.state.isLiveVal)
    }

    // TODO: Refactor to use default form submission instead of manually listening for keys
    // Also has benefit of native browser validation for required fields
    onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        // On enter attempt to create the model if required fields are set
        if (event.keyCode === 13 && this.state.tagNameVal) {
            this.onClickCreate();
        }
    }

    onGetNameErrorMessage(value: string): string {
        const { intl } = this.props
        if (value.length === 0) {
            return Util.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_REQUIREDVALUE)

        }

        if (!/^[a-zA-Z0-9- ]+$/.test(value)) {
            return Util.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_ALPHANUMERIC)
        }

        // Check that name isn't in use
        let foundName = this.props.packageReferences.find(pr => pr.packageVersion === value)
        if (foundName) {
            return Util.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_DISTINCT)
        }

        if ("Master".toLowerCase() === value.toLowerCase()) {
            return Util.formatMessageId(intl, FM.APPCREATOR_FIELDERROR_DISTINCT)
        }

        return ''
    }

    @OF.autobind
    onToggleSetLive() {
        this.setState({
            isLiveVal: !this.state.isLiveVal
        })
    }

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={() => this.onClickCancel()}
                isBlocking={false}
                containerClassName="cl-modal cl-modal--small"
            >
                <div className="cl-page">
                    <div className="cl-modal_header">
                        <span className={OF.FontClassNames.xxLarge}>
                            <FormattedMessageId id={FM.PACKAGECREATOR_TITLE} />
                        </span>
                    </div>
                    <div>
                        <OF.TextField
                            onGetErrorMessage={value => this.onGetNameErrorMessage(value)}
                            onChanged={text => this.nameChanged(text)}
                            label={intl.formatMessage({
                                id: FM.PACKAGECREATOR_TAG_LABEL,
                                defaultMessage: 'Name'
                            })}
                            placeholder={intl.formatMessage({
                                id: FM.PACKAGECREATOR_TAG_PLACEHOLDER,
                                defaultMessage: 'Tag Name...'
                            })}
                            onKeyDown={key => this.onKeyDown(key)}
                            value={this.state.tagNameVal}
                        />
                    </div>
                    <div className="cl-entity-creator-checkbox">
                        <TC.Checkbox
                            label={intl.formatMessage({
                                id: FM.PACKAGECREATOR_LIVE_LABEL,
                                defaultMessage: 'Make Live Version'
                            })}
                            checked={this.state.isLiveVal}
                            onChange={this.onToggleSetLive}
                            tipType={ToolTips.TipType.PACKAGECREATOR_LIVE_TOGGLE}
                        />
                    </div>
                    <div className="cl-modal_footer">
                        <div className="cl-modal-buttons">
                            <div className="cl-modal-buttons_primary">
                                <OF.PrimaryButton
                                    disabled={!this.state.tagNameVal || this.onGetNameErrorMessage(this.state.tagNameVal).length > 0}
                                    onClick={this.onClickCreate}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.PACKAGECREATOR_CREATEBUTTON_ARIADESCRIPTION,
                                        defaultMessage: 'Create'
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.PACKAGECREATOR_CREATEBUTTON_TEXT,
                                        defaultMessage: 'Create'
                                    })}
                                />
                                <OF.DefaultButton
                                    onClick={this.onClickCancel}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.PACKAGECREATOR_CANCELBUTTON_ARIADESCRIPTION,
                                        defaultMessage: 'Cancel'
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.PACKAGECREATOR_CANCELBUTTON_TEXT,
                                        defaultMessage: 'Cancel'
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({}, dispatch);
}
const mapStateToProps = (state: State) => {
    return {}
}

export interface ReceivedProps {
    open: boolean
    packageReferences: PackageReference[]
    onSubmit: (tagName: string, isLive: boolean) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(PackageCreator))