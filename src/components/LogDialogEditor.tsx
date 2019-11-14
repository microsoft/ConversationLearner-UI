/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as Util from '../Utils/util'
import * as DialogEditing from '../Utils/dialogEditing'
import * as DialogUtils from '../Utils/dialogUtils'
import * as BB from 'botbuilder'
import actions from '../actions'
import produce from 'immer'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../types'
import { EditDialogType, EditState, SelectionType } from '../types/const'
import { EditDialogModal, TeachSessionModal, MergeModal } from './modals'
import LogConversionConflictModal, { ConflictPair } from './modals/LogConversionConflictModal'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../react-intl-messages'
import { TeachSessionState } from '../types/StateTypes'
import { EntityLabelConflictError } from '../types/errors'
import { autobind } from 'core-decorators'
import { PartialTrainDialog } from '../types/models'

interface ComponentState {
    conflictPairs: ConflictPair[]
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
    activityHistory: BB.Activity[]
    lastAction: CLM.ActionBase | null
    validationErrors: CLM.ReplayError[]
    // Hack to keep screen from flashing when transition to Edit Page
    lastTeachSession: TeachSessionState | null
}

const defaultAcceptConflictResolutionFn = async () => { throw new Error(`acceptConflictResolutionFn called without being assigned.`) }

class LogDialogEditor extends React.Component<Props, ComponentState> {
    acceptConflictResolutionFn: (conflictFreeDialog: CLM.TrainDialog) => Promise<void> = defaultAcceptConflictResolutionFn
    state: ComponentState

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

        this.state = {
            conflictPairs: [],
            isEditDialogModalOpen: false,
            isTeachDialogModalOpen: false,
            selectionCount: 0,
            mergeExistingTrainDialog: null,
            mergeNewTrainDialog: null,
            selectedActivityIndex: null,
            currentLogDialogId: null,
            currentTrainDialog: null,
            editType: EditDialogType.LOG_ORIGINAL,
            activityHistory: [],
            lastAction: null,
            validationErrors: [],
            lastTeachSession: null,
        }
    }

    async componentDidUpdate(prevProps: Props) {
    
        // A hack to prevent the screen from flashing
        // Will go away once Edit/Teach dialogs are merged
        if (this.props.teachSession && this.props.teachSession !== prevProps.teachSession) {
            this.setState({
                lastTeachSession: prevProps.teachSession
            })
        }

        if (this.props.logDialog !== prevProps.logDialog) {

            if (this.props.logDialog) {
                // Reset WebChat scroll position
                this.props.clearWebchatScrollPosition()
    
                // Convert to trainDialog until schema update change, and pass in app definition too
                const trainDialog = CLM.ModelUtils.ToTrainDialog(this.props.logDialog, this.props.actions, this.props.entities)
    
                try {
                    const teachWithActivities = await ((this.props.fetchActivitiesThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithActivities>)
    
                    this.setState({
                        activityHistory: teachWithActivities.activities,
                        lastAction: teachWithActivities.lastAction,
                        currentLogDialogId: this.props.logDialog.logDialogId,
                        currentTrainDialog: CLM.ModelUtils.ToTrainDialog(this.props.logDialog),
                        isEditDialogModalOpen: true,
                        editType: EditDialogType.LOG_ORIGINAL,
                        validationErrors: teachWithActivities.replayErrors
                    })
                }
                catch (error) {
                    console.warn(`Error when attempting to create activityHistory: `, error)
                }
            }
            else {
                this.setState({
                    activityHistory: [],
                    lastAction: null,
                    currentLogDialogId: null,
                    currentTrainDialog: null,
                    isEditDialogModalOpen: false,
                    isTeachDialogModalOpen: false,
                    editType: EditDialogType.LOG_ORIGINAL,
                    validationErrors: []
                })
            }
        }

        // If log dialogs have been updated, update selected logDialog too
        if (this.props.logDialogs !== prevProps.logDialogs) {
            if (this.state.currentLogDialogId) {
                const newLogDialog = this.props.logDialogs.find(t => t.logDialogId === this.state.currentLogDialogId)
                this.setState({
                    currentLogDialogId: newLogDialog ? newLogDialog.logDialogId : null,
                    currentTrainDialog: newLogDialog ? CLM.ModelUtils.ToTrainDialog(newLogDialog) : null
                })
            }
        }
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
                const conflictPairs = LogDialogEditor.GetConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
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
                const conflictPairs = LogDialogEditor.GetConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
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
                const conflictPairs = LogDialogEditor.GetConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
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
            currentTrainDialog: null
        })

        this.onCloseEditDialogModal()
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
            lastAction: null
        })

        // Remove selection from query parameter
        const searchParams = new URLSearchParams(this.props.location.search)
        const selectedDialogId = searchParams.get(DialogUtils.DialogQueryParams.id)
        if (selectedDialogId) {
            this.props.history.replace(this.props.match.url, { app: this.props.app })
        }

        this.props.onCloseEdit()
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
                const conflictPairs = LogDialogEditor.GetConflicts((this.state.currentTrainDialog && this.state.currentTrainDialog.rounds) || [], error.textVariations)
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
            currentTrainDialog: null
        })

        this.onCloseEditDialogModal()
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

    render() {    
        const { intl } = this.props

        const editState = (this.props.editingPackageId !== this.props.app.devPackageId)
            ? EditState.INVALID_PACKAGE
            : this.props.invalidBot
                ? EditState.INVALID_BOT
                : EditState.CAN_EDIT

        const teachSession = (this.props.teachSession && this.props.teachSession.teach)
            ? this.props.teachSession
            : this.state.lastTeachSession

        return (
            <>
                {teachSession && teachSession.teach &&
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
            </>
        );
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
        createTeachSessionFromTrainDialogThunkAsync: actions.teach.createTeachSessionFromTrainDialogThunkAsync,
        createTrainDialogThunkAsync: actions.train.createTrainDialogThunkAsync,
        deleteLogDialogThunkAsync: actions.log.deleteLogDialogThunkAsync,
        deleteTeachSessionThunkAsync: actions.teach.deleteTeachSessionThunkAsync,
        editActionThunkAsync: actions.action.editActionThunkAsync,
        editTrainDialogThunkAsync: actions.train.editTrainDialogThunkAsync,
        extractFromTrainDialogThunkAsync: actions.train.extractFromTrainDialogThunkAsync,
        fetchActivitiesThunkAsync: actions.train.fetchActivitiesThunkAsync,
        fetchTrainDialogThunkAsync: actions.train.fetchTrainDialogThunkAsync,
        trainDialogMergeThunkAsync: actions.train.trainDialogMergeThunkAsync,
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
    editingPackageId: string,
    logDialog: CLM.LogDialog | undefined
    onCloseEdit: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>
type dispatchProps = ReturnType<typeof mapDispatchToProps>
type Props = stateProps & dispatchProps & ReceivedProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<stateProps, dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(LogDialogEditor)))