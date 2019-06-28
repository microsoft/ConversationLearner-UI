/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import { connect } from 'react-redux'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, } from 'react-intl'
import './TranscriptValidatorModal.css'

interface ComponentState {
    userInputVal: string
}

class TranscriptValidatorModal extends React.Component<Props, ComponentState> {

    render() {
        const valid = this.props.transcriptValidationResults.filter(tr => tr.validity === CLM.Validity.VALID).length
        const invalid = this.props.transcriptValidationResults.filter(tr => tr.validity === CLM.Validity.INVALID).length
        const unknown = this.props.transcriptValidationResults.filter(tr => tr.validity === CLM.Validity.UNKNOWN).length
        const warning = this.props.transcriptValidationResults.filter(tr => tr.validity === CLM.Validity.WARNING).length

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
                        Passed: 
                        <span className="cl-entity cl-entity--match">
                            {valid}
                        </span>
                    </div>
                    <div className="cl-transcript-validator-result">
                        Failed: 
                        <span className="cl-entity cl-entity--mismatch">
                            {invalid}
                        </span>
                    </div>
                    {warning > 0 &&
                        <div className="cl-transcript-validator-result">
                            Invalid Transcript: 
                            <span className="cl-entity cl-entity--mismatch">
                                {warning}
                            </span>
                        </div>
                    }
                    {unknown > 0 &&
                        <div className="cl-transcript-validator-result">
                            Unknown: 
                            <span className="cl-entity cl-entity--mismatch">
                                {unknown}
                            </span>
                        </div>
                    }
                    <div className="cl-modal_footer cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary"/>
                        <div className="cl-modal-buttons_primary">
                            <OF.DefaultButton
                                    data-testid="action-creator-cancel-button"
                                    onClick={this.props.onClose}
                                    ariaDescription={this.props.importCount === 0
                                        ? Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)
                                        : Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)
                                    }
                                    text={this.props.importCount === 0
                                        ? Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)
                                        : Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)
                                    }
                                    iconProps={{ iconName: 'Close' }}
                            />
                        </div>
                    </div>
            </OF.Modal>
        )
    }
}

export interface ReceivedProps {
    importIndex?: number
    importCount?: number
    transcriptValidationResults: CLM.TranscriptValidationResult[]
    onClose: () => void
}

type Props = ReceivedProps & InjectedIntlProps

export default connect<null, null, ReceivedProps>(null, null)(injectIntl(TranscriptValidatorModal))