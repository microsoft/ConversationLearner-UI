/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import * as BB from 'botbuilder'
import actions from '../../actions'
import UserInputModal from './UserInputModal'
import CompareDialogsModal from '../modals/CompareDialogsModal'
import RateDialogsModal from '../modals/RateDialogsModal'
import TranscriptValidatorPicker from '../modals/TranscriptValidatorPicker'
import { State, ErrorType } from '../../types'
import { saveAs } from 'file-saver'
import { connect } from 'react-redux'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, } from 'react-intl'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import './TranscriptValidatorModal.css'

const SAVE_SUFFIX = ".cltr"

interface ComponentState {
    transcriptIndex: number
    transcriptFiles: File[]
    transcriptValidationSet: CLM.TranscriptValidationSet
    isTranscriptValidatePickerOpen: boolean
    isCompareDialogsOpen: boolean
    isRateDialogsOpen: boolean
    isGetSaveNameOpen: boolean
    setToSave: CLM.TranscriptValidationSet | null
}

const initialState: ComponentState = {
    transcriptIndex: 0,
    transcriptFiles: [],
    transcriptValidationSet: {transcriptValidationResults: []},
    isTranscriptValidatePickerOpen: false,
    isCompareDialogsOpen: false,
    isRateDialogsOpen: false,
    isGetSaveNameOpen: false,
    setToSave: null
}

class TranscriptValidatorModal extends React.Component<Props, ComponentState> {
    state = initialState

    private resultfileInput: any

    @OF.autobind
    async onCloseTranscriptValidationPicker(transcriptsToValidate: File[] | null, transcriptValidationSet: CLM.TranscriptValidationSet | null): Promise<void> {
        if (transcriptsToValidate && transcriptsToValidate.length > 0) {
            const emptySet: CLM.TranscriptValidationSet = { transcriptValidationResults: [], appId: this.props.app.appId }
            await Util.setStateAsync(this, {
                isTranscriptValidatePickerOpen: false,
                transcriptFiles: transcriptsToValidate,
                transcriptValidationSet: emptySet
            })
            await this.onStartTranscriptValidate()
        }
        else if (transcriptValidationSet && transcriptValidationSet.transcriptValidationResults.length > 0) {
            await Util.setStateAsync(this, {
                isTranscriptValidatePickerOpen: false,
                isTranscriptTestWaitOpen: true,
                transcriptFiles: null,
                transcriptValidationSet
            })
        }
        else {
            this.setState({isTranscriptValidatePickerOpen: false})
        }
    }

    readFileAsync(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
        
            reader.onload = (e: Event) => {
                resolve(reader.result as any);
            }
        
            reader.onerror = reject;
            reader.readAsText(file);
        })
    }

    @OF.autobind
    async onStartTranscriptValidate() {

        if (!this.state.transcriptFiles || this.state.transcriptFiles.length === 0) {
            return
        }

        // Check if I'm done importing files
        if (this.state.transcriptIndex === this.state.transcriptFiles.length) {
            this.setState({transcriptFiles: []})
            return
        }

        // Pop the next file
        const transcriptFile = this.state.transcriptFiles[this.state.transcriptIndex]
        this.setState({transcriptIndex: this.state.transcriptIndex + 1})

        let source = await this.readFileAsync(transcriptFile)
        try {
            const sourceJson = JSON.parse(source)
            await this.onValidateTranscript(transcriptFile.name, sourceJson)
        }
        catch (e) {
            const error = e as Error
            this.props.setErrorDisplay(ErrorType.Error, `.transcript file (${transcriptFile.name})`, error.message, null)
            this.setState({
                transcriptFiles: []
            })
        }
    }

    async onValidateTranscript(fileName: string, transcript: BB.Activity[]): Promise<void> {

        const transcriptValidationTurns: CLM.TranscriptValidationTurn[] = []
        let transcriptValidationTurn: CLM.TranscriptValidationTurn = { inputText: "", actionHashes: []}
        let invalidTranscript = false
        for (let activity of transcript) {
            // TODO: Handle conversation updates
            if (!activity.type || activity.type === "message") {
                if (activity.from.role === "user") {
                    // If already have user input push it
                    if (transcriptValidationTurn.inputText !== "") {
                        transcriptValidationTurns.push(transcriptValidationTurn)
                    }
                    transcriptValidationTurn = { inputText: activity.text, actionHashes: []}
                }
                else if (activity.from.role === "bot") {
                    if (transcriptValidationTurn) {
                        const actionHash = Util.hashText(activity.text)
                        transcriptValidationTurn.actionHashes.push(actionHash)
                    }
                    else {
                        invalidTranscript = true
                        break
                    }
                }
            }
        }
        // Add last turn
        if (transcriptValidationTurn) {
            transcriptValidationTurns.push(transcriptValidationTurn)
        }

        let transcriptValidationResult: CLM.TranscriptValidationResult
        if (invalidTranscript) {
            transcriptValidationResult = { validity: CLM.TranscriptValidationResultType.INVALID_TRANSCRIPT, logDialogId: null, rating: CLM.TranscriptRating.UNKNOWN }
        }
        else {
            transcriptValidationResult = await ((this.props.fetchTranscriptValidationThunkAsync(this.props.app.appId, this.props.editingPackageId, this.props.user.id, transcriptValidationTurns) as any) as Promise<CLM.TranscriptValidationResult>)
        }
        // If invalid, store the transcript for later comparison
        if (transcriptValidationResult.validity === CLM.TranscriptValidationResultType.CHANGED) {
            transcriptValidationResult.sourceHistory = transcript
            transcriptValidationResult.fileName = fileName
        }
        // Need to check that dialog as still open as user may canceled the test
        if (this.state.transcriptValidationSet) {
            const transcriptValidationSet = Util.deepCopy(this.state.transcriptValidationSet)
            transcriptValidationSet.transcriptValidationResults = [...transcriptValidationSet.transcriptValidationResults, transcriptValidationResult]
            await Util.setStateAsync(this, {transcriptValidationSet})
        }
        await this.onStartTranscriptValidate()
    }

    @OF.autobind
    onTest(): void {
        this.setState({
            isTranscriptValidatePickerOpen: true,
            transcriptIndex: 0
        })
    }

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
    onSave(set: CLM.TranscriptValidationSet | null) {
        this.setState({
            isRateDialogsOpen: false,
            isGetSaveNameOpen: true,
            setToSave: set
        })
    }

    //--- SAVE ------
    @OF.autobind
    onCancelSave() {
        this.setState({
            isGetSaveNameOpen: false,
            setToSave: null
        })
    }

    @OF.autobind
    onConfirmSave(name: string) {
        this.setState({
            isGetSaveNameOpen: false,
            setToSave: null
        })

        if (this.state.setToSave) {
            const set = Util.deepCopy(this.state.setToSave)
            set.fileName = `${name}${SAVE_SUFFIX}`
            const blob = new Blob([JSON.stringify(this.state.setToSave)], { type: "text/plain;charset=utf-8" })
            saveAs(blob, set.fileName)
            this.setState({transcriptValidationSet: set})
        }
    }

    @OF.autobind
    onChangeResultFiles(files: any) { 
        const reader = new FileReader()
        reader.onload = (e: Event) => {
            try {
                if (typeof reader.result !== 'string') {
                    throw new Error("String Expected")
                }
                const set = JSON.parse(reader.result) as CLM.TranscriptValidationSet
                if (!set || set.transcriptValidationResults.length === 0 || !set.transcriptValidationResults[0].validity) {
                    throw new Error("No test results found in file")
                }
                if (set.appId !== this.props.app.appId) {
                    throw new Error("Loaded results are from a different Model")
                }
                set.fileName = files[0].name
                this.setState({transcriptValidationSet: set})
            }
            catch (e) {
                const error = e as Error
                this.props.setErrorDisplay(ErrorType.Error, error.message, "Invalid file contents", null)
            }
        }
        if (files[0]) {
            reader.readAsText(files[0])
        }
    }

    percentOf(count: number): string {
        if (this.state.transcriptValidationSet.transcriptValidationResults.length === 0) {
            return "-"
        }
        return `${(count / this.state.transcriptValidationSet.transcriptValidationResults.length * 100).toFixed(1)}%`
    }

    render() {
        const results = this.state.transcriptValidationSet.transcriptValidationResults
        const reproduced = results.filter(tr => tr.validity === CLM.TranscriptValidationResultType.REPRODUCED)
        const changed = results.filter(tr => tr.validity === CLM.TranscriptValidationResultType.CHANGED)
        const changed_better = changed.filter(tr => tr.rating === CLM.TranscriptRating.BETTER)
        const changed_worse = changed.filter(tr => tr.rating === CLM.TranscriptRating.WORSE)
        const changed_same = changed.filter(tr => tr.rating === CLM.TranscriptRating.SAME)
        const test_failed = results.filter(tr => tr.validity === CLM.TranscriptValidationResultType.TEST_FAILED)
        const invalid = results.filter(tr => tr.validity === CLM.TranscriptValidationResultType.INVALID_TRANSCRIPT)

        const numChangedResults = changed_better.length + changed_same.length + changed_worse.length
        const changed_notRated = changed.length - numChangedResults

        let title = ".transcript Testing"
        if (this.state.transcriptValidationSet.transcriptValidationResults.length > 0 && this.state.transcriptFiles.length === 0) {
            title = this.state.transcriptValidationSet.fileName || "Testing Complete"
        }
        else if (this.state.transcriptFiles.length > 0) {
            title = `Testing ${this.state.transcriptIndex} of ${this.state.transcriptFiles.length}...`
        }

        return (
            <div>
                {!this.state.isCompareDialogsOpen && !this.state.isRateDialogsOpen && !this.state.isGetSaveNameOpen && !this.state.isTranscriptValidatePickerOpen &&
                    <OF.Modal
                        isOpen={true}
                        isBlocking={true}
                        containerClassName='cl-modal cl-modal--medium'
                    >
                        <div className="cl-modal_header">
                            <div className={`cl-dialog-title cl-dialog-title--import ${OF.FontClassNames.xxLarge}`}>
                                <OF.Icon
                                    iconName='TestPlan'
                                />
                                {title}
                            </div>
                        </div>
                        <div className="cl-modal_body cl-transcript-validator-body">
                            <input
                                hidden={true}
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(event) => this.onChangeResultFiles(event.target.files)}
                                ref={ele => (this.resultfileInput = ele)}
                                multiple={false}
                            />
                            {this.state.transcriptValidationSet.transcriptValidationResults.length > 0 &&
                                <div>
                                    <div className="cl-transcript-validator-result-group">
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
                                        {invalid.length > 0 &&
                                            <div className="cl-transcript-validator-result">
                                                <span className="cl-transcript-validator-result-title">Invalid File: </span> 
                                                <span className="cl-entity cl-entity--mismatch cl-transcript-validator-result-value">
                                                    {invalid.length}
                                                </span>
                                                <span className="cl-entity cl-entity--mismatch cl-transcript-validator-result-percent">
                                                    {this.percentOf(invalid.length)}
                                                </span>
                                            </div>
                                        }
                                        {test_failed.length > 0 &&
                                            <div className="cl-transcript-validator-result">
                                                <span className="cl-transcript-validator-result-title">Test Fail: </span>
                                                <span className="cl-entity cl-entity--mismatch cl-transcript-validator-result-value">
                                                    {test_failed.length}
                                                </span>
                                                <span className="cl-entity cl-entity--mismatch cl-transcript-validator-result-percent">
                                                    {this.percentOf(test_failed.length)}
                                                </span>
                                            </div>
                                        }
                                    </div>
                                    <div className="cl-buttons-row">
                                        <OF.DefaultButton
                                            disabled={changed.length === 0}
                                            onClick={this.onCompare}
                                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                            iconProps={{ iconName: 'DiffSideBySide' }}
                                        />
                                        <OF.DefaultButton
                                            disabled={changed.length === 0}
                                            onClick={this.onRate}
                                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                                            iconProps={{ iconName: 'Compare' }}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="cl-modal_footer cl-modal-buttons">
                            <div className="cl-modal-buttons_secondary"/>
                            {this.state.transcriptFiles.length === 0 
                                ?
                                <div className="cl-modal-buttons_primary">
                                    <OF.PrimaryButton
                                        className="cl-file-picker-button"
                                        ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_NEW_TEST)} 
                                        text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_NEW_TEST)} 
                                        iconProps={{ iconName: 'TestCase' }}
                                        onClick={this.onTest}
                                    />
                                    <OF.DefaultButton
                                        className="cl-file-picker-button"
                                        ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_LOAD_RESULTS)} 
                                        text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_LOAD_RESULTS)} 
                                        iconProps={{ iconName: 'DownloadDocument' }}
                                        onClick={() => this.resultfileInput.click()}
                                    />
                                    <OF.DefaultButton
                                        disabled={this.state.transcriptValidationSet.transcriptValidationResults.length === 0}
                                        onClick={() => this.onSave(this.state.transcriptValidationSet)}
                                        ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_SAVE_RESULTS)}
                                        text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_SAVE_RESULTS)}
                                        iconProps={{ iconName: 'DownloadDocument' }}
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
                    </OF.Modal>
                }
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
                        transcriptValidationSet={this.state.transcriptValidationSet}
                        onClose={this.onSave}
                    />
                }
                {this.state.isGetSaveNameOpen &&
                    <UserInputModal
                        titleFM={FM.TRANSCRIPT_VALIDATOR_FILESAVE}
                        placeholderFM={FM.TRANSCRIPT_VALIDATOR_FILESAVE_PLACEHOLDER}
                        submitButtonFM={FM.BUTTON_SAVE}
                        initialInput={this.state.transcriptValidationSet.fileName ?
                            this.state.transcriptValidationSet.fileName.replace(SAVE_SUFFIX, "") : undefined}
                        open={this.state.isGetSaveNameOpen}
                        onCancel={this.onCancelSave}
                        onSubmit={this.onConfirmSave}
                    />
                }
                {this.state.isTranscriptValidatePickerOpen && 
                    <TranscriptValidatorPicker
                        app={this.props.app}
                        open={true}
                        onAbandon={() => this.onCloseTranscriptValidationPicker(null, null)}
                        onValidateFiles={(files: File[]) => this.onCloseTranscriptValidationPicker(files, null)}
                        onViewResults={(set: CLM.TranscriptValidationSet) => this.onCloseTranscriptValidationPicker(null, set)}
                    />
                }
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchTranscriptValidationThunkAsync: actions.app.fetchTranscriptValidationThunkAsync,
        setErrorDisplay: actions.display.setErrorDisplay,
    }, dispatch);
}

const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render TrainDialogs but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        user: state.user.user,
    }
}

export interface ReceivedProps {
    app: CLM.AppBase
    editingPackageId: string
    onClose: () => void
}

const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = ReceivedProps & InjectedIntlProps & typeof dispatchProps & typeof stateProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TranscriptValidatorModal))