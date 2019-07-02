/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import CompareDialogsModal from '../modals/CompareDialogsModal'
import { saveAs } from 'file-saver'
import { connect } from 'react-redux'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, } from 'react-intl'
import './TranscriptValidatorModal.css'

interface ComponentState {
    isCompareDialogsOpen: boolean
}

const initialState: ComponentState = {
    isCompareDialogsOpen: false
}

class TranscriptValidatorModal extends React.Component<Props, ComponentState> {
    state = initialState

    @OF.autobind
    onCompare() {
        this.setState({isCompareDialogsOpen: true})
    }

    @OF.autobind
    onCloseCompare() {
        this.setState({isCompareDialogsOpen: false})
    }

    //--- SAVE ------
    @OF.autobind
    onClickExport() {
        const blob = new Blob([JSON.stringify(this.props.transcriptValidationResults)], { type: "text/plain;charset=utf-8" })
        saveAs(blob, `${this.props.app.appName}.cltr`);
        this.props.onClose()
    }

    render() {
        const valid = this.props.transcriptValidationResults.filter(tr => tr.validity === CLM.Validity.VALID)
        const invalid = this.props.transcriptValidationResults.filter(tr => tr.validity === CLM.Validity.INVALID)
        const unknown = this.props.transcriptValidationResults.filter(tr => tr.validity === CLM.Validity.UNKNOWN)
        const warning = this.props.transcriptValidationResults.filter(tr => tr.validity === CLM.Validity.WARNING)

        return (
            <OF.Modal
                isOpen={true}
                isBlocking={true}
                containerClassName='cl-modal cl-modal--transcriptvalidator'
            >
                <div className={`cl-dialog-title cl-dialog-title--import cl-transcript-validator-body ${OF.FontClassNames.xxLarge}`}>
                    <OF.Icon
                        iconName='TestPlan'
                    />
                    {this.props.importCount === 0
                        ? "Testing Complete"
                        : `Testing ${this.props.importIndex} of ${this.props.importCount}...`
                    }
                </div>
                <div className="cl-transcript-validator-result">
                    <span className="cl-transcript-validator-result-title">Passed: </span>
                    <span className="cl-entity cl-entity--match cl-transcript-validator-result-value">
                        {valid.length}
                    </span>
                </div>
                <div className="cl-transcript-validator-result">
                    <span className="cl-transcript-validator-result-title">Failed: </span>
                    <span className="cl-entity cl-entity--mismatch cl-transcript-validator-result-value">
                        {invalid.length}
                    </span>
                </div>
                {warning.length > 0 &&
                    <div className="cl-transcript-validator-result">
                        <span className="cl-transcript-validator-result-title">Invalid: </span> 
                        <span className="cl-entity cl-entity--mismatch cl-transcript-validator-result-value">
                            {warning.length}
                        </span>
                    </div>
                }
                {unknown.length > 0 &&
                    <div className="cl-transcript-validator-result">
                        <span className="cl-transcript-validator-result-title">Unknown: </span>
                        <span className="cl-entity cl-entity--mismatch cl-transcript-validator-result-value">
                            {unknown.length}
                        </span>
                    </div>
                }
                <div className="cl-modal_footer cl-modal-buttons">
                    <div className="cl-modal-buttons_secondary"/>
                    {this.props.importCount === 0 ?
                        <div className="cl-modal-buttons_primary">
                            {invalid.length > 0 &&
                                <OF.DefaultButton
                                    onClick={this.onClickExport}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_SAVE)}
                                    text={Util.formatMessageId(this.props.intl, FM.BUTTON_SAVE)}
                                    iconProps={{ iconName: 'DownloadDocument' }}
                                />
                            }
                            <OF.DefaultButton
                                onClick={this.onCompare}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                iconProps={{ iconName: 'DiffSideBySide' }}
                            />
                            <OF.DefaultButton
                                onClick={this.props.onClose}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                                iconProps={{ iconName: 'Cancel' }}
                            />
                        </div>
                        :
                        <div className="cl-modal-buttons_primary">
                            <OF.DefaultButton
                                onClick={this.props.onClose}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_CANCEL)}
                                iconProps={{ iconName: 'Cancel' }}
                            />
                        </div>
                    }
                </div>
                {this.state.isCompareDialogsOpen &&
                    <CompareDialogsModal
                        app={this.props.app}
                        transcriptValidationResults={invalid}
                        onClose={this.onCloseCompare}
                    />
                }
            </OF.Modal>
        )
    }
}

export interface ReceivedProps {
    app: CLM.AppBase
    importIndex?: number
    importCount?: number
    transcriptValidationResults: CLM.TranscriptValidationResult[]
    onClose: () => void
}

type Props = ReceivedProps & InjectedIntlProps

export default connect<null, null, ReceivedProps>(null, null)(injectIntl(TranscriptValidatorModal))