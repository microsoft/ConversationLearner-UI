/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as OF from 'office-ui-fabric-react';
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { State } from '../../types'
import actions from '../../actions'
import Webchat from '../Webchat'
import { EditDialogAdmin, EditDialogType, EditState } from '.'
import * as CLM from '@conversationlearner/models'
import { Activity } from 'botframework-directlinejs'
import ConfirmCancelModal from './ConfirmCancelModal'
import UserInputModal from './UserInputModal'
import { FM } from '../../react-intl-messages'
import { renderReplayError } from './ReplayErrorList'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { autobind } from 'office-ui-fabric-react/lib/Utilities'

interface ComponentState {
    isConfirmAbandonOpen: boolean
    isUserInputModalOpen: boolean
    selectedActivity: Activity | null
    webchatKey: number
    currentTrainDialog: CLM.TrainDialog | null
    pendingExtractionChanges: boolean,
}

const initialState: ComponentState = {
    isConfirmAbandonOpen: false,
    isUserInputModalOpen: false,
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
            if (nextProps.initialSelectedHistoryIndex !== null) {
                selectedActivity = nextProps.history[nextProps.initialSelectedHistoryIndex]
            }

            // Force webchat to re-mount as history prop can't be updated
            this.setState({
                currentTrainDialog: nextProps.trainDialog,
                webchatKey: this.state.webchatKey + 1,
                selectedActivity
            })

        }
    }

    selectedActivityIndex(): number | null {
        if (!this.state.selectedActivity || this.props.history.length === 0) {
            return null
        }
        else {
            return this.props.history.findIndex(a => a === this.state.selectedActivity) 
        }
    }

    @autobind
    onClickBranch() {
        if (this.state.selectedActivity && this.props.onBranch) {
            let branchRound = this.state.selectedActivity.channelData.roundIndex;
            if (branchRound > 0) {
                this.props.onBranch(branchRound);
            }
        }
    }

    @autobind
    onClickAddUserInput() {
        this.setState({
            isUserInputModalOpen: true
        })
    }

    @autobind
    onCancelAddUserInput() {
        this.setState({
            isUserInputModalOpen: false
        })
    }

    @autobind
    onSubmitAddUserInput(userInput: string) {
        this.setState({
            isUserInputModalOpen: false
        })
        
        if (this.state.selectedActivity) {
            this.props.onInsertInput(this.state.selectedActivity, userInput)
        }
    }

    @autobind
    onClickAbandon() {
        this.setState({
            isConfirmAbandonOpen: true
        })

    }

    // User is continuing the train dialog by typing something new
    @autobind
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
            this.props.onContinue(newTrainDialog, initialUserInput) 
        }
    }

    // LARS - no longer used?
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

    @autobind
    async onChangeExtraction(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) {
 
        if (!this.state.selectedActivity) {
            throw new Error("No selected activity")
        }
        if (!this.props.user) {
            throw new Error("No Active User");
        }

        try {
            const roundIndex = this.state.selectedActivity.channelData.roundIndex
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            let newTrainDialog = JSON.parse(JSON.stringify(this.props.trainDialog)) as CLM.TrainDialog
            newTrainDialog.definitions = definitions;
            newTrainDialog.rounds[roundIndex].extractorStep.textVariations = textVariations;

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            this.props.onUpdateHistory(newTrainDialog, this.selectedActivityIndex())
        }
        catch (error) {
                console.warn(`Error when attempting to change extraction: `, error)
        }
    }

    @autobind
    async onChangeAction(trainScorerStep: CLM.TrainScorerStep) {
        if (!this.state.selectedActivity) {
            throw new Error("No selected activity")
        }
        if (!this.props.user) {
            throw new Error("No Active User");
        }

        try {
            const roundIndex = this.state.selectedActivity.channelData.roundIndex
            const scoreIndex = this.state.selectedActivity.channelData.scoreIndex
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            let newTrainDialog = JSON.parse(JSON.stringify(this.props.trainDialog)) as CLM.TrainDialog
            newTrainDialog.rounds[roundIndex].scorerSteps[scoreIndex] = trainScorerStep
            newTrainDialog.definitions = definitions;

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            this.props.onUpdateHistory(newTrainDialog, this.selectedActivityIndex())
        }
        catch (error) {
            console.warn(`Error when attempting to change an Action: `, error)
        }
    }
 
    onWebChatSelectActivity(activity: Activity) {
         this.setState({
            selectedActivity: activity
        })
    }

    onExtractionsChanged(changed: boolean) {
        // Put mask on webchat if changing extractions
        this.setState({
            pendingExtractionChanges: changed
        })
    }

    // Does history have any replay errors
    hasReplayError(): boolean {
        if (!this.props.history || this.props.history.length === 0) {
            return false
        }

        return (this.props.history.filter(h => h.channelData.replayError != null).length > 0)
    }

    renderSelectedActivity(activity: Activity): (JSX.Element | null) {

        if (this.props.editState !== EditState.CAN_EDIT) {
            return null
        }
        
        const canBranch = activity && activity.channelData.senderType === CLM.SenderType.User
        const roundIndex = activity.channelData.roundIndex
        const senderType = activity.channelData.senderType
        const curRound = this.props.trainDialog.rounds[roundIndex]

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

        return (
            <div className="cl-wc-buttonbar">
                <OF.IconButton
                    className={`cl-wc-addinput ${activity.channelData.senderType === CLM.SenderType.User ? `cl-wc-addinput--user` : `cl-wc-addinput--bot`}`}
                    onClick={this.onClickAddUserInput}
                    ariaDescription="Insert Input Turn"
                    iconProps={{ iconName: 'CommentAdd' }}
                />
                {this.state.selectedActivity &&
                    <OF.IconButton
                        className={`cl-wc-addscore ${activity.channelData.senderType === CLM.SenderType.User ? `cl-wc-addscore--user` : `cl-wc-addscore--bot`}`}
                        onClick={() => {
                            if (this.state.selectedActivity) {
                                this.props.onInsertAction(this.state.selectedActivity)
                            }
                        }}
                        ariaDescription="Insert Score Turn"
                        iconProps={{ iconName: 'CommentAdd' }}
                    />
                }
                {canDeleteRound &&
                    <OF.IconButton
                        className={`cl-wc-deleteturn ${activity.channelData.senderType === CLM.SenderType.User ? `cl-wc-deleteturn--user` : `cl-wc-deleteturn--bot`}`}
                        iconProps={{ iconName: 'Delete' }}
                        onClick={() => {
                            if (this.state.selectedActivity) {
                                this.props.onDeleteTurn(this.state.selectedActivity)
                            }
                        }}
                        ariaDescription="Delete Turn"
                    />
                }
                {this.props.onBranch &&
                    <OF.IconButton
                        disabled={!canBranch ||
                            this.state.pendingExtractionChanges ||
                            this.props.editState !== EditState.CAN_EDIT ||
                            (this.props.trainDialog && this.props.trainDialog.invalid === true)}
                        
                        className={`cl-wc-branchturn ${activity.channelData.senderType === CLM.SenderType.User ? `cl-wc-branchturn--user` : `cl-wc-branchturn--bot`}`}
                        iconProps={{ iconName: 'BranchMerge' }}
                        onClick={this.onClickBranch}
                        ariaDescription={this.props.intl.formatMessage({
                            id: FM.EDITDIALOGMODAL_BRANCH_ARIADESCRIPTION,
                            defaultMessage: 'Branch'
                        })}
                    />
                }
                </div>
        )
    }
    
    shouldDisableUserInput(): boolean {

        if (!this.props.trainDialog || this.props.trainDialog.rounds.length === 0) {
            return true
        }

        const lastRound = this.props.trainDialog.rounds[this.props.trainDialog.rounds.length - 1]

        if (lastRound.scorerSteps.length === 0) {
            return true
        }

        const lastScorerStep = lastRound.scorerSteps[lastRound.scorerSteps.length - 1]
        const lastAction = this.props.actions.find(a => a.actionId === lastScorerStep.labelAction)
        return !lastAction || !lastAction.isTerminal
    }

    

    @autobind
    onClickAbandonCancel() {
        this.setState({
            isConfirmAbandonOpen: false
        })
    }

    @autobind
    onClickAbandonApprove() {
        switch (this.props.editType) {
            case EditDialogType.NEW:
                this.props.onDelete()
                break;
            case EditDialogType.LOG_EDITED:
                this.props.onClose(false) // false -> no need to reload original
                break;
            case EditDialogType.LOG_ORIGINAL:
                this.props.onDelete()
                break;
            case EditDialogType.TRAIN_EDITED:
                this.props.onClose(true) // true -> Reload original TrainDialog
                break;
            case EditDialogType.TRAIN_ORIGINAL:
                this.props.onDelete()
                break;
            default:
        }
    }

    renderAbandonText(intl: ReactIntl.InjectedIntl) {
        switch (this.props.editType) {
            case EditDialogType.NEW:
                return intl.formatMessage({
                    id: FM.BUTTON_ABANDON,
                    defaultMessage: 'Abandon'
                })
            case EditDialogType.LOG_EDITED:
                return intl.formatMessage({
                    id: FM.BUTTON_ABANDON_EDIT,
                    defaultMessage: 'Abandon Edit'
                })
            case EditDialogType.LOG_ORIGINAL:
                return intl.formatMessage({
                    id: FM.BUTTON_DELETE,
                    defaultMessage: 'Delete'
                })
            case EditDialogType.TRAIN_EDITED:
                return intl.formatMessage({
                    id: FM.BUTTON_ABANDON_EDIT,
                    defaultMessage: 'Abandon Edit'
                })
            case EditDialogType.TRAIN_ORIGINAL:
                return intl.formatMessage({
                    id: FM.BUTTON_DELETE,
                    defaultMessage: 'Delete'
                })
            default:
                return ""
        }
    }

    @autobind
    onClickConvert() {
        if (this.props.editType !== EditDialogType.LOG_ORIGINAL) {
            throw Error("Invoalid Edit Type for onClickConvert")
        }
        this.props.onSave(this.props.trainDialog, this.hasReplayError())
    }

    @autobind
    onClickSave() {
        switch (this.props.editType) {
            case EditDialogType.NEW:
                this.props.onCreate(this.props.trainDialog, this.hasReplayError())
                break;
            case EditDialogType.LOG_EDITED:
                this.props.onSave(this.props.trainDialog, this.hasReplayError())
                break;
            case EditDialogType.LOG_ORIGINAL:
                this.props.onClose(false)  // false - No need to reload original
                break;
            case EditDialogType.TRAIN_EDITED:
                this.props.onSave(this.props.trainDialog, this.hasReplayError())
                break;
            case EditDialogType.TRAIN_ORIGINAL:
                this.props.onClose(false)  // false - No need to reload original
                break;
            default:
        }
    }

    renderSaveText(intl: ReactIntl.InjectedIntl) {
        switch (this.props.editType) {
            case EditDialogType.NEW:
                return intl.formatMessage({
                    id: FM.BUTTON_SAVE,
                    defaultMessage: 'Save'
                })  
            case EditDialogType.LOG_EDITED:
                return intl.formatMessage({
                    id: FM.BUTTON_SAVE_AS_TRAIN_DIALOG,
                    defaultMessage: 'Save as Train Dialog'
                })
            case EditDialogType.LOG_ORIGINAL:
                return intl.formatMessage({
                    id: FM.BUTTON_CLOSE,
                    defaultMessage: 'Close'
                })
            case EditDialogType.TRAIN_EDITED:
                return intl.formatMessage({
                    id: FM.BUTTON_SAVE_EDIT,
                    defaultMessage: 'Save Edit'
                })
            case EditDialogType.TRAIN_ORIGINAL:
                return intl.formatMessage({
                    id: FM.BUTTON_CLOSE,
                    defaultMessage: 'Close'
                })
            default:
                return ""
        }
    }

    renderConfirmText(intl: ReactIntl.InjectedIntl) {
        switch (this.props.editType) {
            case EditDialogType.NEW:
                return intl.formatMessage({
                    id: FM.EDITDIALOGMODAL_CONFIRMABANDON_NEW_TITLE,
                    defaultMessage: `Are you sure you want to abandon this Training Dialog?`
                })
            case EditDialogType.LOG_EDITED:
                return intl.formatMessage({
                    id: FM.EDITDIALOGMODAL_CONFIRMABANDON_EDIT_TITLE,
                    defaultMessage: `Are you sure you want to abandon your edits?`
                })
            case EditDialogType.LOG_ORIGINAL:
                return intl.formatMessage({
                    id: FM.EDITDIALOGMODAL_CONFIRMDELETELOG_TITLE,
                    defaultMessage: `Are you sure you want to delete this Log Dialog?`
                })
            case EditDialogType.TRAIN_EDITED:
                return intl.formatMessage({
                    id: FM.EDITDIALOGMODAL_CONFIRMABANDON_EDIT_TITLE,
                    defaultMessage: `Are you sure you want to abandon your edits?`
                })
            case EditDialogType.TRAIN_ORIGINAL:
                return intl.formatMessage({
                    id: FM.EDITDIALOGMODAL_CONFIRMDELETETRAIN_TITLE,
                    defaultMessage: `Are you sure you want to delete this Training Dialog?`
                })
            default:
                return ""
        }
    }

    onScrollChange(position: number) {
        this.props.setWebchatScrollPosition(position)
    }

    renderWarning() {

        if (this.props.editState === EditState.INVALID_BOT) {
            return (
                <div className="cl-editdialog-warning">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.EDITDIALOGMODAL_WARNING_INVALID_BOT}
                            defaultMessage={FM.EDITDIALOGMODAL_WARNING_INVALID_BOT}
                        />
                    </div>
                </div>
            )
        }
        else if (this.props.editState === EditState.INVALID_PACKAGE) {
            return (
                <div className="cl-editdialog-warning">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.EDITDIALOGMODAL_WARNING_INVALID_PACKAGE}
                            defaultMessage={FM.EDITDIALOGMODAL_WARNING_INVALID_PACKAGE}
                        />
                    </div>
                </div>
            )
        }
        else if (this.state.selectedActivity && this.state.selectedActivity.channelData.replayError) {
            return (
                <div className="cl-editdialog-error">
                    {renderReplayError(this.state.selectedActivity.channelData.replayError)}
                </div>
            )
        }
        else if (this.hasReplayError()) {
            // Replay error, but not activity selected
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_EXISTS}
                            defaultMessage={FM.REPLAYERROR_EXISTS}
                        />
                    </div>
                </div>
            )
        }
        else {
            return null
        }
    }

    render() {
        const { intl } = this.props
        // Put mask of webchat if waiting for extraction labelling
        const chatDisable = this.state.pendingExtractionChanges ? <div className="cl-overlay"/> : null;
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
                                hideInput={disableUserInput}
                                focusInput={false}
                                disableDL={true} // Prevents ProcessActivity from being called
                                renderSelectedActivity={activity => this.renderSelectedActivity(activity)}
                                highlightClassName={'wc-message-selected'}
                                selectedActivityIndex={this.props.initialSelectedHistoryIndex}
                            />
                            {chatDisable}
                        </div>
                        <div className="cl-chatmodal_controls"> 
                            <div className="cl-chatmodal_admin-controls">
                                <EditDialogAdmin
                                    data-testid="chatmodal-editdialogadmin"
                                    app={this.props.app}
                                    editingPackageId={this.props.editingPackageId}
                                    editingLogDialog={this.props.editingLogDialog}
                                    editType={this.props.editType}
                                    editState={this.props.editState}
                                    trainDialog={this.props.trainDialog}
                                    selectedActivity={this.state.selectedActivity}
                                    onChangeAction={(trainScorerStep: CLM.TrainScorerStep) => this.onChangeAction(trainScorerStep)}
                                    onChangeExtraction={(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) => this.onChangeExtraction(extractResponse, textVariations)}
                                    onExtractionsChanged={(changed: boolean) => this.onExtractionsChanged(changed)}
                                />
                            </div>
                            {this.props.editState !== EditState.CAN_EDIT && <div className="cl-overlay"/>} 
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
                                    disabled={this.state.pendingExtractionChanges || this.props.editState !== EditState.CAN_EDIT}
                                    onClick={this.onClickConvert}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.BUTTON_SAVE_AS_TRAIN_DIALOG,
                                        defaultMessage: 'Save as Train Dialog'
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.BUTTON_SAVE_AS_TRAIN_DIALOG,
                                        defaultMessage: 'Save as Train Dialog'
                                    })}
                                />
                            }
                            <OF.PrimaryButton
                                data-testid="footer-button-done"
                                disabled={this.state.pendingExtractionChanges}
                                onClick={this.onClickSave}
                                ariaDescription={this.renderSaveText(intl)}
                                text={this.renderSaveText(intl)}
                            />
                            <OF.DefaultButton
                                data-testid="footer-button-delete"
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
                <UserInputModal
                    open={this.state.isUserInputModalOpen}
                    onCancel={this.onCancelAddUserInput}
                    onSubmit={this.onSubmitAddUserInput}
                />
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        trainDialogReplayThunkAsync: actions.train.trainDialogReplayThunkAsync,// Lars still used?
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
    // If editing a log dialog, this was the source
    editingLogDialog: CLM.LogDialog | null
    history: Activity[]
    // Is it a new dialog, a TrainDialog or LogDialog 
    editType: EditDialogType
    // If starting with activity selected
    initialSelectedHistoryIndex: number | null
    onInsertAction: (activity: Activity) => any
    onInsertInput: (activity: Activity, userText: string) => any
    onDeleteTurn: (activity: Activity) => any
    onClose: (reload: boolean) => void
    onBranch: ((turnIndex: number) => void) | null,
    onContinue: (newTrainDialog: CLM.TrainDialog, initialUserInput: CLM.UserInput) => void
    onSave: (newTrainDialog: CLM.TrainDialog, isInvalid: boolean) => void
    // Add a new train dialog to the Model (when EditDialogType === NEW)
    onCreate: (newTrainDialog: CLM.TrainDialog, isInvalid: boolean) => void
    onUpdateHistory: (newTrainDialog: CLM.TrainDialog, selectedActivityIndex: number | null) => void
    onDelete: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(EditDialogModal))
