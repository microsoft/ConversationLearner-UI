/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as OF from 'office-ui-fabric-react'
import { State } from '../../../types'
import * as CLM from '@conversationlearner/models'
import * as Util from '../../../Utils/util'
import * as ValidityUtils from '../../../Utils/validityUtils'
import * as DialogUtils from '../../../Utils/dialogUtils'
import { SelectionType } from '../../../types/const'
import { TeachSessionModal, EditDialogModal, EditDialogType, EditState } from '../../../components/modals'
import actions from '../../../actions'
import { injectIntl, InjectedIntl, InjectedIntlProps, } from 'react-intl'
import FormattedMessageId from '../../../components/FormattedMessageId'
import { FM } from '../../../react-intl-messages'
import { Activity } from 'botframework-directlinejs'
import { TeachSessionState } from '../../../types/StateTypes'
import TagsReadOnly from '../../../components/TagsReadOnly'
import * as moment from 'moment'
import TreeView from '../../../components/modals/TreeView'

export interface EditHandlerArgs {
    userInput?: string,
    extractResponse?: CLM.ExtractResponse,
    textVariations?: CLM.TextVariation[],
    trainScorerStep?: CLM.TrainScorerStep
    selectionType?: SelectionType
    isLastActivity?: boolean
}

interface IRenderableColumn extends OF.IColumn {
    render: (x: CLM.TrainDialog, component: TrainDialogs) => React.ReactNode
    getSortValue: (trainDialog: CLM.TrainDialog, component: TrainDialogs) => string
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

export function cleanTrainDialog(trainDialog: CLM.TrainDialog) {
    // Remove actionless dummy step (used for rendering) if they exist
    for (let round of trainDialog.rounds) {
        if (round.scorerSteps.length > 0 && round.scorerSteps[0].labelAction === undefined) {
            round.scorerSteps = []
        }
    }
    // Remove empty filled entities (used for rendering) if they exist
    for (let round of trainDialog.rounds) {
        for (let scorerStep of round.scorerSteps) {
            scorerStep.input.filledEntities = scorerStep.input.filledEntities.filter(fe => fe.values.length > 0)
        }
    }
}

const returnErrorStringWhenError = returnStringWhenError("ERR")

function textClassName(trainDialog: CLM.TrainDialog): string {
    if (trainDialog.validity === CLM.Validity.INVALID) {
        return `${OF.FontClassNames.mediumPlus} cl-font--highlight`;
    }
    return OF.FontClassNames.mediumPlus!;
}

function getFirstInput(trainDialog: CLM.TrainDialog): string | void {
    if (trainDialog.rounds && trainDialog.rounds.length > 0) {
        return trainDialog.rounds[0].extractorStep.textVariations[0].text
    }
}

function getLastInput(trainDialog: CLM.TrainDialog): string | void {
    if (trainDialog.rounds && trainDialog.rounds.length > 0) {
        return trainDialog.rounds[trainDialog.rounds.length - 1].extractorStep.textVariations[0].text;
    }
}

function getLastResponse(trainDialog: CLM.TrainDialog, component: TrainDialogs): string | void {
    // Find last action of last scorer step of last round
    // If found, return payload, otherwise return not found icon
    if (trainDialog.rounds && trainDialog.rounds.length > 0) {
        let scorerSteps = trainDialog.rounds[trainDialog.rounds.length - 1].scorerSteps;
        if (scorerSteps.length > 0) {
            let actionId = scorerSteps[scorerSteps.length - 1].labelAction;
            let action = component.props.actions.find(a => a.actionId === actionId);
            if (action) {
                return CLM.ActionBase.GetPayload(action, Util.getDefaultEntityMap(component.props.entities))
            }
        }
    }
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    let equalizeColumnWidth = window.innerWidth / 3
    return [
        {
            key: `description`,
            name: Util.formatMessageId(intl, FM.TRAINDIALOGS_DESCRIPTION),
            fieldName: `description`,
            minWidth: 100,
            maxWidth: equalizeColumnWidth,
            isResizable: true,
            render: (trainDialog, component) => {
                const firstInput = getFirstInput(trainDialog)
                const lastInput = getLastInput(trainDialog)
                const lastResponse = getLastResponse(trainDialog, component);
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
                            {trainDialog.description
                                || <>
                                    <span data-testid="train-dialogs-first-input">{firstInput ? firstInput : ''}</span>
                                    <span> - </span>
                                    <span data-testid="train-dialogs-last-input">{lastInput ? lastInput : ''}</span>
                                </>}
                        </span>
                    </span>
                    {/* Keep firstInput and lastInput available in DOM until tests are upgraded */}
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
            render: trainDialog => {
                return <span className={`${OF.FontClassNames.mediumPlus}`} data-testid="train-dialogs-tags">
                    {trainDialog.tags.length === 0
                        ? <OF.Icon iconName="Remove" className="cl-icon" />
                        : <TagsReadOnly tags={trainDialog.tags} />}
                </span>
            },
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
                let count = trainDialog.rounds ? trainDialog.rounds.length : 0
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
    // Item selected in webchat window
    selectedActivityIndex: number | null
    // Current train dialogs being edited
    currentTrainDialog: CLM.TrainDialog | null
    // If Train Dialog was edited, the original one
    originalTrainDialogId: string | null,
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
            selectedActivityIndex: null,
            currentTrainDialog: null,
            originalTrainDialogId: null,
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
        // Prevent flash when swiching to EditDialogModal by keeping teach session around
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
        // If column header selected sort the items, always putting invalid at the top
        if (this.state.sortColumn) {
            trainDialogs
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
                        let sortColumn2 = ((this.state.sortColumn !== this.state.columns[0]) ? this.state.columns[0] : this.state.columns[1]) as IRenderableColumn
                        firstValue = sortColumn2.getSortValue(a, this)
                        secondValue = sortColumn2.getSortValue(b, this)
                        compareValue = firstValue.localeCompare(secondValue)
                    }

                    return this.state.sortColumn.isSortedDescending
                        ? compareValue
                        : compareValue * -1
                })
        }

        return trainDialogs;
    }

    @OF.autobind
    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        let { columns } = this.state;
        let isSortedDescending = !clickedColumn.isSortedDescending;

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

            await this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession.teach, this.props.app, this.props.editingPackageId, false, null, null); // False = abandon

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
                originalTrainDialogId: null
            })
        }
        catch (error) {
            console.warn(`Error when attempting to create teach session: `, error)
        }
    }

    @OF.autobind
    onCloseTeachSession(save: boolean, tags: string[] = [], description: string = '') {
        if (this.props.teachSession && this.props.teachSession.teach) {
            // Delete the teach session unless it was already closed with and EndSessionAction
            if (this.props.teachSession.dialogMode !== CLM.DialogMode.EndSession) {
                if (save) {
                    // If source was a trainDialog, delete the original
                    let sourceTrainDialogId = this.state.currentTrainDialog && this.state.editType !== EditDialogType.BRANCH
                        ? this.state.currentTrainDialog.trainDialogId : null;
                    this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession.teach, this.props.app, this.props.editingPackageId, true, sourceTrainDialogId, null, tags, description)
                }
                else {
                    this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession.teach, this.props.app, this.props.editingPackageId, false, null, null); // False = abandon
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

    // User has edited an Activity in a TeachSession
    async onEditTeach(historyIndex: number, args: EditHandlerArgs | null = null, editHandler: (trainDialog: CLM.TrainDialog, activity: Activity, args?: EditHandlerArgs) => any) {

        try {
            if (this.props.teachSession.teach) {
                // Get train dialog associated with the teach session
                let trainDialog = await ((this.props.fetchTrainDialogThunkAsync(this.props.app.appId, this.props.teachSession.teach.trainDialogId, false) as any) as Promise<CLM.TrainDialog>)
                trainDialog.definitions = {
                    entities: this.props.entities,
                    actions: this.props.actions,
                    trainDialogs: []
                }

                // Delete the teach session w/o saving
                await this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession.teach, this.props.app, this.props.editingPackageId, false, null, null)

                // Generate history
                let teachWithHistory = await ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)
                if (teachWithHistory) {

                    let selectedActivity = teachWithHistory.history[historyIndex]
                    const clData: CLM.CLChannelData = { ...selectedActivity.channelData.clData, activityIndex: historyIndex }
                    selectedActivity.channelData.clData = clData
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
            console.warn(`Error when attempting to edit Teach session`, error)
        }
    }

    @OF.autobind
    async onInsertAction(trainDialog: CLM.TrainDialog, selectedActivity: Activity, isLastActivity: boolean, selectionType: SelectionType) {

        try {
            const clData: CLM.CLChannelData = selectedActivity.channelData.clData
            const roundIndex = clData.roundIndex || 0
            let scoreIndex = clData.scoreIndex
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            // Created shorted verion of TrainDialog at insert point
            // Copy, Remove rounds / scorer steps below insert
            let shortTrainDialog = JSON.parse(JSON.stringify(trainDialog))
            shortTrainDialog.definitions = definitions
            shortTrainDialog.rounds = shortTrainDialog.rounds.slice(0, roundIndex + 1)

            // Remove actionless dummy step (used for rendering) if it exits
            if (shortTrainDialog.rounds[roundIndex].scorerSteps.length > 0 && shortTrainDialog.rounds[roundIndex].scorerSteps[0].labelAction === undefined) {
                shortTrainDialog.rounds[roundIndex].scorerSteps = []
            }
            else if (scoreIndex === null) {
                shortTrainDialog.rounds[roundIndex].scorerSteps = []
            }
            // Or remove following scorer steps 
            else {
                shortTrainDialog.rounds[roundIndex].scorerSteps = shortTrainDialog.rounds[roundIndex].scorerSteps.slice(0, scoreIndex + 1);
            }

            // Get a score for this step
            let uiScoreResponse = await ((this.props.scoreFromHistoryThunkAsync(this.props.app.appId, shortTrainDialog) as any) as Promise<CLM.UIScoreResponse>)

            if (!uiScoreResponse.scoreResponse) {
                throw new Error("Empty Score REsponse")
            }

            // End sesion call only allowed on last turn if one doesn't exist already
            const canEndSession = isLastActivity && !DialogUtils.hasEndSession(trainDialog, this.props.actions)

            // Find top scoring Action
            let insertedAction = DialogUtils.getBestAction(uiScoreResponse.scoreResponse, this.props.actions, canEndSession)

            // None were qualified so pick the first (will show in UI as invalid)
            if (!insertedAction && uiScoreResponse.scoreResponse.unscoredActions[0]) {
                let scoredAction = { ...uiScoreResponse.scoreResponse.unscoredActions[0], score: 1 }
                delete scoredAction.reason
                insertedAction = scoredAction
            }
            if (!insertedAction) {
                throw new Error("Unable to find an action")
            }

            let scorerStep = {
                input: uiScoreResponse.scoreInput,
                labelAction: insertedAction.actionId,
                scoredAction: insertedAction
            }

            // Insert new Action into Full TrainDialog
            let newTrainDialog = JSON.parse(JSON.stringify(trainDialog))
            newTrainDialog.definitions = definitions
            let curRound = newTrainDialog.rounds[roundIndex]

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
                (scoreIndex === undefined || scoreIndex === curRound.scorerSteps.length - 1)) {
                this.props.clearWebchatScrollPosition()
            }

            await this.onUpdateHistory(newTrainDialog, selectedActivity, selectionType, this.state.editType)
        }
        catch (error) {
            console.warn(`Error when attempting to insert an Action `, error)
        }
    }

    @OF.autobind
    async onChangeAction(trainDialog: CLM.TrainDialog, selectedActivity: Activity, trainScorerStep: CLM.TrainScorerStep | undefined) {

        if (!trainScorerStep) {
            throw new Error("missing args")
        }
        try {
            const clData: CLM.CLChannelData = selectedActivity.channelData.clData
            const roundIndex = clData.roundIndex!
            const scoreIndex = clData.scoreIndex!
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            let newTrainDialog = JSON.parse(JSON.stringify(trainDialog)) as CLM.TrainDialog
            newTrainDialog.rounds[roundIndex].scorerSteps[scoreIndex] = trainScorerStep
            newTrainDialog.definitions = definitions;

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

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
            const clData: CLM.CLChannelData = selectedActivity.channelData.clData
            const roundIndex = clData.roundIndex!
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            let newTrainDialog = JSON.parse(JSON.stringify(trainDialog)) as CLM.TrainDialog
            newTrainDialog.definitions = definitions;
            newTrainDialog.rounds[roundIndex].extractorStep.textVariations = textVariations;

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            await this.onUpdateHistory(newTrainDialog, selectedActivity, SelectionType.NONE, this.state.editType)
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
        const scoreIndex = clData.scoreIndex!

        let newTrainDialog: CLM.TrainDialog = { ...trainDialog }
        newTrainDialog.definitions = {
            entities: this.props.entities,
            actions: this.props.actions,
            trainDialogs: []
        }

        let curRound = newTrainDialog.rounds[roundIndex]

        if (senderType === CLM.SenderType.User) {
            // If user input deleted, append scores to previous round
            if (roundIndex > 0) {
                let previousRound = newTrainDialog.rounds[roundIndex - 1]
                previousRound.scorerSteps = [...previousRound.scorerSteps, ...curRound.scorerSteps]

                // Remove actionless dummy step if it exits
                previousRound.scorerSteps = previousRound.scorerSteps.filter(ss => ss.labelAction !== undefined)
            }

            // Delete round 
            newTrainDialog.rounds.splice(roundIndex, 1)
        }
        else { // CLM.SenderType.Bot 
            // If Action deleted remove it
            curRound.scorerSteps.splice(scoreIndex, 1)
        }

        // Replay logic functions on train dialog
        newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)
        await this.onUpdateHistory(newTrainDialog, selectedActivity, SelectionType.CURRENT, this.state.editType)

    }

    @OF.autobind
    async onReplayTrainDialog(trainDialog: CLM.TrainDialog) {

        try {
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            let newTrainDialog = JSON.parse(JSON.stringify(trainDialog)) as CLM.TrainDialog
            newTrainDialog.definitions = definitions
            // I've replayed so warning status goes away (but not invalid)
            if (trainDialog.validity === CLM.Validity.WARNING || trainDialog.validity === CLM.Validity.UNKNOWN) {
                newTrainDialog.validity = CLM.Validity.VALID
            }

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

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
            let newTrainDialog = JSON.parse(JSON.stringify(trainDialog))
            newTrainDialog.definitions = definitions
            newTrainDialog.rounds = newTrainDialog.rounds.slice(0, roundIndex)

            const userInput: CLM.UserInput = { text: inputText }

            // Get extraction
            const extractResponse = await ((this.props.extractFromHistoryThunkAsync(this.props.app.appId, newTrainDialog, userInput) as any) as Promise<CLM.ExtractResponse>)

            if (!extractResponse) {
                throw new Error("No extract response")
            }

            let textVariations = CLM.ModelUtils.ToTextVariations([extractResponse])
            let extractorStep: CLM.TrainExtractorStep = { textVariations }

            // Create new round
            let newRound = {
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
            let partialTrainDialog: CLM.TrainDialog = JSON.parse(JSON.stringify(trainDialog))
            partialTrainDialog.definitions = definitions
            partialTrainDialog.rounds = partialTrainDialog.rounds.slice(0, roundIndex + 1)
            let lastRound = partialTrainDialog.rounds[partialTrainDialog.rounds.length - 1]
            lastRound.scorerSteps = lastRound.scorerSteps.slice(0, scoreIndex)

            const userInput: CLM.UserInput = { text: inputText }

            // Get extraction
            const extractResponse = await ((this.props.extractFromHistoryThunkAsync(this.props.app.appId, partialTrainDialog, userInput) as any) as Promise<CLM.ExtractResponse>)

            if (!extractResponse) {
                throw new Error("No extract response")
            }

            let textVariations = CLM.ModelUtils.ToTextVariations([extractResponse])
            let extractorStep: CLM.TrainExtractorStep = { textVariations }

            // Copy original and insert new round for the text
            let newTrainDialog = JSON.parse(JSON.stringify(trainDialog))
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
            let newRound = {
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

            // true - select created input
            await this.onUpdateHistory(newTrainDialog, selectedActivity, selectionType, this.state.editType)
        }
        catch (error) {
            console.warn(`Error when attempting to create teach session from history: `, error)
        }
    }

    @OF.autobind
    onCloseTreeView() {
            this.setState({isTreeViewModalOpen: false})
    }

    @OF.autobind
    onOpenTreeView() {
            this.setState({isTreeViewModalOpen: true})
    }

    onDeleteTrainDialog() {
        if (!this.state.currentTrainDialog) {
            throw new Error(`You attempted to delete a train dialog, but currentTrainDialog is not defined. Please open an issue.`)
        }

        this.setState({
            isEditDialogModalOpen: false,
        })

        const deleteDialogId = this.state.currentTrainDialog.trainDialogId
        this.props.deleteTrainDialogThunkAsync(this.props.user.id, this.props.app, deleteDialogId)
        this.props.fetchApplicationTrainingStatusThunkAsync(this.props.app.appId)
        void this.onCloseEditDialogModal();
    }

    // End Session activity selected.  Switch from Teach to Edit
    @OF.autobind
    async onEndSessionActivity() {

        try {
            if (this.props.teachSession.teach) {
                // Get train dialog associated with the teach session
                let trainDialog = await ((this.props.fetchTrainDialogThunkAsync(this.props.app.appId, this.props.teachSession.teach.trainDialogId, false) as any) as Promise<CLM.TrainDialog>)
                trainDialog.definitions = {
                    entities: this.props.entities,
                    actions: this.props.actions,
                    trainDialogs: []
                }

                // EndSession callback close the teach session, but UI state still needs to be updates after fetch
                await ((this.props.clearTeachSession() as any) as Promise<CLM.TrainDialog>)

                // Generate history
                await this.onUpdateHistory(trainDialog, null, SelectionType.NONE, EditDialogType.NEW)
            }
        }
        catch (error) {
            console.warn(`Error when attempting to use EndSession Action`, error)
        }
    }

    async onUpdateHistory(newTrainDialog: CLM.TrainDialog, selectedActivity: Activity | null, selectionType: SelectionType, editDialogType: EditDialogType) {
        const originalId = this.state.originalTrainDialogId || (this.state.currentTrainDialog ? this.state.currentTrainDialog.trainDialogId : null);

        try {
            const teachWithHistory = await ((this.props.fetchHistoryThunkAsync(this.props.app.appId, newTrainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)

            let activityIndex: number | null = null

            // If activity was selected, calculate activity to select after update
            if (selectedActivity !== null) {
                activityIndex = DialogUtils.matchedActivityIndex(selectedActivity, teachWithHistory.history)
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

            const editType = (editDialogType !== EditDialogType.NEW && editDialogType !== EditDialogType.BRANCH) ?
                EditDialogType.TRAIN_EDITED : editDialogType

            this.setState({
                history: teachWithHistory.history,
                lastAction: teachWithHistory.lastAction,
                currentTrainDialog: newTrainDialog,
                originalTrainDialogId: originalId,
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

        if (this.props.teachSession && this.props.teachSession.teach) {
            // Delete the teach session w/o saving
            await this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession.teach, this.props.app, this.props.editingPackageId, false, null, null)
        }

        let teachWithHistory = await ((this.props.createTeachSessionFromHistoryThunkAsync(this.props.app, newTrainDialog, this.props.user.name, this.props.user.id, initialUserInput) as any) as Promise<CLM.TeachWithHistory>)

        const editType = (this.state.editType !== EditDialogType.NEW && this.state.editType !== EditDialogType.BRANCH) ?
            EditDialogType.TRAIN_EDITED : this.state.editType

        // Note: Don't clear currentTrainDialog so I can delete it if I save my edits
        this.setState({
            history: teachWithHistory.history,
            lastAction: teachWithHistory.lastAction,
            isEditDialogModalOpen: false,
            selectedActivityIndex: null,
            isTeachDialogModalOpen: true,
            editType,
            currentTrainDialog: newTrainDialog
        })
    }

    // Replace the current trainDialog with a new one
    async onReplaceTrainDialog(newTrainDialog: CLM.TrainDialog, validity?: CLM.Validity) {

        this.setState({
            isEditDialogModalOpen: false,
        })

        try {
            // Remove any data added for rendering 
            cleanTrainDialog(newTrainDialog)

            newTrainDialog.validity = validity
            newTrainDialog.trainDialogId = this.state.originalTrainDialogId || newTrainDialog.trainDialogId
            newTrainDialog.definitions = null

            await this.props.editTrainDialogThunkAsync(this.props.app.appId, newTrainDialog)
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
        const selectedActivityIndex = DialogUtils.activityIndexFromRounnd(trainDialog, roundIndex, scoreIndex) || null

        // LARS: duplicate code with below clean up on both opens
        let trainDialogWithDefinitions: CLM.TrainDialog = {
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
            const originalId = this.state.currentTrainDialog
                ? this.state.currentTrainDialog.trainDialogId
                : null
            this.setState({
                history: teachWithHistory.history,
                lastAction: teachWithHistory.lastAction,
                currentTrainDialog: trainDialog,
                originalTrainDialogId: originalId,
                editType: EditDialogType.TRAIN_ORIGINAL,
                isEditDialogModalOpen: false,
                isTreeViewModalOpen: true,
                selectedActivityIndex
            })
        }
        catch (e) {
            const error = e as Error
            console.warn(`Error when attempting to create history: `, error)
        }

        //LARS await this.onClickTrainDialogItem(trainDialog, activityIndex)
    }

    @OF.autobind
    async onClickTrainDialogItem(trainDialog: CLM.TrainDialog, selectedActivityIndex: number | null = null) {
        this.props.clearWebchatScrollPosition()
        let trainDialogWithDefinitions: CLM.TrainDialog = {
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
            const originalId = this.state.currentTrainDialog
                ? this.state.currentTrainDialog.trainDialogId
                : null
            this.setState({
                history: teachWithHistory.history,
                lastAction: teachWithHistory.lastAction,
                currentTrainDialog: trainDialog,
                originalTrainDialogId: originalId,
                editType: EditDialogType.TRAIN_ORIGINAL,
                isEditDialogModalOpen: true,
                isTreeViewModalOpen: false,
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
            await this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession.teach, this.props.app, this.props.editingPackageId, false, null, null)
        }

        if (reload && this.state.originalTrainDialogId) {
            // Reload local copy
            await ((this.props.fetchTrainDialogThunkAsync(this.props.app.appId, this.state.originalTrainDialogId, true) as any) as Promise<CLM.TrainDialog>)
        }
        this.setState({
            isEditDialogModalOpen: false,
            selectedActivityIndex: null,
            currentTrainDialog: null,
            // originalTrainDialogId: Do not clear.  Save for later 
            history: [],
            lastAction: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    onChangeSearchString(newValue: string) {
        let lcString = newValue.toLowerCase();
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

                for (let round of t.rounds) {
                    for (let variation of round.extractorStep.textVariations) {
                        textVariations.push(variation.text);
                        for (let le of variation.labelEntities) {
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
                    for (let ss of round.scorerSteps) {
                        let foundAction = this.props.actions.find(a => a.actionId === ss.labelAction)
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
                if (tagFilter && tagFilter.key
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
                <div>
                    <OF.PrimaryButton
                        data-testid="button-new-train-dialog"
                        disabled={this.props.editingPackageId !== this.props.app.devPackageId || this.props.invalidBot}
                        onClick={() => this.onClickNewTeachSession()}
                        ariaDescription={Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                        text={Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATEBUTTONTITLE)}
                        componentRef={component => this.newTeachSessionButton = component!}
                    />
                    <OF.PrimaryButton
                        onClick={this.onOpenTreeView}
                        ariaDescription={Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                        text={"Tree View"}
                    />
                </div>

                {trainDialogs.length === 0
                    ? <div className="cl-page-placeholder">
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
                    : <React.Fragment>
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
                        originalTrainDialogId={this.state.originalTrainDialogId}
                        onClose={this.onCloseTeachSession}
                        onEditTeach={(historyIndex, userInput, editHandler) => this.onEditTeach(historyIndex, userInput, editHandler)}
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
                    />
                }
                <EditDialogModal
                    data-testid="train-dialog-modal"
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    editState={editState}
                    open={this.state.isEditDialogModalOpen}
                    trainDialog={this.state.currentTrainDialog!}
                    originalTrainDialogId={this.state.originalTrainDialogId}
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
                />
                <TreeView
                    open={(this.state.isTreeViewModalOpen)}
                    app={this.props.app}
                    originalTrainDialogId={this.state.originalTrainDialogId}
                    sourceTrainDialog={this.state.currentTrainDialog}
                    editType={this.state.editType}    
                    editState={editState}
                    editingPackageId={this.props.editingPackageId}
                    onCancel={this.onCloseTreeView}
                    openTrainDialog={this.openTrainDialog}
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        clearWebchatScrollPosition: actions.display.clearWebchatScrollPosition,
        clearTeachSession: actions.teach.clearTeachSession,
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
        allUniqueTags: [...new Set(state.trainDialogs.reduce((tags, trainDialog) => [...tags, ...trainDialog.tags || []], []))]
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