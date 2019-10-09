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
import TranscriptComparisions from '../../../components/modals/TranscriptComparisons'
import TranscriptList from '../../../components/modals/TranscriptList'
import FormattedMessageId from '../../../components/FormattedMessageId'
import CompareDialogsModal from '../../../components/modals/CompareDialogsModal'
import RateDialogsModal from '../../../components/modals/RateDialogsModal'
import TestWaitModal from '../../../components/modals/ProgressModal'
import TranscriptTestPicker from '../../../components/modals/TranscriptTestPicker'
import ConfirmCancelModal from '../../../components/modals/ConfirmCancelModal'
import { autobind } from 'core-decorators'
import { connect } from 'react-redux'
import { saveAs } from 'file-saver'
import { State, ErrorType } from '../../../types'
import { bindActionCreators } from 'redux'
import { returntypeof } from 'react-redux-typescript'
import { FM } from '../../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './Testing.css'

const SAVE_SUFFIX = ".cltr"

interface ComponentState {
    testIndex: number
    testItems: Test.TestItem[]
    testSet: Test.TestSet | undefined
    viewConversationIds: string[] | undefined
    viewConversationPivot: string | undefined
    isRateDialogsOpen: boolean
    isTestPickerOpen: boolean
    isConfirmClearModalOpen: boolean
    pivotSelection: string | undefined
    isSaveInputOpen: boolean
}

class Testing extends React.Component<Props, ComponentState> {

    private loadSetFileInput: any

    constructor(props: Props) {
        super(props)
        this.state = {
            testIndex: 0,
            testItems: [],
            testSet: undefined,
            viewConversationIds: undefined,
            viewConversationPivot: undefined,
            isRateDialogsOpen: false,
            isTestPickerOpen: false,
            isConfirmClearModalOpen: false,
            pivotSelection: undefined,
            isSaveInputOpen: false
        }
    }

    async onTranscriptsChanged(): Promise<void> {
        if (!this.state.testSet || this.state.testSet.sourceNames.length === 0) {
            return
        }

        const testSet = Test.TestSet.Create(this.state.testSet)
        testSet.compareAll()
        testSet.initRating()
        this.setState({testSet: testSet})
    }

    newTestSet(): Test.TestSet {
        // Generate LGItems for actions with LG refs
        const lgItems: CLM.LGItem[] = this.props.actions
            .filter(a => a.clientData && a.clientData.lgName)
            .map(a => {
                return {
                    lgName: (a.clientData && a.clientData.lgName) ? a.clientData.lgName : "",
                    actionId: a.actionId,
                    text: "",
                    suggestions: []}
                })

            return Test.TestSet.Create({appId: this.props.app.appId, lgItems})
    }
    
    @autobind
    async onLoadTranscriptFiles(transcriptFiles: any): Promise<void> {
        if (transcriptFiles.length > 0) {

            try {
                const testSet = this.state.testSet 
                    ? Test.TestSet.Create(this.state.testSet)
                    : this.newTestSet()
                
                await testSet.addTranscriptFiles(transcriptFiles)

                await Util.setStateAsync(this, {testSet})

                // Recompute comparisons and rankings
                await this.onTranscriptsChanged()
            }
            catch (e) {
                const error = e as Error
                this.props.setErrorDisplay(ErrorType.Error, `invalid .transcript file`, error.message, null)
            }
        }
    }

    @autobind
    async onLoadLGFiles(lgFiles: any): Promise<void> {
        if (lgFiles.length > 0) {

            try {
                const testSet = this.state.testSet 
                    ? Test.TestSet.Create(this.state.testSet)
                    : this.newTestSet()
                
                await testSet.addLGFiles(lgFiles)

                await Util.setStateAsync(this, {testSet})

                // Recompute comparisons and rankings
                await this.onTranscriptsChanged()
            }
            catch (e) {
                const error = e as Error
                this.props.setErrorDisplay(ErrorType.Error, `invalid .lg file`, error.message, null)
            }
        }
    }

    @autobind
    onChangeName(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string) {
        const testSet = Test.TestSet.Create(this.state.testSet)
        testSet.fileName = text
        this.setState({testSet: testSet})
    }

    @autobind
    onCancelTest(): void {
        this.setState({
            testItems: []
        })
    }

    @autobind
    onCompare(): void {
        if (!this.state.testSet || this.state.testSet.sourceNames.length === 0) {
            return
        }

        const testSet = Test.TestSet.Create(this.state.testSet)
        testSet.compareAll()
        this.setState({testSet: testSet})
    }

    @autobind
    async testNextTranscript() {

        if (!this.state.testItems || this.state.testItems.length === 0) {
            return
        }

        // Check if I'm done importing files
        if (this.state.testIndex === this.state.testItems.length) {
            this.setState({ 
                testItems: []
            })
            await this.onTranscriptsChanged()
            this.onSaveSet()
            return
        }

        // Get the next test item
        const testItem = this.state.testItems[this.state.testIndex]
        this.setState({ testIndex: this.state.testIndex + 1 })

        try {
            await this.onValidateTranscript(testItem)
        }
        catch (e) {
            const error = e as Error
            this.props.setErrorDisplay(ErrorType.Error, `Source: ${testItem.sourceName} Conversation: ${testItem.conversationId}`, error.message, null)
            this.setState({
                testItems: []
            })
        }
    }

    async onValidateTranscript(testItem: Test.TestItem): Promise<void> {

        if (!testItem.transcript) {
            throw new Error("Missing transcript")
        }
        // Copy validation set
        const testSet = Test.TestSet.Create(this.state.testSet)
        const conversationId = testItem.conversationId

        const transcriptValidationTurns: CLM.TranscriptValidationTurn[] = []
        let transcriptValidationTurn: CLM.TranscriptValidationTurn = { inputText: "", apiResults: []}
        let invalidTranscript = false
        let apiResults: CLM.FilledEntity[] = []

        for (let activity of testItem.transcript) {
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
                    transcriptValidationTurn = { inputText: activity.text, apiResults: []}
                }
                else if (activity.from.role === "bot") {
                    if (transcriptValidationTurn) {
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

        const sourceName = `${this.props.app.appName} (${testItem.sourceName})`

        let validationResult: Test.TestItem
        if (invalidTranscript) {
            validationResult = { 
                sourceName,
                conversationId,
                logDialogId: null, 
                invalidTranscript: true
            }
        }
        else {
            const logDialogId = await ((this.props.fetchTranscriptValidationThunkAsync(this.props.app.appId, this.props.editingPackageId, this.props.user.id, transcriptValidationTurns) as any) as Promise<string | null>)

            let resultTranscript: BB.Activity[] | undefined
            if (logDialogId) {

                resultTranscript = await OBIUtils.getLogDialogActivities(
                    this.props.app.appId, 
                    logDialogId,
                    this.props.user, 
                    this.props.actions,
                    this.props.entities,
                    conversationId,
                    sourceName,
                    this.props.fetchLogDialogThunkAsync as any,
                    this.props.fetchActivitiesThunkAsync as any) as BB.Activity[]
            }

            // Substitute back in any LG refs
            const transcript = Util.deepCopy(resultTranscript) || []
            OBIUtils.toLG(transcript, testSet.lgItems, this.props.entities, this.props.actions)

            validationResult = { 
                sourceName,
                conversationId,
                logDialogId, 
                transcript
            }
        }

        // Need to check that dialog as still open as user may canceled the test
        if (this.state.testSet) {
            testSet.addTestItem(validationResult)
            await Util.setStateAsync(this, { testSet: testSet })
        }
        await this.testNextTranscript()
    }

    @autobind
    async onTest(): Promise<void> {
        if (!this.state.testSet || this.state.testSet.sourceNames.length === 0) {
            return
        }

        // If there's only one set of transcripts test on it
        if (this.state.testSet.sourceNames.length === 1) {
            await this.startTest(this.state.testSet.sourceNames[0])
        }
        // Otherwise user must pick,
        else {
            this.setState({
                isTestPickerOpen: true
            })
        }
    }

    async startTest(sourceName: string): Promise<void> {
        if (this.state.testSet) {
            const testItems = this.state.testSet.getTestItems(sourceName)
            await Util.setStateAsync(this, { testItems, testIndex: 0 })
            await this.testNextTranscript()
        }
    }

    @autobind
    onView(compareType: Test.ComparisonResultType, comparePivot?: string, compareSource?: string): void {

        if (this.state.testSet) {
            const viewConversationIds = compareSource && comparePivot 
            ? this.state.testSet.getComparisonConversationIds(compareSource, comparePivot, compareType)
            : this.state.testSet.getAllConversationIds()

            this.onViewConversationIds(viewConversationIds, comparePivot)
        }
    }

    @autobind
    onViewConversationIds(viewConversationIds: string[], viewConversationPivot?: string) {
        if (viewConversationIds.length > 0) {
            this.setState({ viewConversationIds, viewConversationPivot })
        }
    }

    @autobind
    onCloseView() {
        this.setState({ viewConversationIds: undefined, viewConversationPivot: undefined })
    }

    @autobind
    onOpenRate() {
        const testSet = Test.TestSet.Create(this.state.testSet)
        // TODO: consider only clearing when .transcripts have changed
        // and allowing user to continue partially rated set of .transcripts
        testSet.initRating()
        this.setState({testSet: testSet, isRateDialogsOpen: true})
    }

    @autobind
    async onRate(ratingPair: Test.RatingPair) {
        const testSet = Test.TestSet.Create(this.state.testSet)
        testSet.addRatingResult(ratingPair)
        await Util.setStateAsync(this, {testSet})
    }

    @autobind
    async onCloseRate() {
        this.setState({
            isRateDialogsOpen: false
        })
        await this.calcRankings()
        this.onSaveSet()
    }

    async calcRankings() {
        if (this.state.testSet) {
            const testSet = Test.TestSet.Create(this.state.testSet)
            testSet.calcRankings()
            await Util.setStateAsync(this, {testSet})
        }
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
    async onPickTestSubmit(sourceName: string) {
        this.setState({ isTestPickerOpen: false })
        await this.startTest(sourceName)
    }

    @autobind
    onClear() {
        this.setState({isConfirmClearModalOpen: true})
    }

    @autobind
    onConfirmClear() {
        const testSet = this.newTestSet()

        // Clear filename so user can reload same file
        let fileInput = (this.loadSetFileInput as HTMLInputElement)
        fileInput.value = ""
        this.setState({testSet: testSet, isConfirmClearModalOpen: false})
    }

    @autobind
    onCancelClear() {
        this.setState({
            isConfirmClearModalOpen: false,
        })
    }

    @autobind
    async onSaveSet() {

        if (!this.state.testSet) {
            return
        }

        // If no name provided default to name of model
        if (!this.state.testSet.fileName) {
            const testSet = Test.TestSet.Create(this.state.testSet)
            // Use app name, removing unsafe characters
            testSet.fileName = this.props.app.appName.replace(/[^a-zA-Z0-9-_\.]/g, '')
            await Util.setStateAsync(this, {testSet})

        }

        if (this.state.testSet.fileName && this.onGetNameErrorMessage(this.state.testSet.fileName) !== '') {
            return
        }

        const blob = this.state.testSet.serialize()
        saveAs(blob, `${this.state.testSet.fileName}${SAVE_SUFFIX}`)
    }

    @autobind
    async onLoadSet(files: any) {

        const fileText = await Util.readFileAsync(files[0])

        try {
            if (typeof fileText !== 'string') {
                throw new Error("String Expected")
            }
            const testSet = Test.TestSet.Deserialize(fileText)

            if (testSet.ratingPairs.length === 0) {
                testSet.compareAll()
                testSet.initRating()
            }
            await Util.setStateAsync(this, {testSet})
        }
        catch (e) {
            const error = e as Error
            this.props.setErrorDisplay(ErrorType.Error, error.message, "Invalid file contents", null)
        }
    }

    @autobind
    nameErrorCheck(value: string): string {
        const MAX_NAME_LENGTH = 30

        // Allow empty name, will populate with Model name on save if empty
        if (value.length === 0) {
            return ''
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

        const saveDisabled = !this.state.testSet 
            || this.state.testSet.items.length === 0
            || (this.state.testSet.fileName !== undefined && this.onGetNameErrorMessage(this.state.testSet.fileName) !== '')

        return (
            <div className="cl-page">
                <span
                    className={`cl-dialog-title cl-dialog-title--import ${OF.FontClassNames.xxLarge}`}
                >
                    <OF.Icon iconName="TestPlan" />
                    <FormattedMessageId id={FM.TESTING_TITLE} />
                </span>
                <span className={OF.FontClassNames.mediumPlus}>
                    <FormattedMessageId id={FM.TESTING_SUBTITLE} />
                </span>
                <OF.TextField
                    className={`${OF.FontClassNames.mediumPlus} ${!this.state.testSet || this.state.testSet.items.length === 0 ? ' cl-test-disabled' : ''}`}
                    onChange={this.onChangeName}
                    label={Util.formatMessageId(this.props.intl, FM.TESTING_NAME_LABEL)}
                    onGetErrorMessage={value => this.onGetNameErrorMessage(value)}
                    value={this.state.testSet ? this.state.testSet.fileName : ""}
                />
                <div className="cl-modal-buttons">
                    <input
                        hidden={true}
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(event) => this.onLoadSet(event.target.files)}
                        ref={ele => (this.loadSetFileInput = ele)}
                        multiple={false}
                    />
                    <div className="cl-modal-buttons_secondary"/>
                    <div className="cl-modal-buttons_primary">
                        <OF.DefaultButton
                            disabled={saveDisabled}
                            onClick={this.onSaveSet}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.TESTING_BUTTON_SAVE_RESULTS)}
                            text={Util.formatMessageId(this.props.intl, FM.TESTING_BUTTON_SAVE_RESULTS)}
                            iconProps={{ iconName: 'CloudDownload' }}
                        />
                        <OF.DefaultButton
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.TESTING_BUTTON_LOAD_RESULTS)}
                            text={Util.formatMessageId(this.props.intl, FM.TESTING_BUTTON_LOAD_RESULTS)}
                            iconProps={{ iconName: 'CloudUpload' }}
                            onClick={() => this.loadSetFileInput.click()}
                        />
                        <OF.DefaultButton
                            className="cl-button-delete"
                            disabled={!this.state.testSet || this.state.testSet.sourceName.length === 0}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.TESTING_BUTTON_CLEAR_RESULTS)}
                            text={Util.formatMessageId(this.props.intl, FM.TESTING_BUTTON_CLEAR_RESULTS)}
                            iconProps={{ iconName: 'RemoveFilter' }}
                            onClick={this.onClear}
                        />
                    </div>
                </div>
            <div className="cl-testing-body">
                    <OF.Pivot 
                        linkSize={OF.PivotLinkSize.large}
                    >
                        <OF.PivotItem
                            linkText={Util.formatMessageId(this.props.intl, FM.TESTING_PIVOT_DATA)}
                        >
                            <TranscriptList
                                testSet={this.state.testSet}
                                onView={this.onView}
                                onLoadTranscriptFiles={this.onLoadTranscriptFiles}
                                onLoadLGFiles={this.onLoadLGFiles}
                                onTest={this.onTest}
                            />
                        </OF.PivotItem>
                        <OF.PivotItem
                            linkText={Util.formatMessageId(this.props.intl, FM.TESTING_PIVOT_COMPARISON)}
                        >
                            <TranscriptComparisions
                                testSet={this.state.testSet}
                                onCompare={this.onCompare}
                                onView={this.onView}
                            />
                        </OF.PivotItem>
                        <OF.PivotItem
                            linkText={Util.formatMessageId(this.props.intl, FM.TESTING_PIVOT_RATING)}
                        >
                            <TranscriptRatings
                                testSet={this.state.testSet}
                                onRate={this.onOpenRate}
                                onView={this.onViewConversationIds}
                            />
                        </OF.PivotItem>
                    </OF.Pivot>
                </div>
                <ConfirmCancelModal
                    open={this.state.isConfirmClearModalOpen}
                    onCancel={this.onCancelClear}
                    onConfirm={this.onConfirmClear}
                    title={Util.formatMessageId(this.props.intl, FM.TESTING_CONFIRM_CLEAR_TITLE)}
                />
                <TestWaitModal
                    open={this.state.testItems.length > 0}
                    title={"Testing"}
                    index={this.state.testIndex}
                    total={this.state.testItems.length}
                    onClose={this.onCancelTest}
                />
                {this.state.viewConversationIds && this.state.testSet && 
                    <CompareDialogsModal
                        app={this.props.app}
                        testSet={this.state.testSet}
                        conversationIds={this.state.viewConversationIds}
                        conversationPivot={this.state.viewConversationPivot}
                        onClose={this.onCloseView}
                    />
                }
                {this.state.isRateDialogsOpen && this.state.testSet &&
                    <RateDialogsModal
                        app={this.props.app}
                        testSet={this.state.testSet}
                        onRate={this.onRate}
                        onClose={this.onCloseRate}
                    />
                }
                {this.state.isTestPickerOpen && this.state.testSet && 
                    <TranscriptTestPicker
                        sourceNames={this.state.testSet.sourceNames}
                        onAbandon={this.onPickTestAbandon}
                        onSubmit={this.onPickTestSubmit}
                    />
                }
            </div>
        )
    }

    private onGetNameErrorMessage(value: string): string {

        // If not results skip check
        if (this.state && this.state.testSet && this.state.testSet.items.length === 0) {
            return ''
        }

        return this.nameErrorCheck(value)
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchActivitiesThunkAsync: actions.train.fetchActivitiesThunkAsync,
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