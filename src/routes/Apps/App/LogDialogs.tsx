/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as Util from '../../../Utils/util'
import * as DialogEditing from '../../../Utils/dialogEditing'
import * as DialogUtils from '../../../Utils/dialogUtils'
import * as OF from 'office-ui-fabric-react'
import * as moment from 'moment'
import * as BB from 'botbuilder'
import FormattedMessageId from '../../../components/FormattedMessageId'
import actions from '../../../actions'
import produce from 'immer'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../../types'
import { EditDialogType, EditState, SelectionType } from '../../../types/const'
import { ChatSessionModal, EditDialogModal, TeachSessionModal, MergeModal, ConfirmCancelModal } from '../../../components/modals'
import LogConversionConflictModal, { ConflictPair } from '../../../components/modals/LogConversionConflictModal'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../../react-intl-messages'
import { TeachSessionState } from '../../../types/StateTypes'
import { EntityLabelConflictError } from '../../../types/errors'
import { autobind } from 'core-decorators'
import { PartialTrainDialog } from '../../../types/models'

interface IRenderableColumn extends OF.IColumn {
    render: (x: CLM.LogDialog, component: LogDialogs) => React.ReactNode
    getSortValue: (logDialog: CLM.LogDialog, component: LogDialogs) => string
}

const returnErrorStringWhenError = Util.returnStringWhenError("ERR")

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
            render: (logDialog, component) => {
                return <>
                    <span className={OF.FontClassNames.mediumPlus} data-testid="log-dialogs-description">
                        {DialogUtils.dialogSampleInput(logDialog)}
                    </span>
                </>
            },
            getSortValue: logDialog => {
                return DialogUtils.dialogSampleInput(logDialog)
            }
        },
        {
            key: 'turns',
            name: Util.formatMessageId(intl, FM.LOGDIALOGS_TURNS),
            fieldName: 'dialog',
            minWidth: 50,
            maxWidth: 50,
            isResizable: false,
            render: logDialog => <span className={OF.FontClassNames.mediumPlus} data-testid="log-dialogs-turns">{logDialog.rounds.length}</span>,
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

const getDialogKey = (logDialog: OF.IObjectWithKey) => (logDialog as CLM.LogDialog).logDialogId

interface ComponentState {
    columns: IRenderableColumn[]
    sortColumn: IRenderableColumn
    chatSession: CLM.Session | null
    conflictPairs: ConflictPair[]
    isConfirmDeleteModalOpen: boolean
    isChatSessionWindowOpen: boolean
    isEditDialogModalOpen: boolean
    isTeachDialogModalOpen: boolean
    selectionCount: number
    mergeExistingTrainDialog: CLM.TrainDialog | null
    mergeNewTrainDialog: CLM.TrainDialog | null
    // Item selected in webchat window
    selectedActivityIndex: number | null
    // The ID of the selected log dialog
    currentLogDialogId: string | null
    // The trainDialog created out of the selected LogDialog
    currentTrainDialog: CLM.TrainDialog | null
    // Is Dialog being edited a new one, a TrainDialog or a LogDialog
    editType: EditDialogType
    searchValue: string
    // Allows user to re-open modal for same row ()
    dialogKey: number
    activityHistory: BB.Activity[]
    lastAction: CLM.ActionBase | null
    validationErrors: CLM.ReplayError[]
    // Hack to keep screen from flashing when transition to Edit Page
    lastTeachSession: TeachSessionState | null

}
const defaultAcceptConflictResolutionFn = async () => { throw new Error(`acceptConflictResolutionFn called without being assigned.`) }

// TODO: This component is highly redundant with TrainDialogs.  Should collapse
class LogDialogs extends React.Component<Props, ComponentState> {
    acceptConflictResolutionFn: (conflictFreeDialog: CLM.TrainDialog) => Promise<void> = defaultAcceptConflictResolutionFn
    newChatSessionButtonRef = React.createRef<OF.IButton>()
    state: ComponentState

    private selection: OF.ISelection = new OF.Selection({
        getKey: getDialogKey,
        onSelectionChanged: this.onSelectionChanged
    })

    static GetConflicts(rounds: CLM.TrainRound[], previouslySubmittedTextVariations: CLM.TextVariation[]) {
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
        const columns = getColumns(this.props.intl)
        const sortColumn = columns.find(c => c.key === 'created')
        if (!sortColumn) {
            throw new Error(`Cannot find initial sort column by key 'created'`)
        }
        columns.forEach(col => {
            col.isSorted = false
            col.isSortedDescending = false

            if (col === sortColumn) {
                col.isSorted = true
            }
        })

        this.state = {
            columns,
            sortColumn,
            chatSession: null,
            conflictPairs: [],
            isConfirmDeleteModalOpen: false,
            isChatSessionWindowOpen: false,
            isEditDialogModalOpen: false,
            isTeachDialogModalOpen: false,
            selectionCount: 0,
            mergeExistingTrainDialog: null,
            mergeNewTrainDialog: null,
            selectedActivityIndex: null,
            currentLogDialogId: null,
            currentTrainDialog: null,
            editType: EditDialogType.LOG_ORIGINAL,
            searchValue: '',
            dialogKey: 0,
            activityHistory: [],
            lastAction: null,
            validationErrors: [],
            lastTeachSession: null
        }
    }

    @autobind
    onSelectionChanged() {
        const selectionCount = this.selection.getSelectedCount()
        this.setState({ selectionCount })
    }

    sortLogDialogs(
        logDialogs: CLM.LogDialog[],
        columns: IRenderableColumn[],
        sortColumn: IRenderableColumn | undefined,
    ): CLM.LogDialog[] {
        // If column header not selected, no sorting needed, return items
        if (!sortColumn) {
            return logDialogs
        }

        return [...logDialogs]
            .sort((a, b) => {
                let firstValue = sortColumn.getSortValue(a, this)
                let secondValue = sortColumn.getSortValue(b, this)
                let compareValue = firstValue.localeCompare(secondValue)

                // If primary sort is the same do secondary sort on another column, to prevent sort jumping around
                if (compareValue === 0) {
                    const sortColumn2 = sortColumn !== columns[1]
                        ? columns[1]
                        : columns[2]
                    firstValue = sortColumn2.getSortValue(a, this)
                    secondValue = sortColumn2.getSortValue(b, this)
                    compareValue = firstValue.localeCompare(secondValue)
                }

                return sortColumn.isSortedDescending
                    ? compareValue
                    : compareValue * -1
            })
    }

    @autobind
    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        const sortColumn = this.state.columns.find(c => c.key === clickedColumn.key)!
        // Toggle isSortedDescending of clickedColumn and reset all other columns
        const columns = this.state.columns.map(column => {
            column.isSorted = false
            column.isSortedDescending = false
            if (column === sortColumn) {
                column.isSorted = true
                column.isSortedDescending = !clickedColumn.isSortedDescending
            }
            return column
        })

        this.setState({
            columns,
            sortColumn,
        })
    }

    componentDidMount() {
        this.focusNewChatButton()
        this.handleQueryParameters(this.props.location.search)
    }

    UNSAFE_componentWillReceiveProps(newProps: Props) {
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

    componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        this.handleQueryParameters(this.props.location.search, prevProps.location.search)
    }

    async handleQueryParameters(newSearch: string, oldSearch?: string): Promise<void> {

        const searchParams = new URLSearchParams(newSearch)
        const selectedDialogId = searchParams.get(DialogUtils.DialogQueryParams.id)

        // Check that I need to update
        if (oldSearch) {
            const searchParamsPrev = new URLSearchParams(oldSearch)
            const selectedDialogIdPrev = searchParamsPrev.get(DialogUtils.DialogQueryParams.id)
            if (selectedDialogId === selectedDialogIdPrev) {
                return
            }
        }

        // If dialog id is in query param and edit modal not open, open it
        if (selectedDialogId &&
            (!this.state.isEditDialogModalOpen && !this.state.isTeachDialogModalOpen)) {
            let logDialog = this.props.logDialogs.find(ld => ld.logDialogId === selectedDialogId)
            if (!logDialog) {
                // If log isn't loaded yet attempt to load it
                logDialog = await ((this.props.fetchLogDialogAsync(this.props.app.appId, selectedDialogId, true, true) as any) as Promise<CLM.LogDialog>)
                if (!logDialog) {
                    // Invalid log dialog, go back to LD list
                    this.props.history.replace(this.props.match.url, { app: this.props.app })
                    return
                }
            }
            this.openLogDialog(logDialog)
        }
    }

    @autobind
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

    @autobind
    onCloseChatSessionWindow() {
        this.setState({
            chatSession: null,
            isChatSessionWindowOpen: false,
            dialogKey: this.state.dialogKey + 1
        })
    }

    @autobind
    onChangeSearchString(event?: React.ChangeEvent<HTMLInputElement>, newValue?: string) {
        if (typeof newValue === 'undefined') {
            return
        }

        this.onSearch(newValue)
    }

    @autobind
    onSearch(newValue: string) {
        const lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }

    @autobind
    async onClickLogDialogItem(logDialog: CLM.LogDialog) {
        const { history } = this.props
        let url = `${this.props.match.url}?id=${logDialog.logDialogId}`
        history.push(url, { app: this.props.app })
    }

    async onClickSync() {
        await ((this.props.fetchAllLogDialogsThunkAsync(this.props.app, this.props.editingPackageId) as any) as Promise<void>)
    }

    @autobind
    async onDeleteLogDialog() {
        this.setState({
            isEditDialogModalOpen: false,
        })

        if (this.state.currentLogDialogId) {
            await ((this.props.deleteLogDialogThunkAsync(this.props.app, this.state.currentLogDialogId, this.props.editingPackageId) as any) as Promise<void>)
        }
        await this.onCloseEditDialogModal();
    }

    @autobind
    async onInsertAction(trainDialog: CLM.TrainDialog, selectedActivity: BB.Activity, isLastActivity: boolean) {
        try {
            const newTrainDialog = await DialogEditing.onInsertAction(
                trainDialog,
                selectedActivity,
                isLastActivity,

                this.props.entities,
                this.props.actions,
                this.props.app.appId,
                this.props.scoreFromTrainDialogThunkAsync as any,
                this.props.clearWebchatScrollPosition,
            )

            await this.onUpdateActivities(newTrainDialog, selectedActivity, SelectionType.NEXT)
        }
        catch (error) {
            if (error instanceof EntityLabelConflictError) {
                const conflictPairs = LogDialogs.GetConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
                this.acceptConflictResolutionFn = (updatedDialog) => this.onInsertAction(updatedDialog, selectedActivity, isLastActivity)
                this.setState({
                    conflictPairs
                })
                return
            }

            console.warn(`Error when attempting to insert an Action `, { error })
        }
    }

    @autobind
    async onChangeAction(trainDialog: CLM.TrainDialog, selectedActivity: BB.Activity, trainScorerStep: CLM.TrainScorerStep | undefined) {
        if (!trainScorerStep) {
            throw new Error("missing args")
        }

        try {
            const newTrainDialog = await DialogEditing.onChangeAction(
                trainDialog,
                selectedActivity,
                trainScorerStep,
                this.state.editType,
                this.props.app.appId,
                this.props.entities,
                this.props.actions,
                undefined,
                this.props.trainDialogReplayThunkAsync as any,
                this.props.editActionThunkAsync as any
            )

            await this.onUpdateActivities(newTrainDialog, selectedActivity, SelectionType.NONE)
        }
        catch (error) {
            console.warn(`Error when attempting to change an Action: `, error)
        }
    }

    @autobind
    async onChangeExtraction(trainDialog: CLM.TrainDialog, selectedActivity: BB.Activity, extractResponse: CLM.ExtractResponse | undefined, textVariations: CLM.TextVariation[] | undefined) {
        if (!extractResponse || !textVariations) {
            throw new Error("missing args")
        }

        try {
            const newTrainDialog = await DialogEditing.onChangeExtraction(
                trainDialog,
                selectedActivity,
                textVariations,
                this.state.editType,
                this.props.app.appId,
                this.props.entities,
                this.props.actions,
                this.props.trainDialogReplayThunkAsync as any,
            )

            await this.onUpdateActivities(newTrainDialog, selectedActivity, SelectionType.NONE)
        }
        catch (error) {
            console.warn(`Error when attempting to change extraction: `, error)
        }
    }

    @autobind
    async onDeleteTurn(trainDialog: CLM.TrainDialog, selectedActivity: BB.Activity) {
        const newTrainDialog = await DialogEditing.onDeleteTurn(
            trainDialog,
            selectedActivity,
            this.props.app.appId,
            this.props.entities,
            this.props.actions,
            this.props.trainDialogReplayThunkAsync as any,
        )

        await this.onUpdateActivities(newTrainDialog, selectedActivity, SelectionType.CURRENT)
    }

    @autobind
    async onReplayTrainDialog(trainDialog: CLM.TrainDialog) {
        try {
            const newTrainDialog = await DialogEditing.onReplayTrainDialog(
                trainDialog,
                this.props.app.appId,
                this.props.entities,
                this.props.actions,
                this.props.trainDialogReplayThunkAsync as any,
            )

            await this.onUpdateActivities(newTrainDialog, null, SelectionType.NONE)
        }
        catch (error) {
            console.warn(`Error when attempting to Replay a train dialog: `, error)
        }
    }

    @autobind
    async onInsertInput(trainDialog: CLM.TrainDialog, selectedActivity: BB.Activity, inputText: string | undefined) {
        if (!inputText) {
            throw new Error("inputText is null")
        }

        try {
            const newTrainDialog = await DialogEditing.onInsertInput(
                trainDialog,
                selectedActivity,
                inputText,
                this.props.app.appId,
                this.props.entities,
                this.props.actions,
                this.props.extractFromTrainDialogThunkAsync as any,
                this.props.trainDialogReplayThunkAsync as any,
                this.props.clearWebchatScrollPosition,
            )

            await this.onUpdateActivities(newTrainDialog, selectedActivity, SelectionType.NEXT)
        }
        catch (error) {
            if (error instanceof EntityLabelConflictError) {
                const conflictPairs = LogDialogs.GetConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
                this.acceptConflictResolutionFn = (updatedDialog) => this.onInsertInput(updatedDialog, selectedActivity, inputText)
                this.setState({
                    conflictPairs
                })
                return
            }

            console.warn(`Error when attempting to create teach session from activityHistory: `, { error })
        }
    }

    async onContinueTrainDialog(newTrainDialog: CLM.TrainDialog, initialUserInput: CLM.UserInput) {

        try {
            if (this.props.teachSession.teach) {
                // Delete the teach session w/o saving
                await ((this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app) as any) as Promise<void>)
            }
            const teachWithActivities = await ((this.props.createTeachSessionFromTrainDialogThunkAsync(this.props.app, newTrainDialog, this.props.user.name, this.props.user.id, initialUserInput, null) as any) as Promise<CLM.TeachWithActivities>)

            // Update currentTrainDialog with tags and description
            const currentTrainDialog = this.state.currentTrainDialog ? {
                ...this.state.currentTrainDialog,
                tags: newTrainDialog.tags,
                description: newTrainDialog.description
            } : null

            // Note: Don't clear currentTrainDialog so I can delete it if I save my edits
            this.setState({
                activityHistory: teachWithActivities.activities,
                lastAction: teachWithActivities.lastAction,
                isEditDialogModalOpen: false,
                selectedActivityIndex: null,
                isTeachDialogModalOpen: true,
                editType: EditDialogType.LOG_EDITED,
                currentTrainDialog
            })
        }
        catch (error) {
            if (error instanceof EntityLabelConflictError) {
                const conflictPairs = LogDialogs.GetConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
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
    @autobind
    async onEndSessionActivity(tags: string[] = [], description: string = '') {

        try {
            if (this.props.teachSession.teach) {
                // Get train dialog associated with the teach session
                const trainDialog = await ((this.props.fetchTrainDialogThunkAsync(this.props.app.appId, this.props.teachSession.teach.trainDialogId, false) as any) as Promise<CLM.TrainDialog>)
                trainDialog.tags = tags
                trainDialog.description = description
                trainDialog.definitions = {
                    entities: this.props.entities,
                    actions: this.props.actions,
                    trainDialogs: []
                }

                // Delete the teach session w/o saving
                await ((this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app) as any) as Promise<void>)

                // Generate activityHistory
                await this.onUpdateActivities(trainDialog, null, SelectionType.NONE)
            }

        }
        catch (error) {
            console.warn(`Error when attempting to use EndSession Action`, error)
        }
    }

    @autobind
    async onUpdateActivities(newTrainDialog: CLM.TrainDialog, selectedActivity: BB.Activity | null, selectionType: SelectionType) {
        try {
            const { teachWithActivities, activityIndex } = await DialogEditing.onUpdateActivities(
                newTrainDialog,
                selectedActivity,
                selectionType,

                this.props.app.appId,
                this.props.user,
                this.props.fetchActivitiesThunkAsync as any
            )

            this.setState({
                activityHistory: teachWithActivities.activities,
                lastAction: teachWithActivities.lastAction,
                currentTrainDialog: newTrainDialog,
                isEditDialogModalOpen: true,
                isTeachDialogModalOpen: false,
                selectedActivityIndex: activityIndex,
                editType: EditDialogType.LOG_EDITED
            })
        }
        catch (error) {
            console.warn(`Error when attempting to update activityHistory: `, error)
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
            const teachWithActivities = await ((this.props.fetchActivitiesThunkAsync(this.props.app.appId, trainDialogWithDefinitions, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithActivities>)
            this.setState({
                activityHistory: teachWithActivities.activities,
                lastAction: teachWithActivities.lastAction,
                currentTrainDialog: trainDialog,
                isEditDialogModalOpen: true,
                selectedActivityIndex: null,
                editType: EditDialogType.LOG_ORIGINAL
            })
        }
        catch (e) {
            const error = e as Error
            console.warn(`Error when attempting to create activityHistory: `, error)
        }
    }

    @autobind
    async onCloseMergeModal(shouldMerge: boolean, description: string | null = null, tags: string[] | null = null) {

        if (!this.state.mergeNewTrainDialog || !this.state.mergeExistingTrainDialog) {
            throw new Error("Expected merge props to be set")
        }

        if (shouldMerge) {
            await ((this.props.trainDialogMergeThunkAsync(this.props.app.appId, this.state.mergeNewTrainDialog, this.state.mergeExistingTrainDialog, description, tags, null) as any) as Promise<void>)
        }
        else {
            // The dialog exists as side affect of closing each session but tags and description where not updated since merge modal was possible.
            const partialDialog: PartialTrainDialog = {
                trainDialogId: this.state.mergeNewTrainDialog.trainDialogId,
                tags: this.state.mergeNewTrainDialog.tags,
                description: this.state.mergeNewTrainDialog.description
            }
            await ((this.props.editTrainDialogThunkAsync(this.props.app.appId, partialDialog) as any) as Promise<void>)
        }

        if (this.state.currentLogDialogId) {
            await ((this.props.deleteLogDialogThunkAsync(this.props.app, this.state.currentLogDialogId, this.props.editingPackageId) as any) as Promise<void>)
        }

        this.setState({
            mergeExistingTrainDialog: null,
            mergeNewTrainDialog: null,
            isTeachDialogModalOpen: false,
            activityHistory: [],
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
            await ((this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app) as any) as Promise<void>)
        }

        this.setState({
            selectedActivityIndex: null,
            currentTrainDialog: null,
            currentLogDialogId: null,
            activityHistory: [],
            lastAction: null,
            dialogKey: this.state.dialogKey + 1
        })

        // Remove selection from query parameter
        const searchParams = new URLSearchParams(this.props.location.search)
        const selectedDialogId = searchParams.get(DialogUtils.DialogQueryParams.id)
        if (selectedDialogId) {
            this.props.history.replace(this.props.match.url, { app: this.props.app })
        }
    }

    async onSaveTrainDialog(newTrainDialog: CLM.TrainDialog) {
        // Remove any data added for rendering
        DialogUtils.cleanTrainDialog(newTrainDialog)

        const validity = DialogUtils.getTrainDialogValidity(newTrainDialog, this.state.activityHistory)

        const cleanedDialog = {
            ...newTrainDialog,
            validity,
            definitions: null
        }

        try {
            await ((this.props.createTrainDialogThunkAsync(this.props.app.appId, cleanedDialog) as any) as Promise<void>)

            this.setState({
                isEditDialogModalOpen: false,
            })

            // Check to see if it can be merged with an existing TrainDialog
            const matchedTrainDialog = DialogUtils.findMatchingTrainDialog(cleanedDialog, this.props.trainDialogs)
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
                    await ((this.props.deleteLogDialogThunkAsync(this.props.app, this.state.currentLogDialogId, this.props.editingPackageId) as any) as Promise<void>)
                }
                else {
                    throw new Error("Could not find LogDialog associated with conversion to TrainDialog")
                }
            }
        }
        catch (error) {
            if (error instanceof EntityLabelConflictError) {
                const conflictPairs = LogDialogs.GetConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
                this.acceptConflictResolutionFn = this.onSaveTrainDialog
                this.setState({
                    conflictPairs
                })
                return
            }

            console.warn(`Error when attempting to convert log dialog to train dialog: `, error)
        }

        await this.onCloseEditDialogModal()
    }

    @autobind
    async onCloseTeachSession(save: boolean, tags: string[] = [], description: string = '') {
        if (this.props.teachSession && this.props.teachSession.teach) {

            if (save) {

                // Delete the teach session and retreive the new TrainDialog
                const newTrainDialog = await ((this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app, true) as any) as Promise<CLM.TrainDialog>)
                newTrainDialog.tags = tags
                newTrainDialog.description = description

                // Check to see if new TrainDialog can be merged with an exising TrainDialog
                const matchingTrainDialog = DialogUtils.findMatchingTrainDialog(newTrainDialog, this.props.trainDialogs)

                if (matchingTrainDialog) {
                    this.setState({
                        mergeExistingTrainDialog: matchingTrainDialog,
                        mergeNewTrainDialog: newTrainDialog
                    })
                }
                else {
                    // Otherwise just update the tags and description
                    await ((this.props.editTrainDialogThunkAsync(this.props.app.appId, { trainDialogId: newTrainDialog.trainDialogId, tags, description }) as any) as Promise<void>)

                    // Delete associated log dialog
                    if (this.state.currentLogDialogId) {
                        await ((this.props.deleteLogDialogThunkAsync(this.props.app, this.state.currentLogDialogId, this.props.editingPackageId) as any) as Promise<void>)
                    }
                }
            }
            // Just delete the teach session without saving
            else {
                await ((this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app) as any) as Promise<void>)
            }
        }

        this.setState({
            isTeachDialogModalOpen: false,
            activityHistory: [],
            lastAction: null,
            currentLogDialogId: null,
            currentTrainDialog: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    getFilteredDialogs(
        logDialogs: CLM.LogDialog[],
        entities: CLM.EntityBase[],
        actions: CLM.ActionBase[],
        searchValue: string
    ): CLM.LogDialog[] {
        if (!searchValue) {
            return logDialogs
        }

        return logDialogs
            .filter(logDialog => {
                const keys = [];
                for (const round of logDialog.rounds) {
                    keys.push(round.extractorStep.text)

                    for (const le of round.extractorStep.predictedEntities) {
                        const entity = entities.find(e => e.entityId === le.entityId)
                        if (!entity) {
                            throw new Error(`Could not find entity by id: ${le.entityId} in list of entities`)
                        }
                        keys.push(entity.entityName)
                    }

                    for (const ss of round.scorerSteps) {
                        const action = actions.find(a => a.actionId === ss.predictedAction)
                        if (!action) {
                            throw new Error(`Could not find action by id: ${ss.predictedAction} in list of actions`)
                        }

                        let payload = ''
                        try {
                            payload = CLM.ActionBase.GetPayload(action, Util.getDefaultEntityMap(this.props.entities))
                        }
                        catch {
                            // Backwards compatibility to models with old payload type
                        }
                        keys.push(payload)
                    }
                }

                const searchString = keys.join(' ').toLowerCase();
                return searchString.includes(searchValue);
            })
    }

    @autobind
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

    @autobind
    onAbortConflictChanges() {
        this.setState({
            conflictPairs: []
        })
    }

    @autobind
    onClickDeleteSelected() {
        this.setState({
            isConfirmDeleteModalOpen: true
        })
    }

    @autobind
    onClickCancelDelete() {
        this.setState({
            isConfirmDeleteModalOpen: false
        })
    }

    @autobind
    onClickConfirmDelete() {
        const logDialogs = this.selection.getSelection() as CLM.LogDialog[]
        const logDialogIds = logDialogs.map(logDialog => logDialog.logDialogId)
        this.props.deleteLogDialogsThunkAsync(this.props.app, logDialogIds, this.props.editingPackageId)
        this.setState({
            isConfirmDeleteModalOpen: false
        })
    }

    getFilteredAndSortedDialogs() {
        let computedLogDialogs = this.getFilteredDialogs(
            this.props.logDialogs,
            this.props.entities,
            this.props.actions,
            this.state.searchValue)

        computedLogDialogs = this.sortLogDialogs(computedLogDialogs, this.state.columns, this.state.sortColumn)
        return computedLogDialogs
    }

    render() {
        const { intl } = this.props
        const computedLogDialogs = this.getFilteredAndSortedDialogs()

        const editState = (this.props.editingPackageId !== this.props.app.devPackageId)
            ? EditState.INVALID_PACKAGE
            : this.props.invalidBot
                ? EditState.INVALID_BOT
                : EditState.CAN_EDIT

        const teachSession = (this.props.teachSession && this.props.teachSession.teach)
            ? this.props.teachSession
            : this.state.lastTeachSession

        const isPlaceholderVisible = this.props.logDialogs.length === 0

        const isEditingDisabled = this.props.editingPackageId !== this.props.app.devPackageId || this.props.invalidBot;
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
                        disabled={isEditingDisabled}
                        onClick={this.onClickNewChatSession}
                        ariaDescription={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                        text={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONTITLE)}
                        componentRef={this.newChatSessionButtonRef}
                        iconProps={{ iconName: 'Add' }}
                    />
                    <OF.DefaultButton
                        data-testid="logdialogs-button-refresh"
                        onClick={() => this.onClickSync()}
                        ariaDescription="Refresh"
                        text="Refresh"
                        iconProps={{ iconName: 'Sync' }}
                    />

                    <OF.DefaultButton
                        data-testid="logdialogs-button-deleteall"
                        className="cl-button-delete"
                        disabled={this.state.selectionCount === 0}
                        onClick={this.onClickDeleteSelected}
                        ariaDescription={Util.formatMessageId(intl, FM.LOGDIALOGS_BUTTON_DELETESELECTED, { selectionCount: this.state.selectionCount })}
                        text={Util.formatMessageId(intl, FM.LOGDIALOGS_BUTTON_DELETESELECTED, { selectionCount: this.state.selectionCount })}
                        iconProps={{ iconName: 'Delete' }}
                    />
                </div>

                    <div className={`cl-page-placeholder ${isPlaceholderVisible ? '' : 'cl-page-placeholder--none'}`}>
                        <div className="cl-page-placeholder__content">
                            <div className={`cl-page-placeholder__description ${OF.FontClassNames.xxLarge}`}>Create a Log Dialog</div>
                            <OF.PrimaryButton
                                iconProps={{
                                    iconName: "Add"
                                }}
                                disabled={isEditingDisabled}
                                onClick={this.onClickNewChatSession}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                                text={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONTITLE)}
                            />
                        </div>
                    </div>
                    <>
                        <div className={isPlaceholderVisible ? 'cl-hidden' : ''}>
                            <OF.Label htmlFor="logdialogs-input-search" className={OF.FontClassNames.medium}>
                                Search:
                            </OF.Label>
                            <OF.SearchBox
                                id="logdialogs-input-search"
                                data-testid="logdialogs-search-box"
                                className={OF.FontClassNames.mediumPlus}
                                onChange={this.onChangeSearchString}
                                onSearch={this.onSearch}
                            />
                        </div>
                        <OF.DetailsList
                            data-testid="logdialogs-details-list"
                            key={this.state.dialogKey}
                            className={`${OF.FontClassNames.mediumPlus} ${isPlaceholderVisible ? 'cl-hidden' : ''}`}
                            items={computedLogDialogs}
                            selection={this.selection}
                            getKey={getDialogKey}
                            setKey="selectionKey"
                            columns={this.state.columns}
                            checkboxVisibility={OF.CheckboxVisibility.onHover}
                            onColumnHeaderClick={this.onClickColumnHeader}
                            onRenderRow={(props, defaultRender) => <div data-selection-invoke={true}>{defaultRender && defaultRender(props)}</div>}
                            onRenderItemColumn={(logDialog, i, column: IRenderableColumn) => returnErrorStringWhenError(() => column.render(logDialog, this))}
                            onItemInvoked={logDialog => this.onClickLogDialogItem(logDialog)}
                        />
                    </>


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
                        onEditTeach={(activityIndex, editHandlerArgs, tags, description, editHandler) => this.onEditTeach(activityIndex, editHandlerArgs ? editHandlerArgs : undefined, tags, description, editHandler)}
                        onInsertAction={(trainDialog, activity, editHandlerArgs) => this.onInsertAction(trainDialog, activity, editHandlerArgs.isLastActivity!)}
                        onInsertInput={(trainDialog, activity, editHandlerArgs) => this.onInsertInput(trainDialog, activity, editHandlerArgs.userInput)}
                        onDeleteTurn={(trainDialog, activity) => this.onDeleteTurn(trainDialog, activity)}
                        onChangeExtraction={(trainDialog, activity, editHandlerArgs) => this.onChangeExtraction(trainDialog, activity, editHandlerArgs.extractResponse, editHandlerArgs.textVariations)}
                        onChangeAction={(trainDialog, activity, editHandlerArgs) => this.onChangeAction(trainDialog, activity, editHandlerArgs.trainScorerStep)}
                        onEndSessionActivity={this.onEndSessionActivity}
                        onReplayDialog={(trainDialog) => this.onReplayTrainDialog(trainDialog)}
                        editType={this.state.editType}
                        initialHistory={this.state.activityHistory}
                        lastAction={this.state.lastAction}
                        sourceTrainDialog={this.state.currentTrainDialog}
                        allUniqueTags={this.props.allUniqueTags}
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
                    originalTrainDialog={null}
                    activityHistory={this.state.activityHistory}
                    initialSelectedActivityIndex={this.state.selectedActivityIndex}
                    editType={this.state.editType}
                    onInsertAction={(trainDialog, activity, isLastActivity) => this.onInsertAction(trainDialog, activity, isLastActivity)}
                    onInsertInput={(trainDialog, activity, userInput) => this.onInsertInput(trainDialog, activity, userInput)}
                    onDeleteTurn={(trainDialog, activity) => this.onDeleteTurn(trainDialog, activity)}
                    onChangeExtraction={(trainDialog, activity, extractResponse, textVariations) => this.onChangeExtraction(trainDialog, activity, extractResponse, textVariations)}
                    onChangeAction={(trainDialog: CLM.TrainDialog, activity: BB.Activity, trainScorerStep: CLM.TrainScorerStep) => this.onChangeAction(trainDialog, activity, trainScorerStep)}
                    onBranchDialog={null} // Never branch on LogDialogs
                    onCloseModal={(reload) => this.onCloseEditDialogModal(reload)}
                    onDeleteDialog={this.onDeleteLogDialog}
                    onContinueDialog={(editedTrainDialog, initialUserInput) => this.onContinueTrainDialog(editedTrainDialog, initialUserInput)}
                    onSaveDialog={(editedTrainDialog) => this.onSaveTrainDialog(editedTrainDialog)}
                    onReplayDialog={(editedTrainDialog) => this.onReplayTrainDialog(editedTrainDialog)}
                    onCreateDialog={() => { }}
                    allUniqueTags={this.props.allUniqueTags}
                />
                <LogConversionConflictModal
                    title={Util.formatMessageId(intl, FM.LOGCONVERSIONCONFLICTMODAL_SUBTITLE)}
                    open={this.state.conflictPairs.length > 0}
                    entities={this.props.entities}
                    conflictPairs={this.state.conflictPairs}
                    onClose={this.onAbortConflictChanges}
                    onAccept={this.onAcceptConflictChanges}
                />
                <ConfirmCancelModal
                    open={this.state.isConfirmDeleteModalOpen}
                    onCancel={this.onClickCancelDelete}
                    onConfirm={this.onClickConfirmDelete}
                    title={Util.formatMessageId(intl, FM.LOGDIALOGS_CONFIRMCANCEL_DELETESELECTED, { selectionCount: this.state.selectionCount })}
                />
            </div>
        );
    }

    private focusNewChatButton() {
        if (this.newChatSessionButtonRef.current) {
            this.newChatSessionButtonRef.current.focus()
        }
    }

    private async openLogDialog(logDialog: CLM.LogDialog) {
        // Reset WebChat scroll position
        this.props.clearWebchatScrollPosition()

        // Convert to trainDialog until schema update change, and pass in app definition too
        const trainDialog = CLM.ModelUtils.ToTrainDialog(logDialog, this.props.actions, this.props.entities)

        try {
            const teachWithActivities = await ((this.props.fetchActivitiesThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithActivities>)

            this.setState({
                activityHistory: teachWithActivities.activities,
                lastAction: teachWithActivities.lastAction,
                currentLogDialogId: logDialog.logDialogId,
                currentTrainDialog: CLM.ModelUtils.ToTrainDialog(logDialog),
                isEditDialogModalOpen: true,
                editType: EditDialogType.LOG_ORIGINAL,
                validationErrors: teachWithActivities.replayErrors
            })
        }
        catch (error) {
            console.warn(`Error when attempting to create activityHistory: `, error)
        }
    }

    // User has edited an Activity in a TeachSession
    private async onEditTeach(
        activityIndex: number | null,
        args: DialogEditing.EditHandlerArgs | undefined,
        tags: string[],
        description: string,
        editHandler: (trainDialog: CLM.TrainDialog, activity: BB.Activity, args?: DialogEditing.EditHandlerArgs) => any
    ) {
        try {
            if (!this.props.teachSession.teach) {
                return
            }

            await DialogEditing.onEditTeach(
                activityIndex,
                args,
                tags,
                description,
                editHandler,
                this.props.teachSession.teach,
                this.props.app,
                this.props.user,
                this.props.actions,
                this.props.entities,
                this.props.fetchTrainDialogThunkAsync as any,
                this.props.deleteTeachSessionThunkAsync as any,
                this.props.fetchActivitiesThunkAsync as any,
            )
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
        createActionThunkAsync: actions.action.createActionThunkAsync,
        createChatSessionThunkAsync: actions.chat.createChatSessionThunkAsync,
        createTeachSessionFromTrainDialogThunkAsync: actions.teach.createTeachSessionFromTrainDialogThunkAsync,
        createTrainDialogThunkAsync: actions.train.createTrainDialogThunkAsync,
        deleteLogDialogThunkAsync: actions.log.deleteLogDialogThunkAsync,
        deleteLogDialogsThunkAsync: actions.log.deleteLogDialogsThunkAsync,
        deleteTeachSessionThunkAsync: actions.teach.deleteTeachSessionThunkAsync,
        deleteTrainDialogThunkAsync: actions.train.deleteTrainDialogThunkAsync,
        editActionThunkAsync: actions.action.editActionThunkAsync,
        editTrainDialogThunkAsync: actions.train.editTrainDialogThunkAsync,
        extractFromTrainDialogThunkAsync: actions.train.extractFromTrainDialogThunkAsync,
        fetchLogDialogAsync: actions.log.fetchLogDialogThunkAsync,
        fetchAllLogDialogsThunkAsync: actions.log.fetchAllLogDialogsThunkAsync,
        fetchActivitiesThunkAsync: actions.train.fetchActivitiesThunkAsync,
        fetchTrainDialogThunkAsync: actions.train.fetchTrainDialogThunkAsync,
        trainDialogMergeThunkAsync: actions.train.trainDialogMergeThunkAsync,
        trainDialogReplaceThunkAsync: actions.train.trainDialogReplaceThunkAsync,
        scoreFromTrainDialogThunkAsync: actions.train.scoreFromTrainDialogThunkAsync,
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
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(LogDialogs)))