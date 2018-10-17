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
import * as Util from '../../../util'
import { TeachSessionModal, EditDialogModal, EditDialogType, EditState } from '../../../components/modals'
import actions from '../../../actions'
import { Icon } from 'office-ui-fabric-react/lib/Icon'
import { injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { FM } from '../../../react-intl-messages'
import { Activity } from 'botframework-directlinejs'
import { autobind } from 'office-ui-fabric-react/lib/Utilities'
import { getDefaultEntityMap, notNullOrUndefined } from '../../../util'
import ReplayErrorList from '../../../components/modals/ReplayErrorList'
import * as moment from 'moment'

export interface EditHandlerArgs {
    userInput?: string,
    extractResponse?: CLM.ExtractResponse, 
    textVariations?: CLM.TextVariation[],
    trainScorerStep?: CLM.TrainScorerStep
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
                return CLM.ActionBase.GetPayload(action, getDefaultEntityMap(component.props.entities))
            }
        }
    }
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'firstInput',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_FIRSTINPUT,
                defaultMessage: 'First Input'
            }),
            fieldName: 'firstInput',
            minWidth: 100,
            maxWidth: 500,
            isResizable: true,
            isSortedDescending: true,
            render: trainDialog => {
                let firstInput = getFirstInput(trainDialog);
                if (firstInput) {
                    return (<span className={textClassName(trainDialog)}>
                        {trainDialog.validity === CLM.Validity.INVALID && <Icon className="cl-icon" iconName="IncidentTriangle" />}
                        {firstInput}
                    </span>)
                }
                return <OF.Icon iconName="Remove" className="notFoundIcon" />
            },
            getSortValue: trainDialog => {
                let firstInput = getFirstInput(trainDialog)
                return firstInput ? firstInput.toLowerCase() : ''
            }
        },
        {
            key: 'lastInput',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_LASTINPUT,
                defaultMessage: 'Last Input'
            }),
            fieldName: 'lastInput',
            minWidth: 100,
            maxWidth: 500,
            isResizable: true,
            render: trainDialog => {
                let lastInput = getLastInput(trainDialog)
                if (lastInput) {
                    return <span className={textClassName(trainDialog)}>{lastInput}</span>
                }
                return <OF.Icon iconName="Remove" className="notFoundIcon" />
            },
            getSortValue: trainDialog => {
                let lastInput = getLastInput(trainDialog)
                return lastInput ? lastInput.toLowerCase() : ''
            }
        },
        {
            key: 'lastResponse',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_LASTRESPONSE,
                defaultMessage: 'Last Response'
            }),
            fieldName: 'lastResponse',
            minWidth: 100,
            maxWidth: 500,
            isResizable: true,
            render: (trainDialog, component) => {
                let lastResponse = getLastResponse(trainDialog, component);
                if (lastResponse) {
                    return <span className={textClassName(trainDialog)}>{lastResponse}</span>;
                }
                return <OF.Icon iconName="Remove" className="notFoundIcon" />;
            },
            getSortValue: (trainDialog, component) => {
                let lastResponse = getLastResponse(trainDialog, component)
                return lastResponse ? lastResponse.toLowerCase() : ''
            }
        },
        {
            key: 'turns',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_TURNS,
                defaultMessage: 'Turns'
            }),
            fieldName: 'dialog',
            minWidth: 50,
            maxWidth: 50,
            isResizable: false,
            render: trainDialog => {
                let count = trainDialog.rounds ? trainDialog.rounds.length : 0
                return <span className={textClassName(trainDialog)}>{count}</span>
            },
            getSortValue: trainDialog => (trainDialog.rounds ? trainDialog.rounds.length : 0).toString().padStart(4, '0')
        },
        {
            key: 'lastModifiedDateTime',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_LAST_MODIFIED_DATE_TIME,
                defaultMessage: 'Last Modified'
            }),
            fieldName: 'lastModifiedDateTime',
            minWidth: 100,
            isResizable: false,
            render: trainDialog => <span className={OF.FontClassNames.mediumPlus}>{moment(trainDialog.lastModifiedDateTime).format('L')}</span>,
            getSortValue: trainDialog => moment(trainDialog.lastModifiedDateTime).valueOf().toString()
        },
        {
            key: 'created',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_CREATED_DATE_TIME,
                defaultMessage: 'Created'
            }),
            fieldName: 'created',
            minWidth: 100,
            isResizable: false,
            render: trainDialog => <span className={OF.FontClassNames.mediumPlus}>{moment(trainDialog.createdDateTime).format('L')}</span>,
            getSortValue: trainDialog => moment(trainDialog.createdDateTime).valueOf().toString()
        }
    ]
}

interface ComponentState {
    columns: OF.IColumn[]
    sortColumn: IRenderableColumn
    teachSession: CLM.Teach | undefined
    history: Activity[]
    lastAction: CLM.ActionBase | null
    isTeachDialogModalOpen: boolean
    isEditDialogModalOpen: boolean
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
    entityFilter: OF.IDropdownOption | null
    actionFilter: OF.IDropdownOption | null
    isValidationWarningOpen: boolean
    validationErrors: CLM.ReplayError[]
    validationErrorTitleId: string | null
    validationErrorMessageId: string | null
}

class TrainDialogs extends React.Component<Props, ComponentState> {
    newTeachSessionButton: OF.IButton
    state: ComponentState

    constructor(props: Props) {
        super(props)
        let columns = getColumns(this.props.intl);
        this.state = {
            columns: columns,
            sortColumn: columns[0],
            teachSession: undefined,
            history: [],
            lastAction: null,
            isTeachDialogModalOpen: false,
            isEditDialogModalOpen: false,
            selectedActivityIndex: null,
            currentTrainDialog: null,
            originalTrainDialogId: null,
            editType: EditDialogType.TRAIN_ORIGINAL,
            searchValue: '',
            dialogKey: 0,
            entityFilter: null,
            actionFilter: null,
            isValidationWarningOpen: false,
            validationErrors: [],
            validationErrorTitleId: null,
            validationErrorMessageId: null
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

    @autobind
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

    toActionFilter(action: CLM.ActionBase, entities: CLM.EntityBase[]): OF.IDropdownOption {
        return {
            key: action.actionId,
            text: CLM.ActionBase.GetPayload(action, getDefaultEntityMap(entities))
        }
    }

    toEntityFilter(entity: CLM.EntityBase): OF.IDropdownOption {
        return {
            key: entity.entityId,
            text: entity.entityName,
            data: entity.negativeId
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

    @autobind
    onSelectEntityFilter(item: OF.IDropdownOption) {
        this.setState({
            entityFilter: item
        })
    }

    @autobind
    onSelectActionFilter(item: OF.IDropdownOption) {
        this.setState({
            actionFilter: item
        })
    }

    @autobind
    async onSetInitialEntities(initialFilledEntities: CLM.FilledEntity[]) {

        if (this.state.teachSession) {
            // Delete existing teach session
            await this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.state.teachSession, this.props.app, this.props.editingPackageId, false, null, null); // False = abandon
                
            // Create new one with initial entities
            await this.onClickNewTeachSession(initialFilledEntities)
        }
    }

    onClickNewTeachSession(initialFilledEntities: CLM.FilledEntity[] = []) {
        // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
        ((this.props.createTeachSessionThunkAsync(this.props.app.appId, initialFilledEntities) as any) as Promise<CLM.TeachResponse>)
            .then(teachResponse => {
                this.setState({
                    teachSession: teachResponse as CLM.Teach,
                    isTeachDialogModalOpen: true,
                    editType: EditDialogType.NEW
                })
            })
            .catch(error => {
                console.warn(`Error when attempting to create teach session: `, error)
            })
    }

    onCloseTeachSession() {
        this.setState({
            teachSession: undefined,
            isTeachDialogModalOpen: false,
            history: [],
            lastAction: null,
            currentTrainDialog: null,
            // originalTrainDialogId - do not clear. Need for later 
            dialogKey: this.state.dialogKey + 1
        })
    }
    
    // User has edited an Activity in a TeachSession
    async onEditTeach(historyIndex: number, args: EditHandlerArgs|null = null, editHandler: (trainDialog: CLM.TrainDialog, activity: Activity, args?: EditHandlerArgs) => any) {

        try {
            if (this.state.teachSession) {
                // Get train dialog associated with the teach session
                let trainDialog = await ((this.props.fetchTrainDialogThunkAsync(this.props.app.appId, this.state.teachSession.trainDialogId, false) as any) as Promise<CLM.TrainDialog>)
                trainDialog.definitions = {
                    entities: this.props.entities,
                    actions: this.props.actions,
                    trainDialogs: []
                }

                // Delete the teach session w/o saving
                await this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.state.teachSession, this.props.app, this.props.editingPackageId, false, null, null)

                // Generate history
                let teachWithHistory = await ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)
                if (teachWithHistory) {

                    let selectedActivity = teachWithHistory.history[historyIndex]
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

    @autobind
    async onInsertAction(trainDialog: CLM.TrainDialog, selectedActivity: Activity) {

        try {
            const senderType = selectedActivity.channelData.senderType
            const roundIndex = selectedActivity.channelData.roundIndex
            let scoreIndex = selectedActivity.channelData.scoreIndex
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            // Created shorted verion of TrainDialog at insert point
            // Copy, Remove rounds / scorer steps below insert
            let history = JSON.parse(JSON.stringify(trainDialog))
            history.definitions = definitions
            history.rounds = history.rounds.slice(0, roundIndex + 1)

            // Remove actionless dummy step (used for rendering) if it exits
            if (history.rounds[roundIndex].scorerSteps.length > 0 && history.rounds[roundIndex].scorerSteps[0].labelAction === undefined) {
                history.rounds[roundIndex].scorerSteps = []
            }
            // Or remove following scorer steps 
            else {
                history.rounds[roundIndex].scorerSteps = history.rounds[roundIndex].scorerSteps.slice(0, scoreIndex);
            }

            // Get a score for this step
            let uiScoreResponse = await ((this.props.scoreFromHistoryThunkAsync(this.props.app.appId, history) as any) as Promise<CLM.UIScoreResponse>)

            // Find top scoring Action
            let insertedAction = this.getBestAction(uiScoreResponse.scoreResponse)

            // None were qualified so pick the first (will show in UI as invalid)
            if (!insertedAction && uiScoreResponse.scoreResponse.unscoredActions[0]) {
                let scoredAction = {...uiScoreResponse.scoreResponse.unscoredActions[0], score: 1.0}
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
            else if (senderType === CLM.SenderType.User) {
                curRound.scorerSteps = [scorerStep, ...curRound.scorerSteps]
            } 
            // Or insert 
            else {
                curRound.scorerSteps.splice(scoreIndex + 1, 0, scorerStep)
            }

            // If inserted at end of conversation, allow to scroll to bottom
            if (roundIndex === trainDialog.rounds.length - 1 && scoreIndex === curRound.scorerSteps.length - 1) {
                this.props.clearWebchatScrollPosition()
            }

            // true = select next activity after updating
            await this.onUpdateHistory(newTrainDialog, selectedActivity, true)
        }
        catch (error) {
            console.warn(`Error when attempting to insert an Action `, error)
        }
    }

    @autobind
    async onChangeAction(trainDialog: CLM.TrainDialog, selectedActivity: Activity, trainScorerStep: CLM.TrainScorerStep|undefined) {
 
        if (!trainScorerStep) {
            throw new Error("missing args")
        }
        try {
            const roundIndex = selectedActivity.channelData.roundIndex
            const scoreIndex = selectedActivity.channelData.scoreIndex
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

            this.onUpdateHistory(newTrainDialog, selectedActivity)
        }
        catch (error) {
            console.warn(`Error when attempting to change an Action: `, error)
        }
    }

    @autobind
    async onChangeExtraction(trainDialog: CLM.TrainDialog, selectedActivity: Activity, extractResponse: CLM.ExtractResponse|undefined, textVariations: CLM.TextVariation[]|undefined) {
 
        if (!extractResponse || !textVariations) {
            throw new Error("missing args")
        }
        try {
            const roundIndex = selectedActivity.channelData.roundIndex
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

            this.onUpdateHistory(newTrainDialog, selectedActivity)
        }
        catch (error) {
                console.warn(`Error when attempting to change extraction: `, error)
        }
    }

    @autobind
    async onDeleteTurn(trainDialog: CLM.TrainDialog, selectedActivity: Activity) {

        const senderType = selectedActivity.channelData.senderType
        const roundIndex = selectedActivity.channelData.roundIndex
        const scoreIndex = selectedActivity.channelData.scoreIndex

        let newTrainDialog: CLM.TrainDialog = {...trainDialog}
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

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            await this.onUpdateHistory(newTrainDialog, null)
        }
        else if (senderType === CLM.SenderType.Bot) {
            // If Action deleted remove it
            curRound.scorerSteps.splice(scoreIndex, 1)

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            await this.onUpdateHistory(newTrainDialog, null)
        }
    }

    @autobind
    async onBranchTrainDialog(trainDialog: CLM.TrainDialog, selectedActivity: Activity, inputText: string) {

        try {
            const roundIndex = selectedActivity.channelData.roundIndex
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
                throw new Error("No extract response")  // LARS todo - handle this better
            }

            let textVariations = CLM.ModelUtils.ToTextVariations([extractResponse])
            let extractorStep: CLM.TrainExtractorStep = {textVariations}

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

            await this.onUpdateHistory(newTrainDialog, selectedActivity)
        }
        catch (error) {
            console.warn(`Error when attempting to create teach session from history: `, error)
        }
    }

    @autobind
    async onInsertInput(trainDialog: CLM.TrainDialog, selectedActivity: Activity, inputText: string | undefined) {

        if (!inputText) {
            throw new Error("inputText is null")
        }

        try {
            const roundIndex = selectedActivity.channelData.roundIndex
            const scoreIndex = selectedActivity.channelData.scoreIndex
            const senderType = selectedActivity.channelData.senderType

            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            // Copy, Remove rounds / scorer steps below insert
            let history = JSON.parse(JSON.stringify(trainDialog))
            history.definitions = definitions
            history.rounds = history.rounds.slice(0, roundIndex + 1)

            const userInput: CLM.UserInput = { text: inputText }

            // Get extraction
            const extractResponse = await ((this.props.extractFromHistoryThunkAsync(this.props.app.appId, history, userInput) as any) as Promise<CLM.ExtractResponse>)

            if (!extractResponse) {
                throw new Error("No extract response")  // LARS todo - handle this better
            }

            let textVariations = CLM.ModelUtils.ToTextVariations([extractResponse])
            let extractorStep: CLM.TrainExtractorStep = {textVariations}

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
            await this.onUpdateHistory(newTrainDialog, selectedActivity, true)
        }
        catch (error) {
            console.warn(`Error when attempting to create teach session from history: `, error)
        }
    }

    // Return best action from ScoreResponse 
    getBestAction(scoreResponse: CLM.ScoreResponse): CLM.ScoredAction | undefined {

        let scoredActions  = scoreResponse.scoredActions

        // Get highest scoring Action 
        let best
        for (let test of scoredActions) {
            if (!best || test.score > best.score) {
                best = test
            }
        }
        return best
    }

    onDeleteTrainDialog() {
        if (!this.state.currentTrainDialog) {
            throw new Error(`You attempted to delete a train dialog, but currentTrainDialog is not defined. Please open an issue.`)
        }

        const deleteDialogId = this.state.currentTrainDialog.trainDialogId
        this.props.deleteTrainDialogThunkAsync(this.props.user.id, this.props.app, deleteDialogId)
        this.props.fetchApplicationTrainingStatusThunkAsync(this.props.app.appId)
        this.onCloseEditDialogModal();
    }

    async onUpdateHistory(newTrainDialog: CLM.TrainDialog, selectedActivity: Activity | null, selectNextActivity: boolean = false) {
        const originalId = this.state.originalTrainDialogId || (this.state.currentTrainDialog ? this.state.currentTrainDialog.trainDialogId : null);

        try {
            const teachWithHistory = await ((this.props.fetchHistoryThunkAsync(this.props.app.appId, newTrainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)
            let activityIndex = selectedActivity ? Util.matchedActivityIndex(selectedActivity, teachWithHistory.history) : null
            if (activityIndex !== null && selectNextActivity) {
                // Select next activity, useful for when inserting a step
                activityIndex = activityIndex + 1
            }
            
            this.setState({
                history: teachWithHistory.history,
                lastAction: teachWithHistory.lastAction,
                currentTrainDialog: newTrainDialog,
                originalTrainDialogId: originalId,
                selectedActivityIndex: activityIndex,
                isEditDialogModalOpen: true,
                isTeachDialogModalOpen: false,
                editType: this.state.editType === EditDialogType.NEW 
                        ? EditDialogType.NEW
                        : EditDialogType.TRAIN_EDITED
            })
        }
        catch (error) {
            console.warn(`Error when attempting to update history: `, error)
        }
    }

    async onContinueTrainDialog(newTrainDialog: CLM.TrainDialog, initialUserInput: CLM.UserInput) {

        try {
            let teachWithHistory = await ((this.props.createTeachSessionFromHistoryThunkAsync(this.props.app, newTrainDialog, this.props.user.name, this.props.user.id, initialUserInput) as any) as Promise<CLM.TeachWithHistory>)
    
            if (teachWithHistory.replayErrors.length  === 0) {
                // Note: Don't clear currentTrainDialog so I can delete it if I save my edits
                this.setState({
                    teachSession: teachWithHistory.teach,
                    history: teachWithHistory.history,
                    lastAction: teachWithHistory.lastAction,
                    isEditDialogModalOpen: false,
                    selectedActivityIndex: null,
                    isTeachDialogModalOpen: true,
                    editType: this.state.editType === EditDialogType.NEW 
                        ? EditDialogType.NEW
                        : EditDialogType.TRAIN_EDITED
                })
            }
            else {
                this.setState({
                    validationErrors: teachWithHistory.replayErrors,
                    isValidationWarningOpen: true,
                    validationErrorTitleId: FM.REPLAYERROR_EDIT_TITLE,
                    validationErrorMessageId: FM.REPLAYERROR_FAILMESSAGE
                })
            }
        }
        catch (error) {
                console.warn(`Error when attempting to create teach session from train dialog: `, error)
        }
    }

    // Replace the current trainDialog with a new one
    async onReplaceTrainDialog(newTrainDialog: CLM.TrainDialog, isInvalid: boolean) {

        // Remove actionless dummy step (used for rendering) if it exits
        let lastRound = newTrainDialog.rounds[newTrainDialog.rounds.length - 1] 
        if (lastRound.scorerSteps.length > 0 && lastRound.scorerSteps[0].labelAction === undefined) {
            lastRound.scorerSteps = []
        }

        newTrainDialog.validity = isInvalid ? CLM.Validity.INVALID : CLM.Validity.VALID
        newTrainDialog.definitions = null
        try { 
            await ((this.props.editTrainDialogThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TeachWithHistory>);
        }
        catch (error) {
            console.warn(`Error when attempting to replace an edited train dialog: `, error)
        }

        this.onCloseEditDialogModal()
    }

    // Create a new trainDialog 
    async onCreateTrainDialog(newTrainDialog: CLM.TrainDialog, isInvalid: boolean) {

        newTrainDialog.validity = isInvalid ? CLM.Validity.INVALID : CLM.Validity.VALID

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

        this.onCloseEditDialogModal()
    }

    onClickTrainDialogItem(trainDialog: CLM.TrainDialog) {
        this.props.clearWebchatScrollPosition()
        let trainDialogWithDefinitions: CLM.TrainDialog = {
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

        ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialogWithDefinitions, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)
            .then(teachWithHistory => {
                const originalId = this.state.currentTrainDialog ? this.state.currentTrainDialog.trainDialogId : null   
                this.setState({
                    history: teachWithHistory.history,
                    lastAction: teachWithHistory.lastAction,
                    currentTrainDialog: trainDialog,
                    originalTrainDialogId: originalId,
                    editType: EditDialogType.TRAIN_ORIGINAL,
                    isEditDialogModalOpen: true,
                    selectedActivityIndex: null
                })
            })
            .catch(error => {
                console.warn(`Error when attempting to create history: `, error)
            })
    }

    async onCloseEditDialogModal(reload: boolean = false) {

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

    @autobind
    onCloseValidationWarning() {
        this.setState({
            isValidationWarningOpen: false
        })
    }

    getFilteredAndSortedDialogs(): CLM.TrainDialog[] {
        let filteredTrainDialogs: CLM.TrainDialog[] = []

        if (!this.state.searchValue && !this.state.entityFilter && !this.state.actionFilter) {
            filteredTrainDialogs = this.props.trainDialogs;
        } else {
            // TODO: Consider caching as not very efficient
            filteredTrainDialogs = this.props.trainDialogs.filter((t: CLM.TrainDialog) => {
                const entitiesInTD: CLM.EntityBase[] = []
                const actionsInTD: CLM.ActionBase[] = []
                const variationText: string[] = []

                for (let round of t.rounds) {
                    for (let variation of round.extractorStep.textVariations) {
                        variationText.push(variation.text);
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
                        let foundAction = this.props.actions.find(a => a.actionId === ss.labelAction);
                        // Invalid train dialogs can contain deleted actions
                        if (!foundAction) {
                            continue
                        }

                        actionsInTD.push(foundAction)

                        // Need to check filledEntities for programmatic only entities
                        const entities = ss.input.filledEntities
                            .map((fe: any) => fe.entityId)
                            .filter(notNullOrUndefined)
                            .map((entityId: any) => this.props.entities.find(e => e.entityId === entityId))
                            .filter(notNullOrUndefined)

                        entitiesInTD.push(...entities)
                    }
                }

                // Filter out train dialogs that don't match filters (data = negativeId for multivalue)
                const entityFilter = this.state.entityFilter
                if (entityFilter && entityFilter.key
                    && !entitiesInTD.find(en => en.entityId === entityFilter.key)
                    && !entitiesInTD.find(en => en.entityId === entityFilter.data)) {
                    return false;
                }
                const actionFilter = this.state.actionFilter
                if (actionFilter && actionFilter.key
                    && !actionsInTD.find(a => a.actionId === actionFilter.key)) {
                    return false;
                }

                let entityNames = entitiesInTD.map(e => e.entityName);
                let actionPayloads = actionsInTD.map(a => CLM.ActionBase.GetPayload(a, getDefaultEntityMap(this.props.entities)));

                // Then check search terms
                let searchString = variationText.concat(actionPayloads).concat(entityNames).join(' ').toLowerCase();
                return searchString.indexOf(this.state.searchValue) > -1;
            })
        }

        filteredTrainDialogs = this.sortTrainDialogs(filteredTrainDialogs);
        return filteredTrainDialogs;
    }

    render() {
        const { intl, trainDialogs } = this.props
        const computedTrainDialogs = this.getFilteredAndSortedDialogs()
        const editState = (this.props.editingPackageId !== this.props.app.devPackageId) 
            ? EditState.INVALID_PACKAGE 
            : this.props.invalidBot
            ? EditState.INVALID_BOT
            : EditState.CAN_EDIT

        return (
            <div className="cl-page">
                <div data-testid="train-dialogs-title" className={`cl-dialog-title cl-dialog-title--train ${OF.FontClassNames.xxLarge}`}>
                    <OF.Icon iconName="EditContact" />
                    <FormattedMessage
                        id={FM.TRAINDIALOGS_TITLE}
                        defaultMessage="Train Dialogs"
                    />
                </div>
                {this.props.editingPackageId === this.props.app.devPackageId ?
                    <span data-testid="train-dialogs-subtitle" className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.TRAINDIALOGS_SUBTITLE}
                            defaultMessage="Train Dialogs are example conversations you want your Bot to imitate"
                        />
                    </span>
                    :
                    <span className="cl-errorpanel">Editing is only allowed in Master Tag</span>
                }
                <div>
                    <OF.PrimaryButton
                        data-testid="button-new-train-dialog"
                        disabled={this.props.editingPackageId !== this.props.app.devPackageId || this.props.invalidBot}
                        onClick={() => this.onClickNewTeachSession()}
                        ariaDescription={intl.formatMessage({
                            id: FM.TRAINDIALOGS_CREATEBUTTONARIALDESCRIPTION,
                            defaultMessage: 'Create a New Train Dialog'
                        })}
                        text={intl.formatMessage({
                            id: FM.TRAINDIALOGS_CREATEBUTTONTITLE,
                            defaultMessage: 'New Train Dialog'
                        })}
                        componentRef={component => this.newTeachSessionButton = component!}
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
                                ariaDescription={intl.formatMessage({
                                    id: FM.TRAINDIALOGS_CREATEBUTTONARIALDESCRIPTION,
                                    defaultMessage: 'Create a New Train Dialog'
                                })}
                                text={intl.formatMessage({
                                    id: FM.TRAINDIALOGS_CREATEBUTTONTITLE,
                                    defaultMessage: 'New Train Dialog'
                                })}
                            />
                        </div>
                    </div>
                    : <React.Fragment>
                        <div>
                            <OF.Label htmlFor="traindialogs-input-search" className={OF.FontClassNames.medium}>
                                Search:
                            </OF.Label>
                            <OF.SearchBox
                                data-testid="search-box"
                                id="traindialogs-input-search"
                                className={OF.FontClassNames.medium}
                                onChange={(newValue) => this.onChangeSearchString(newValue)}
                                onSearch={(newValue) => this.onChangeSearchString(newValue)}
                            />
                        </div>
                        <div className="cl-list-filters">
                            <OF.Dropdown
                                data-testid="dropdown-filter-by-entity"
                                ariaLabel="Entity:"
                                label="Entity:"
                                selectedKey={(this.state.entityFilter ? this.state.entityFilter.key : undefined)}
                                onChanged={this.onSelectEntityFilter}
                                placeHolder="Filter by Entity"
                                options={this.props.entities
                                    // Only show positive versions of negatable entities
                                    .filter(e => e.positiveId == null)
                                    .map(e => this.toEntityFilter(e))
                                    .concat({ key: -1, text: '---', data: null })
                                }
                            />

                            <OF.Dropdown
                                data-testid="dropdown-filter-by-action"
                                ariaLabel="Action:"
                                label="Action:"
                                selectedKey={(this.state.actionFilter ? this.state.actionFilter.key : undefined)}
                                onChanged={this.onSelectActionFilter}
                                placeHolder="Filter by Action"
                                options={this.props.actions
                                    .map(a => this.toActionFilter(a, this.props.entities))
                                    .concat({ key: -1, text: '---' })
                                }
                            />
                        </div>
                        <OF.DetailsList
                            data-testid="detail-list"
                            key={this.state.dialogKey}
                            className={OF.FontClassNames.mediumPlus}
                            items={computedTrainDialogs}
                            columns={this.state.columns}
                            checkboxVisibility={OF.CheckboxVisibility.hidden}
                            onColumnHeaderClick={this.onClickColumnHeader}
                            onRenderItemColumn={(trainDialog, i, column: IRenderableColumn) => returnErrorStringWhenError(() => column.render(trainDialog, this))}
                            onActiveItemChanged={trainDialog => this.onClickTrainDialogItem(trainDialog)}
                        />
                    </React.Fragment>}
                <ReplayErrorList
                    open={this.state.isValidationWarningOpen}
                    onClose={this.onCloseValidationWarning}
                    textItems={this.state.validationErrors}
                    formattedTitleId={this.state.validationErrorTitleId!}
                    formattedMessageId={this.state.validationErrorMessageId!}
                />
                <TeachSessionModal
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    teach={this.props.teachSessions.current!}
                    dialogMode={this.props.teachSessions.mode}
                    isOpen={this.state.isTeachDialogModalOpen}
                    onClose={() => this.onCloseTeachSession()}
                    onEditTeach={(historyIndex, userInput, editHandler) => this.onEditTeach(historyIndex, userInput, editHandler)}
                    onInsertAction={(trainDialog, activity) => this.onInsertAction(trainDialog, activity)}
                    onInsertInput={(trainDialog, activity, editHandlerArgs) => this.onInsertInput(trainDialog, activity, editHandlerArgs.userInput)} 
                    onDeleteTurn={(trainDialog, activity) => this.onDeleteTurn(trainDialog, activity)}
                    onChangeExtraction={(trainDialog, activity, editHandlerArgs) => this.onChangeExtraction(trainDialog, activity, editHandlerArgs.extractResponse, editHandlerArgs.textVariations)} 
                    onChangeAction={(trainDialog, activity, editHandlerArgs) => this.onChangeAction(trainDialog, activity, editHandlerArgs.trainScorerStep)} 
                    onSetInitialEntities={this.onSetInitialEntities}
                    initialHistory={this.state.history}
                    editType={this.state.editType}
                    lastAction={this.state.lastAction}
                    sourceTrainDialog={this.state.currentTrainDialog}
                    sourceLogDialog={null}
                />
                <EditDialogModal
                    data-testid="train-dialog-modal"
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    editState={editState}
                    open={this.state.isEditDialogModalOpen}
                    trainDialog={this.state.currentTrainDialog!}
                    editingLogDialog={null}
                    history={this.state.history}
                    initialSelectedActivityIndex={this.state.selectedActivityIndex}
                    editType={this.state.editType}
                    onCloseModal={(reload) => this.onCloseEditDialogModal(reload)}
                    onInsertAction={(trainDialog, activity) => this.onInsertAction(trainDialog, activity)}
                    onInsertInput={(trainDialog, activity, userInput) => this.onInsertInput(trainDialog, activity, userInput)} 
                    onDeleteTurn={(trainDialog, activity) => this.onDeleteTurn(trainDialog, activity)}
                    onChangeExtraction={(trainDialog, activity, extractResponse, textVariations) => this.onChangeExtraction(trainDialog, activity, extractResponse, textVariations)}
                    onChangeAction={(trainDialog: CLM.TrainDialog, activity: Activity, trainScorerStep: CLM.TrainScorerStep) => this.onChangeAction(trainDialog, activity, trainScorerStep)}
                    onBranchDialog={(trainDialog, activity, userInput) => this.onBranchTrainDialog(trainDialog, activity, userInput)}
                    onDeleteDialog={() => this.onDeleteTrainDialog()}
                    onContinueDialog={(editedTrainDialog, initialUserInput) => this.onContinueTrainDialog(editedTrainDialog, initialUserInput)}
                    onSaveDialog={(editedTrainDialog, isInvalid) => this.onReplaceTrainDialog(editedTrainDialog, isInvalid)}
                    onCreateDialog={(newTrainDialog, isInvalid) => this.onCreateTrainDialog(newTrainDialog, isInvalid)}
                />
            </div>
        );
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
        teachSessions: state.teachSessions
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