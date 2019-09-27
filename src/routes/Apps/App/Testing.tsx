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
import * as Test from '../../../types/TestObjects'
import actions from '../../../actions'
import TranscriptRatings from '../../../components/modals/TranscriptRatings'
import FormattedMessageId from '../../../components/FormattedMessageId'
import CompareDialogsModal from '../../../components/modals/CompareDialogsModal'
import RateDialogsModal from '../../../components/modals/RateDialogsModal'
import TranscriptLoader from '../../../components/modals/TranscriptLoader'
import TestWaitModal from '../../../components/modals/ProgressModal'
import TranscriptTestPicker from '../../../components/modals/TranscriptTestPicker'
import { autobind } from 'core-decorators'
import { connect } from 'react-redux'
import { saveAs } from 'file-saver'
import { State, ErrorType } from '../../../types'
import { bindActionCreators } from 'redux'
import { returntypeof } from 'react-redux-typescript'
import { FM } from '../../../react-intl-messages'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import './Testing.css'

const SAVE_SUFFIX = ".cltr"

interface ComponentState {
    testIndex: number
    testTranscripts: BB.Activity[][]
    lgMap: Map<string, CLM.LGItem> | null
    transcriptColumns: IRenderableColumn[]
    validationSet: Test.ValidationSet | undefined
    isTranscriptLoaderOpen: boolean
    compareType: Test.ComparisonResultType | undefined
    compareSource: string | undefined
    isRateDialogsOpen: boolean
    isTestPickerOpen: boolean
    comparePivot: string | undefined, 
    edited: boolean
}

interface SourceRenderData {
    sourceName: string,
    transcriptCount: number,
    reproduced: Test.SourceComparison[]
    changed: Test.SourceComparison[]
    no_transcript: Test.SourceComparison[]
    invalid_transcript: Test.SourceComparison[]
}

interface IRenderableColumn extends OF.IColumn {
    render: (renderResults: SourceRenderData) => JSX.Element | JSX.Element[]
    getSortValue: (renderResults: SourceRenderData) => string
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'source',
            name: Util.formatMessageId(intl, FM.TESTING_TABLE_SOURCE_LABEL),
            fieldName: 'source',
            minWidth: 150,
            maxWidth: 150,
            isResizable: true,
            isSortedDescending: true,
            getSortValue: renderResults => renderResults.sourceName.toLowerCase(),
            render: renderResults => <span data-testid="entities-name" className={OF.FontClassNames.mediumPlus}>{renderResults.sourceName}</span>
        },
        {
            key: 'count',
            name: Util.formatMessageId(intl, FM.TESTING_TABLE_COUNT_LABEL),
            fieldName: 'count',
            minWidth: 180,
            maxWidth: 180,
            isResizable: true,
            getSortValue: renderResults => renderResults.transcriptCount.toString(),
            render: renderResults => {
                return (
                    <span data-testid="entities-type" className={OF.FontClassNames.mediumPlus}>
                        {renderResults.transcriptCount}
                    </span>)
            }
        }
    ]
}

class Testing extends React.Component<Props, ComponentState> {

    private resultfileInput: any

    constructor(props: Props) {
        super(props)
        this.state = {
            testIndex: 0,
            testTranscripts: [],
            transcriptColumns: getColumns(this.props.intl),
            lgMap: null,
            validationSet: undefined,
            isTranscriptLoaderOpen: false,
            compareType: undefined,
            compareSource: undefined,
            isRateDialogsOpen: false,
            isTestPickerOpen: false,
            comparePivot: undefined,
            edited: false
        }
    }

    componentDidUpdate(prevProps: Props, prevState: ComponentState) { 
        // If no compare selected yet, do compare if more than one soucce loaded
        if (this.state.validationSet && this.state.validationSet.sourceNames.length > 1 && !this.state.comparePivot) {
            this.onCompare(this.state.validationSet.sourceNames[0])
        }
    }

    @autobind
    async onSubmitTranscriptLoader(transcriptFiles: File[], lgFiles: File[]): Promise<void> {
        if (transcriptFiles.length > 0) {
            const lgMap = await OBIUtils.lgMapFromLGFiles(lgFiles)
            const validationSet = this.state.validationSet 
                ? new Test.ValidationSet(this.state.validationSet)
                : new Test.ValidationSet({ appId: this.props.app.appId })
            
            await validationSet.addTranscriptFiles(transcriptFiles)

            await Util.setStateAsync(this, {
                validationSet,
                lgMap,
                edited: true
            })

            // Recompare as new transcripts added
            if (this.state.comparePivot) {
                this.onCompare(this.state.comparePivot)
            }
        }
        this.setState({ isTranscriptLoaderOpen: false })
    }

    @autobind
    async onAbandonTranscriptLoader(): Promise<void> {
        this.setState({ isTranscriptLoaderOpen: false })
    }

    @autobind
    onChangeName(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string) {
        const validationSet = new Test.ValidationSet(this.state.validationSet)
        validationSet.fileName = text
        this.setState({
            validationSet: validationSet,
            edited: true
        })
    }

    @autobind
    onCancelTest() {
        this.setState({
            testTranscripts: [],
            lgMap: null
        })
    }

    @autobind
    async testNextTranscript() {

        if (!this.state.testTranscripts || this.state.testTranscripts.length === 0) {
            return
        }

        // Check if I'm done importing files
        if (this.state.testIndex === this.state.testTranscripts.length) {
            this.setState({ 
                testTranscripts: [],
                lgMap: null
            })
            this.onSave()
            return
        }

        // Pop the next file
        const transcript = this.state.testTranscripts[this.state.testIndex]
        this.setState({ testIndex: this.state.testIndex + 1 })

        try {
            await this.onValidateTranscript(transcript, this.props.entities)
        }
        catch (e) {
            const error = e as Error
            this.props.setErrorDisplay(ErrorType.Error, "", error.message, null)
            this.setState({
                testTranscripts: [],
                lgMap: null
            })
        }
    }

    // LARS todo - filename
    async onValidateTranscript(transcript: BB.Activity[], entities: CLM.EntityBase[]): Promise<void> {

        if (transcript.length === 0) {
            throw new Error("Transcript has no rounds")
        }
        if (!transcript[0].channelId) {
            throw new Error("Transcript does not have a channelId")
        }

        // Get transcriptComparison, create new one if doesn't exist
        const validationSet = new Test.ValidationSet(this.state.validationSet)
        const conversationId = validationSet.conversationId(transcript)

        const transcriptValidationTurns: CLM.TranscriptValidationTurn[] = []
        let transcriptValidationTurn: CLM.TranscriptValidationTurn = { inputText: "", actionHashes: [], apiResults: []}
        let invalidTranscript = false
        let apiResults: CLM.FilledEntity[] = []

        // If I have an LG map, substitute in LG text
        if (this.state.lgMap) {
            OBIUtils.substituteLG(transcript, this.state.lgMap)
        }

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
                        const hashText = OBIUtils.hashTextFromActivity(activity, entities, apiResults)
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

        let validationResult: Test.ValidationItem
        if (invalidTranscript) {
            validationResult = { 
                sourceName: this.props.app.appName,
                conversationId,
                logDialogId: null, 
                invalidTranscript: true
            }
        }
        else {
            // LARS: should just return logdialogId
            let larsResult = await ((this.props.fetchTranscriptValidationThunkAsync(this.props.app.appId, this.props.editingPackageId, this.props.user.id, transcriptValidationTurns) as any) as Promise<Test.ValidationItem>)

            if (!larsResult.logDialogId) {
                throw new Error("No log dialog!") //LARS handle gracefully w/o killing test
            }

            // LARS: make return a plain BB.Activity
            const resultTranscript = await OBIUtils.getLogDialogActivities(
                this.props.app.appId, 
                larsResult.logDialogId,
                this.props.user, 
                this.props.actions,
                this.props.entities,
                conversationId,
                this.props.app.appName,
                this.props.fetchLogDialogThunkAsync as any,
                this.props.fetchHistoryThunkAsync as any)

            validationResult = { 
                sourceName: this.props.app.appName,
                conversationId,
                logDialogId: larsResult.logDialogId, 
                transcript: resultTranscript as BB.Activity[]
            }
        }

        // LARS Store the transcript for later comparison
       // transcriptValidationResult.fileName = fileName

        // Need to check that dialog as still open as user may canceled the test
        if (this.state.validationSet) {
            validationSet.addValidationResult(validationResult)
            await Util.setStateAsync(this, { validationSet: validationSet })
        }
        await this.testNextTranscript()
    }

    @autobind
    async onTest(): Promise<void> {
        if (!this.state.validationSet || this.state.validationSet.sourceNames.length === 0) {
            return
        }

        // If there's only one set of transcripts test on it
        if (this.state.validationSet.sourceNames.length === 1) {
            this.startTest(this.state.validationSet.sourceNames[0])
        }
        // Otherwise user must pick,
        else {
            this.setState({
                isTestPickerOpen: true
            })
        }
    }

    async startTest(sourceName: string): Promise<void> {
        if (this.state.validationSet) {
            const testTranscripts = this.state.validationSet.getTranscripts(sourceName)
            await Util.setStateAsync(this, { testTranscripts })
            this.testNextTranscript()
        }
    }

    @autobind
    onAddTranscripts(): void {
        this.setState({
            isTranscriptLoaderOpen: true,
            testIndex: 0
        })
    }

    @autobind
    onView(compareType: Test.ComparisonResultType, compareSource?: string) {
        this.setState({ compareType, compareSource })
    }

    @autobind
    onCloseView() {
        this.setState({ compareType: undefined, compareSource: undefined })
    }

    @autobind
    onOpenRate() {
        this.setState({ isRateDialogsOpen: true })
    }

    @autobind
    async onRate(ratingPair: Test.RatingPair) {
        const validationSet = new Test.ValidationSet(this.state.validationSet)
        validationSet.addRatingResult(ratingPair)
        Util.setStateAsync(this, {validationSet})
    }

    @autobind
    onCloseRate() {
        this.setState({
            isRateDialogsOpen: false,
            edited: true
        })
        // LARS update it
        if (this.state.validationSet) {
            this.state.validationSet.calcRankings()
        }
        this.onSave()
    }

    @autobind
    onPickTest() {
        this.setState({ isTestPickerOpen: true })
    }

    @autobind
    onPickTestAbandon() {
        this.setState({ isTestPickerOpen: false })
    }

    @autobind
    onPickTestSubmit(sourceName: string) {
        this.setState({ isTestPickerOpen: false })
        this.startTest(sourceName)
    }

    @autobind
    async onCompare(comparePivot: string | undefined): Promise<void> {
        if (!this.state.validationSet || this.state.validationSet.sourceNames.length === 0) {
            return
        }

        const validationSet = new Test.ValidationSet(this.state.validationSet)
        validationSet.compareAll()
        this.setState({validationSet, comparePivot})
    }

    @autobind
    async onChangeCompareSource(event: React.FormEvent<HTMLDivElement>, item: OF.IDropdownOption) {
        if (item.text) {
            this.onCompare(item.text)
        }
    }

    @autobind
    onSave() {

        if (!this.state.validationSet || !this.state.validationSet.fileName || this.onGetNameErrorMessage(this.state.validationSet.fileName) !== '') {
            return
        }
        const blob = new Blob([JSON.stringify(this.state.validationSet, Util.mapReplacer)], { type: "text/plain;charset=utf-8" })
        saveAs(blob, `${this.state.validationSet.fileName}${SAVE_SUFFIX}`)
    }

    @autobind
    async onChangeResultFiles(files: any) {

        const fileText = await Util.readFileAsync(files[0])

        try {
            if (typeof fileText !== 'string') {
                throw new Error("String Expected")
            }
            const set = JSON.parse(fileText, Util.mapReviver)// LARS no longer needed
            const validationSet = new Test.ValidationSet(set)
            if (validationSet.items.length === 0) {
                throw new Error("No test results found in file")
            }
            if (validationSet.appId !== this.props.app.appId) {
                throw new Error("Loaded results are from a different Model")
            }
            await Util.setStateAsync(this, {
                validationSet,
                edited: false
            })
        }
        catch (e) {
            const error = e as Error
            this.props.setErrorDisplay(ErrorType.Error, error.message, "Invalid file contents", null)
        }
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

    resultRenderData(): SourceRenderData[] {

        if (!this.state.validationSet) {
            return []
        }
        const renderResults: SourceRenderData[] = []
        for (const sourceName of this.state.validationSet.sourceNames) {

            let items: Test.ValidationItem[] = this.state.validationSet.items
            .filter(i => i.sourceName === sourceName) 

            if (this.state.comparePivot && sourceName !== this.state.comparePivot) {
                const comparisons  = this.state.validationSet.getSourceComparisons(sourceName, this.state.comparePivot)

                const reproduced = comparisons.filter(c => c.result === Test.ComparisonResultType.REPRODUCED)
                const changed = comparisons.filter(c => c.result === Test.ComparisonResultType.CHANGED)
                const no_transcript = comparisons.filter(tr => tr.result === Test.ComparisonResultType.NO_TRANSCRIPT)
                const invalid_transcript = comparisons.filter(tr => tr.result === Test.ComparisonResultType.INVALID_TRANSCRIPT)

                renderResults.push({
                    sourceName: sourceName,
                    transcriptCount: items.length,
                    reproduced,
                    changed,
                    no_transcript,
                    invalid_transcript
                })
            }
            else {
                renderResults.push({
                    sourceName: sourceName,
                    transcriptCount: items.length,
                    reproduced: [],
                    changed: [],
                    no_transcript: [],
                    invalid_transcript: []
                })
            }
        }
        return renderResults
    }

    render() {
        const renderResults = this.resultRenderData()

        const saveDisabled = !this.state.validationSet 
            || this.state.validationSet.items.length === 0
            || !this.state.validationSet.fileName
            || this.onGetNameErrorMessage(this.state.validationSet.fileName) !== ''

        const hasNoTranscript = renderResults.some(rr => rr.no_transcript.length > 0)
        const hasInvalidTranscript = renderResults.some(rr => rr.invalid_transcript.length > 0)

        const numConversations = this.state.validationSet 
            ? this.state.validationSet.numConversations()
            : 0

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
                    className={`${OF.FontClassNames.mediumPlus} ${!this.state.validationSet || this.state.validationSet.items.length === 0 ? ' cl-test-disabled' : ''}`}
                    onChange={this.onChangeName}
                    label={Util.formatMessageId(this.props.intl, FM.TESTING_NAME_LABEL)}
                    onGetErrorMessage={value => this.onGetNameErrorMessage(value)}
                    value={this.state.validationSet ? this.state.validationSet.fileName : ""}
                />
                <div className="cl-modal_footer cl-modal-buttons">
                    <div className="cl-modal-buttons_secondary">
                        <OF.DefaultButton
                            disabled={saveDisabled}
                            onClick={() => this.onSave()}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_SAVE_RESULTS)}
                            text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_SAVE_RESULTS)}
                            iconProps={{ iconName: 'DownloadDocument' }}
                        />
                        <OF.DefaultButton
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_LOAD_RESULTS)}
                            text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_LOAD_RESULTS)}
                            iconProps={{ iconName: 'DownloadDocument' }}
                            onClick={() => this.resultfileInput.click()}
                        />
                    </div>
                </div>
                <div className="cl-testing-body">
                    <input
                        hidden={true}
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(event) => this.onChangeResultFiles(event.target.files)}
                        ref={ele => (this.resultfileInput = ele)}
                        multiple={false}
                    />
                    <div className={OF.FontClassNames.mediumPlus}>
                        Transcripts
                    </div>
                    <div className="cl-testing-trascript-group">
                        {renderResults.length > 0
                        ?
                        <OF.DetailsList
                            className={OF.FontClassNames.mediumPlus}
                            items={renderResults}
                            columns={this.state.transcriptColumns}
                            checkboxVisibility={OF.CheckboxVisibility.hidden}
                            onRenderRow={(props, defaultRender) => <div data-selection-invoke={true}>{defaultRender && defaultRender(props)}</div>}
                            onRenderItemColumn={(rr: SourceRenderData, i, column: IRenderableColumn) =>
                                column.render(rr)}
                        />
                        : "None"
                        }
                        <div className="cl-modal-buttons cl-modal_footer">
                            <div className="cl-modal-buttons_primary">
                                <OF.PrimaryButton
                                //   className="cl-file-picker-button"
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_ADD_TRANSCRIPTS)}
                                    text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_ADD_TRANSCRIPTS)}
                                    iconProps={{ iconName: 'TestCase' }}
                                    onClick={this.onAddTranscripts}
                                />
                                <OF.DefaultButton
                                    disabled={!this.state.validationSet}
                                    onClick={() => this.onView(Test.ComparisonResultType.ALL)}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_SAVE_RESULTS)}
                                    text="View Transcripts" // LARS
                                    iconProps={{ iconName: 'DownloadDocument' }}
                                />
                                <OF.PrimaryButton
                                    disabled={renderResults.length === 0}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_TEST_MODEL)}
                                    text={Util.formatMessageId(this.props.intl, FM.TRANSCRIPT_VALIDATOR_BUTTON_TEST_MODEL)}
                                    iconProps={{ iconName: 'TestCase' }}
                                    onClick={this.onTest}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className={OF.FontClassNames.mediumPlus}>
                            <OF.Dropdown
                                disabled={!this.state.validationSet || this.state.validationSet.sourceNames.length < 2}
                                ariaLabel={"Compare Against"}//LARS
                                label={"Compare Against"}//LARS
                                selectedKey={this.state.validationSet && this.state.comparePivot 
                                    ? this.state.validationSet.sourceNames.indexOf(this.state.comparePivot)
                                    : -1
                                }
                                onChange={this.onChangeCompareSource}
                                placeholder={Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_TAGS_LABEL)}
                                options={this.state.validationSet 
                                    ? this.state.validationSet.sourceNames
                                        .map<OF.IDropdownOption>((tag, i) => ({
                                            key: i,
                                            text: tag
                                        })) 
                                    : []
                                }
                            />
                        </div>
                        <div className={`cl-testing-result-group ${!this.state.validationSet || this.state.validationSet.items.length === 0 ? ' cl-test-disabled' : ''}`}>
                            <div className="cl-testing-result cl-testing-source-title"/>
                            <div className="cl-testing-result">
                                <span className="cl-testing-result-title">Reproduced: </span>
                            </div>
                            <div className="cl-testing-result">
                                <span className="cl-testing-result-title">Changed: </span>
                            </div>
                            {hasNoTranscript &&
                                <div className="cl-testing-result">
                                    <span className="cl-testing-result-title">No Transcript: </span>
                                </div>
                            }
                            {hasInvalidTranscript &&
                                <div className="cl-testing-result">
                                    <span className="cl-testing-result-title">Invalid Transcript: </span>
                                </div>
                            }
                        </div>
                        {this.state.comparePivot && renderResults
                            .filter(rr => this.state.comparePivot && rr.sourceName !== this.state.comparePivot)
                            .map(rr => {
                            return (
                                <div 
                                    className={`cl-testing-result-group ${!this.state.validationSet || this.state.validationSet.items.length === 0 ? ' cl-test-disabled' : ''}`}
                                    key={rr.sourceName}
                                >
                                    <div className="cl-testing-result cl-testing-source-title">
                                        {rr.sourceName}
                                    </div>
                                    <div className="cl-testing-result">
                                        <span className="cl-testing-result-item cl-testing-result-value">
                                            {rr.reproduced.length}
                                        </span>
                                        <span className="cl-testing-result-item cl-testing-result-percent">
                                            {Util.percentOf(rr.reproduced.length, numConversations)}
                                        </span>
                                        <div className="cl-buttons-row cl-testing-result-buttons">
                                            <OF.DefaultButton
                                                disabled={rr.reproduced.length === 0}
                                                onClick={() => this.onView(Test.ComparisonResultType.REPRODUCED, rr.sourceName)}
                                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                                iconProps={{ iconName: 'DiffSideBySide' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="cl-testing-result">
                                        <span className="cl-testing-result-item cl-testing-result-value">
                                            {rr.changed.length}
                                        </span>
                                        <span className="cl-testing-result-item cl-testing-result-percent">
                                            {Util.percentOf(rr.changed.length, numConversations)}
                                        </span>
                                        <div className="cl-buttons-row cl-testing-result-buttons">
                                            <OF.DefaultButton
                                                disabled={rr.changed.length === 0}
                                                onClick={() => this.onView(Test.ComparisonResultType.CHANGED, rr.sourceName)}
                                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                                iconProps={{ iconName: 'DiffSideBySide' }}
                                            />
                                        </div>
                                    </div>
{/*
                                    {rr.numChangedResults > 0 &&
                                        <div className="cl-testing-subresult">
                                            <span className="cl-testing-result-item cl-testing-result-item--match cl-testing-result-subvalue">
                                                {rr.changed_better.length}
                                            </span>
                                            <span className="cl-testing-result-item cl-testing-result-item--match cl-testing-result-subpercent">
                                                {Util.percentOf(rr.changed_better.length, numConversations)}
                                            </span>
                                        </div>
                                    }
                                    {rr.numChangedResults > 0 &&
                                        <div className="cl-testing-subresult">
                                            <span className="cl-testing-result-item cl-testing-result-subvalue">
                                                {rr.changed_same.length}
                                            </span>
                                            <span className="cl-testing-result-item cl-testing-result-subpercent">
                                                {this.percentOf(rr.changed_same.length, numConversations)}
                                            </span>
                                        </div>
                                    }
                                    {rr.numChangedResults > 0 &&
                                        <div className="cl-testing-subresult">
                                            <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-subvalue">
                                                {rr.changed_worse.length}
                                            </span>
                                            <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-subpercent">
                                                {this.percentOf(rr.changed_worse.length, numConversations)}
                                            </span>
                                        </div>
                                    }
                                    {rr.numChangedResults > 0 && rr.changed_notRated > 0 &&
                                        <div className="cl-testing-subresult">
                                            <span className="cl-testing-result-item cl-testing-result-subvalue">
                                                {rr.changed_notRated}
                                            </span>
                                            <span className="cl-testing-result-item cl-testing-result-subpercent">
                                                {this.percentOf(rr.changed_notRated, numConversations)}
                                            </span>
                                        </div>
                                    }
                                    */}
                                    {hasNoTranscript &&
                                        <div className="cl-testing-result">
                                            <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-value">
                                                {rr.no_transcript.length}
                                            </span>
                                            <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-percent">
                                                {Util.percentOf(rr.no_transcript.length, numConversations)}
                                            </span>
                                            <div className="cl-buttons-row cl-testing-result-buttons">
                                                <OF.DefaultButton
                                                    disabled={rr.no_transcript.length === 0 || this.state.testTranscripts.length > 0}
                                                    onClick={() => this.onView(Test.ComparisonResultType.NO_TRANSCRIPT, rr.sourceName)}
                                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                                    text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                                    iconProps={{ iconName: 'DiffSideBySide' }}
                                                />
                                            </div>
                                        </div>
                                    }
                                    {hasInvalidTranscript &&
                                        <div className="cl-testing-result">
                                            <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-value">
                                                {rr.invalid_transcript.length}
                                            </span>
                                            <span className="cl-testing-result-item cl-testing-result-item--mismatch cl-testing-result-percent">
                                                {Util.percentOf(rr.invalid_transcript.length, numConversations)}
                                            </span>
                                            <div className="cl-buttons-row cl-testing-result-buttons">
                                                <OF.DefaultButton
                                                    disabled={rr.invalid_transcript.length === 0}
                                                    onClick={() => this.onView(Test.ComparisonResultType.INVALID_TRANSCRIPT, rr.sourceName)}
                                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                                    text={Util.formatMessageId(this.props.intl, FM.BUTTON_COMPARE)}
                                                    iconProps={{ iconName: 'DiffSideBySide' }}
                                                />
                                            </div>
                                        </div>
                                    }
                                </div>
                            )}
                        )}
                    </div>
                    <div className="cl-testing-body">
                        <TranscriptRatings
                            validationSet={this.state.validationSet}
                        />
                        <div className="cl-modal_footer cl-modal-buttons">
                            <div className="cl-modal-buttons_secondary">
                                <OF.DefaultButton
                                    disabled={saveDisabled}
                                    onClick={() => this.onOpenRate()}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                                    text={Util.formatMessageId(this.props.intl, FM.BUTTON_RATE)}
                                    iconProps={{ iconName: 'DownloadDocument' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <TestWaitModal
                    open={this.state.testTranscripts.length > 0}
                    title={"Testing"}
                    index={this.state.testIndex}
                    total={this.state.testTranscripts.length}
                    onClose={this.onCancelTest}
                />
                {this.state.compareType && this.state.validationSet &&
                    <CompareDialogsModal
                        app={this.props.app}
                        lgMap={this.state.lgMap}
                        validationSet={this.state.validationSet}
                        compareType={this.state.compareType}
                        compareSource={this.state.compareSource}
                        onClose={this.onCloseView}
                    />
                }
                {this.state.isRateDialogsOpen && this.state.validationSet &&
                    <RateDialogsModal
                        app={this.props.app}
                        validationSet={this.state.validationSet}
                        onRate={this.onRate}
                        onClose={this.onCloseRate}
                    />
                }
                {this.state.isTestPickerOpen && this.state.validationSet && 
                    <TranscriptTestPicker
                        sourceNames={this.state.validationSet.sourceNames}
                        onAbandon={this.onPickTestAbandon}
                        onSubmit={this.onPickTestSubmit}
                    />
                }
                {this.state.isTranscriptLoaderOpen &&
                    <TranscriptLoader
                        app={this.props.app}
                        open={true}
                        onAbandon={() => this.onAbandonTranscriptLoader()}
                        onValidateFiles={(transcriptFiles: File[], lgFiles: File[]) => this.onSubmitTranscriptLoader(transcriptFiles, lgFiles)}
                    />
                }
            </div>
        )
    }

    private onGetNameErrorMessage(value: string): string {

        // If not results skip check
        if (this.state && this.state.validationSet && this.state.validationSet.items.length === 0) {
            return ''
        }

        return this.nameErrorCheck(value)
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchHistoryThunkAsync: actions.train.fetchHistoryThunkAsync,
        fetchLogDialogThunkAsync: actions.log.fetchLogDialogThunkAsync,
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
        entities: state.entities,
        actions: state.actions
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