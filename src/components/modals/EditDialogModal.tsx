/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react'
import * as DialogUtils from '../../Utils/dialogUtils'
import * as BotChat from '@conversationlearner/webchat'
import actions from '../../actions'
import HelpIcon from '../HelpIcon'
import AddButtonInput from './AddButtonInput'
import AddScoreButton from './AddButtonScore'
import DisabledInputButtom from './DisabledInputButton'
import ConfirmCancelModal from './ConfirmCancelModal'
import UserInputModal from './UserInputModal'
import FormattedMessageId from '../FormattedMessageId'
import ImportCancelModal from './ImportCancelModal';
import Webchat, { renderActivity } from '../Webchat'
import LogConversionConflictModal, { ConflictPair } from './LogConversionConflictModal'
import { NewActionPreset } from './ActionCreatorEditor'
import { formatMessageId, equal, deepCopy } from '../../Utils/util'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { State } from '../../types'
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip'
import { EditDialogAdmin, EditDialogType, EditState } from '.'
import { Activity } from 'botframework-directlinejs'
import { SelectionType } from '../../types/const'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { FM } from '../../react-intl-messages'
import { TipType } from '../ToolTips/ToolTips'
import { renderReplayError } from '../../Utils/RenderReplayError'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ComponentState {
    isConfirmAbandonOpen: boolean
    isImportAbandonOpen: boolean
    cantReplayMessage: FM | null
    isUserInputModalOpen: boolean
    newActionPreset?: NewActionPreset
    addUserInputSelectionType: SelectionType
    isUserBranchModalOpen: boolean
    isSaveConflictModalOpen: boolean
    selectedActivity: Activity | null
    webchatKey: number
    hasEndSession: boolean
    currentTrainDialog: CLM.TrainDialog | null
    pendingExtractionChanges: boolean
    tags: string[]
    description: string
}

const initialState: ComponentState = {
    isConfirmAbandonOpen: false,
    isImportAbandonOpen: false,
    cantReplayMessage: null,
    isUserInputModalOpen: false,
    newActionPreset: undefined,
    addUserInputSelectionType: SelectionType.NONE,
    isUserBranchModalOpen: false,
    isSaveConflictModalOpen: false,
    selectedActivity: null,
    webchatKey: 0,
    hasEndSession: false,
    currentTrainDialog: null,
    pendingExtractionChanges: false,
    tags: [],
    description: '',
}

class EditDialogModal extends React.Component<Props, ComponentState> {
    state = initialState

    @OF.autobind
    resetWebchat() {
        this.setState({
            webchatKey: this.state.webchatKey + 1,
        })
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.open === false && nextProps.open === true) {
            this.setState({
                ...initialState,
                tags: [...nextProps.trainDialog.tags],
                description: nextProps.trainDialog.description
            });
        }
        if (this.state.currentTrainDialog !== nextProps.trainDialog) {

            let selectedActivity = null
            if (nextProps.initialSelectedActivityIndex !== null) {
                selectedActivity = nextProps.history[nextProps.initialSelectedActivityIndex]
            }

            this.setState({
                currentTrainDialog: nextProps.trainDialog,
                // Force webchat to re-mount as history prop can't be updated
                webchatKey: this.state.webchatKey + 1,
                selectedActivity,
                hasEndSession: this.hasSessionEnded(nextProps.trainDialog),
                tags: nextProps.trainDialog ? [...nextProps.trainDialog.tags] : [],
                description: nextProps.trainDialog ? nextProps.trainDialog.description : ""
            })
        }
    }

    // Did trainDialog end on an EndSession
    hasSessionEnded(trainDialog: CLM.TrainDialog): boolean {

        if (!trainDialog) {
            return false
        }

        const lastRound = trainDialog.rounds[trainDialog.rounds.length - 1]
        if (lastRound.scorerSteps.length === 0) {
            return false
        }

        const lastScorerStep = lastRound.scorerSteps[lastRound.scorerSteps.length - 1]
        const lastAction = this.props.actions.find(a => a.actionId === lastScorerStep.labelAction)
        if (!lastAction) {
            return false
        }

        // Disable if last action is end session
        if (lastAction.actionType === CLM.ActionTypes.END_SESSION) {
            return true
        }

        return false
    }

    @OF.autobind
    onClickAddUserInput(selectionType: SelectionType) {
        // TEMP: until server can exclude label conflicts with self
        if (this.showInternalLabelConflict()) {
            return
        }
        if (this.state.selectedActivity) {
            if (this.canReplay(this.state.selectedActivity)) {
                this.setState({
                    isUserInputModalOpen: true,
                    addUserInputSelectionType: selectionType
                })
            }
            else {
                this.setState({
                    cantReplayMessage: FM.EDITDIALOGMODAL_CANTREPLAY_TITLE
                })
            }
        }
    }

    @OF.autobind
    onClickAddScore(activity: BotChat.Activity, selectionType: SelectionType) {
        // TEMP: until server can exclude label conflicts with self
        if (this.showInternalLabelConflict()) {
            return
        }
        if (this.canReplay(activity)) {
            if (activity && this.state.currentTrainDialog) {
                const isLastActivity = activity === this.props.history[this.props.history.length - 1]
                const trainDialog: CLM.TrainDialog = {
                    ...this.state.currentTrainDialog,
                    tags: this.state.tags,
                    description: this.state.description
                }
                this.props.onInsertAction(trainDialog, activity, isLastActivity, selectionType)
            }
        }
        else {
            this.setState({
                cantReplayMessage: FM.EDITDIALOGMODAL_CANTREPLAY_TITLE
            })
        }
    }

    @OF.autobind
    onClickCloseCantReplay() {
        this.setState({
            cantReplayMessage: null
        })
    }

    @OF.autobind
    onCancelAddUserInput() {
        this.setState({
            isUserInputModalOpen: false
        })
    }

    @OF.autobind
    onSubmitAddUserInput(userInput: string) {
        this.setState({
            isUserInputModalOpen: false
        })

        if (this.state.selectedActivity && this.state.currentTrainDialog) {
            const trainDialog: CLM.TrainDialog = {
                ...this.state.currentTrainDialog,
                tags: this.state.tags,
                description: this.state.description
            }
            this.props.onInsertInput(trainDialog, this.state.selectedActivity, userInput, this.state.addUserInputSelectionType)
        }
    }

    @OF.autobind
    onChangeExtraction(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) {
        if (this.state.selectedActivity && this.state.currentTrainDialog) {
            const trainDialog: CLM.TrainDialog = {
                ...this.state.currentTrainDialog,
                tags: this.state.tags,
                description: this.state.description
            }
            this.props.onChangeExtraction(trainDialog, this.state.selectedActivity, extractResponse, textVariations)
        }
    }

    @OF.autobind
    onChangeAction(trainScorerStep: CLM.TrainScorerStep) {
        if (this.state.selectedActivity && this.state.currentTrainDialog) {
            const trainDialog: CLM.TrainDialog = {
                ...this.state.currentTrainDialog,
                tags: this.state.tags,
                description: this.state.description
            }
            this.props.onChangeAction(trainDialog, this.state.selectedActivity, trainScorerStep)
        }
    }

    //---- BRANCH ----
    @OF.autobind
    onClickBranch() {
        if (this.canReplay(this.state.selectedActivity!)) {
            this.setState({
                isUserBranchModalOpen: true
            })
        }
        else {
            this.setState({
                cantReplayMessage: FM.EDITDIALOGMODAL_CANTBRANCH_TITLE
            })
        }
    }

    @OF.autobind
    onCancelBranch() {
        this.setState({
            isUserBranchModalOpen: false
        })
    }

    @OF.autobind
    onSaveConflictSave() {
        // Save the dialog
        this.onClickSave()
        this.setState({
            isSaveConflictModalOpen: false
        })
    }

    @OF.autobind
    onSaveConflictCancel() {
        // Increment webchat key to reset and clear last input
        // Forces redraw of webchat from TrainDialog (which hasn't been updated yet)
        this.setState({
            isSaveConflictModalOpen: false,
            webchatKey: this.state.webchatKey + 1
        })
    }

    @OF.autobind
    onSubmitBranch(userInput: string) {
        this.setState({
            isUserBranchModalOpen: false
        })

        if (this.state.selectedActivity && this.state.currentTrainDialog && this.props.onBranchDialog) {
            const trainDialog: CLM.TrainDialog = {
                ...this.state.currentTrainDialog,
                tags: this.state.tags,
                description: this.state.description
            }
            this.props.onBranchDialog(trainDialog, this.state.selectedActivity, userInput)
        }
    }

    //---- ABANDON ----
    @OF.autobind
    onClickAbandon() {
        if (this.props.editType === EditDialogType.IMPORT) {
            this.setState({
                isImportAbandonOpen: true
            })
        }
        else {
            this.setState({
                isConfirmAbandonOpen: true
            })
        }
    }

    @OF.autobind
    onClickAbandonCancel() {
        this.setState({
            isConfirmAbandonOpen: false,
            isImportAbandonOpen: false
        })
    }

    // User is continuing the train dialog by typing something new
    @OF.autobind
    async onWebChatPostActivity(activity: Activity) {

        if (activity.type === 'message') {

            const newTrainDialog: CLM.TrainDialog = {
                ...deepCopy(this.props.trainDialog),
                tags: this.state.tags,
                description: this.state.description,
                definitions: {
                    entities: this.props.entities,
                    actions: this.props.actions,
                    trainDialogs: []
                }
            }

            // Content could come from button submit
            const userInput: CLM.UserInput = { text: activity.text! }

            // Allow webchat to scroll to bottom 
            this.props.clearWebchatScrollPosition()

            // If there's an error when I try to continue, reset webchat to ignore new input
            await this.props.setErrorDismissCallback(this.resetWebchat)

            // For now always add button response to bottom of dialog even
            // when card is selected.  
            // Can insert here but would be inconsistent with TeachSession behavior
            /* 
            const buttonSubmit = activity.channelData && activity.channelData.imback
            if (this.state.selectedActivity && buttonSubmit) {
                await this.props.onInsertInput(this.state.currentTrainDialog!, this.state.selectedActivity, userInput.text, this.state.addUserInputSelectionType)
            }
            */
            // If next action should be score, need to insert, not continue
            if (this.waitingForScore()) {
                const lastActivity = this.props.history[this.props.history.length - 1]
                await this.props.onInsertInput(this.state.currentTrainDialog!, lastActivity, userInput.text, this.state.addUserInputSelectionType)
            }
            // Otherwise continue
            else {
                // TEMP: until server can exclude label conflicts with self
                if (this.showInternalLabelConflict()) {
                    return
                }
                await this.props.onContinueDialog(newTrainDialog, userInput)
            }
        }
    }

    // TEMP: until server can exclude label conflicts with self, we need
    // to check for them and force save before we can add a turn 
    showInternalLabelConflict(): boolean {

        // Can avoid check on import as won't have pre-existing dialog
        if (this.props.editType === EditDialogType.IMPORT) {
            return false
        }
        if (this.props.originalTrainDialog && this.state.currentTrainDialog) {
            const conflict = DialogUtils.hasInternalLabelConflict(this.props.originalTrainDialog, this.state.currentTrainDialog)
            if (conflict) {
                this.setState({ isSaveConflictModalOpen: true })
                return true
            }
        }
        return false
    }
    onWebChatSelectActivity(activity: Activity) {
        this.setState({
            selectedActivity: activity,
        })

        const newActionPreset = this.getNewActionPreset(activity)
        this.setState({newActionPreset})
    }

    onPendingStatusChanged(changed: boolean) {
        // Put mask on webchat if changing extractions
        this.setState({
            pendingExtractionChanges: changed
        })
    }

    // Returns false if dialog has fatal replay error occuring before
    // the selected activity that would prevent a teach 
    canReplay(activity: BotChat.Activity): boolean {
        if (this.props.history.length === 0) {
            return true
        }
        // Loop until I hit the current activity
        let activityIndex = 0
        do {
            const clData: CLM.CLChannelData = this.props.history[activityIndex].channelData.clData
            if (clData && clData.replayError && clData.replayError.errorLevel === CLM.ReplayErrorLevel.BLOCKING) {
                return false
            }
            activityIndex = activityIndex + 1
        }
        while (activity !== this.props.history[activityIndex - 1])
        return true
    }

    // Returns true if blocking error exists
    hasBlockingError(): boolean {
        if (this.props.history.length === 0) {
            return false
        }
        for (const activity of this.props.history) {
            const clData: CLM.CLChannelData = activity.channelData.clData
            if (clData &&
                clData.replayError &&
                clData.replayError.errorLevel === CLM.ReplayErrorLevel.BLOCKING) {
                return true
            }
        }
        return false
    }

    renderActivity(activityProps: BotChat.WrappedActivityProps, children: React.ReactNode, setRef: (div: HTMLDivElement | null) => void): JSX.Element {
        return renderActivity(activityProps, children, setRef, this.renderSelectedActivity, this.props.editType, this.state.selectedActivity != null)
    }

    getNewActionPreset(activity: Activity): NewActionPreset | undefined {
        const clData: CLM.CLChannelData = activity.channelData.clData
        const senderType = clData.senderType
        const scoreIndex = clData.scoreIndex || 0
        const roundIndex = clData.roundIndex

        const curRound = this.props.trainDialog.rounds[roundIndex!]

        if (!curRound || senderType !== CLM.SenderType.Bot) {
            return undefined
        }

        const importText = curRound.scorerSteps[scoreIndex].importText
        const isTerminal = senderType === CLM.SenderType.Bot 
            ? curRound.scorerSteps.length === scoreIndex + 1
            : false

        if (importText) {
            return { text: importText, isTerminal }
        }
        return undefined
    }

    @OF.autobind
    renderSelectedActivity(activity: Activity): (JSX.Element | null) {

        if (this.props.editState !== EditState.CAN_EDIT || !this.props.trainDialog) {
            return null
        }

        const clData: CLM.CLChannelData = activity.channelData.clData
        const canBranch =
            activity &&
            // Can only branch on user turns
            clData.senderType === CLM.SenderType.User &&
            // Can only branch on un-edited dialogs
            (this.props.editType === EditDialogType.LOG_ORIGINAL || this.props.editType === EditDialogType.TRAIN_ORIGINAL)

        const roundIndex = clData.roundIndex
        const senderType = clData.senderType
        const curRound = this.props.trainDialog.rounds[roundIndex!]

        // Round could have been deleted
        if (!curRound) {
            return null
        }

        const hasNoScorerStep = curRound.scorerSteps.length === 0 || curRound.scorerSteps[0].labelAction === undefined

        // Can only delete first user input if it has no scorer steps
        // and is followed by user input
        const canDeleteRound =
            (roundIndex !== 0 && roundIndex !== null) ||
            senderType !== CLM.SenderType.User ||
            (hasNoScorerStep && this.props.trainDialog.rounds.length > 1)

        const hideBranch =  
            !canBranch || 
            !this.props.onBranchDialog ||
            this.state.pendingExtractionChanges ||
            this.props.editState !== EditState.CAN_EDIT
        
        const isLastActivity = activity === this.props.history[this.props.history.length - 1]
        const selectionType = isLastActivity ? SelectionType.NONE : SelectionType.NEXT
        const isEndSession = isLastActivity && this.state.hasEndSession
        return (
            <div className="cl-wc-buttonbar">
                {!isEndSession &&
                    <AddButtonInput
                        onClick={() => this.onClickAddUserInput(selectionType)}
                        editType={this.props.editType}
                    />
                }
                {!isEndSession &&
                    <AddScoreButton
                        // Don't select an activity if on last step
                        onClick={() => this.onClickAddScore(activity, selectionType)}
                    />
                }
                {canDeleteRound &&
                    <OF.IconButton
                        data-testid="edit-dialog-modal-delete-turn-button"
                        className={`cl-wc-deleteturn ${clData.senderType === CLM.SenderType.User ? `cl-wc-deleteturn--user` : `cl-wc-deleteturn--bot`}`}
                        iconProps={{ iconName: 'Delete' }}
                        onClick={() => {
                            if (this.state.selectedActivity && this.state.currentTrainDialog) {
                                const trainDialog: CLM.TrainDialog = {
                                    ...this.state.currentTrainDialog,
                                    tags: this.state.tags,
                                    description: this.state.description
                                }
                                this.props.onDeleteTurn(trainDialog, activity)
                            }
                        }}
                        ariaDescription="Delete Turn"
                    />
                }
                {!hideBranch &&
                    <TooltipHost
                        directionalHint={DirectionalHint.topCenter}
                        tooltipProps={{
                            onRenderContent: () =>
                                <FormattedMessageId id={FM.TOOLTIP_BRANCH_BUTTON} />
                        }}
                    >
                        <OF.IconButton
                            data-testid="edit-dialog-modal-branch-button"
                            className={`cl-wc-branchturn`}
                            iconProps={{ iconName: 'BranchMerge' }}
                            onClick={this.onClickBranch}
                            ariaDescription={formatMessageId(this.props.intl, FM.EDITDIALOGMODAL_BRANCH_ARIADESCRIPTION)}
                        />
                    </TooltipHost>
                }
            </div>
        )
    }

    shouldDisableUserInput(): boolean {

        if (!this.props.trainDialog) {
            return true
        }

        if (this.props.trainDialog.rounds.length === 0) {
            return false
        }

        // Disable last round has no scorer step
        const lastRound = this.props.trainDialog.rounds[this.props.trainDialog.rounds.length - 1]
        if (lastRound.scorerSteps.length === 0) {
            return true
        }

        const lastScorerStep = lastRound.scorerSteps[lastRound.scorerSteps.length - 1]

        // If not an unresolved import action
        if (!lastScorerStep.importText) {
            const lastAction = this.props.actions.find(a => a.actionId === lastScorerStep.labelAction)
            // Disable if last round's last scorer step isn't terminal
            if (!lastAction || !lastAction.isTerminal) {
                return true
            }
        }

        return false
    }

    waitingForScore(): boolean {
        if (!this.props.trainDialog || this.props.trainDialog.rounds.length === 0) {
            return false
        }
        // If last round doesn't have a scorer step (or is a dummy round)
        const lastRound = this.props.trainDialog.rounds[this.props.trainDialog.rounds.length - 1]
        if (lastRound.scorerSteps.length === 0 || !lastRound.scorerSteps[0].labelAction) {
            return true
        }
        // If last action is a non-wait action
        const lastActionLabel = lastRound.scorerSteps[lastRound.scorerSteps.length - 1].labelAction
        const action = this.props.actions.find(a => a.actionId === lastActionLabel)
        if (action && !action.isTerminal) {
            return true
        }
        return false
    }

    @OF.autobind
    onClickAbandonApprove(stopImporting: boolean = false) {
        const dialogChanged = this.isDialogChanged()

        switch (this.props.editType) {
            case EditDialogType.NEW:
                this.props.onDeleteDialog()
                break;
            case EditDialogType.IMPORT:
                this.props.onCloseModal(false, stopImporting) // false -> no need to reload original
                break;
            case EditDialogType.BRANCH:
                this.props.onCloseModal(false, stopImporting) // false -> no need to reload original
                break;
            case EditDialogType.LOG_EDITED:
                this.props.onCloseModal(false, stopImporting) // false -> no need to reload original
                break;
            case EditDialogType.LOG_ORIGINAL:
                this.props.onDeleteDialog()
                break;
            case EditDialogType.TRAIN_EDITED:
                this.props.onCloseModal(true, stopImporting) // true -> Reload original TrainDialog
                break;
            case EditDialogType.TRAIN_ORIGINAL:
                dialogChanged
                    ? this.props.onCloseModal(true, stopImporting)
                    : this.props.onDeleteDialog()
                break;
            default:
        }
    }

    renderAbandonText(intl: ReactIntl.InjectedIntl) {
        const dialogChanged = this.isDialogChanged()

        switch (this.props.editType) {
            case EditDialogType.NEW:
            return formatMessageId(intl, FM.BUTTON_ABANDON)
            case EditDialogType.IMPORT:
                return formatMessageId(intl, FM.BUTTON_ABANDON_IMPORT)
            case EditDialogType.BRANCH:
                return formatMessageId(intl, FM.BUTTON_ABANDON_BRANCH)
            case EditDialogType.LOG_EDITED:
                return formatMessageId(intl, FM.BUTTON_ABANDON_EDIT)
            case EditDialogType.LOG_ORIGINAL:
                return formatMessageId(intl, FM.BUTTON_DELETE)
            case EditDialogType.TRAIN_EDITED:
                return formatMessageId(intl, FM.BUTTON_ABANDON_EDIT)
            case EditDialogType.TRAIN_ORIGINAL:
                return dialogChanged
                    ? formatMessageId(intl, FM.BUTTON_ABANDON_EDIT)
                    : formatMessageId(intl, FM.BUTTON_DELETE)
            default:
                return ""
        }
    }

    renderAbandonIcon() {
        const dialogChanged = this.isDialogChanged()

        switch (this.props.editType) {
            case EditDialogType.NEW:
            case EditDialogType.IMPORT:
            case EditDialogType.BRANCH:
            case EditDialogType.LOG_EDITED:
            case EditDialogType.TRAIN_EDITED:
                return "Cancel"
            case EditDialogType.LOG_ORIGINAL:
                return "Delete"
            case EditDialogType.TRAIN_ORIGINAL:
                return dialogChanged
                    ? "Cancel"
                    : "Delete"
            default:
                return ""
        }
    }

    isDialogChanged() {
        // Only occurs before dialog is open and doesn't have props setup
        if (!this.props.trainDialog) {
            return false
        }

        return this.state.description !== this.props.trainDialog.description
            || !equal(this.state.tags, this.props.trainDialog.tags)
    }

    @OF.autobind
    onClickConvert() {
        if (this.props.editType !== EditDialogType.LOG_ORIGINAL) {
            throw Error("Invalid Edit Type for onClickConvert")
        }

        const trainDialog: CLM.TrainDialog = {
            ...this.props.trainDialog,
            tags: this.state.tags,
            description: this.state.description
        }
        this.props.onSaveDialog(trainDialog)
    }

    @OF.autobind
    onClickSave() {
        const trainDialog: CLM.TrainDialog = {
            ...this.props.trainDialog,
            tags: this.state.tags,
            description: this.state.description
        }

        const dialogChanged = this.isDialogChanged()

        switch (this.props.editType) {
            case EditDialogType.NEW:
            case EditDialogType.IMPORT:
            case EditDialogType.BRANCH:
                this.props.onCreateDialog(trainDialog)
                break;
            case EditDialogType.LOG_EDITED:
                this.props.onSaveDialog(trainDialog)
                break;
            case EditDialogType.LOG_ORIGINAL:
                this.props.onCloseModal(false, false)  // false - No need to reload original
                break;
            case EditDialogType.TRAIN_EDITED:
                this.props.onSaveDialog(trainDialog)
                break;
            case EditDialogType.TRAIN_ORIGINAL:
                dialogChanged
                    ? this.props.onSaveDialog(trainDialog)
                    : this.props.onCloseModal(false, false)  // false - No need to reload original
                break;
            default:
        }
    }

    @OF.autobind
    onAddTag(tag: string) {
        this.setState(prevState => ({
            tags: [...prevState.tags, tag]
        }))
    }

    @OF.autobind
    onRemoveTag(tag: string) {
        this.setState(prevState => ({
            tags: prevState.tags.filter(t => t !== tag)
        }))
    }

    @OF.autobind
    onChangeDescription(description: string) {
        this.setState({
            description
        })
    }

    isCloseOrSaveBlocked(hasBlockingError: boolean): boolean {
        switch (this.props.editType) {
            // Save buttons
            case EditDialogType.NEW:
            case EditDialogType.IMPORT:
            case EditDialogType.BRANCH:
            case EditDialogType.LOG_EDITED:
            case EditDialogType.TRAIN_EDITED:
                return hasBlockingError
            // Close buttons
            case EditDialogType.LOG_ORIGINAL:
            case EditDialogType.TRAIN_ORIGINAL:
                return false
            default:
                return hasBlockingError
        }
    }

    renderCloseOrSaveText(intl: ReactIntl.InjectedIntl) {
        const dialogChanged = this.isDialogChanged()

        switch (this.props.editType) {
            case EditDialogType.NEW:
            case EditDialogType.IMPORT:
                return formatMessageId(intl, FM.BUTTON_SAVE)
            case EditDialogType.BRANCH:
                return formatMessageId(intl, FM.BUTTON_SAVE_BRANCH)
            case EditDialogType.LOG_EDITED:
                return formatMessageId(intl, FM.BUTTON_SAVE_AS_TRAIN_DIALOG)
            case EditDialogType.LOG_ORIGINAL:
                return formatMessageId(intl, FM.BUTTON_CLOSE)
            case EditDialogType.TRAIN_EDITED:
                return formatMessageId(intl, FM.BUTTON_SAVE_EDIT)
            case EditDialogType.TRAIN_ORIGINAL:
                return dialogChanged
                    ? formatMessageId(intl, FM.BUTTON_SAVE_EDIT)
                    : formatMessageId(intl, FM.BUTTON_CLOSE)
            default:
                return ""
        }
    }

    renderCloseOrSaveIcon() {
        const dialogChanged = this.isDialogChanged()

        switch (this.props.editType) {
            case EditDialogType.IMPORT:
            case EditDialogType.NEW:
            case EditDialogType.BRANCH:
            case EditDialogType.LOG_EDITED:
            case EditDialogType.TRAIN_EDITED:
                return "Accept"
            case EditDialogType.LOG_ORIGINAL:
                return "Cancel"
            case EditDialogType.TRAIN_ORIGINAL:
                return dialogChanged
                    ? "Accept"
                    : "Cancel"
            default:
                return ""
        }
    }

    renderConfirmText(intl: ReactIntl.InjectedIntl) {
        const dialogChanged = this.isDialogChanged()
        if (dialogChanged) {
            return formatMessageId(intl, FM.EDITDIALOGMODAL_CONFIRMABANDON_EDIT_TITLE)
        }

        switch (this.props.editType) {
            case EditDialogType.NEW:
            case EditDialogType.BRANCH:
                return formatMessageId(intl, FM.EDITDIALOGMODAL_CONFIRMABANDON_NEW_TITLE)
            case EditDialogType.LOG_EDITED:
                return formatMessageId(intl, FM.EDITDIALOGMODAL_CONFIRMABANDON_EDIT_TITLE)
            case EditDialogType.LOG_ORIGINAL:
                return formatMessageId(intl, FM.EDITDIALOGMODAL_CONFIRMDELETELOG_TITLE)
            case EditDialogType.TRAIN_EDITED:
                return formatMessageId(intl, FM.EDITDIALOGMODAL_CONFIRMABANDON_EDIT_TITLE)
            case EditDialogType.TRAIN_ORIGINAL:
                return formatMessageId(intl, FM.EDITDIALOGMODAL_CONFIRMDELETETRAIN_TITLE)
            default:
                // EditDialogType.IMPORT Handled by ImportCancelModal
                return ""
        }
    }

    onScrollChange(position: number) {
        this.props.setWebchatScrollPosition(position)
    }

    @OF.autobind
    renderWebchatInput(showDisableInput: boolean): JSX.Element | null {
        if (this.waitingForScore() && this.state.currentTrainDialog) {
            return (
                <div className="wc-console">
                    <OF.PrimaryButton
                        data-testid="score-actions-button"
                        className="cl-rightjustify"
                        disabled={this.props.editState !== EditState.CAN_EDIT}
                        onClick={() => this.onClickAddScore(this.props.history[this.props.history.length - 1], SelectionType.NONE)}
                        ariaDescription={'Score Actions'}
                        text={'Score Actions'} // TODO internationalize
                    />
                </div>)
        }
        else if (showDisableInput) {
            return (
                <div className="wc-console">
                    <div className="wc-textbox">
                        <input
                            type="text"
                            className="wc-shellinput"
                            onKeyPress={() =>
                                this.setState({
                                    cantReplayMessage: FM.EDITDIALOGMODAL_CANTREPLAY_TITLE
                                })
                            }
                            placeholder={"Type your message..."}
                        />
                    </div>
                    <DisabledInputButtom
                        className="cl-button-blockwebchat"
                        onClick={() =>
                            this.setState({
                                cantReplayMessage: FM.EDITDIALOGMODAL_CANTREPLAY_TITLE
                            })
                        }
                    />
                </div>
            )
        }
        return null
    }

    renderWarning(): React.ReactNode | null {
        if (!this.props.trainDialog) {
            return null
        }

        const replayError = DialogUtils.getReplayError(this.state.selectedActivity)
        if (this.props.editState === EditState.INVALID_BOT) {
            return (
                <div className={`cl-editdialog-warning ${OF.FontClassNames.mediumPlus}`}
                    data-testid="dialog-modal-warning">
                    <FormattedMessageId id={FM.EDITDIALOGMODAL_WARNING_INVALID_BOT} />
                    <HelpIcon tipType={TipType.INVALID_BOT} />
                </div>
            )
        }
        if (this.props.editState === EditState.INVALID_PACKAGE) {
            return (
                <div className={`cl-editdialog-warning ${OF.FontClassNames.mediumPlus}`}
                    data-testid="dialog-modal-warning">
                    <FormattedMessageId id={FM.EDITDIALOGMODAL_WARNING_INVALID_PACKAGE} />
                </div>
            )
        }
        if (replayError) {
            return renderReplayError(replayError)
        }

        // No Activity selected, but Replay error on an Activity
        const replayErrorLevel = this.props.history ? DialogUtils.getReplayErrorLevel(this.props.history) : null
        if (replayErrorLevel) {
            if (replayErrorLevel === CLM.ReplayErrorLevel.WARNING) {
                // Only show activity based warning if no trainDialog level warning
                if (this.props.trainDialog.validity !== CLM.Validity.UNKNOWN
                    && this.props.trainDialog.validity !== CLM.Validity.WARNING) {
                    return (
                        <div className={`cl-editdialog-warning ${OF.FontClassNames.mediumPlus}`}
                            data-testid="dialog-modal-warning">
                            <FormattedMessageId id={FM.REPLAYERROR_WARNING} />
                        </div>
                    )
                }
            }
            else {
                return (
                    <div className={`cl-editdialog-error ${OF.FontClassNames.mediumPlus}`}
                        data-testid="dialog-modal-error-noselection">
                        {this.props.editType === EditDialogType.LOG_ORIGINAL
                            ? <FormattedMessageId id={FM.REPLAYERROR_EXISTS_LOG} />
                            : <FormattedMessageId id={FM.REPLAYERROR_EXISTS} />
                        }
                    </div>
                )
            }
        }

        if (this.props.trainDialog.validity === CLM.Validity.UNKNOWN) {
            return (
                <div className={`cl-editdialog-caution ${OF.FontClassNames.mediumPlus}`}
                    data-testid="dialog-modal-caution">
                    <FormattedMessageId id={FM.EDITDIALOGMODAL_UNKNOWN_NEED_REPLAY} />
                    <HelpIcon tipType={TipType.EDITDIALOGMODAL_UNKNOWN_NEED_REPLAY} customClass="cl-icon-orangebackground" />
                </div>
            )
        }
        else if (this.props.trainDialog.validity === CLM.Validity.WARNING) {
            return (
                <div className={`cl-editdialog-warning ${OF.FontClassNames.mediumPlus}`}
                    data-testid="dialog-modal-warning">
                    <FormattedMessageId id={FM.EDITDIALOGMODAL_WARNING_NEED_REPLAY} />
                    <HelpIcon tipType={TipType.EDITDIALOGMODAL_WARNING_NEED_REPLAY} customClass="cl-icon-orangebackground" />
                </div>
            )
        }
        return null
    }

    render() {
        const { intl } = this.props
        // Put mask of webchat if waiting for extraction labelling
        const chatDisable = this.state.pendingExtractionChanges ? <div className="cl-overlay" /> : null;
        const hasBlockingError = this.hasBlockingError()
        const disableUserInput = this.shouldDisableUserInput()
        const isLastActivitySelected = this.state.selectedActivity ? this.state.selectedActivity === this.props.history[this.props.history.length - 1] : false
        const containerClassName = `cl-modal cl-modal--large cl-modal--${this.props.editType === EditDialogType.LOG_EDITED ? "teach" : "log"}`
        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={true}
                containerClassName={containerClassName}
            >
                <div className="cl-modal_body">
                    <div className="cl-chatmodal">
                        <div className="cl-chatmodal_webchat">
                            <Webchat
                                data-testid="chatmodal-webchat"
                                isOpen={this.props.open}
                                key={this.state.webchatKey}
                                app={this.props.app}
                                history={this.props.history}
                                onPostActivity={activity => this.onWebChatPostActivity(activity)}
                                onSelectActivity={activity => this.onWebChatSelectActivity(activity)}
                                onScrollChange={position => this.onScrollChange(position)}
                                hideInput={disableUserInput || hasBlockingError || this.state.hasEndSession || this.props.editState !== EditState.CAN_EDIT}
                                focusInput={false}
                                disableDL={true} // Prevents ProcessActivity from being called
                                renderActivity={(props, children, setRef) => this.renderActivity(props, children, setRef)}
                                renderInput={() => this.renderWebchatInput(disableUserInput || hasBlockingError)}
                                selectedActivityIndex={this.props.initialSelectedActivityIndex}
                            />
                            {chatDisable}
                        </div>
                        <div className="cl-chatmodal_controls">
                            <div className="cl-chatmodal_admin-controls">
                                <EditDialogAdmin
                                    data-testid="chatmodal-editdialogadmin"
                                    app={this.props.app}
                                    editingPackageId={this.props.editingPackageId}
                                    editingLogDialogId={this.props.editingLogDialogId}
                                    originalTrainDialogId={this.props.originalTrainDialog ? this.props.originalTrainDialog.trainDialogId : null}
                                    editType={this.props.editType}
                                    editState={this.props.editState}
                                    trainDialog={this.props.trainDialog}
                                    selectedActivity={this.state.selectedActivity}
                                    isLastActivitySelected={isLastActivitySelected}
                                    onChangeAction={this.onChangeAction}
                                    onSubmitExtraction={(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) => this.onChangeExtraction(extractResponse, textVariations)}
                                    onPendingStatusChanged={(changed: boolean) => this.onPendingStatusChanged(changed)}
                                    newActionPreset={this.state.newActionPreset}//LARS rename
                                    importIndex={this.props.importIndex}
                                    importCount={this.props.importCount}
                                    allUniqueTags={this.props.allUniqueTags}
                                    tags={this.state.tags}
                                    onAddTag={this.onAddTag}
                                    onRemoveTag={this.onRemoveTag}

                                    description={this.state.description}
                                    onChangeDescription={this.onChangeDescription}
                                    onActionCreatorClosed={() => this.setState({newActionPreset: undefined})}
                                />
                            </div>
                            {this.props.editState !== EditState.CAN_EDIT && <div className="cl-overlay" />}
                        </div>
                    </div>
                </div>
                <div className="cl-modal_footer cl-modal_footer--border">
                    <div className="cl-modal-buttons">
                        <div className="cl-debug-marker" />
                        <div className="cl-modal-buttons_secondary">
                            {this.renderWarning()}
                        </div>

                        <div className="cl-modal-buttons_primary">
                            {this.props.editType === EditDialogType.LOG_ORIGINAL &&
                                <OF.PrimaryButton
                                    data-testid="footer-button-done"
                                    disabled={this.state.pendingExtractionChanges || this.props.editState !== EditState.CAN_EDIT || hasBlockingError}
                                    onClick={this.onClickConvert}
                                    ariaDescription={formatMessageId(intl, FM.BUTTON_SAVE_AS_TRAIN_DIALOG)}
                                    text={formatMessageId(intl, FM.BUTTON_SAVE_AS_TRAIN_DIALOG)}
                                    iconProps={{ iconName: 'Accept' }}
                                />
                            }
                            <TooltipHost
                                directionalHint={DirectionalHint.topCenter}
                                tooltipProps={{
                                    onRenderContent: () =>
                                        <FormattedMessageId id={FM.TOOLTIP_REPLAY} />
                                }}
                            >
                                <OF.PrimaryButton
                                    data-testid="edit-dialog-modal-replay-button"
                                    disabled={this.state.pendingExtractionChanges || this.props.editState !== EditState.CAN_EDIT}
                                    onClick={() => this.props.onReplayDialog(this.props.trainDialog)}
                                    ariaDescription={formatMessageId(intl, FM.BUTTON_REPLAY)}
                                    text={formatMessageId(intl, FM.BUTTON_REPLAY)}
                                    iconProps={{ iconName: 'Refresh' }}
                                />
                            </TooltipHost>

                            <OF.PrimaryButton
                                data-testid="edit-teach-dialog-close-save-button"
                                disabled={this.state.pendingExtractionChanges || this.isCloseOrSaveBlocked(hasBlockingError)}
                                onClick={this.onClickSave}
                                ariaDescription={this.renderCloseOrSaveText(intl)}
                                text={this.renderCloseOrSaveText(intl)}
                                iconProps={{ iconName: this.renderCloseOrSaveIcon() }}
                            />
                            <OF.DefaultButton
                                data-testid="edit-dialog-modal-abandon-delete-button"
                                className="cl-button-delete"
                                disabled={this.props.editState !== EditState.CAN_EDIT}
                                onClick={this.onClickAbandon}
                                ariaDescription={this.renderAbandonText(intl)}
                                text={this.renderAbandonText(intl)}
                                iconProps={{ iconName: this.renderAbandonIcon() }}
                            />
                        </div>
                    </div>
                </div>
                <ConfirmCancelModal
                    data-testid="confirm-delete-trainingdialog"
                    open={this.state.isConfirmAbandonOpen}
                    onCancel={this.onClickAbandonCancel}
                    onConfirm={this.onClickAbandonApprove}
                    title={this.renderConfirmText(intl)}
                />
                <ImportCancelModal
                    open={this.state.isImportAbandonOpen}
                    onCancel={this.onClickAbandonCancel}
                    onConfirm={this.onClickAbandonApprove}
                />
                {this.state.cantReplayMessage &&
                    <ConfirmCancelModal
                        open={true}
                        onCancel={this.onClickCloseCantReplay}
                        title={this.state.cantReplayMessage ? formatMessageId(intl, this.state.cantReplayMessage) : ""}
                    />
                }
                <UserInputModal
                    open={this.state.isUserInputModalOpen}
                    titleFM={FM.USERINPUT_ADD_TITLE}
                    onCancel={this.onCancelAddUserInput}
                    onSubmit={this.onSubmitAddUserInput}
                />
                <UserInputModal
                    titleFM={FM.USERINPUT_BRANCH_TITLE}
                    open={this.state.isUserBranchModalOpen}
                    onCancel={this.onCancelBranch}
                    onSubmit={this.onSubmitBranch}
                />
                <LogConversionConflictModal
                    title={formatMessageId(intl, FM.LOGCONVERSIONCONFLICTMODAL_SUBTITLE)}
                    open={this.props.conflictPairs.length > 0}
                    entities={this.props.entities}
                    conflictPairs={this.props.conflictPairs}
                    onClose={this.props.onAbortConflictResolution}
                    onAccept={this.props.onAcceptConflictResolution}
                />
                <ConfirmCancelModal
                    open={this.state.isSaveConflictModalOpen}
                    title={formatMessageId(intl, FM.EDITDIALOGMODAL_SAVECONFLICT_TITLE)}
                    onCancel={this.onSaveConflictCancel}
                    onOk={this.onSaveConflictSave}
                />
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setWebchatScrollPosition: actions.display.setWebchatScrollPosition,
        clearWebchatScrollPosition: actions.display.clearWebchatScrollPosition,
        setErrorDismissCallback: actions.display.setErrorDismissCallback
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user.user,
        actions: state.actions,
        entities: state.entities
    }
}

export interface ReceivedProps {
    app: CLM.AppBase,
    editingPackageId: string
    editState: EditState
    open: boolean
    // Current train dialog being edited
    trainDialog: CLM.TrainDialog
    // Train Dialog that this edit originally came from
    originalTrainDialog: CLM.TrainDialog | null
    // If editing a log dialog, this was the source
    editingLogDialogId: string | null
    history: Activity[]
    // Is it a new dialog, a TrainDialog or LogDialog 
    editType: EditDialogType
    // If starting with activity selected
    initialSelectedActivityIndex: number | null
    allUniqueTags: string[]
    importIndex?: number
    importCount?: number

    onInsertAction: (trainDialog: CLM.TrainDialog, activity: Activity, isLastActivity: boolean, selectionType: SelectionType) => any
    onInsertInput: (trainDialog: CLM.TrainDialog, activity: Activity, userText: string, selectionType: SelectionType) => any
    onChangeExtraction: (trainDialog: CLM.TrainDialog, activity: Activity, extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) => any
    onChangeAction: (trainDialog: CLM.TrainDialog, activity: Activity, trainScorerStep: CLM.TrainScorerStep) => any
    onDeleteTurn: (trainDialog: CLM.TrainDialog, activity: Activity) => any
    onCloseModal: (reload: boolean, stopImport: boolean) => void
    onBranchDialog: ((trainDialog: CLM.TrainDialog, activity: Activity, userText: string) => void) | null,
    onContinueDialog: (newTrainDialog: CLM.TrainDialog, initialUserInput: CLM.UserInput) => void
    onSaveDialog: (newTrainDialog: CLM.TrainDialog) => void
    onReplayDialog: (newTrainDialog: CLM.TrainDialog) => void
    // Add a new train dialog to the Model (when EditDialogType === NEW)
    onCreateDialog: (newTrainDialog: CLM.TrainDialog) => void
    onDeleteDialog: () => void
    conflictPairs: ConflictPair[]
    onAcceptConflictResolution: (conflictPairs: ConflictPair[]) => Promise<void>
    onAbortConflictResolution: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(EditDialogModal))
