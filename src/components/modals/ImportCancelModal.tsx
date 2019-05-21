/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as Util from '../../Utils/util'
import * as OF from 'office-ui-fabric-react'
import { FM } from '../../react-intl-messages'
import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ComponentState {
    stopImport: boolean
}
class ImportCancelModal extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        stopImport: false,
    }

    @OF.autobind
    onChangeCheckbox() {
        this.setState({
            stopImport: !this.state.stopImport
        })
    }
    
    render () {
        return (
            <OF.Dialog
                hidden={!this.props.open}
                onDismiss={() => this.props.onCancel()}
                dialogContentProps={{
                    type: OF.DialogType.normal,
                    title: Util.formatMessageId(this.props.intl, FM.IMPORT_CANCEL_TITLE)
                }}
                modalProps={{
                    isBlocking: false
                }}
            >
            <OF.Checkbox
                label={Util.formatMessageId(this.props.intl, FM.IMPORT_CANCEL_CHECKBOX_LABEL)}
                checked={this.state.stopImport}
                onChange={this.onChangeCheckbox}
            />
            <OF.DialogFooter>
                    <OF.PrimaryButton
                        onClick={() => this.props.onConfirm(this.state.stopImport)}
                        text={Util.formatMessageId(this.props.intl, FM.BUTTON_CONFIRM)}
                        iconProps={{ iconName: 'Accept' }}
                        data-testid="confirm-cancel-modal-accept"
                    />
                    <OF.DefaultButton
                        onClick={() => this.props.onCancel()}
                        text={Util.formatMessageId(this.props.intl, FM.BUTTON_CANCEL)}
                        iconProps={{ iconName: 'Cancel' }}
                        data-testid="confirm-cancel-modal-cancel"
                    />
                </OF.DialogFooter>
            </OF.Dialog>
        )
    }
}

export interface ReceivedProps {
    onConfirm: Function
    onCancel: Function
    open: boolean
}

// Props types inferred from mapStateToProps & dispatchToProps
type Props = ReceivedProps & InjectedIntlProps

export default connect<null, null, ReceivedProps>(null, null)(injectIntl(ImportCancelModal))