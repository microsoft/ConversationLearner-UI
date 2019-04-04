/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as Util from '../../../Utils/util'
import * as DialogUtils from '../../../Utils/dialogUtils'
import * as OF from 'office-ui-fabric-react'
import * as moment from 'moment'
import FormattedMessageId from '../../../components/FormattedMessageId'
import actions from '../../../actions'
import produce from 'immer'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../../types'
import { SelectionType } from '../../../types/const'
import { ChatSessionModal, EditDialogModal, TeachSessionModal, EditDialogType, EditState, MergeModal } from '../../../components/modals'
import { ConflictPair } from '../../../components/modals/LogConversionConflictModal'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../../react-intl-messages'
import { Activity } from 'botframework-directlinejs'
import { EditHandlerArgs, cleanTrainDialog } from './TrainDialogs'
import { TeachSessionState } from '../../../types/StateTypes'
import { EntityLabelConflictError } from '../../../types/errors'

interface IRenderableColumn extends OF.IColumn {
    render: (x: CLM.LogDialog, component: LogDialogs) => React.ReactNode
    getSortValue: (logDialog: CLM.LogDialog, component: LogDialogs) => string
}

const returnStringWhenError = (s: string) => {
    return (f: Function) => {
        try {
            return f()
        }
        catch (err) {
            return s
        }
    }
}

const returnErrorStringWhenError = returnStringWhenError("ERR")

function getTagName(logDialog: CLM.LogDialog, component: LogDialogs): string {
    // Only show tag column on Master branch it's the only one containing multiple tag types
    if (component.props.editingPackageId !== component.props.app.devPackageId) {
        return ''
    }
    let tagName = `UNKNOWN`; // Cover bug case of missing package
    if (logDialog.packageId === component.props.app.devPackageId) {
        tagName = 'Master'
    }
    else {
        const packageVersion = component.props.app.packageVersions.find((pv: any) => pv.packageId === logDialog.packageId);
        if (packageVersion) {
            tagName = packageVersion.packageVersion;
        }
    }
    return tagName;
}

function getFirstInput(logDialog: CLM.LogDialog): string | void {
    if (logDialog.rounds && logDialog.rounds.length > 0) {
        return logDialog.rounds[0].extractorStep.text
    }
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'version',
            name: Util.formatMessageId(intl, FM.LOGDIALOGS_MODEL_VERSION),
            fieldName: 'version',
            minWidth: 80,
            maxWidth: 120,
            isResizable: true,
            render: (logDialog, component) => {
                const tagName = getTagName(logDialog, component);
                return <span className={OF.FontClassNames.mediumPlus}>{tagName}</span>;
            },
            getSortValue: (logDialog, component) => {
                const tagName = getTagName(logDialog, component)
                return tagName ? tagName.toLowerCase() : ''
            }
        },
        {
            key: `description`,
            name: Util.formatMessageId(intl, FM.LOGDIALOGS_USERINPUT),
            fieldName: `description`,
            minWidth: 100,
            maxWidth: 1500,
            isResizable: true,
            render: (trainDialog, component) => {

                return <>
                    <span className={OF.FontClassNames.mediumPlus} data-testid="log-dialogs-first-input">
                        <span data-testid="train-dialogs-description">
                            {DialogUtils.dialogSampleInput(trainDialog)}
                        </span>
                    </span>
                </>
            },
            getSortValue: logDialog => {
                const firstInput = getFirstInput(logDialog)
                return firstInput ? firstInput.toLowerCase() : ''
            }
        },
        {
            key: 'turns',
            name: Util.formatMessageId(intl, FM.LOGDIALOGS_TURNS),
            fieldName: 'dialog',
            minWidth: 50,
            maxWidth: 50,
            isResizable: false,
            render: logDialog => <span className={OF.FontClassNames.mediumPlus}>{logDialog.rounds.length}</span>,
            getSortValue: logDialog => logDialog.rounds.length.toString().padStart(4, '0')
        },
        {
            key: 'created',
            name: Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATED_DATE_TIME),
            fieldName: 'created',
            minWidth: 100,
            isResizable: false,
            isSortedDescending: false,
            render: logDialog => <span className={OF.FontClassNames.mediumPlus}>{Util.earlierDateOrTimeToday(logDialog.createdDateTime)}</span>,
            getSortValue: logDialog => moment(logDialog.createdDateTime).valueOf().toString()
        }
    ]
}

interface ComponentState {
    columns: IRenderableColumn[]
    sortColumn: IRenderableColumn
    chatSession: CLM.Session | null
    conflictPairs: ConflictPair[]
    isChatSessionWindowOpen: boolean
    isEditDialogModalOpen: boolean
    isTeachDialogModalOpen: boolean
    mergeExistingTrainDialog: CLM.TrainDialog | null
    mergeNewTrainDialog: CLM.TrainDialog | null
    // Item selected in webchat window
    selectedHistoryIndex: number | null
    // The ID of the selected log dialog
    currentLogDialogId: string | null
    // The trainDialog created out of the selected LogDialog
    currentTrainDialog: CLM.TrainDialog | null
    // Is Dialog being edited a new one, a TrainDialog or a LogDialog
    editType: EditDialogType
    searchValue: string
    // Allows user to re-open modal for same row ()
    dialogKey: number
    history: Activity[]
    lastAction: CLM.ActionBase | null
    validationErrors: CLM.ReplayError[]
    // Hack to keep screen from flashing when transition to Edit Page
    lastTeachSession: TeachSessionState | null

}
const defaultAcceptConflictResolutionFn = async () => { throw new Error(`acceptConflictResolutionFn called without being assigned.`) }

// TODO: This component is highly redundant with TrainDialogs.  Should collapse
class LogDialogs extends React.Component<Props, ComponentState> {
    acceptConflictResolutionFn: (conflictFreeDialog: CLM.TrainDialog) => Promise<void> = defaultAcceptConflictResolutionFn
    newChatSessionButton: OF.IButton
    state: ComponentState

    static getConflicts(rounds: CLM.TrainRound[], previouslySubmittedTextVariations: CLM.TextVariation[]) {
        const conflictPairs: ConflictPair[] = []

        rounds.forEach((round, roundIndex) => {
            round.extractorStep.textVariations.forEach((textVariation, textVariationIndex) => {
                const previouslySubmittedTextVariation = previouslySubmittedTextVariations.find(tv => tv.text.toLowerCase() === textVariation.text.toLowerCase())
                if (previouslySubmittedTextVariation) {
                    const conflictPair: ConflictPair = {
                        roundIndex,
                        textVariationIndex,
                        conflicting: CLM.ModelUtils.ToExtractResponse(textVariation),
                        previouslySubmitted: CLM.ModelUtils.ToExtractResponse(previouslySubmittedTextVariation)
                    }

                    conflictPairs.push(conflictPair)
                }
            })
        })

        return conflictPairs
    }
    
    constructor(props: Props) {
        super(props)
        const columns = getColumns(this.props.intl);
        this.state = {
            columns: columns,
            sortColumn: columns[5],
            chatSession: null,
            conflictPairs: [],
            isChatSessionWindowOpen: false,
            isEditDialogModalOpen: false,
            isTeachDialogModalOpen: false,
            mergeExistingTrainDialog: null,
            mergeNewTrainDialog: null,
            selectedHistoryIndex: null,
            currentLogDialogId: null,
            currentTrainDialog: null,
            editType: EditDialogType.LOG_ORIGINAL,
            searchValue: '',
            dialogKey: 0,
            history: [],
            lastAction: null,
            validationErrors: [],
            lastTeachSession: null
        }
    }

    sortLogDialogs(logDialogs: CLM.LogDialog[]): CLM.LogDialog[] {
        const logDialogsCopy = [...logDialogs]
        // If column header selected sort the items
        if (this.state.sortColumn) {
            logDialogsCopy
                .sort((a, b) => {
                    let firstValue = this.state.sortColumn.getSortValue(a, this)
                    let secondValue = this.state.sortColumn.getSortValue(b, this)
                    let compareValue = firstValue.localeCompare(secondValue)

                    // If primary sort is the same do secondary sort on another column, to prevent sort jumping around
                    if (compareValue === 0) {
                        const sortColumn2 = ((this.state.sortColumn !== this.state.columns[1]) ? this.state.columns[1] : this.state.columns[2]) as IRenderableColumn
                        firstValue = sortColumn2.getSortValue(a, this)
                        secondValue = sortColumn2.getSortValue(b, this)
                        compareValue = firstValue.localeCompare(secondValue)
                    }

                    return this.state.sortColumn.isSortedDescending
                        ? compareValue
                        : compareValue * -1
                })
        }

        return logDialogsCopy
    }

    @OF.autobind
    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        const { columns } = this.state;
        const isSortedDescending = !clickedColumn.isSortedDescending;

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map(column => {
                column.isSorted = (column.key === clickedColumn.key);
                column.isSortedDescending = isSortedDescending;
                return column;
            }),
            sortColumn: clickedColumn
        });
    }

    componentDidMount() {
        this.newChatSessionButton.focus()
    }

    componentWillReceiveProps(newProps: Props) {
        // A hack to prevent the screen from flashing
        // Will go away once Edit/Teach dialogs are merged
        if (newProps.teachSession && newProps.teachSession !== this.props.teachSession) {
            this.setState({
                lastTeachSession: this.props.teachSession
            })
        }
        // If log dialogs have been updated, update selected logDialog too
        if (this.props.logDialogs !== newProps.logDialogs) {
            if (this.state.currentLogDialogId) {
                const newLogDialog = newProps.logDialogs.find(t => t.logDialogId === this.state.currentLogDialogId)
                this.setState({
                    currentLogDialogId: newLogDialog ? newLogDialog.logDialogId : null,
                    currentTrainDialog: newLogDialog ? CLM.ModelUtils.ToTrainDialog(newLogDialog) : null
                })
            }
        }
    }

    @OF.autobind
    async onClickNewChatSession() {
        try {
            // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
            const chatSession = await ((this.props.createChatSessionThunkAsync(this.props.app.appId, this.props.editingPackageId, this.props.app.metadata.isLoggingOn !== false) as any) as Promise<CLM.Session>)
            this.setState({
                chatSession,
                isChatSessionWindowOpen: true,
                editType: EditDialogType.LOG_ORIGINAL
            })
        }
        catch (e) {
            const error = e as Error
            console.warn(`Error when attempting to opening chat window: `, error)
        }
    }

    @OF.autobind
    onCloseChatSessionWindow() {
        this.setState({
            chatSession: null,
            isChatSessionWindowOpen: false,
            dialogKey: this.state.dialogKey + 1
        })
    }

    onChange(newValue: string) {
        const lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }

    async onClickLogDialogItem(logDialog: CLM.LogDialog) {
        // Reset WebChat scroll position
        this.props.clearWebchatScrollPosition()

        // Convert to trainDialog until schema update change, and pass in app definition too
        const trainDialog = CLM.ModelUtils.ToTrainDialog(logDialog, this.props.actions, this.props.entities);

        try {
            const teachWithHistory = await ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)

            this.setState({
                history: teachWithHistory.history,
                lastAction: teachWithHistory.lastAction,
                currentLogDialogId: logDialog.logDialogId,
                currentTrainDialog: CLM.ModelUtils.ToTrainDialog(logDialog),
                isEditDialogModalOpen: true,
                editType: EditDialogType.LOG_ORIGINAL,
                validationErrors: teachWithHistory.replayErrors
            })
        }
        catch (error) {
            console.warn(`Error when attempting to create history: `, error)
        }
    }

    async onClickSync() {
        await this.props.fetchAllLogDialogsThunkAsync(this.props.app, this.props.editingPackageId);
    }

    @OF.autobind
    async onDeleteLogDialog() {
        this.setState({
            isEditDialogModalOpen: false,
        })

        if (this.state.currentLogDialogId) {
            await this.props.deleteLogDialogThunkAsync(this.props.app, this.state.currentLogDialogId, this.props.editingPackageId)
        }
        await this.onCloseEditDialogModal();
    }

    @OF.autobind
    async onInsertAction(trainDialog: CLM.TrainDialog, selectedActivity: Activity, isLastActivity: boolean) {

        try {
            const clData: CLM.CLChannelData = selectedActivity.channelData.clData
            const roundIndex = clData.roundIndex || 0
            const scoreIndex = clData.scoreIndex
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            // Created shorted version of TrainDialog at insert point
            // Copy, Remove rounds / scorer steps below insert
            const history = Util.deepCopy(trainDialog)
            history.definitions = definitions
            history.rounds = history.rounds.slice(0, roundIndex + 1)

            // Remove actionless dummy step (used for rendering) if it exits
            if (history.rounds[roundIndex].scorerSteps.length > 0 && history.rounds[roundIndex].scorerSteps[0].labelAction === undefined) {
                history.rounds[roundIndex].scorerSteps = []
            }
            else if (scoreIndex === null) {
                history.rounds[roundIndex].scorerSteps = []
            }
            // Or remove following scorer steps 
            else {
                history.rounds[roundIndex].scorerSteps = history.rounds[roundIndex].scorerSteps.slice(0, scoreIndex + 1);
            }

            // Get a score for this step
            const uiScoreResponse = await ((this.props.scoreFromHistoryThunkAsync(this.props.app.appId, history) as any) as Promise<CLM.UIScoreResponse>)

            if (!uiScoreResponse.scoreResponse) {
                throw new Error("Empty Score Response")
            }

            // End session call only allowed on last turn if one doesn't exist already
            const canEndSession = isLastActivity && !DialogUtils.hasEndSession(trainDialog, this.props.actions)

            // Find top scoring Action
            let insertedAction = DialogUtils.getBestAction(uiScoreResponse.scoreResponse, this.props.actions, canEndSession)

            // None were qualified so pick the first (will show in UI as invalid)
            if (!insertedAction && uiScoreResponse.scoreResponse.unscoredActions[0]) {
                const scoredAction = { ...uiScoreResponse.scoreResponse.unscoredActions[0], score: 1 }
                delete scoredAction.reason
                insertedAction = scoredAction
            }
            if (!insertedAction) {
                throw new Error("No actions available")
            }

            const scorerStep: CLM.TrainScorerStep = {
                logicResult: undefined,
                input: uiScoreResponse.scoreInput!,
                labelAction: insertedAction.actionId,
                scoredAction: insertedAction
            }

            // Insert new Action into Full TrainDialog
            const newTrainDialog = Util.deepCopy(trainDialog)
            newTrainDialog.definitions = definitions
            const curRound = newTrainDialog.rounds[roundIndex]

            // Replace actionless dummy step (used for rendering) if it exits
            if (curRound.scorerSteps.length === 0 || curRound.scorerSteps[0].labelAction === undefined) {
                curRound.scorerSteps = [scorerStep]
            }
            // Or insert 
            else if (scoreIndex === null) {
                curRound.scorerSteps = [scorerStep, ...curRound.scorerSteps]
            }
            else {
                curRound.scorerSteps.splice(scoreIndex + 1, 0, scorerStep)
            }

            // If inserted at end of conversation, allow to scroll to bottom
            if (roundIndex === trainDialog.rounds.length - 1 &&
                (scoreIndex === null || scoreIndex === curRound.scorerSteps.length - 1)) {
                this.props.clearWebchatScrollPosition()
            }

            await this.onUpdateHistory(newTrainDialog, selectedActivity, SelectionType.NEXT)
        }
        catch (error) {
            if (error instanceof EntityLabelConflictError) {
                const conflictPairs = LogDialogs.getConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
                this.acceptConflictResolutionFn = (updatedDialog) => this.onInsertAction(updatedDialog, selectedActivity, isLastActivity)
                this.setState({
                    conflictPairs
                })
                return
            }

            console.warn(`Error when attempting to insert an Action `, { error })
        }
    }

    @OF.autobind
    async onChangeAction(trainDialog: CLM.TrainDialog, selectedActivity: Activity, trainScorerStep: CLM.TrainScorerStep | undefined) {

        if (!trainScorerStep) {
            throw new Error("missing args")
        }
        try {
            const clData: CLM.CLChannelData = selectedActivity.channelData.clData
            const roundIndex = clData.roundIndex || 0
            const scoreIndex = clData.scoreIndex!
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            let newTrainDialog = Util.deepCopy(trainDialog)
            newTrainDialog.rounds[roundIndex].scorerSteps[scoreIndex] = trainScorerStep
            newTrainDialog.definitions = definitions;

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            await this.onUpdateHistory(newTrainDialog, selectedActivity, SelectionType.NONE)
        }
        catch (error) {
            console.warn(`Error when attempting to change an Action: `, error)
        }
    }

    @OF.autobind
    async onChangeExtraction(trainDialog: CLM.TrainDialog, selectedActivity: Activity, extractResponse: CLM.ExtractResponse | undefined, textVariations: CLM.TextVariation[] | undefined) {

        if (!extractResponse || !textVariations) {
            throw new Error("missing args")
        }
        try {
            const clData: CLM.CLChannelData = selectedActivity.channelData.clData
            const roundIndex = clData.roundIndex!
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            let newTrainDialog = Util.deepCopy(trainDialog)
            newTrainDialog.definitions = definitions;
            newTrainDialog.rounds[roundIndex].extractorStep.textVariations = textVariations;

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            await this.onUpdateHistory(newTrainDialog, selectedActivity, SelectionType.NONE)
        }
        catch (error) {
            console.warn(`Error when attempting to change extraction: `, error)
        }
    }

    @OF.autobind
    async onDeleteTurn(trainDialog: CLM.TrainDialog, selectedActivity: Activity) {

        const clData: CLM.CLChannelData = selectedActivity.channelData.clData
        const senderType = clData.senderType
        const roundIndex = clData.roundIndex!
        const scoreIndex = clData.scoreIndex

        let newTrainDialog: CLM.TrainDialog = { ...trainDialog }
        newTrainDialog.definitions = {
            entities: this.props.entities,
            actions: this.props.actions,
            trainDialogs: []
        }

        const curRound = newTrainDialog.rounds[roundIndex]

        if (senderType === CLM.SenderType.User) {
            // If user input deleted, append scores to previous round
            if (roundIndex > 0) {
                const previousRound = newTrainDialog.rounds[roundIndex - 1]
                previousRound.scorerSteps = [...previousRound.scorerSteps, ...curRound.scorerSteps]

                // Remove actionless dummy step if it exits
                previousRound.scorerSteps = previousRound.scorerSteps.filter(ss => ss.labelAction !== undefined)
            }

            // Delete round 
            newTrainDialog.rounds.splice(roundIndex, 1)
        }
        else { //CLM.SenderType.Bot 
            if (scoreIndex === null) {
                throw new Error("Unexpected null scoreIndex")
            }
            // If Action deleted remove it
            curRound.scorerSteps.splice(scoreIndex, 1)
        }

        // Replay logic functions on train dialog
        newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)
        await this.onUpdateHistory(newTrainDialog, selectedActivity, SelectionType.CURRENT)
    }

    @OF.autobind
    async onReplayTrainDialog(trainDialog: CLM.TrainDialog) {

        try {
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            let newTrainDialog = Util.deepCopy(trainDialog)
            newTrainDialog.definitions = definitions
            // I've replayed so unknown status goes away (but not invalid)
            if (trainDialog.validity === CLM.Validity.UNKNOWN) {
                newTrainDialog.validity = CLM.Validity.VALID
            }

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            await this.onUpdateHistory(newTrainDialog, null, SelectionType.NONE)
        }
        catch (error) {
            console.warn(`Error when attempting to Replay a train dialog: `, error)
        }
    }

    @OF.autobind
    async onInsertInput(trainDialog: CLM.TrainDialog, selectedActivity: Activity, inputText: string | undefined) {

        if (!inputText) {
            throw new Error("inputText is null")
        }
        try {
            const clData: CLM.CLChannelData = selectedActivity.channelData.clData
            const roundIndex = clData.roundIndex!
            const scoreIndex = clData.scoreIndex || 0
            const senderType = clData.senderType

            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            // Copy, Remove rounds / scorer steps below insert
            const partialTrainDialog = Util.deepCopy(trainDialog)
            partialTrainDialog.definitions = definitions
            partialTrainDialog.rounds = partialTrainDialog.rounds.slice(0, roundIndex + 1)
            const lastRound = partialTrainDialog.rounds[partialTrainDialog.rounds.length - 1]
            lastRound.scorerSteps = lastRound.scorerSteps.slice(0, scoreIndex)

            const userInput: CLM.UserInput = { text: inputText }

            // Get extraction
            const extractResponse = await ((this.props.extractFromHistoryThunkAsync(this.props.app.appId, partialTrainDialog, userInput) as any) as Promise<CLM.ExtractResponse>)

            if (!extractResponse) {
                throw new Error("No extract response")
            }

            const textVariations = CLM.ModelUtils.ToTextVariations([extractResponse])
            const extractorStep: CLM.TrainExtractorStep = { textVariations }

            // Copy original and insert new round for the text
            let newTrainDialog = Util.deepCopy(trainDialog)
            newTrainDialog.definitions = definitions

            let scorerSteps: CLM.TrainScorerStep[]

            if (senderType === CLM.SenderType.User) {
                // Copy scorer steps below the injected input for new Round
                scorerSteps = trainDialog.rounds[roundIndex].scorerSteps

                // Remove scorer steps above injected input from round 
                newTrainDialog.rounds[roundIndex].scorerSteps = []
            }
            else {
                // Copy scorer steps below the injected input for new Round
                scorerSteps = trainDialog.rounds[roundIndex].scorerSteps.slice(scoreIndex + 1)

                // Remove scorer steps above injected input from round 
                newTrainDialog.rounds[roundIndex].scorerSteps.splice(scoreIndex + 1, Infinity)
            }

            // Create new round
            const newRound = {
                extractorStep,
                scorerSteps
            }

            // Inject new Round
            newTrainDialog.rounds.splice(roundIndex + 1, 0, newRound)

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            // If inserted at end of conversation, allow to scroll to bottom
            if (roundIndex === trainDialog.rounds.length - 1) {
                this.props.clearWebchatScrollPosition()
            }

            await this.onUpdateHistory(newTrainDialog, selectedActivity, SelectionType.NEXT)
        }
        catch (error) {
            if (error instanceof EntityLabelConflictError) {
                const conflictPairs = LogDialogs.getConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
                console.log(`Conflict detected: `, { conflictPairs })
                this.acceptConflictResolutionFn = (updatedDialog) => this.onInsertInput(updatedDialog, selectedActivity, inputText)
                this.setState({
                    conflictPairs
                })
                return
            }

            console.warn(`Error when attempting to create teach session from history: `, { error })
        }
    }

    async onContinueTrainDialog(newTrainDialog: CLM.TrainDialog, initialUserInput: CLM.UserInput) {

        try {
            if (this.props.teachSession.teach) {
                // Delete the teach session w/o saving
                await this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app)
            }

            const teachWithHistory = await ((this.props.createTeachSessionFromHistoryThunkAsync(this.props.app, newTrainDialog, this.props.user.name, this.props.user.id, initialUserInput) as any) as Promise<CLM.TeachWithHistory>)

            // Update currentTrainDialog with tags and description
            const currentTrainDialog = this.state.currentTrainDialog ? {
                ...this.state.currentTrainDialog,
                tags: newTrainDialog.tags,
                description: newTrainDialog.description
            } : null

            // Note: Don't clear currentTrainDialog so I can delete it if I save my edits
            this.setState({
                history: teachWithHistory.history,
                lastAction: teachWithHistory.lastAction,
                isEditDialogModalOpen: false,
                selectedHistoryIndex: null,
                isTeachDialogModalOpen: true,
                editType: EditDialogType.LOG_EDITED,
                currentTrainDialog
            })
        }
        catch (error) {
            if (error instanceof EntityLabelConflictError) {
                const conflictPairs = LogDialogs.getConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
                this.acceptConflictResolutionFn = (updatedDialog) => this.onContinueTrainDialog(updatedDialog, initialUserInput)
                this.setState({
                    conflictPairs
                })
                return
            }

            console.warn(`Error when attempting to create teach session from train dialog: `, error)
        }
    }

    // End Session activity selected.  Switch from Teach to Edit
    @OF.autobind
    async onEndSessionActivity() {

        try {
            if (this.props.teachSession.teach) {
                // Get train dialog associated with the teach session
                const trainDialog = await ((this.props.fetchTrainDialogThunkAsync(this.props.app.appId, this.props.teachSession.teach.trainDialogId, false) as any) as Promise<CLM.TrainDialog>)
                trainDialog.definitions = {
                    entities: this.props.entities,
                    actions: this.props.actions,
                    trainDialogs: []
                }

                // EndSession callback close the teach session, but UI state still needs to be updates after fetch
                await ((this.props.clearTeachSession() as any) as Promise<CLM.TrainDialog>)

                // Generate history
                await this.onUpdateHistory(trainDialog, null, SelectionType.NONE)
            }
        }
        catch (error) {
            console.warn(`Error when attempting to use EndSession Action`, error)
        }
    }

    async onUpdateHistory(newTrainDialog: CLM.TrainDialog, selectedActivity: Activity | null, selectionType: SelectionType) {

        try {
            const teachWithHistory = await ((this.props.fetchHistoryThunkAsync(this.props.app.appId, newTrainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)

            let activityIndex: number | null = null

            // If activity was selected, calculate activity to select after update
            if (selectedActivity !== null) {
                activityIndex = selectedActivity ? DialogUtils.matchedActivityIndex(selectedActivity, this.state.history) : null
                if (activityIndex !== null && selectionType === SelectionType.NEXT) {
                    // Select next activity, useful for when inserting a step
                    activityIndex = activityIndex + 1
                }
                // If was a delete action, activity won't exist any more, so select by index
                else if (activityIndex === null && selectionType === SelectionType.CURRENT) {

                    const clData: CLM.CLChannelData = selectedActivity.channelData.clData
                    if (clData && clData.activityIndex) {
                        activityIndex = clData.activityIndex
                    }
                }
                else if (selectionType === SelectionType.NONE) {
                    activityIndex = null
                }
            }

            this.setState({
                history: teachWithHistory.history,
                lastAction: teachWithHistory.lastAction,
                currentTrainDialog: newTrainDialog,
                isEditDialogModalOpen: true,
                isTeachDialogModalOpen: false,
                selectedHistoryIndex: activityIndex,
                editType: EditDialogType.LOG_EDITED
            })
        }
        catch (error) {
            console.warn(`Error when attempting to update history: `, error)
        }
    }

    async onClickTrainDialogItem(trainDialog: CLM.TrainDialog) {
        const trainDialogWithDefinitions: CLM.TrainDialog = {
            ...trainDialog,
            createdDateTime: new Date().toJSON(),
            lastModifiedDateTime: new Date().toJSON(),
            trainDialogId: undefined!,
            sourceLogDialogId: trainDialog.sourceLogDialogId,
            version: undefined!,
            packageCreationId: undefined!,
            packageDeletionId: undefined!,
            rounds: trainDialog.rounds,
            initialFilledEntities: trainDialog.initialFilledEntities,
            definitions: {
                actions: this.props.actions,
                entities: this.props.entities,
                trainDialogs: []
            }
        };

        try {
            const teachWithHistory = await ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialogWithDefinitions, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)
            this.setState({
                history: teachWithHistory.history,
                lastAction: teachWithHistory.lastAction,
                currentTrainDialog: trainDialog,
                isEditDialogModalOpen: true,
                selectedHistoryIndex: null,
                editType: EditDialogType.LOG_ORIGINAL
            })
        }
        catch (e) {
            const error = e as Error
            console.warn(`Error when attempting to create history: `, error)
        }
    }

    @OF.autobind
    async onCloseMergeModal(shouldMerge: boolean, description: string = "", tags: string[] = []) {

        if (!this.state.mergeNewTrainDialog || !this.state.mergeExistingTrainDialog) {
            throw new Error ("Expected merge props to be set")
        }

        const sourceTrainDialogId = this.state.currentTrainDialog && this.state.editType !== EditDialogType.BRANCH
                ? this.state.currentTrainDialog.trainDialogId : null

        if (shouldMerge) {
            await this.props.trainDialogMergeThunkAsync(this.props.app.appId, this.state.mergeNewTrainDialog, this.state.mergeExistingTrainDialog, description, tags, sourceTrainDialogId)
        }
        else {
            // If editing an existing Train Dialog, replace existing with the new one
            if (sourceTrainDialogId) {
                await this.props.trainDialogReplaceThunkAsync(this.props.app.appId, sourceTrainDialogId, this.state.mergeNewTrainDialog)
            }
        }

        if (this.state.currentLogDialogId) {
            await this.props.deleteLogDialogThunkAsync(this.props.app, this.state.currentLogDialogId, this.props.editingPackageId)
        } 

        this.setState({
            mergeExistingTrainDialog: null,
            mergeNewTrainDialog: null,
            isTeachDialogModalOpen: false,
            history: [],
            lastAction: null,
            currentLogDialogId: null,
            currentTrainDialog: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    async onCloseEditDialogModal(reload: boolean = false) {

        this.setState({
            isEditDialogModalOpen: false,
        })

        if (this.props.teachSession && this.props.teachSession.teach) {
            // Delete the teach session w/o saving
            await this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app)
        }

        this.setState({
            selectedHistoryIndex: null,
            currentTrainDialog: null,
            currentLogDialogId: null,
            history: [],
            lastAction: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    async onSaveTrainDialog(newTrainDialog: CLM.TrainDialog, validity?: CLM.Validity) {
        // Remove any data added for rendering
        cleanTrainDialog(newTrainDialog)
        const cleanedDialog = {
            ...newTrainDialog,
            validity,
            definitions: null
        }

        try {
            await this.props.createTrainDialogThunkAsync(this.props.app.appId, cleanedDialog)
  
            this.setState({
                isEditDialogModalOpen: false,
            })

            // Check to see if it can be merged with an exising TrainDialog
            const matchedTrainDialog = false // DISABLE DialogUtils.findMatchingTrainDialog(cleanedDialog, this.props.trainDialogs)
            if (matchedTrainDialog) {
                // Open model to ask user if they want to merge
                this.setState({
                    mergeExistingTrainDialog: matchedTrainDialog,
                    mergeNewTrainDialog: cleanedDialog
                })
                return
            }
            // Otherwise save as a new TrainDialog
            else {

                if (this.state.currentLogDialogId) {
                    await this.props.deleteLogDialogThunkAsync(this.props.app, this.state.currentLogDialogId, this.props.editingPackageId)
                }
                else {
                    throw new Error("Could not find LogDialag associated with conversion to TrainDialog")
                }
            }
        }
        catch (error) {
            if (error instanceof EntityLabelConflictError) {
                const conflictPairs = LogDialogs.getConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
                this.acceptConflictResolutionFn = this.onSaveTrainDialog
                this.setState({
                    conflictPairs
                })
                return
            }

            console.warn(`Error when attempting to convert log dialog to train dialog: `, error)
        }

        this.onCloseEditDialogModal()
    }

    @OF.autobind
    async onCloseTeachSession(save: boolean, tags: string[] = [], description: string = '') {
        if (this.props.teachSession && this.props.teachSession.teach) {

            if (save) {

                // If editing an existing train dialog, extract its dialogId
                const sourceTrainDialogId = this.state.currentTrainDialog && this.state.editType !== EditDialogType.BRANCH
                    ? this.state.currentTrainDialog.trainDialogId : null

                // Delete the teach session and retreive the new TrainDialog
                const newTrainDialog = await ((this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app, true, sourceTrainDialogId)as any) as Promise<CLM.TrainDialog>)
                newTrainDialog.tags = tags
                newTrainDialog.description = description

                // Check to see if new TrainDialog can be merged with an exising TrainDialog
                const matchingTrainDialog = false // DISABLE DialogUtils.findMatchingTrainDialog(newTrainDialog, this.props.trainDialogs, sourceTrainDialogId)

                if (matchingTrainDialog) {
                    this.setState({
                        mergeExistingTrainDialog: matchingTrainDialog,
                        mergeNewTrainDialog: newTrainDialog
                    })
                    return
                }
                else {
                    // If editing an existing Train Dialog, replace existing with the new one
                    if (sourceTrainDialogId) {
                        await this.props.trainDialogReplaceThunkAsync(this.props.app.appId, sourceTrainDialogId, newTrainDialog)
                    }
                    // Otherwise just update the tags and description
                    else {
                        await this.props.editTrainDialogThunkAsync(this.props.app.appId, { trainDialogId: newTrainDialog.trainDialogId, tags, description })
                    }
                    
                    // Delete associated log dialog
                    if (this.state.currentLogDialogId) {
                        await this.props.deleteLogDialogThunkAsync(this.props.app, this.state.currentLogDialogId, this.props.editingPackageId)
                    } 
                }
            }
            // Just delete the teach sesion without saving
            else {
                await this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app)
            }
        }

        this.setState({
            isTeachDialogModalOpen: false,
            history: [],
            lastAction: null,
            currentLogDialogId: null,
            currentTrainDialog: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    getFilteredAndSortedDialogs(): CLM.LogDialog[] {
        // Don't show log dialogs that have derived TrainDialogs as they've already been edited
        let filteredLogDialogs: CLM.LogDialog[] = this.props.logDialogs.filter(l => !l.targetTrainDialogIds || l.targetTrainDialogIds.length === 0);

        if (this.state.searchValue) {
            // TODO: Consider caching as not very efficient
            filteredLogDialogs = filteredLogDialogs.filter((l: CLM.LogDialog) => {
                const keys = [];
                for (const round of l.rounds) {
                    keys.push(round.extractorStep.text);
                    for (const le of round.extractorStep.predictedEntities) {
                        const entity = this.props.entities.find(e => e.entityId === le.entityId)
                        if (!entity) {
                            throw new Error(`Could not find entity by id: ${le.entityId} in list of entities`)
                        }
                        keys.push(entity.entityName)
                    }
                    for (const ss of round.scorerSteps) {
                        const action = this.props.actions.find(a => a.actionId === ss.predictedAction)
                        if (!action) {
                            throw new Error(`Could not find action by id: ${ss.predictedAction} in list of actions`)
                        }

                        keys.push(action.payload)
                    }
                }
                const searchString = keys.join(' ').toLowerCase();
                return searchString.indexOf(this.state.searchValue) > -1;
            })
        }

        filteredLogDialogs = this.sortLogDialogs(filteredLogDialogs);
        return filteredLogDialogs;
    }

    @OF.autobind
    async onAcceptConflictChanges(conflictPairs: ConflictPair[]) {
        // This shouldn't be possible but have to check.
        // Would be better for the modal to return all the data required to continue the conversion
        if (!this.state.currentTrainDialog) {
            throw new Error(`No train dialog available to update with changes`)
        }

        const updatedTrainDialog = produce(this.state.currentTrainDialog, (draft: CLM.TrainDialog) => {
            // For each conflicting text variation replace the inconsistent labels with the consistent labels
            for (const conflict of conflictPairs) {
                const textVariation = CLM.ModelUtils.ToTextVariation(conflict.previouslySubmitted)
                draft.rounds[conflict.roundIndex].extractorStep.textVariations[conflict.textVariationIndex].labelEntities = textVariation.labelEntities
            }

            draft.definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }
        })

        this.setState({
            conflictPairs: []
        })

        await this.acceptConflictResolutionFn(updatedTrainDialog)
        this.acceptConflictResolutionFn = defaultAcceptConflictResolutionFn
    }

    @OF.autobind
    onAbortConflictChanges() {
        this.setState({
            conflictPairs: []
        })
    }

    render() {
        const computedLogDialogs = this.getFilteredAndSortedDialogs()
        const editState = (this.props.editingPackageId !== this.props.app.devPackageId)
            ? EditState.INVALID_PACKAGE
            : this.props.invalidBot
                ? EditState.INVALID_BOT
                : EditState.CAN_EDIT

        const teachSession = (this.props.teachSession && this.props.teachSession.teach) ?
            this.props.teachSession : this.state.lastTeachSession

        return (
            <div className="cl-page">
                <div data-testid="log-dialogs-title" className={`cl-dialog-title cl-dialog-title--log ${OF.FontClassNames.xxLarge}`}>
                    <OF.Icon iconName="UserFollowed" />
                    <FormattedMessageId id={FM.LOGDIALOGS_TITLE} />
                </div>
                {this.props.editingPackageId === this.props.app.devPackageId ?
                    <span className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.LOGDIALOGS_SUBTITLE} />
                    </span>
                    :
                    <span className="cl-errorpanel">Editing is only allowed in Master Tag</span>
                }
                {this.props.app.metadata.isLoggingOn === false &&
                    <span className="ms-TextField-errorMessage label-error">
                        <FormattedMessageId id={FM.LOGDIALOGS_LOGDISABLED} />
                    </span>
                }
                <div className="cl-buttons-row">
                    <OF.PrimaryButton
                        data-testid="log-dialogs-new-button"
                        disabled={this.props.editingPackageId !== this.props.app.devPackageId || this.props.invalidBot}
                        onClick={this.onClickNewChatSession}
                        ariaDescription={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                        text={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONTITLE)}
                        componentRef={component => this.newChatSessionButton = component!}
                        iconProps={{ iconName: 'Add' }}
                    />
                    <OF.DefaultButton
                        data-testid="logdialogs-button-refresh"
                        onClick={() => this.onClickSync()}
                        ariaDescription="Refresh"
                        text="Refresh"
                        iconProps={{ iconName: 'Sync' }}
                    />
                </div>
                {
                    computedLogDialogs.length === 0
                        ? <div className="cl-page-placeholder">
                            <div className="cl-page-placeholder__content">
                                <div className={`cl-page-placeholder__description ${OF.FontClassNames.xxLarge}`}>Create a Log Dialog</div>
                                <OF.PrimaryButton
                                    iconProps={{
                                        iconName: "Add"
                                    }}
                                    disabled={this.props.editingPackageId !== this.props.app.devPackageId || this.props.invalidBot}
                                    onClick={this.onClickNewChatSession}
                                    ariaDescription={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                                    text={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONTITLE)}
                                />
                            </div>
                        </div>
                        : <React.Fragment>
                            <div>
                                <OF.Label htmlFor="logdialogs-input-search" className={OF.FontClassNames.medium}>
                                    Search:
                                </OF.Label>
                                <OF.SearchBox
                                    id="logdialogs-input-search"
                                    data-testid="logdialogs-search-box"
                                    className={OF.FontClassNames.mediumPlus}
                                    onChange={(newValue) => this.onChange(newValue)}
                                    onSearch={(newValue) => this.onChange(newValue)}
                                />
                            </div>

                            <OF.DetailsList
                                data-testid="logdialogs-details-list"
                                key={this.state.dialogKey}
                                className={OF.FontClassNames.mediumPlus}
                                items={computedLogDialogs}
                                columns={this.state.columns}
                                checkboxVisibility={OF.CheckboxVisibility.hidden}
                                onColumnHeaderClick={this.onClickColumnHeader}
                                onRenderItemColumn={(logDialog, i, column: IRenderableColumn) => returnErrorStringWhenError(() => column.render(logDialog, this))}
                                onActiveItemChanged={logDialog => this.onClickLogDialogItem(logDialog)}
                            />
                        </React.Fragment>
                }

                <ChatSessionModal
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    open={this.state.isChatSessionWindowOpen}
                    onClose={this.onCloseChatSessionWindow}
                />
                {
                    teachSession && teachSession.teach &&
                    <TeachSessionModal
                        isOpen={this.state.isTeachDialogModalOpen}
                        app={this.props.app}
                        teachSession={teachSession}
                        editingPackageId={this.props.editingPackageId}
                        originalTrainDialogId={null}
                        onClose={this.onCloseTeachSession}
                        onSetInitialEntities={null}
                        onEditTeach={(historyIndex, userInput, editHandler) => this.onEditTeach(historyIndex, userInput, editHandler)}
                        onInsertAction={(trainDialog, activity, editHandlerArgs) => this.onInsertAction(trainDialog, activity, editHandlerArgs.isLastActivity!)}
                        onInsertInput={(trainDialog, activity, editHandlerArgs) => this.onInsertInput(trainDialog, activity, editHandlerArgs.userInput)}
                        onDeleteTurn={(trainDialog, activity) => this.onDeleteTurn(trainDialog, activity)}
                        onChangeExtraction={(trainDialog, activity, editHandlerArgs) => this.onChangeExtraction(trainDialog, activity, editHandlerArgs.extractResponse, editHandlerArgs.textVariations)}
                        onChangeAction={(trainDialog, activity, editHandlerArgs) => this.onChangeAction(trainDialog, activity, editHandlerArgs.trainScorerStep)}
                        onEndSessionActivity={this.onEndSessionActivity}
                        onReplayDialog={(trainDialog) => this.onReplayTrainDialog(trainDialog)}
                        editType={this.state.editType}
                        initialHistory={this.state.history}
                        lastAction={this.state.lastAction}
                        sourceTrainDialog={this.state.currentTrainDialog}
                        allUniqueTags={this.props.allUniqueTags}

                        conflictPairs={this.state.conflictPairs}
                        onAcceptConflictResolution={this.onAcceptConflictChanges}
                        onAbortConflictResolution={this.onAbortConflictChanges}
                    />
                }
                <MergeModal
                    open={this.state.mergeExistingTrainDialog !== null}
                    onMerge={(description, tags) => this.onCloseMergeModal(true, description, tags)}
                    onCancel={() => this.onCloseMergeModal(false)}
                    savedTrainDialog={this.state.mergeNewTrainDialog}
                    existingTrainDialog={this.state.mergeExistingTrainDialog}
                    allUniqueTags={this.props.allUniqueTags}
                />
                <EditDialogModal
                    data-testid="train-dialog-modal"
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    editState={editState}
                    open={this.state.isEditDialogModalOpen}
                    trainDialog={this.state.currentTrainDialog!}
                    editingLogDialogId={this.state.currentLogDialogId}
                    originalTrainDialogId={null}
                    history={this.state.history}
                    initialSelectedActivityIndex={this.state.selectedHistoryIndex}
                    editType={this.state.editType}
                    onInsertAction={(trainDialog, activity, isLastActivity) => this.onInsertAction(trainDialog, activity, isLastActivity)}
                    onInsertInput={(trainDialog, activity, userInput) => this.onInsertInput(trainDialog, activity, userInput)}
                    onDeleteTurn={(trainDialog, activity) => this.onDeleteTurn(trainDialog, activity)}
                    onChangeExtraction={(trainDialog, activity, extractResponse, textVariations) => this.onChangeExtraction(trainDialog, activity, extractResponse, textVariations)}
                    onChangeAction={(trainDialog: CLM.TrainDialog, activity: Activity, trainScorerStep: CLM.TrainScorerStep) => this.onChangeAction(trainDialog, activity, trainScorerStep)}
                    onBranchDialog={null} // Never branch on LogDialogs
                    onCloseModal={(reload) => this.onCloseEditDialogModal(reload)}
                    onDeleteDialog={this.onDeleteLogDialog}
                    onContinueDialog={(editedTrainDialog, initialUserInput) => this.onContinueTrainDialog(editedTrainDialog, initialUserInput)}
                    onSaveDialog={(editedTrainDialog, validity) => this.onSaveTrainDialog(editedTrainDialog, validity)}
                    onReplayDialog={(editedTrainDialog) => this.onReplayTrainDialog(editedTrainDialog)}
                    onCreateDialog={() => { }}
                    allUniqueTags={this.props.allUniqueTags}

                    conflictPairs={this.state.conflictPairs}
                    onAcceptConflictResolution={this.onAcceptConflictChanges}
                    onAbortConflictResolution={this.onAbortConflictChanges}
                />
            </div>
        );
    }

    // User has edited an Activity in a TeachSession
    private async onEditTeach(historyIndex: number, args: EditHandlerArgs | null = null, editHandler: (trainDialog: CLM.TrainDialog, activity: Activity, args?: EditHandlerArgs) => any) {

        try {
            if (this.props.teachSession.teach) {
                // Get train dialog associated with the teach session
                const trainDialog = await ((this.props.fetchTrainDialogThunkAsync(this.props.app.appId, this.props.teachSession.teach.trainDialogId, false) as any) as Promise<CLM.TrainDialog>)
                trainDialog.definitions = {
                    entities: this.props.entities,
                    actions: this.props.actions,
                    trainDialogs: []
                }

                // Delete the teach session w/o saving
                await this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app)

                // Generate history
                const teachWithHistory = await ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)
                if (teachWithHistory) {

                    const selectedActivity = teachWithHistory.history[historyIndex]
                    if (args) {
                        await editHandler(trainDialog, selectedActivity, args)
                    }
                    else {
                        await editHandler(trainDialog, selectedActivity)
                    }
                }
            }
        }
        catch (error) {
            console.log(`LogDialogs.onEditTeach: `, { error, textVariations: error.textVariations })
            console.warn(`Error when attempting to edit Teach session`, error)
        }
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        clearWebchatScrollPosition: actions.display.clearWebchatScrollPosition,
        clearTeachSession: actions.teach.clearTeachSession,
        createChatSessionThunkAsync: actions.chat.createChatSessionThunkAsync,
        createTeachSessionFromHistoryThunkAsync: actions.teach.createTeachSessionFromHistoryThunkAsync,
        createTrainDialogThunkAsync: actions.train.createTrainDialogThunkAsync,
        deleteLogDialogThunkAsync: actions.log.deleteLogDialogThunkAsync,
        deleteTeachSessionThunkAsync: actions.teach.deleteTeachSessionThunkAsync,
        deleteTrainDialogThunkAsync: actions.train.deleteTrainDialogThunkAsync,
        editTrainDialogThunkAsync: actions.train.editTrainDialogThunkAsync,
        extractFromHistoryThunkAsync: actions.train.extractFromHistoryThunkAsync,
        fetchAllLogDialogsThunkAsync: actions.log.fetchAllLogDialogsThunkAsync,
        fetchHistoryThunkAsync: actions.train.fetchHistoryThunkAsync,
        fetchTrainDialogThunkAsync: actions.train.fetchTrainDialogThunkAsync,
        trainDialogMergeThunkAsync: actions.train.trainDialogMergeThunkAsync,
        trainDialogReplaceThunkAsync: actions.train.trainDialogReplaceThunkAsync,
        scoreFromHistoryThunkAsync: actions.train.scoreFromHistoryThunkAsync,
        trainDialogReplayThunkAsync: actions.train.trainDialogReplayThunkAsync,
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render LogDialogs but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        logDialogs: state.logDialogs,
        trainDialogs: state.trainDialogs,
        user: state.user.user,
        actions: state.actions,
        entities: state.entities,
        teachSession: state.teachSession,
        // Get all tags from all train dialogs then put in Set to get unique tags
        allUniqueTags: [...new Set(state.trainDialogs.reduce((tags, trainDialog) => [...tags, ...trainDialog.tags], []))]
    }
}

export interface ReceivedProps {
    app: CLM.AppBase,
    invalidBot: boolean,
    editingPackageId: string
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(LogDialogs))