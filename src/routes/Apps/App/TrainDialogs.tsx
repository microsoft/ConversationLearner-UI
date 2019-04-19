/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as Util from '../../../Utils/util'
import * as ValidityUtils from '../../../Utils/validityUtils'
import * as DialogEditing from '../../../Utils/dialogEditing'
import * as DialogUtils from '../../../Utils/dialogUtils'
import * as OF from 'office-ui-fabric-react'
import * as moment from 'moment'
import FormattedMessageId from '../../../components/FormattedMessageId'
import actions from '../../../actions'
import TreeView from '../../../components/modals/TreeView/TreeView'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { returntypeof } from 'react-redux-typescript'
import { State } from '../../../types'
import { SelectionType } from '../../../types/const'
import { TeachSessionModal, EditDialogModal, EditDialogType, EditState, MergeModal } from '../../../components/modals'
import { injectIntl, InjectedIntl, InjectedIntlProps, } from 'react-intl'
import { FM } from '../../../react-intl-messages'
import { Activity } from 'botframework-directlinejs'
import { TeachSessionState } from '../../../types/StateTypes'

interface IRenderableColumn extends OF.IColumn {
    render: (x: CLM.TrainDialog, component: TrainDialogs) => React.ReactNode
    getSortValue: (trainDialog: CLM.TrainDialog, component: TrainDialogs) => string
}

const returnErrorStringWhenError = Util.returnStringWhenError("ERR")

function textClassName(trainDialog: CLM.TrainDialog): string {
    if (trainDialog.validity === CLM.Validity.INVALID) {
        return `${OF.FontClassNames.mediumPlus} cl-font--highlight`;
    }
    return OF.FontClassNames.mediumPlus!;
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    const equalizeColumnWidth = window.innerWidth / 3
    return [
        {
            key: `description`,
            name: Util.formatMessageId(intl, FM.TRAINDIALOGS_DESCRIPTION),
            fieldName: `description`,
            minWidth: 100,
            maxWidth: equalizeColumnWidth,
            isResizable: true,
            render: (trainDialog, component) => {
                // TODO: Keep firstInput and lastInput available in DOM until tests are upgraded */}
                const firstInput = DialogUtils.trainDialogFirstInput(trainDialog)
                const lastInput = DialogUtils.trainDialogLastInput(trainDialog)
                const lastResponse = DialogUtils.trainDialogLastResponse(trainDialog, component.props.actions, component.props.entities)

                return <>
                    <span className={textClassName(trainDialog)}>
                        {trainDialog.validity && trainDialog.validity !== CLM.Validity.VALID &&
                            <OF.Icon
                                className={`cl-icon ${ValidityUtils.validityColorClassName(trainDialog.validity)}`}
                                iconName="IncidentTriangle"
                                data-testid="train-dialogs-validity-indicator"
                            />
                        }
                        <span data-testid="train-dialogs-description">
                            {DialogUtils.trainDialogRenderDescription(trainDialog)}
                        </span>
                    </span>
                    {/* TODO: Keep firstInput and lastInput available in DOM until tests are upgraded */}
                    <span style={{ display: "none" }} data-testid="train-dialogs-first-input">{firstInput ? firstInput : ''}</span>
                    <span style={{ display: "none" }} data-testid="train-dialogs-last-input">{lastInput ? lastInput : ''}</span>
                    <span style={{ display: "none" }} data-testid="train-dialogs-last-response">{lastResponse ? lastResponse : ''}</span>
                </>
            },
            getSortValue: trainDialog => trainDialog.description
        },
        {
            key: `tags`,
            name: Util.formatMessageId(intl, FM.TRAINDIALOGS_TAGS),
            fieldName: `tags`,
            minWidth: 100,
            maxWidth: equalizeColumnWidth,
            isResizable: true,
            render: trainDialog => DialogUtils.trainDialogRenderTags(trainDialog),
            getSortValue: trainDialog => trainDialog.tags.join(' ')
        },
        {
            key: 'turns',
            name: Util.formatMessageId(intl, FM.TRAINDIALOGS_TURNS),
            fieldName: 'dialog',
            minWidth: 50,
            maxWidth: 50,
            isResizable: false,
            render: trainDialog => {
                const count = trainDialog.rounds ? trainDialog.rounds.length : 0
                return <span className={textClassName(trainDialog)} data-testid="train-dialogs-turns">{count}</span>
            },
            getSortValue: trainDialog => (trainDialog.rounds ? trainDialog.rounds.length : 0).toString().padStart(4, '0')
        },
        {
            key: 'lastModifiedDateTime',
            name: Util.formatMessageId(intl, FM.TRAINDIALOGS_LAST_MODIFIED_DATE_TIME),
            fieldName: 'lastModifiedDateTime',
            minWidth: 100,
            isResizable: false,
            isSortedDescending: false,
            render: trainDialog => <span className={OF.FontClassNames.mediumPlus} data-testid="train-dialogs-last-modified">{Util.earlierDateOrTimeToday(trainDialog.lastModifiedDateTime)}</span>,
            getSortValue: trainDialog => moment(trainDialog.lastModifiedDateTime).valueOf().toString()
        },
        {
            key: 'created',
            name: Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATED_DATE_TIME),
            fieldName: 'created',
            minWidth: 100,
            isResizable: false,
            render: trainDialog => <span className={OF.FontClassNames.mediumPlus} data-testid="train-dialogs-created">{Util.earlierDateOrTimeToday(trainDialog.createdDateTime)}</span>,
            getSortValue: trainDialog => moment(trainDialog.createdDateTime).valueOf().toString()
        }
    ]
}

interface ComponentState {
    columns: OF.IColumn[]
    sortColumn: IRenderableColumn
    history: Activity[]
    lastAction: CLM.ActionBase | null
    isTeachDialogModalOpen: boolean
    isEditDialogModalOpen: boolean
    isTreeViewModalOpen: boolean
    mergeExistingTrainDialog: CLM.TrainDialog | null
    mergeNewTrainDialog: CLM.TrainDialog | null
    // Item selected in webchat window
    selectedActivityIndex: number | null
    // Current train dialogs being edited
    currentTrainDialog: CLM.TrainDialog | null
    // If Train Dialog was edited, the original one
    originalTrainDialog: CLM.TrainDialog | null,
    // Is Dialog being edited a new one, a TrainDialog or a LogDialog
    editType: EditDialogType
    searchValue: string,
    dialogKey: number,
    tagsFilter: OF.IDropdownOption | null
    entityFilter: OF.IDropdownOption | null
    actionFilter: OF.IDropdownOption | null
    // Used to prevent screen from flashing when transition to Edit Page
    lastTeachSession: TeachSessionState | null
}

class TrainDialogs extends React.Component<Props, ComponentState> {
    newTeachSessionButton: OF.IButton
    state: ComponentState

    constructor(props: Props) {
        super(props)
        const columns = getColumns(this.props.intl)
        const lastModifiedColumn = columns.find(c => c.key === 'lastModifiedDateTime')!
        this.state = {
            columns: columns,
            sortColumn: lastModifiedColumn,
            history: [],
            lastAction: null,
            isTeachDialogModalOpen: false,
            isEditDialogModalOpen: false,
            isTreeViewModalOpen: false,
            mergeExistingTrainDialog: null,
            mergeNewTrainDialog: null,
            selectedActivityIndex: null,
            currentTrainDialog: null,
            originalTrainDialog: null,
            editType: EditDialogType.TRAIN_ORIGINAL,
            searchValue: '',
            dialogKey: 0,
            tagsFilter: null,
            entityFilter: null,
            actionFilter: null,
            lastTeachSession: null
        }
    }

    componentDidMount() {
        this.newTeachSessionButton.focus();
        if (this.props.filteredAction) {
            this.setState({
                actionFilter: this.toActionFilter(this.props.filteredAction, this.props.entities)
            })
        }
        if (this.props.filteredEntity) {
            this.setState({
                entityFilter: this.toEntityFilter(this.props.filteredEntity)
            })
        }
    }

    componentWillReceiveProps(newProps: Props) {
        // Prevent flash when switching to EditDialogModal by keeping teach session around
        // after teach session has been terminated
        // Will go away once Edit/Teach dialogs are merged
        if (newProps.teachSession && newProps.teachSession.teach && newProps.teachSession !== this.props.teachSession) {
            this.setState({
                lastTeachSession: { ...this.props.teachSession }
            })
        }
        if (newProps.filteredAction && this.props.filteredAction !== newProps.filteredAction) {
            this.setState({
                actionFilter: this.toActionFilter(newProps.filteredAction, newProps.entities)
            })
        }
        if (newProps.filteredEntity && this.props.filteredEntity !== newProps.filteredEntity) {
            this.setState({
                entityFilter: this.toEntityFilter(newProps.filteredEntity)
            })
        }
        // If train dialogs have been updated, update selected trainDialog too
        if (this.props.trainDialogs !== newProps.trainDialogs) {
            this.newTeachSessionButton.focus();
        }
    }

    sortTrainDialogs(trainDialogs: CLM.TrainDialog[]): CLM.TrainDialog[] {
        const trainDialogsCopy = [...trainDialogs]
        // If column header selected sort the items, always putting invalid at the top
        if (this.state.sortColumn) {
            trainDialogsCopy
                .sort((a, b) => {

                    // Always put invalid at top (values can also be undefined)
                    if (a.validity === CLM.Validity.INVALID && b.validity !== CLM.Validity.INVALID) {
                        return -1;
                    }
                    if (b.validity === CLM.Validity.INVALID && a.validity !== CLM.Validity.INVALID) {
                        return 1;
                    }

                    // Then sort by column value
                    let firstValue = this.state.sortColumn.getSortValue(a, this)
                    let secondValue = this.state.sortColumn.getSortValue(b, this)
                    let compareValue = firstValue.localeCompare(secondValue)

                    // If primary sort is the same do secondary sort on another column, to prevent sort jumping around
                    if (compareValue === 0) {
                        const sortColumn2 = ((this.state.sortColumn !== this.state.columns[0]) ? this.state.columns[0] : this.state.columns[1]) as IRenderableColumn
                        firstValue = sortColumn2.getSortValue(a, this)
                        secondValue = sortColumn2.getSortValue(b, this)
                        compareValue = firstValue.localeCompare(secondValue)
                    }

                    return this.state.sortColumn.isSortedDescending
                        ? compareValue
                        : compareValue * -1
                })
        }

        return trainDialogsCopy
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

    toActionFilter(action: CLM.ActionBase, entities: CLM.EntityBase[]): OF.IDropdownOption | null {
        try {
            return {
                key: action.actionId,
                text: CLM.ActionBase.GetPayload(action, Util.getDefaultEntityMap(entities))
            }
        }
        catch {
            // Action could have an invalid payload
            return null
        }

    }

    toEntityFilter(entity: CLM.EntityBase): OF.IDropdownOption {
        return {
            key: entity.entityId,
            text: entity.entityName,
            data: entity.negativeId
        }
    }

    @OF.autobind
    onSelectTagsFilter(item: OF.IDropdownOption) {
        this.setState({
            tagsFilter: (item.key !== -1) ? item : null
        })
    }

    @OF.autobind
    onSelectEntityFilter(item: OF.IDropdownOption) {
        this.setState({
            entityFilter: (-1 != item.key) ? item : null
        })
    }

    @OF.autobind
    onSelectActionFilter(item: OF.IDropdownOption) {
        this.setState({
            actionFilter: (item.key !== -1) ? item : null
        })
    }

    @OF.autobind
    async onSetInitialEntities(initialFilledEntityMap: CLM.FilledEntityMap) {

        if (this.props.teachSession.teach) {

            await Util.setStateAsync(this, {
                lastTeachSession: { ...this.props.teachSession }
            })

            await this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app)

            // Create new one with initial entities
            await this.onClickNewTeachSession(initialFilledEntityMap)
        }
    }

    async onClickNewTeachSession(initialFilledEntityMap: CLM.FilledEntityMap | null = null) {
        try {
            await this.props.createTeachSessionThunkAsync(this.props.app.appId, initialFilledEntityMap)

            this.setState({
                isTeachDialogModalOpen: true,
                editType: EditDialogType.NEW,
                currentTrainDialog: null,
                originalTrainDialog: null
            })
        }
        catch (error) {
            console.warn(`Error when attempting to create teach session: `, error)
        }
    }

    // If editing an existing train dialog, return its Id, otherwise null
    sourceTrainDialogId(): string | null {
        if (this.state.currentTrainDialog 
            && this.state.editType !== EditDialogType.BRANCH
            && this.state.editType !== EditDialogType.NEW) {
                return this.state.currentTrainDialog.trainDialogId
            }
        return null
    }

    @OF.autobind
    async onCloseTeachSession(save: boolean, tags: string[] = [], description: string = '') {
        if (this.props.teachSession && this.props.teachSession.teach) {
            // Delete the teach session unless it was already closed with and EndSessionAction
            if (this.props.teachSession.dialogMode !== CLM.DialogMode.EndSession) {

                if (save) {

                    // If editing an existing train dialog, extract its dialogId
                    const sourceTrainDialogId = this.sourceTrainDialogId()

                    // Delete the teach session and retreive the new TrainDialog
                    const newTrainDialog = await ((this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app, true, sourceTrainDialogId) as any) as Promise<CLM.TrainDialog>)
                    newTrainDialog.tags = tags
                    newTrainDialog.description = description

                    // Check to see if new TrainDialog can be merged with an exising TrainDialog
                    const matchingTrainDialog = DialogUtils.findMatchingTrainDialog(newTrainDialog, this.props.trainDialogs, sourceTrainDialogId)

                    if (matchingTrainDialog) {
                        this.setState({
                            mergeExistingTrainDialog: matchingTrainDialog,
                            mergeNewTrainDialog: newTrainDialog,
                            isTeachDialogModalOpen: false
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
                    }
                }
                // Just delete the teach session without saving
                else {
                    await this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app)
                }
            }
        }
        this.setState({
            isTeachDialogModalOpen: false,
            history: [],
            lastAction: null,
            currentTrainDialog: null,
            // originalTrainDialogId - do not clear. Need for later 
            dialogKey: this.state.dialogKey + 1
        })
    }

    @OF.autobind
    async onInsertAction(trainDialog: CLM.TrainDialog, selectedActivity: Activity, isLastActivity: boolean, selectionType: SelectionType) {
        try {
            const newTrainDialog = await DialogEditing.onInsertAction(
                trainDialog,
                selectedActivity,
                isLastActivity,
                this.props.entities,
                this.props.actions,
                this.props.app.appId,
                this.props.scoreFromHistoryThunkAsync as any,
                this.props.clearWebchatScrollPosition,
            )

            await this.onUpdateHistory(newTrainDialog, selectedActivity, selectionType, this.state.editType)
        }
        catch (error) {
            console.warn(`Error when attempting to insert an Action `, { error })
        }
    }

    @OF.autobind
    async onChangeAction(trainDialog: CLM.TrainDialog, selectedActivity: Activity, trainScorerStep: CLM.TrainScorerStep | undefined) {
        if (!trainScorerStep) {
            throw new Error(`You attempted to change an Action but the step you are editing was undefined. Please open an issue.`)
        }

        try {
            const newTrainDialog = await DialogEditing.onChangeAction(
                trainDialog,
                selectedActivity,
                trainScorerStep,
                this.props.app.appId,
                this.props.entities,
                this.props.actions,
                this.props.trainDialogReplayThunkAsync as any,
            )

            await this.onUpdateHistory(newTrainDialog, selectedActivity, SelectionType.NONE, this.state.editType)
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
            const newTrainDialog = await DialogEditing.onChangeExtraction(
                trainDialog,
                selectedActivity,
                textVariations,

                this.props.app.appId,
                this.props.entities,
                this.props.actions,
                this.props.trainDialogReplayThunkAsync as any,
            )

            await this.onUpdateHistory(newTrainDialog, selectedActivity, SelectionType.NONE, this.state.editType)
        }
        catch (error) {
            console.warn(`Error when attempting to change extraction: `, error)
        }
    }

    @OF.autobind
    async onDeleteTurn(trainDialog: CLM.TrainDialog, selectedActivity: Activity) {
        const newTrainDialog = await DialogEditing.onDeleteTurn(
            trainDialog,
            selectedActivity,
            this.props.app.appId,
            this.props.entities,
            this.props.actions,
            this.props.trainDialogReplayThunkAsync as any,
        )

        await this.onUpdateHistory(newTrainDialog, selectedActivity, SelectionType.CURRENT, this.state.editType)
    }

    @OF.autobind
    async onReplayTrainDialog(trainDialog: CLM.TrainDialog) {
        try {
            const newTrainDialog = await DialogEditing.onReplayTrainDialog(
                trainDialog,
                this.props.app.appId,
                this.props.entities,
                this.props.actions,
                this.props.trainDialogReplayThunkAsync as any,
            )

            await this.onUpdateHistory(newTrainDialog, null, SelectionType.NONE, this.state.editType)
        }
        catch (error) {
            console.warn(`Error when attempting to Replay a train dialog: `, error)
        }
    }

    @OF.autobind
    async onBranchTrainDialog(trainDialog: CLM.TrainDialog, selectedActivity: Activity, inputText: string) {

        try {
            const clData: CLM.CLChannelData = selectedActivity.channelData.clData
            const roundIndex = clData.roundIndex!
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            // Copy, Remove rounds / scorer steps below branch
            let newTrainDialog = Util.deepCopy(trainDialog)
            newTrainDialog.definitions = definitions
            newTrainDialog.rounds = newTrainDialog.rounds.slice(0, roundIndex)

            const userInput: CLM.UserInput = { text: inputText }

            // Get extraction
            const extractResponse = await ((this.props.extractFromHistoryThunkAsync(this.props.app.appId, newTrainDialog, userInput) as any) as Promise<CLM.ExtractResponse>)

            if (!extractResponse) {
                throw new Error("No extract response")
            }

            const textVariations = CLM.ModelUtils.ToTextVariations([extractResponse])
            const extractorStep: CLM.TrainExtractorStep = { textVariations }

            // Create new round
            const newRound = {
                extractorStep,
                scorerSteps: []
            }

            // Append new Round
            newTrainDialog.rounds.push(newRound)

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            // Allow to scroll to bottom
            this.props.clearWebchatScrollPosition()

            await this.onUpdateHistory(newTrainDialog, selectedActivity, SelectionType.NONE, EditDialogType.BRANCH)
        }
        catch (error) {
            console.warn(`Error when attempting to create teach session from history: `, error)
        }
    }

    @OF.autobind
    async onInsertInput(trainDialog: CLM.TrainDialog, selectedActivity: Activity, inputText: string, selectionType: SelectionType) {
        try {
            const newTrainDialog = await DialogEditing.onInsertInput(
                trainDialog,
                selectedActivity,
                inputText,

                this.props.app.appId,
                this.props.entities,
                this.props.actions,
                this.props.extractFromHistoryThunkAsync as any,
                this.props.trainDialogReplayThunkAsync as any,
                this.props.clearWebchatScrollPosition,
            )

            await this.onUpdateHistory(newTrainDialog, selectedActivity, selectionType, this.state.editType)
        }
        catch (error) {
            console.warn(`Error when attempting to create teach session from history: `, error)
        }
    }

    @OF.autobind
    onCloseTreeView() {
        this.setState({ isTreeViewModalOpen: false })
    }

    @OF.autobind
    onOpenTreeView() {
        this.setState({ isTreeViewModalOpen: true })
    }

    @OF.autobind
    async onCloseMergeModal(shouldMerge: boolean, description: string = "", tags: string[] = []) {

        if (!this.state.mergeNewTrainDialog || !this.state.mergeExistingTrainDialog) {
            throw new Error("Expected merge props to be set")
        }

        // If editing an existing train dialog, extract its dialogId
        const sourceTrainDialogId = this.sourceTrainDialogId()

        if (shouldMerge) {
            await this.props.trainDialogMergeThunkAsync(this.props.app.appId, this.state.mergeNewTrainDialog, this.state.mergeExistingTrainDialog, description, tags, sourceTrainDialogId)
        }
        else {
            // If editing an existing Train Dialog, replace existing with the new one
            if (sourceTrainDialogId) {
                await this.props.trainDialogReplaceThunkAsync(this.props.app.appId, sourceTrainDialogId, this.state.mergeNewTrainDialog)
            }
        }
        this.setState({
            mergeExistingTrainDialog: null,
            mergeNewTrainDialog: null,
            isTeachDialogModalOpen: false,
            history: [],
            lastAction: null,
            currentTrainDialog: null,
            // originalTrainDialogId - do not clear. Need for later 
            dialogKey: this.state.dialogKey + 1
        })
    }

    onDeleteTrainDialog() {
        if (!this.state.currentTrainDialog) {
            throw new Error(`You attempted to delete a train dialog, but currentTrainDialog is not defined. Please open an issue.`)
        }

        this.setState({
            isEditDialogModalOpen: false,
        })

        const deleteDialogId = this.state.currentTrainDialog.trainDialogId
        this.props.deleteTrainDialogThunkAsync(this.props.app, deleteDialogId)
        this.props.fetchApplicationTrainingStatusThunkAsync(this.props.app.appId)
        void this.onCloseEditDialogModal();
    }

    // End Session activity selected.  Switch from Teach to Edit
    @OF.autobind
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
                await this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app)
  
                // Generate history
                await this.onUpdateHistory(trainDialog, null, SelectionType.NONE, this.state.editType)
            }
        }
        catch (error) {
            console.warn(`Error when attempting to use EndSession Action`, error)
        }
    }

    @OF.autobind
    async onUpdateHistory(newTrainDialog: CLM.TrainDialog, selectedActivity: Activity | null, selectionType: SelectionType, editDialogType: EditDialogType) {
        const originalId = this.state.originalTrainDialog || this.state.currentTrainDialog 

        try {
            const { teachWithHistory, activityIndex } = await DialogEditing.onUpdateHistory(
                newTrainDialog,
                selectedActivity,
                selectionType,

                this.props.app.appId,
                this.props.user,
                this.props.fetchHistoryThunkAsync as any
            )

            const editType = (editDialogType !== EditDialogType.NEW && editDialogType !== EditDialogType.BRANCH) 
                ? EditDialogType.TRAIN_EDITED 
                : editDialogType

            this.setState({
                history: teachWithHistory.history,
                lastAction: teachWithHistory.lastAction,
                currentTrainDialog: newTrainDialog,
                originalTrainDialog: originalId,
                selectedActivityIndex: activityIndex,
                isEditDialogModalOpen: true,
                isTeachDialogModalOpen: false,
                editType
            })
        }
        catch (error) {
            console.warn(`Error when attempting to update history: `, error)
        }
    }

    async onContinueTrainDialog(newTrainDialog: CLM.TrainDialog, initialUserInput: CLM.UserInput) {

        try {
            if (this.props.teachSession && this.props.teachSession.teach) {
                // Delete the teach session w/o saving
                await this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app)
            }

            const conflictIgnoreId = this.state.currentTrainDialog ? this.state.currentTrainDialog.trainDialogId : null
            const teachWithHistory = await ((this.props.createTeachSessionFromHistoryThunkAsync(this.props.app, newTrainDialog, this.props.user.name, this.props.user.id, initialUserInput, conflictIgnoreId) as any) as Promise<CLM.TeachWithHistory>)

            const editType = (this.state.editType !== EditDialogType.NEW && this.state.editType !== EditDialogType.BRANCH) ?
                EditDialogType.TRAIN_EDITED : this.state.editType

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
                selectedActivityIndex: null,
                isTeachDialogModalOpen: true,
                editType,
                currentTrainDialog
            })
        }
        catch (error) {
            console.warn(`Error when attempting to Continue a train dialog: `, error)
        }
    }

    // Replace the current trainDialog with a new one
    async onReplaceTrainDialog(newTrainDialog: CLM.TrainDialog, validity?: CLM.Validity) {

        this.setState({
            isEditDialogModalOpen: false,
        })

        try {
            const originalTrainDialogId = this.state.originalTrainDialog ? this.state.originalTrainDialog.trainDialogId : null
            
            // Remove any data added for rendering 
            DialogUtils.cleanTrainDialog(newTrainDialog)

            newTrainDialog.validity = validity
            newTrainDialog.trainDialogId = originalTrainDialogId || newTrainDialog.trainDialogId
            newTrainDialog.definitions = null

            // Check to see if it can be merged with an existing TrainDialog
            const matchedTrainDialog = DialogUtils.findMatchingTrainDialog(newTrainDialog, this.props.trainDialogs, originalTrainDialogId)
            if (matchedTrainDialog) {
                // Open model to ask user if they want to merge
                this.setState({
                    mergeExistingTrainDialog: matchedTrainDialog,
                    mergeNewTrainDialog: newTrainDialog
                })
                return
            }
            // Otherwise save as a new TrainDialog
            else {
                await this.props.editTrainDialogThunkAsync(this.props.app.appId, newTrainDialog)
            }
        }
        catch (error) {
            console.warn(`Error when attempting to replace an edited train dialog: `, error)
        }

        await this.onCloseEditDialogModal()
    }

    // Create a new trainDialog 
    async onCreateTrainDialog(newTrainDialog: CLM.TrainDialog, validity?: CLM.Validity) {

        this.setState({
            isEditDialogModalOpen: false,
        })

        newTrainDialog.validity = validity

        // Remove dummy scorer rounds used for rendering
        newTrainDialog.rounds.forEach(r => r.scorerSteps = r.scorerSteps.filter(ss => {
            return ss.labelAction !== undefined
        }))

        try {
            await ((this.props.createTrainDialogThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>);
        }
        catch (error) {
            console.warn(`Error when attempting to create a train dialog: `, error)
        }

        void this.onCloseEditDialogModal()
    }

    @OF.autobind
    async openTrainDialog(trainDialog: CLM.TrainDialog, roundIndex: number, scoreIndex: number | null) {

        const selectedActivityIndex = DialogUtils.activityIndexFromRound(trainDialog, roundIndex, scoreIndex) || null
        this.onClickTrainDialogItem(trainDialog, selectedActivityIndex)
    }

    @OF.autobind
    async onClickTrainDialogItem(trainDialog: CLM.TrainDialog, selectedActivityIndex: number | null = null) {
        this.props.clearWebchatScrollPosition()
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
            },
        };

        try {
            const teachWithHistory = await ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialogWithDefinitions, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)

            this.setState({
                history: teachWithHistory.history,
                lastAction: teachWithHistory.lastAction,
                currentTrainDialog: trainDialog,
                originalTrainDialog: this.state.currentTrainDialog,
                editType: EditDialogType.TRAIN_ORIGINAL,
                isEditDialogModalOpen: true,
                selectedActivityIndex
            })
        }
        catch (e) {
            const error = e as Error
            console.warn(`Error when attempting to create history: `, error)
        }
    }

    async onCloseEditDialogModal(reload: boolean = false) {

        if (this.props.teachSession && this.props.teachSession.teach) {
            // Delete the teach session w/o saving
            await this.props.deleteTeachSessionThunkAsync(this.props.teachSession.teach, this.props.app)
        }

        if (reload && this.state.originalTrainDialog) {
            // Reload local copy
            await ((this.props.fetchTrainDialogThunkAsync(this.props.app.appId, this.state.originalTrainDialog.trainDialogId, true) as any) as Promise<CLM.TrainDialog>)
        }
        this.setState({
            isEditDialogModalOpen: false,
            selectedActivityIndex: null,
            currentTrainDialog: null,
            // originalTrainDialog: Do not clear.  Save for later 
            history: [],
            lastAction: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    onChangeSearchString(newValue: string) {
        const lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }

    getFilteredAndSortedDialogs(): CLM.TrainDialog[] {
        let filteredTrainDialogs: CLM.TrainDialog[] = []

        if (!this.state.searchValue && !this.state.entityFilter && !this.state.actionFilter && !this.state.tagsFilter) {
            filteredTrainDialogs = this.props.trainDialogs;
        } else {
            // TODO: Consider caching as not very efficient
            filteredTrainDialogs = this.props.trainDialogs.filter((t: CLM.TrainDialog) => {
                const entitiesInTD: CLM.EntityBase[] = []
                const actionsInTD: CLM.ActionBase[] = []
                const textVariations: string[] = []

                for (const round of t.rounds) {
                    for (const variation of round.extractorStep.textVariations) {
                        textVariations.push(variation.text);
                        for (const le of variation.labelEntities) {
                            // Include pos and neg examples of entity if reversable
                            const entity = this.props.entities.find(e => e.entityId === le.entityId)
                            if (!entity) {
                                continue
                            }

                            entitiesInTD.push(entity)
                            const negativeEntity = this.props.entities.find(e => e.entityId === entity.negativeId)
                            if (!negativeEntity) {
                                continue
                            }
                            entitiesInTD.push(negativeEntity)
                        }
                    }
                    for (const ss of round.scorerSteps) {
                        const foundAction = this.props.actions.find(a => a.actionId === ss.labelAction)
                        // Invalid train dialogs can contain deleted actions
                        if (!foundAction) {
                            continue
                        }

                        actionsInTD.push(foundAction)

                        // Need to check filledEntities for programmatic only entities
                        const entities = ss.input.filledEntities
                            .map((fe: any) => fe.entityId)
                            .filter(Util.notNullOrUndefined)
                            .map((entityId: any) => this.props.entities.find(e => e.entityId === entityId))
                            .filter(Util.notNullOrUndefined)

                        entitiesInTD.push(...entities)
                    }
                }

                // Filter out train dialogs that don't match filters (data = negativeId for multivalue)
                const entityFilter = this.state.entityFilter
                if (entityFilter && entityFilter.key
                    && !entitiesInTD.find(en => en.entityId === entityFilter.key)
                    && !entitiesInTD.find(en => en.entityId === entityFilter.data)) {
                    return false
                }
                const actionFilter = this.state.actionFilter
                if (actionFilter && actionFilter.key
                    && !actionsInTD.find(a => a.actionId === actionFilter.key)) {
                    return false
                }

                const tagFilter = this.state.tagsFilter
                if (tagFilter && tagFilter.key !== null
                    && !t.tags.map(t => t.toLowerCase()).includes(tagFilter.text.toLowerCase())) {
                    return false
                }

                const entityNames = entitiesInTD.map(e => e.entityName)
                const actionPayloads = actionsInTD.map(a => {
                    try {
                        return CLM.ActionBase.GetPayload(a, Util.getDefaultEntityMap(this.props.entities))
                    }
                    catch {
                        // Backwards compatibility to models with old payload type
                        return ""
                    }
                })

                // Then check search terms
                const searchString = [
                    ...textVariations,
                    ...actionPayloads,
                    ...entityNames,
                    ...t.tags,
                    t.description
                ].join(' ').toLowerCase()

                return searchString.includes(this.state.searchValue)
            })
        }

        filteredTrainDialogs = this.sortTrainDialogs(filteredTrainDialogs)
        return filteredTrainDialogs
    }

    render() {
        const { intl, trainDialogs } = this.props
        const computedTrainDialogs = this.getFilteredAndSortedDialogs()
        const editState = (this.props.editingPackageId !== this.props.app.devPackageId)
            ? EditState.INVALID_PACKAGE
            : this.props.invalidBot
                ? EditState.INVALID_BOT
                : EditState.CAN_EDIT

        // LastTeachSession used to prevent screen flash when moving between Edit and Teach pages
        const teachSession = (this.props.teachSession && this.props.teachSession.teach)
            ? this.props.teachSession
            : this.state.lastTeachSession

        return (
            <div className="cl-page">
                <div data-testid="train-dialogs-title" className={`cl-dialog-title cl-dialog-title--train ${OF.FontClassNames.xxLarge}`}>
                    <OF.Icon iconName="EditContact" />
                    <FormattedMessageId id={FM.TRAINDIALOGS_TITLE} />
                </div>
                {this.props.editingPackageId === this.props.app.devPackageId ?
                    <span data-testid="train-dialogs-subtitle" className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.TRAINDIALOGS_SUBTITLE} />
                    </span>
                    :
                    <span className="cl-errorpanel">Editing is only allowed in Master Tag</span>
                }
                <div className="cl-buttons-row">
                    <OF.PrimaryButton
                        data-testid="button-new-train-dialog"
                        disabled={this.props.editingPackageId !== this.props.app.devPackageId || this.props.invalidBot}
                        onClick={() => this.onClickNewTeachSession()}
                        ariaDescription={Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                        text={Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATEBUTTONTITLE)}
                        componentRef={component => this.newTeachSessionButton = component!}
                        iconProps={{ iconName: 'Add' }}
                    />
                    {this.state.isTreeViewModalOpen ?
                        <OF.DefaultButton
                            className="cl-rotate"
                            iconProps={{ iconName: 'AlignJustify' }}
                            onClick={this.onCloseTreeView}
                            ariaDescription={Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                            text={"List View"}//TODO
                        />
                        :
                        <OF.DefaultButton
                            className="cl-rotate"
                            iconProps={{ iconName: 'BranchFork2' }}
                            onClick={this.onOpenTreeView}
                            ariaDescription={Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                            text={"Tree View"}//TODO
                        />
                    }
                </div>

                <TreeView
                    open={this.state.isTreeViewModalOpen && !this.state.isEditDialogModalOpen && !teachSession}
                    app={this.props.app}
                    originalTrainDialogId={this.state.originalTrainDialog ? this.state.originalTrainDialog.trainDialogId : null}
                    sourceTrainDialog={this.state.currentTrainDialog}
                    editType={this.state.editType}
                    editState={editState}
                    editingPackageId={this.props.editingPackageId}
                    onCancel={this.onCloseTreeView}
                    openTrainDialog={this.openTrainDialog}
                />

                {trainDialogs.length === 0  &&
                    <div className="cl-page-placeholder">
                        <div className="cl-page-placeholder__content">
                            <div className={`cl-page-placeholder__description ${OF.FontClassNames.xxLarge}`}>Create a Train Dialog</div>
                            <OF.PrimaryButton
                                iconProps={{
                                    iconName: "Add"
                                }}
                                disabled={this.props.editingPackageId !== this.props.app.devPackageId || this.props.invalidBot}
                                onClick={() => this.onClickNewTeachSession()}
                                ariaDescription={Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                                text={Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATEBUTTONTITLE)}
                            />
                        </div>
                    </div>
                }
                {!this.state.isTreeViewModalOpen && trainDialogs.length !== 0 &&
                    <React.Fragment>
                        <div>
                            <OF.Label htmlFor="train-dialogs-input-search" className={OF.FontClassNames.medium}>
                                Search:
                            </OF.Label>
                            <OF.SearchBox
                                // TODO: This next line has no visible affect on the DOM, but test automation needs it!
                                data-testid="train-dialogs-input-search"
                                id="train-dialogs-input-search"
                                className={OF.FontClassNames.medium}
                                onChange={(newValue) => this.onChangeSearchString(newValue)}
                                onSearch={(newValue) => this.onChangeSearchString(newValue)}
                            />
                        </div>
                        <div className="cl-list-filters">
                            <OF.Dropdown
                                data-testid="dropdown-filter-by-tag"
                                ariaLabel={Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_TAGS_LABEL)}
                                label={Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_TAGS_LABEL)}
                                selectedKey={(this.state.tagsFilter ? this.state.tagsFilter.key : -1)}
                                onChanged={this.onSelectTagsFilter}
                                placeHolder={Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_TAGS_LABEL)}
                                options={this.props.allUniqueTags
                                    .map<OF.IDropdownOption>((tag, i) => ({
                                        key: i,
                                        text: tag
                                    }))
                                    .concat({ key: -1, text: Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_TAGS) })
                                }
                            />

                            <OF.Dropdown
                                data-testid="dropdown-filter-by-entity"
                                ariaLabel={Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_ENTITIES_LABEL)}
                                label={Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_ENTITIES_LABEL)}
                                selectedKey={(this.state.entityFilter ? this.state.entityFilter.key : -1)}
                                onChanged={this.onSelectEntityFilter}
                                placeHolder={Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_ENTITIES_LABEL)}
                                options={this.props.entities
                                    // Only show positive versions of negatable entities
                                    .filter(e => e.positiveId == null)
                                    .map(e => this.toEntityFilter(e))
                                    .concat({ key: -1, text: Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_ENTITIES), data: null })
                                }
                            />

                            <OF.Dropdown
                                data-testid="dropdown-filter-by-action"
                                ariaLabel={Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_ACTIONS_LABEL)}
                                label={Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_ACTIONS_LABEL)}
                                selectedKey={(this.state.actionFilter ? this.state.actionFilter.key : -1)}
                                onChanged={this.onSelectActionFilter}
                                placeHolder={Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_ACTIONS_LABEL)}
                                options={this.props.actions
                                    .map(a => this.toActionFilter(a, this.props.entities))
                                    .filter(s => s !== null)
                                    .concat({ key: -1, text: Util.formatMessageId(this.props.intl, FM.TRAINDIALOGS_FILTERING_ACTIONS) })
                                }
                            />
                        </div>
                        {computedTrainDialogs.length === 0
                            ? <div><OF.Icon iconName="Warning" className="cl-icon" /> No dialogs match the search criteria</div>
                            : <OF.DetailsList
                                data-testid="detail-list"
                                key={this.state.dialogKey}
                                className={OF.FontClassNames.mediumPlus}
                                items={computedTrainDialogs}
                                layoutMode={OF.DetailsListLayoutMode.justified}
                                columns={this.state.columns}
                                checkboxVisibility={OF.CheckboxVisibility.hidden}
                                onColumnHeaderClick={this.onClickColumnHeader}
                                onRenderItemColumn={(trainDialog, i, column: IRenderableColumn) => returnErrorStringWhenError(() => column.render(trainDialog, this))}
                                onActiveItemChanged={trainDialog => this.onClickTrainDialogItem(trainDialog)}
                            />}
                    </React.Fragment>}
                {teachSession && teachSession.teach &&
                    <TeachSessionModal
                        isOpen={this.state.isTeachDialogModalOpen}
                        app={this.props.app}
                        teachSession={teachSession}
                        editingPackageId={this.props.editingPackageId}
                        originalTrainDialogId={this.state.originalTrainDialog ? this.state.originalTrainDialog.trainDialogId : null}
                        onClose={this.onCloseTeachSession}
                        onEditTeach={(historyIndex, editHandlerArgs, tags, description, editHandler) => this.onEditTeach(historyIndex, editHandlerArgs ? editHandlerArgs : undefined, tags, description, editHandler)}
                        onInsertAction={(trainDialog, activity, editHandlerArgs) => this.onInsertAction(trainDialog, activity, editHandlerArgs.isLastActivity!, editHandlerArgs.selectionType!)}
                        onInsertInput={(trainDialog, activity, editHandlerArgs) => this.onInsertInput(trainDialog, activity, editHandlerArgs.userInput!, editHandlerArgs.selectionType!)}
                        onDeleteTurn={(trainDialog, activity) => this.onDeleteTurn(trainDialog, activity)}
                        onChangeExtraction={(trainDialog, activity, editHandlerArgs) => this.onChangeExtraction(trainDialog, activity, editHandlerArgs.extractResponse, editHandlerArgs.textVariations)}
                        onChangeAction={(trainDialog, activity, editHandlerArgs) => this.onChangeAction(trainDialog, activity, editHandlerArgs.trainScorerStep)}
                        onEndSessionActivity={this.onEndSessionActivity}
                        onReplayDialog={(trainDialog) => this.onReplayTrainDialog(trainDialog)}
                        onSetInitialEntities={this.onSetInitialEntities}
                        initialHistory={this.state.history}
                        editType={this.state.editType}
                        lastAction={this.state.lastAction}
                        sourceTrainDialog={this.state.currentTrainDialog}
                        allUniqueTags={this.props.allUniqueTags}

                        conflictPairs={[]}
                        onAbortConflictResolution={() => { }}
                        onAcceptConflictResolution={async () => { }}
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
                    originalTrainDialog={this.state.originalTrainDialog}
                    editingLogDialogId={null}
                    history={this.state.history}
                    initialSelectedActivityIndex={this.state.selectedActivityIndex}
                    editType={this.state.editType}
                    onCloseModal={(reload) => this.onCloseEditDialogModal(reload)}
                    onInsertAction={(trainDialog, activity, isLastActivity, selectionType) => this.onInsertAction(trainDialog, activity, isLastActivity, selectionType)}
                    onInsertInput={(trainDialog, activity, userInput, selectionType) => this.onInsertInput(trainDialog, activity, userInput, selectionType)}
                    onDeleteTurn={(trainDialog, activity) => this.onDeleteTurn(trainDialog, activity)}
                    onChangeExtraction={(trainDialog, activity, extractResponse, textVariations) => this.onChangeExtraction(trainDialog, activity, extractResponse, textVariations)}
                    onChangeAction={(trainDialog: CLM.TrainDialog, activity: Activity, trainScorerStep: CLM.TrainScorerStep) => this.onChangeAction(trainDialog, activity, trainScorerStep)}
                    onBranchDialog={(trainDialog, activity, userInput) => this.onBranchTrainDialog(trainDialog, activity, userInput)}
                    onDeleteDialog={() => this.onDeleteTrainDialog()}
                    onContinueDialog={(editedTrainDialog, initialUserInput) => this.onContinueTrainDialog(editedTrainDialog, initialUserInput)}
                    onSaveDialog={(editedTrainDialog, validity) => this.onReplaceTrainDialog(editedTrainDialog, validity)}
                    onReplayDialog={(editedTrainDialog) => this.onReplayTrainDialog(editedTrainDialog)}
                    onCreateDialog={(newTrainDialog, validity) => this.onCreateTrainDialog(newTrainDialog, validity)}
                    allUniqueTags={this.props.allUniqueTags}

                    conflictPairs={[]}
                    onAbortConflictResolution={() => { }}
                    onAcceptConflictResolution={async () => { }}
                />
            </div>
        );
    }

    // User has edited an Activity in a TeachSession
    private async onEditTeach(
        historyIndex: number,
        args: DialogEditing.EditHandlerArgs | undefined,
        tags: string[],
        description: string,
        editHandler: (trainDialog: CLM.TrainDialog, activity: Activity, args?: DialogEditing.EditHandlerArgs) => any
    ) {
        try {
            if (!this.props.teachSession.teach) {
                return
            }

            DialogEditing.onEditTeach(
                historyIndex,
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
                this.props.fetchHistoryThunkAsync as any,
            )
        }
        catch (error) {
            console.warn(`Error when attempting to edit Teach session`, error)
        }
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        clearWebchatScrollPosition: actions.display.clearWebchatScrollPosition,
        createTeachSessionThunkAsync: actions.teach.createTeachSessionThunkAsync,
        createTeachSessionFromHistoryThunkAsync: actions.teach.createTeachSessionFromHistoryThunkAsync,
        createTrainDialogThunkAsync: actions.train.createTrainDialogThunkAsync,
        deleteTrainDialogThunkAsync: actions.train.deleteTrainDialogThunkAsync,
        deleteTeachSessionThunkAsync: actions.teach.deleteTeachSessionThunkAsync,
        deleteMemoryThunkAsync: actions.teach.deleteMemoryThunkAsync,
        editTrainDialogThunkAsync: actions.train.editTrainDialogThunkAsync,
        extractFromHistoryThunkAsync: actions.train.extractFromHistoryThunkAsync,
        fetchHistoryThunkAsync: actions.train.fetchHistoryThunkAsync,
        fetchApplicationTrainingStatusThunkAsync: actions.app.fetchApplicationTrainingStatusThunkAsync,
        fetchTrainDialogThunkAsync: actions.train.fetchTrainDialogThunkAsync,
        trainDialogMergeThunkAsync: actions.train.trainDialogMergeThunkAsync,
        trainDialogReplaceThunkAsync: actions.train.trainDialogReplaceThunkAsync,
        scoreFromHistoryThunkAsync: actions.train.scoreFromHistoryThunkAsync,
        trainDialogReplayThunkAsync: actions.train.trainDialogReplayThunkAsync,
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render TrainDialogs but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        user: state.user.user,
        actions: state.actions,
        entities: state.entities,
        trainDialogs: state.trainDialogs,
        teachSession: state.teachSession,
        // Get all tags from all train dialogs then put in Set to get unique tags
        allUniqueTags: [...new Set(state.trainDialogs.reduce((tags, trainDialog) => [...tags, ...trainDialog.tags], []))]
    }
}

export interface ReceivedProps {
    app: CLM.AppBase,
    invalidBot: boolean,
    editingPackageId: string,
    filteredAction?: CLM.ActionBase,
    filteredEntity?: CLM.EntityBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TrainDialogs))