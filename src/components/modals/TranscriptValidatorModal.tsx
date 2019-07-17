/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import UserInputModal from './UserInputModal'
import CompareDialogsModal from '../modals/CompareDialogsModal'
import RateDialogsModal from '../modals/RateDialogsModal'
import { saveAs } from 'file-saver'
import { connect } from 'react-redux'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, } from 'react-intl'
import './TranscriptValidatorModal.css'

interface ComponentState {
    isCompareDialogsOpen: boolean
    isRateDialogsOpen: boolean
    isGetSaveNameOpen: boolean
    setToSave: CLM.TranscriptValidationSet | null
}

const initialState: ComponentState = {
    isCompareDialogsOpen: false,
    isRateDialogsOpen: false,
    isGetSaveNameOpen: false,
    setToSave: null
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

    @OF.autobind
    onRate() {
        this.setState({isRateDialogsOpen: true})
    }

    @OF.autobind
    onSave(set: CLM.TranscriptValidationSet) {
        this.setState({
            isRateDialogsOpen: false,
            isGetSaveNameOpen: true,
            setToSave: set
        })
    }

    //--- SAVE ------
    @OF.autobind
    onCancelSave() {
        
    }

    onConfirmSave(name: string) {
        if (this.state.setToSave) {
            const set = Util.deepCopy(this.state.setToSave)
            set.fileName = name
            const blob = new Blob([JSON.stringify(this.props.transcriptValidationSet)], { type: "text/plain;charset=utf-8" })
            saveAs(blob, `${set.fileName}.cltr`);
            this.props.onUpdate(set)
        }
        this.setState({
            isGetSaveNameOpen: false,
            setToSave: null
        })
    }

    percentOf(count: number): string {
        if (this.props.transcriptValidationSet.transcriptValidationResults.length === 0) {
            return "-"
        }
        return `${(count / this.props.transcriptValidationSet.transcriptValidationResults.length * 100).toFixed(1)}%`
    }

    render() {
        const results = this.props.transcriptValidationSet.transcriptValidationResults
        const reproduced = results.filter(tr => tr.validity === CLM.Validity.VALID)
        const changed = results.filter(tr => tr.validity === CLM.Validity.INVALID)
        const changed_better = changed.filter(tr => tr.rating === CLM.Rating.BETTER)
        const changed_worse = changed.filter(tr => tr.rating === CLM.Rating.WORSE)
        const changed_same = changed.filter(tr => tr.rating === CLM.Rating.SAME)
        const invalid = results.filter(tr => tr.validity === CLM.Validity.UNKNOWN)
        const warning = results.filter(tr => tr.validity === CLM.Validity.WARNING)

        const numChangedResults = changed_better.length + changed_same.length + changed_worse.length
        const changed_notRated = changed.length - numChangedResults

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
                        ? this.props.transcriptValidationSet.fileName || "Testing Complete"
                        : `Testing ${this.props.importIndex} of ${this.props.importCount}...`
                    }
                </div>
                <div className="cl-transcript-validator-result">
                    <span className="cl-transcript-validator-result-title">Reproduced: </span>
                    <span className="cl-entity cl-transcript-validator-result-value">
                        {reproduced.length}
                    </span>
                    <span className="cl-entity cl-transcript-validator-result-percent">
                        {this.percentOf(reproduced.length)}
                    </span>
                </div>
                <div className="cl-transcript-validator-result">
                    <span className="cl-transcript-validator-result-title">Changed: </span>
                    <span className="cl-entity cl-transcript-validator-result-value">
                        {changed.length}
                    </span>
                    <span className="cl-entity cl-transcript-validator-result-percent">
                        {this.percentOf(changed.length)}
                    </span>
                </div>
                {numChangedResults > 0 && 
                    <div className="cl-transcript-validator-subresult">
                        <span className="cl-transcript-validator-result-subtitle">Better: </span>
                        <span className="cl-entity cl-entity--match cl-transcript-validator-result-subvalue">
                            {changed_better.length}
                        </span>
                        <span className="cl-entity cl-entity--match cl-transcript-validator-result-subpercent">
                            {this.percentOf(changed_better.length)}
                        </span>
                    </div>
                }
                {numChangedResults > 0 && 
                    <div className="cl-transcript-validator-subresult">
                        <span className="cl-transcript-validator-result-subtitle">Same: </span>
                        <span className="cl-entity cl-transcript-validator-result-subvalue">
                            {changed_same.length}
                        </span>
                        <span className="cl-entity cl-transcript-validator-result-subpercent">
                            {this.percentOf(changed_same.length)}
                        </span>
                    </div>
                }
                {numChangedResults > 0 && 
                    <div className="cl-transcript-validator-subresult">
                        <span className="cl-transcript-validator-result-subtitle">Worse: </span>
                        <span className="cl-entity cl-entity--mismatch cl-transcript-validator-result-subvalue">
                            {changed_worse.length}
                        </span>
                        <span className="cl-entity cl-entity--mismatch cl-transcript-validator-result-subpercent">
                            {this.percentOf(changed_worse.length)}
                        </span>
                    </div>
                }
                {numChangedResults > 0 && changed_notRated > 0 &&
                    <div className="cl-transcript-validator-subresult">
                        <span className="cl-transcript-validator-result-subtitle">Not Rated: </span>
                        <span className="cl-entity cl-transcript-validator-result-subvalue">
                            {changed_notRated}
                        </span>
                        <span className="cl-entity cl-transcript-validator-result-subpercent">
                            {this.percentOf(changed_notRated)}
                        </span>
                    </div>
                }
                {warning.length > 0 &&
                    <div className="cl-transcript-validator-result">
                        <span className="cl-transcript-validator-result-title">Invalid: </span> 
                        <span className="cl-entity cl-entity--mismatch cl-transcript-validator-result-value">
                            {warning.length}
                        </span>
                        <span className="cl-entity cl-entity--match cl-transcript-validator-result-percent">
                            {this.percentOf(warning.length)}
                        </span>
                    </div>
                }
                {invalid.length > 0 &&
                    <div className="cl-transcript-validator-result">
                        <span className="cl-transcript-validator-result-title">Unknown: </span>
                        <span className="cl-entity cl-entity--mismatch cl-transcript-validator-result-value">
                            {invalid.length}
                        </span>
                        <span className="cl-entity cl-entity--match cl-transcript-validator-result-percent">
                            {this.percentOf(invalid.length)}
                        </span>
                    </div>
                }
                <div className="cl-modal_footer cl-modal-buttons">
                    <div className="cl-modal-buttons_secondary"/>
                    {this.props.importCount === 0 ?
                        <div className="cl-modal-buttons_primary">
                            <OF.DefaultButton
                                onClick={() => this.onSave(this.props.transcriptValidationSet)}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_SAVE)}
                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_SAVE)}
                                iconProps={{ iconName: 'DownloadDocument' }}
                            />
                            <OF.DefaultButton
                                onClick={this.onCompare}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                iconProps={{ iconName: 'DiffSideBySide' }}
                            />
                            <OF.DefaultButton
                                onClick={this.onRate}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                                iconProps={{ iconName: 'Compare' }}
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
                        transcriptValidationResults={changed}
                        onClose={this.onCloseCompare}
                    />
                }
                {this.state.isRateDialogsOpen &&
                    <RateDialogsModal
                        app={this.props.app}
                        transcriptValidationSet={this.props.transcriptValidationSet}
                        onClose={this.onSave}
                    />
                }
                {this.state.isGetSaveNameOpen &&
                    <UserInputModal
                        titleFM={FM.USERINPUT_ADD_TITLE}
                        open={this.state.isGetSaveNameOpen}
                        onCancel={this.onCancelSave}
                        onSubmit={this.onConfirmSave}
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
    transcriptValidationSet: CLM.TranscriptValidationSet
    onUpdate: (set: CLM.TranscriptValidationSet) => void
    onClose: () => void
}

type Props = ReceivedProps & InjectedIntlProps

export default connect<{}, {}, ReceivedProps>(null)(injectIntl(TranscriptValidatorModal))