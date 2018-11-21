/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as OF from 'office-ui-fabric-react';
import * as DialogUtils from '../../Utils/dialogUtils'
import { formatMessageId } from '../../Utils/util'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { State } from '../../types'
import actions from '../../actions'
import Webchat, { renderActivity } from '../Webchat'
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import * as BotChat from '@conversationlearner/webchat'
import { EditDialogAdmin, EditDialogType, EditState } from '.'
import * as CLM from '@conversationlearner/models'
import { Activity } from 'botframework-directlinejs'
import { SelectionType } from '../../types/const'
import AddButtonInput from './AddButtonInput'
import AddScoreButton from './AddButtonScore'
import DisabledInputButtom from './DisabledInputButton'
import ConfirmCancelModal from './ConfirmCancelModal'
import UserInputModal from './UserInputModal'
import FormattedMessageId from '../FormattedMessageId'
import { FM } from '../../react-intl-messages'
import HelpIcon from '../HelpIcon'
import { TipType } from '../ToolTips/ToolTips';
import { renderReplayError } from '../../Utils/RenderReplayError'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ComponentState {
    isConfirmAbandonOpen: boolean
    cantReplayMessage: FM | null
    isUserInputModalOpen: boolean
    addUserInputSelectionType: SelectionType
    isUserBranchModalOpen: boolean
    selectedActivity: Activity | null
    webchatKey: number
    currentTrainDialog: CLM.TrainDialog | null
    pendingExtractionChanges: boolean,
}

const initialState: ComponentState = {
    isConfirmAbandonOpen: false,
    cantReplayMessage: null,
    isUserInputModalOpen: false,
    addUserInputSelectionType: SelectionType.NONE,
    isUserBranchModalOpen: false,
    selectedActivity: null,
    webchatKey: 0,
    currentTrainDialog: null,
    pendingExtractionChanges: false
}

class EditDialogModal extends React.Component<Props, ComponentState> {
    state = initialState

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.open === false && nextProps.open === true) {
            this.setState(initialState);
        }
        if (this.state.currentTrainDialog !== nextProps.trainDialog) {

            let selectedActivity = null
            if (nextProps.initialSelectedActivityIndex !== null) {
                selectedActivity = nextProps.history[nextProps.initialSelectedActivityIndex]
            }

            // Force webchat to re-mount as history prop can't be updated
            this.setState({
                currentTrainDialog: nextProps.trainDialog,
                webchatKey: this.state.webchatKey + 1,
                selectedActivity
            })

        }
    }

    @OF.autobind
    onClickAddUserInput(selectionType: SelectionType) {
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
        if (this.canReplay(activity)) {
            if (activity && this.state.currentTrainDialog) {
                this.props.onInsertAction(this.state.currentTrainDialog, activity, selectionType)
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
            this.props.onInsertInput(this.state.currentTrainDialog, this.state.selectedActivity, userInput, this.state.addUserInputSelectionType)
        }
    }

    @OF.autobind
    onChangeExtraction(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) {
        if (this.state.selectedActivity && this.state.currentTrainDialog) {
            this.props.onChangeExtraction(this.state.currentTrainDialog, this.state.selectedActivity, extractResponse, textVariations)
        }
    }

    @OF.autobind
    onChangeAction(trainScorerStep: CLM.TrainScorerStep) {
        if (this.state.selectedActivity && this.state.currentTrainDialog) {
            this.props.onChangeAction(this.state.currentTrainDialog, this.state.selectedActivity, trainScorerStep)
        }
    }

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
    onSubmitBranch(userInput: string) {
        this.setState({
            isUserBranchModalOpen: false
        })

        if (this.state.selectedActivity && this.state.currentTrainDialog && this.props.onBranchDialog) {
            this.props.onBranchDialog(this.state.currentTrainDialog, this.state.selectedActivity, userInput)
        }
    }

    @OF.autobind
    onClickAbandon() {
        this.setState({
            isConfirmAbandonOpen: true
        })

    }

    // User is continuing the train dialog by typing something new
    @OF.autobind
    onPostNewActivity(activity: Activity) {

        if (activity.type === 'message') {

            let newTrainDialog = JSON.parse(JSON.stringify(this.props.trainDialog))
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }
            newTrainDialog.definitions = definitions

            const initialUserInput: CLM.UserInput = { text: activity.text! }
            // Allow webchat to scroll to bottom 
            this.props.clearWebchatScrollPosition()
            this.props.onContinueDialog(newTrainDialog, initialUserInput)
        }
    }

    onWebChatSelectActivity(activity: Activity) {
        this.setState({
            selectedActivity: activity
        })
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
        for (let activity of this.props.history) {
            const clData: CLM.CLChannelData = activity.channelData.clData
            if (clData &&
                clData.replayError &&
                clData.replayError.errorLevel === CLM.ReplayErrorLevel.BLOCKING) {
                return true
            }
        }
        return false
    }

    // Does history have any replay errors
    replayErrorLevel(): CLM.ReplayErrorLevel | null {
        if (!this.props.history || this.props.history.length === 0) {
            return null
        }

        // Return most severe error level found
        let replayErrorLevel: CLM.ReplayErrorLevel | null = null
        for (let h of this.props.history) {
            const clData: CLM.CLChannelData = h.channelData.clData
            if (clData && clData.replayError) {
                if (clData.replayError.errorLevel === CLM.ReplayErrorLevel.BLOCKING) {
                    return CLM.ReplayErrorLevel.BLOCKING
                }
                else if (clData.replayError.errorLevel === CLM.ReplayErrorLevel.ERROR) {
                    replayErrorLevel = CLM.ReplayErrorLevel.ERROR
                }
                else if (clData.replayError.errorLevel === CLM.ReplayErrorLevel.WARNING && replayErrorLevel !== CLM.ReplayErrorLevel.ERROR) {
                    replayErrorLevel = CLM.ReplayErrorLevel.WARNING
                }
            }
        }
        return replayErrorLevel
    }

    renderActivity(activityProps: BotChat.WrappedActivityProps, children: React.ReactNode, setRef: (div: HTMLDivElement | null) => void): JSX.Element {
        return renderActivity(activityProps, children, setRef, this.renderSelectedActivity, this.props.editType)
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
            roundIndex !== 0 ||
            senderType !== CLM.SenderType.User ||
            curRound.scorerSteps.length === 0 ||
            (hasNoScorerStep && this.props.trainDialog.rounds.length > 1)

        const hideBranch =
            !canBranch ||
            !this.props.onBranchDialog ||
            this.state.pendingExtractionChanges ||
            this.props.editState !== EditState.CAN_EDIT

        const isLastActivity = activity === this.props.history[this.props.history.length - 1]
        const selectionType = isLastActivity ? SelectionType.NONE : SelectionType.NEXT
        return (
            <div className="cl-wc-buttonbar">
                <AddButtonInput
                    onClick={() => this.onClickAddUserInput(selectionType)}
                    editType={this.props.editType}
                />
                <AddScoreButton
                    // Don't select an activity if on last step
                    onClick={() => this.onClickAddScore(activity, selectionType)}
                />
                {canDeleteRound &&
                    <OF.IconButton
                        data-testid="edit-dialog-modal-delete-turn-button"
                        className={`cl-wc-deleteturn ${clData.senderType === CLM.SenderType.User ? `cl-wc-deleteturn--user` : `cl-wc-deleteturn--bot`}`}
                        iconProps={{ iconName: 'Delete' }}
                        onClick={() => {
                            if (this.state.selectedActivity && this.state.currentTrainDialog) {
                                this.props.onDeleteTurn(this.state.currentTrainDialog, activity)
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

        // Disable if last round's last scorer step isn't terminal
        const lastScorerStep = lastRound.scorerSteps[lastRound.scorerSteps.length - 1]
        const lastAction = this.props.actions.find(a => a.actionId === lastScorerStep.labelAction)
        if (!lastAction || !lastAction.isTerminal) {
            return true
        }
        return false
    }

    shouldShowScoreButton(): boolean {
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
    onClickAbandonCancel() {
        this.setState({
            isConfirmAbandonOpen: false
        })
    }

    @OF.autobind
    onClickAbandonApprove() {
        switch (this.props.editType) {
            case EditDialogType.NEW:
                this.props.onDeleteDialog()
                break;
            case EditDialogType.BRANCH:
                this.props.onCloseModal(false) // false -> no need to reload original
                break;
            case EditDialogType.LOG_EDITED:
                this.props.onCloseModal(false) // false -> no need to reload original
                break;
            case EditDialogType.LOG_ORIGINAL:
                this.props.onDeleteDialog()
                break;
            case EditDialogType.TRAIN_EDITED:
                this.props.onCloseModal(true) // true -> Reload original TrainDialog
                break;
            case EditDialogType.TRAIN_ORIGINAL:
                this.props.onDeleteDialog()
                break;
            default:
        }
    }

    renderAbandonText(intl: ReactIntl.InjectedIntl) {
        switch (this.props.editType) {
            case EditDialogType.NEW:
                return formatMessageId(intl, FM.BUTTON_ABANDON)
            case EditDialogType.BRANCH:
                return formatMessageId(intl, FM.BUTTON_ABANDON_BRANCH)
            case EditDialogType.LOG_EDITED:
                return formatMessageId(intl, FM.BUTTON_ABANDON_EDIT)
            case EditDialogType.LOG_ORIGINAL:
                return formatMessageId(intl, FM.BUTTON_DELETE)
            case EditDialogType.TRAIN_EDITED:
                return formatMessageId(intl, FM.BUTTON_ABANDON_EDIT)
            case EditDialogType.TRAIN_ORIGINAL:
                return formatMessageId(intl, FM.BUTTON_DELETE)
            default:
                return ""
        }
    }

    trainDialogValidity(): CLM.Validity | undefined {
        // Look for individual replay errors
        let replayErrorLevel = this.replayErrorLevel()
        if (replayErrorLevel) {
            if (replayErrorLevel === CLM.ReplayErrorLevel.BLOCKING || replayErrorLevel === CLM.ReplayErrorLevel.ERROR) {
                return CLM.Validity.INVALID
            }
            if (replayErrorLevel === CLM.ReplayErrorLevel.WARNING) {
                return CLM.Validity.WARNING
            }
        }
        // Didn't find any errors on individual rounds so state is now valid
        if (this.props.trainDialog.validity === CLM.Validity.INVALID) {
            return CLM.Validity.VALID
        }
        // Unless previous validity state was WARNING or UNKNOWN and then I don't know
        return this.props.trainDialog.validity
    }

    @OF.autobind
    onClickConvert() {
        if (this.props.editType !== EditDialogType.LOG_ORIGINAL) {
            throw Error("Invoalid Edit Type for onClickConvert")
        }
        this.props.onSaveDialog(this.props.trainDialog, this.trainDialogValidity())
    }

    @OF.autobind
    onClickSave() {
        switch (this.props.editType) {
            case EditDialogType.NEW:
            case EditDialogType.BRANCH:
                this.props.onCreateDialog(this.props.trainDialog, this.trainDialogValidity())
                break;
            case EditDialogType.LOG_EDITED:
                this.props.onSaveDialog(this.props.trainDialog, this.trainDialogValidity())
                break;
            case EditDialogType.LOG_ORIGINAL:
                this.props.onCloseModal(false)  // false - No need to reload original
                break;
            case EditDialogType.TRAIN_EDITED:
                this.props.onSaveDialog(this.props.trainDialog, this.trainDialogValidity())
                break;
            case EditDialogType.TRAIN_ORIGINAL:
                this.props.onCloseModal(false)  // false - No need to reload original
                break;
            default:
        }
    }

    renderCloseOrSaveText(intl: ReactIntl.InjectedIntl) {
        switch (this.props.editType) {
            case EditDialogType.NEW:
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
                return formatMessageId(intl, FM.BUTTON_CLOSE)
            default:
                return ""
        }
    }

    renderConfirmText(intl: ReactIntl.InjectedIntl) {
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
                return ""
        }
    }

    onScrollChange(position: number) {
        this.props.setWebchatScrollPosition(position)
    }

    @OF.autobind
    renderWebchatInput(showDisableInput: boolean): JSX.Element | null {
        if (this.shouldShowScoreButton() && this.state.currentTrainDialog) {
            return (
                <div className="wc-console">
                    <OF.PrimaryButton
                        data-testid="score-actions-button"
                        className="cl-rightjustify"
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

    renderWarning(): JSX.Element | null {
        if (!this.props.trainDialog) {
            return null
        }

        const replayError = DialogUtils.getReplayError(this.state.selectedActivity)
        if (this.props.editState === EditState.INVALID_BOT) {
            return (
                <div className="cl-editdialog-warning">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.EDITDIALOGMODAL_WARNING_INVALID_BOT} />
                        <HelpIcon tipType={TipType.INVALID_BOT} />
                    </div>
                </div>
            )
        }
        if (this.props.editState === EditState.INVALID_PACKAGE) {
            return (
                <div className="cl-editdialog-warning">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.EDITDIALOGMODAL_WARNING_INVALID_PACKAGE} />
                    </div>
                </div>
            )
        }
        if (replayError) {
            return renderReplayError(replayError)
        }

        // No Activity selected, but Replay error on an Activity
        let replayErrorLevel = this.replayErrorLevel()
        if (this.replayErrorLevel()) {
            if (replayErrorLevel === CLM.ReplayErrorLevel.WARNING) {
                // Only show activity based warning if no trainDialog level warning
                if (this.props.trainDialog.validity !== CLM.Validity.UNKNOWN
                    && this.props.trainDialog.validity !== CLM.Validity.WARNING) {
                    return (
                        <div className="cl-editdialog-warning">
                            <div className={OF.FontClassNames.mediumPlus}>
                                <FormattedMessageId id={FM.REPLAYERROR_WARNING} />
                            </div>
                        </div>
                    )
                }
            }
            else {
                return (
                    <div className="cl-editdialog-error">
                        <div className={OF.FontClassNames.mediumPlus}>
                            {this.props.editType === EditDialogType.LOG_ORIGINAL
                                ? <FormattedMessageId id={FM.REPLAYERROR_EXISTS_LOG} />
                                : <FormattedMessageId id={FM.REPLAYERROR_EXISTS} />
                            }
                        </div>
                    </div>
                )
            }

        }

        if (this.props.trainDialog.validity === CLM.Validity.UNKNOWN) {
            return (
                <div>
                    <div className="cl-editdialog-caution">
                        <div className={OF.FontClassNames.mediumPlus}>
                            <FormattedMessageId id={FM.EDITDIALOGMODAL_UNKNOWN_NEED_REPLAY} />
                            <HelpIcon tipType={TipType.EDITDIALOGMODAL_UNKNOWN_NEED_REPLAY} customStyle="cl-icon--transparent" />
                        </div>
                    </div>
                </div>
            )
        }
        else if (this.props.trainDialog.validity === CLM.Validity.WARNING) {
            return (
                <div>
                    <div className="cl-editdialog-warning">
                        <div className={OF.FontClassNames.mediumPlus}>
                            <FormattedMessageId id={FM.EDITDIALOGMODAL_WARNING_NEED_REPLAY} />
                            <HelpIcon tipType={TipType.EDITDIALOGMODAL_WARNING_NEED_REPLAY} customStyle="cl-icon--transparent" />
                        </div>
                    </div>
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
                                onPostActivity={activity => this.onPostNewActivity(activity)}
                                onSelectActivity={activity => this.onWebChatSelectActivity(activity)}
                                onScrollChange={position => this.onScrollChange(position)}
                                hideInput={disableUserInput || hasBlockingError}
                                focusInput={false}
                                disableDL={true} // Prevents ProcessActivity from being called
                                renderActivity={(props, children, setRef) => this.renderActivity(props, children, setRef)}
                                renderInput={() => this.renderWebchatInput(disableUserInput || hasBlockingError)}
                                highlightClassName={'wc-message-selected'}
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
                                    originalTrainDialogId={this.props.originalTrainDialogId}
                                    editType={this.props.editType}
                                    editState={this.props.editState}
                                    trainDialog={this.props.trainDialog}
                                    selectedActivity={this.state.selectedActivity}
                                    onChangeAction={(trainScorerStep: CLM.TrainScorerStep) => this.onChangeAction(trainScorerStep)}
                                    onSubmitExtraction={(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) => this.onChangeExtraction(extractResponse, textVariations)}
                                    onPendingStatusChanged={(changed: boolean) => this.onPendingStatusChanged(changed)}
                                />
                            </div>
                            {this.props.editState !== EditState.CAN_EDIT && <div className="cl-overlay" />}
                        </div>
                    </div>
                </div>
                <div className="cl-modal_footer cl-modal_footer--border">
                    <div className="cl-modal-buttons">
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
                                />
                            </TooltipHost>

                            <OF.PrimaryButton
                                data-testid="edit-teach-dialog-close-save-button"
                                disabled={this.state.pendingExtractionChanges || (hasBlockingError && this.props.editType !== EditDialogType.LOG_ORIGINAL)}
                                onClick={this.onClickSave}
                                ariaDescription={this.renderCloseOrSaveText(intl)}
                                text={this.renderCloseOrSaveText(intl)}
                            />
                            <OF.DefaultButton
                                data-testid="edit-dialog-modal-delete-button"
                                className="cl-button-delete"
                                disabled={this.props.editState !== EditState.CAN_EDIT}
                                onClick={this.onClickAbandon}
                                ariaDescription={this.renderAbandonText(intl)}
                                text={this.renderAbandonText(intl)}
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
                {this.state.cantReplayMessage &&
                    <ConfirmCancelModal
                        open={true}
                        onCancel={this.onClickCloseCantReplay}
                        onConfirm={null}
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
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        trainDialogReplayThunkAsync: actions.train.trainDialogReplayThunkAsync,
        setWebchatScrollPosition: actions.display.setWebchatScrollPosition,
        clearWebchatScrollPosition: actions.display.clearWebchatScrollPosition
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
    originalTrainDialogId: string | null
    // If editing a log dialog, this was the source
    editingLogDialogId: string | null
    history: Activity[]
    // Is it a new dialog, a TrainDialog or LogDialog 
    editType: EditDialogType
    // If starting with activity selected
    initialSelectedActivityIndex: number | null
    onInsertAction: (trainDialog: CLM.TrainDialog, activity: Activity, selectionType: SelectionType) => any
    onInsertInput: (trainDialog: CLM.TrainDialog, activity: Activity, userText: string, selectionType: SelectionType) => any
    onChangeExtraction: (trainDialog: CLM.TrainDialog, activity: Activity, extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) => any
    onChangeAction: (trainDialog: CLM.TrainDialog, activity: Activity, trainScorerStep: CLM.TrainScorerStep) => any
    onDeleteTurn: (trainDialog: CLM.TrainDialog, activity: Activity) => any
    onCloseModal: (reload: boolean) => void
    onBranchDialog: ((trainDialog: CLM.TrainDialog, activity: Activity, userText: string) => void) | null,
    onContinueDialog: (newTrainDialog: CLM.TrainDialog, initialUserInput: CLM.UserInput) => void
    onSaveDialog: (newTrainDialog: CLM.TrainDialog, validity?: CLM.Validity) => void
    onReplayDialog: (newTrainDialog: CLM.TrainDialog) => void
    // Add a new train dialog to the Model (when EditDialogType === NEW)
    onCreateDialog: (newTrainDialog: CLM.TrainDialog, validity?: CLM.Validity) => void
    onDeleteDialog: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(EditDialogModal))
