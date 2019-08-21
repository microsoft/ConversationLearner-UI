/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import * as Util from '../../../Utils/util'
import * as BB from 'botbuilder'
import * as OBIUtils from '../../../Utils/obiUtils'
import actions from '../../../actions'
import FormattedMessageId from '../../../components/FormattedMessageId'
import CompareDialogsModal from '../../../components/modals/CompareDialogsModal'
import RateDialogsModal from '../../../components/modals/RateDialogsModal'
import TranscriptValidatorPicker from '../../../components/modals/TranscriptValidatorPicker'
import TestWaitModal from '../../../components/modals/ProgressModal'
import { connect } from 'react-redux'
import { saveAs } from 'file-saver'
import { State, ErrorType } from '../../../types'
import { bindActionCreators } from 'redux'
import { returntypeof } from 'react-redux-typescript'
import { FM } from '../../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './Testing.css'
import { autobind } from 'core-decorators';

const SAVE_SUFFIX = ".cltr"

interface ComponentState {
    transcriptIndex: number
    transcriptFiles: File[]
    lgMap: Map<string, CLM.LGItem> | null
    transcriptValidationSet: CLM.TranscriptValidationSet
    isTranscriptValidatePickerOpen: boolean
    compareDialogs: CLM.TranscriptValidationResult[] | null
    isRateDialogsOpen: boolean
    edited: boolean
}

const initialState: ComponentState = {
    transcriptIndex: 0,
    transcriptFiles: [],
    lgMap: null,
    transcriptValidationSet: { transcriptValidationResults: [] },
    isTranscriptValidatePickerOpen: false,
    compareDialogs: null,
    isRateDialogsOpen: false,
    edited: false
}

class Testing extends React.Component<Props, ComponentState> {
    state = initialState

    private resultfileInput: any

    @autobind
    async onSubmitTranscriptValidationPicker(testName: string, transcriptFiles: File[], lgFiles: File[]): Promise<void> {
        if (transcriptFiles.length > 0) {
            const lgMap = await OBIUtils.lgMapFromLGFiles(lgFiles)
            const emptySet: CLM.TranscriptValidationSet = { transcriptValidationResults: [], appId: this.props.app.appId, fileName: testName }
            await Util.setStateAsync(this, {
                isTranscriptValidatePickerOpen: false,
                transcriptFiles,
                lgMap,
                transcriptValidationSet: emptySet,
                edited: true
            })
            await this.onStartTranscriptValidate()
        }
        else {
            this.setState({ isTranscriptValidatePickerOpen: false })
        }
    }

    @autobind
    async onAbandonTranscriptValidationPicker(): Promise<void> {
        this.setState({ isTranscriptValidatePickerOpen: false })
    }

    @autobind
    onChangeName(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string) {
        const transcriptValidationSet = Util.deepCopy(this.state.transcriptValidationSet)
        transcriptValidationSet.fileName = text
        this.setState({
            transcriptValidationSet,
            edited: true
        })
    }

    @autobind
    onCancelTest() {
        this.setState({
            transcriptFiles: [],
            lgMap: null
        })
    }

    @autobind
    async onStartTranscriptValidate() {

        if (!this.state.transcriptFiles || this.state.transcriptFiles.length === 0) {
            return
        }

        // Check if I'm done importing files
        if (this.state.transcriptIndex === this.state.transcriptFiles.length) {
            this.setState({ 
                transcriptFiles: [],
                lgMap: null
            })
            this.onSave()
            return
        }

        // Pop the next file
        const transcriptFile = this.state.transcriptFiles[this.state.transcriptIndex]
        this.setState({ transcriptIndex: this.state.transcriptIndex + 1 })

        let source = await Util.readFileAsync(transcriptFile)
        try {
            const sourceJson = JSON.parse(source)
            await this.onValidateTranscript(transcriptFile.name, sourceJson, this.props.entities)
        }
        catch (e) {
            const error = e as Error
            this.props.setErrorDisplay(ErrorType.Error, `.transcript file (${transcriptFile.name})`, error.message, null)
            this.setState({
                transcriptFiles: [],
                lgMap: null
            })
        }
    }

    async onValidateTranscript(fileName: string, transcript: BB.Activity[], entities: CLM.EntityBase[]): Promise<void> {

        const transcriptValidationTurns: CLM.TranscriptValidationTurn[] = []
        let transcriptValidationTurn: CLM.TranscriptValidationTurn = { inputText: "", actionHashes: [], apiResults: []}
        let invalidTranscript = false
        let apiResults: CLM.FilledEntity[] = []
        for (let activity of transcript) {
            // TODO: Handle conversation updates
            if (!activity.type || activity.type === "message") {
                if (activity.text === "END_SESSION") {
                    break
                }
                if (activity.from.role === "user") {
                    // If already have user input push it
                    if (transcriptValidationTurn.inputText !== "") {
                        transcriptValidationTurns.push(transcriptValidationTurn)
                    }
                    transcriptValidationTurn = { inputText: activity.text, actionHashes: [], apiResults: []}
                }
                else if (activity.from.role === "bot") {
                    if (transcriptValidationTurn) {
                        const importText = OBIUtils.substituteLG(activity.text, this.state.lgMap)
                        const hashText = OBIUtils.hashTextFromActivity(importText, activity, entities, apiResults)
                        const actionHash = Util.hashText(hashText)
                        transcriptValidationTurn.actionHashes.push(actionHash)

                        // If API call include API results
                        if (activity.channelData && activity.channelData.type === "ActionCall") {
                            const actionCall = activity.channelData as OBIUtils.TranscriptActionCall
                            apiResults = await OBIUtils.importActionOutput(actionCall.actionOutput, this.props.entities, this.props.app)
                            transcriptValidationTurn.apiResults.push(apiResults)
                        }
                        else {
                            transcriptValidationTurn.apiResults.push([])
                        }
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
        // Store the transcript for later comparison
        transcriptValidationResult.sourceHistory = transcript
        transcriptValidationResult.fileName = fileName

        // Need to check that dialog as still open as user may canceled the test
        if (this.state.transcriptValidationSet) {
            const transcriptValidationSet = Util.deepCopy(this.state.transcriptValidationSet)
            transcriptValidationSet.transcriptValidationResults = [...transcriptValidationSet.transcriptValidationResults, transcriptValidationResult]
            await Util.setStateAsync(this, { transcriptValidationSet })
        }
        await this.onStartTranscriptValidate()
    }

    @autobind
    onTest(): void {
        this.setState({
            isTranscriptValidatePickerOpen: true,
            transcriptIndex: 0
        })
    }

    @autobind
    onCompare(results: CLM.TranscriptValidationResult[]) {
        this.setState({ compareDialogs: results })
    }

    @autobind
    onCloseCompare() {
        this.setState({ compareDialogs: null })
    }

    @autobind
    onRate() {
        this.setState({ isRateDialogsOpen: true })
    }

    @autobind
    onCloseRate(transcriptValidationSet: CLM.TranscriptValidationSet) {
        this.setState({
            transcriptValidationSet,
            isRateDialogsOpen: false,
            edited: true
        })
        this.onSave()
    }

    @autobind
    onSave() {

        if (!this.state.transcriptValidationSet.fileName || this.onGetNameErrorMessage(this.state.transcriptValidationSet.fileName) !== '') {
            return
        }
        const blob = new Blob([JSON.stringify(this.state.transcriptValidationSet)], { type: "text/plain;charset=utf-8" })
        saveAs(blob, `${this.state.transcriptValidationSet.fileName}${SAVE_SUFFIX}`)
    }

    @autobind
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
                this.setState({
                    transcriptValidationSet: set,
                    edited: false
                })
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

    @autobind
    nameErrorCheck(value: string): string {
        const MAX_NAME_LENGTH = 30

        if (value.length === 0) {
            return Util.formatMessageId(this.props.intl, FM.FIELDERROR_REQUIREDVALUE)
        }

        if (value.length > MAX_NAME_LENGTH) {
            return Util.formatMessageId(this.props.intl, FM.FIELDERROR_MAX_30)
        }

        if (!/^[a-zA-Z0-9- ()]+$/.test(value)) {
            return Util.formatMessageId(this.props.intl, FM.FIELDERROR_ALPHANUMERIC)
        }
        return ''
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

        const saveDisabled = this.state.transcriptValidationSet.transcriptValidationResults.length === 0
            || !this.state.transcriptValidationSet.fileName
            || this.onGetNameErrorMessage(this.state.transcriptValidationSet.fileName) !== ''

        return (
            <div className="cl-page">
                <span
                    className={`cl-dialog-title cl-dialog-title--import ${OF.FontClassNames.xxLarge}`}
                >
                    <OF.Icon iconName="TestPlan" />
                    <FormattedMessageId id={FM.TRANSCRIPT_VALIDATOR_TITLE} />
                </span>
                <span className={OF.FontClassNames.mediumPlus}>
                    <FormattedMessageId id={FM.TRANSCRIPT_VALIDATOR_SUBTITLE} />
                </span>
                <OF.TextField
                    className={`${OF.FontClassNames.mediumPlus} ${this.state.transcriptValidationSet.transcriptValidationResults.length === 0 ? ' cl-test-disabled' : ''}`}
                    onChange={this.onChangeName}
                    label={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_NAME_LABEL)}
                    onGetErrorMessage={value => this.onGetNameErrorMessage(value)}
                    value={this.state.transcriptValidationSet.fileName}
                />
                <div className="cl-testing-body">
                    <input
                        hidden={true}
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(event) => this.onChangeResultFiles(event.target.files)}
                        ref={ele => (this.resultfileInput = ele)}
                        multiple={false}
                    />
                    <div>
                        <div className={`cl-testing-result-group ${this.state.transcriptValidationSet.transcriptValidationResults.length === 0 ? ' cl-test-disabled' : ''}`}>
                            <div className="cl-testing-result">
                                <span className="cl-testing-result-title">Reproduced: </span>
                                <span className="cl-entity cl-testing-result-value">
                                    {reproduced.length}
                                </span>
                                <span className="cl-entity cl-testing-result-percent">
                                    {this.percentOf(reproduced.length)}
                                </span>
                                <div className="cl-buttons-row cl-testing-result-buttons">
                                    <OF.DefaultButton
                                        disabled={reproduced.length === 0 || this.state.transcriptFiles.length > 0}
                                        onClick={() => this.onCompare(reproduced)}
                                        ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                        text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                        iconProps={{ iconName: 'DiffSideBySide' }}
                                    />
                                </div>
                            </div>
                            <div className="cl-testing-result">
                                <span className="cl-testing-result-title">Changed: </span>
                                <span className="cl-entity cl-testing-result-value">
                                    {changed.length}
                                </span>
                                <span className="cl-entity cl-testing-result-percent">
                                    {this.percentOf(changed.length)}
                                </span>
                                <div className="cl-buttons-row cl-testing-result-buttons">
                                    <OF.DefaultButton
                                        disabled={changed.length === 0 || this.state.transcriptFiles.length > 0}
                                        onClick={() => this.onCompare(changed)}
                                        ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                        text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                        iconProps={{ iconName: 'DiffSideBySide' }}
                                    />
                                    <OF.DefaultButton
                                        disabled={changed.length === 0 || this.state.transcriptFiles.length > 0}
                                        onClick={this.onRate}
                                        ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                                        text={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                                        iconProps={{ iconName: 'Compare' }}
                                    />
                                </div>
                            </div>
                            {numChangedResults > 0 &&
                                <div className="cl-testing-subresult">
                                    <span className="cl-testing-result-subtitle">Better: </span>
                                    <span className="cl-entity cl-entity--match cl-testing-result-subvalue">
                                        {changed_better.length}
                                    </span>
                                    <span className="cl-entity cl-entity--match cl-testing-result-subpercent">
                                        {this.percentOf(changed_better.length)}
                                    </span>
                                </div>
                            }
                            {numChangedResults > 0 &&
                                <div className="cl-testing-subresult">
                                    <span className="cl-testing-result-subtitle">Same: </span>
                                    <span className="cl-entity cl-testing-result-subvalue">
                                        {changed_same.length}
                                    </span>
                                    <span className="cl-entity cl-testing-result-subpercent">
                                        {this.percentOf(changed_same.length)}
                                    </span>
                                </div>
                            }
                            {numChangedResults > 0 &&
                                <div className="cl-testing-subresult">
                                    <span className="cl-testing-result-subtitle">Worse: </span>
                                    <span className="cl-entity cl-entity--mismatch cl-testing-result-subvalue">
                                        {changed_worse.length}
                                    </span>
                                    <span className="cl-entity cl-entity--mismatch cl-testing-result-subpercent">
                                        {this.percentOf(changed_worse.length)}
                                    </span>
                                </div>
                            }
                            {numChangedResults > 0 && changed_notRated > 0 &&
                                <div className="cl-testing-subresult">
                                    <span className="cl-testing-result-subtitle">Not Rated: </span>
                                    <span className="cl-entity cl-testing-result-subvalue">
                                        {changed_notRated}
                                    </span>
                                    <span className="cl-entity cl-testing-result-subpercent">
                                        {this.percentOf(changed_notRated)}
                                    </span>
                                </div>
                            }
                            {invalid.length > 0 &&
                                <div className="cl-testing-result">
                                    <span className="cl-testing-result-title">Invalid File: </span>
                                    <span className="cl-entity cl-entity--mismatch cl-testing-result-value">
                                        {invalid.length}
                                    </span>
                                    <span className="cl-entity cl-entity--mismatch cl-testing-result-percent">
                                        {this.percentOf(invalid.length)}
                                    </span>
                                </div>
                            }
                            {test_failed.length > 0 &&
                                <div className="cl-testing-result">
                                    <span className="cl-testing-result-title">Test Fail: </span>
                                    <span className="cl-entity cl-entity--mismatch cl-testing-result-value">
                                        {test_failed.length}
                                    </span>
                                    <span className="cl-entity cl-entity--mismatch cl-testing-result-percent">
                                        {this.percentOf(test_failed.length)}
                                    </span>
                                    <div className="cl-buttons-row cl-testing-result-buttons">
                                        <OF.DefaultButton
                                            disabled={test_failed.length === 0 || this.state.transcriptFiles.length > 0}
                                            onClick={() => this.onCompare(test_failed)}
                                            ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                            text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                            iconProps={{ iconName: 'DiffSideBySide' }}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="cl-modal_footer">
                    <div className="cl-modal-buttons_secondary" />
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
                            disabled={saveDisabled}
                            onClick={() => this.onSave()}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_SAVE_RESULTS)}
                            text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_SAVE_RESULTS)}
                            iconProps={{ iconName: 'DownloadDocument' }}
                        />
                    </div>
                </div>
                <TestWaitModal
                    open={this.state.transcriptFiles.length > 0}
                    title={"Testing"}
                    index={this.state.transcriptIndex}
                    total={this.state.transcriptFiles.length}
                    onClose={this.onCancelTest}
                />
                {this.state.compareDialogs &&
                    <CompareDialogsModal
                        app={this.props.app}
                        transcriptValidationResults={this.state.compareDialogs}
                        onClose={this.onCloseCompare}
                    />
                }
                {this.state.isRateDialogsOpen &&
                    <RateDialogsModal
                        app={this.props.app}
                        transcriptValidationSet={this.state.transcriptValidationSet}
                        onClose={this.onCloseRate}
                    />
                }
                {this.state.isTranscriptValidatePickerOpen &&
                    <TranscriptValidatorPicker
                        app={this.props.app}
                        open={true}
                        onAbandon={() => this.onAbandonTranscriptValidationPicker()}
                        onValidateFiles={(testName: string, transcriptFiles: File[], lgFiles: File[]) => this.onSubmitTranscriptValidationPicker(testName, transcriptFiles, lgFiles)}
                        onGetNameErrorMessage={this.nameErrorCheck}
                    />
                }
            </div>
        )
    }

    private onGetNameErrorMessage(value: string): string {

        // If not results skip check
        if (this.state && this.state.transcriptValidationSet.transcriptValidationResults.length === 0) {
            return ''
        }

        return this.nameErrorCheck(value)
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchTranscriptValidationThunkAsync: actions.app.fetchTranscriptValidationThunkAsync,
        setErrorDisplay: actions.display.setErrorDisplay
    }, dispatch);
}

const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render TrainDialogs but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        user: state.user.user,
        entities: state.entities
    }
}

export interface ReceivedProps {
    app: CLM.AppBase
    editingPackageId: string
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(Testing))