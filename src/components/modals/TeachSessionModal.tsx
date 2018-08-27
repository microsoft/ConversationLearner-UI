/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import './TeachSessionModal.css';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ErrorHandler } from '../../ErrorHandler'
import { AT } from '../../types/ActionTypes'
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react';
import { State } from '../../types';
import Webchat from '../Webchat'
import TeachSessionAdmin from './TeachSessionAdmin'
import TeachSessionInitState from './TeachSessionInitState'
import * as CLM from '@conversationlearner/models'
import { Activity } from 'botframework-directlinejs'
import actions from '../../actions'
import ConfirmCancelModal from './ConfirmCancelModal'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

interface ComponentState {
    isConfirmDeleteOpen: boolean,
    isInitStateOpen: boolean,
    isInitAvailable: boolean,
    webchatKey: number,
    editing: boolean,
    hasTerminalAction: boolean
}

class TeachModal extends React.Component<Props, ComponentState> {

    state: ComponentState = {
        isConfirmDeleteOpen: false,
        isInitStateOpen: false,
        isInitAvailable: true,
        webchatKey: 0,
        editing: false,
        hasTerminalAction: false
    }

    private callbacksId: string | null = null;

    componentDidMount() {
        this.callbacksId = ErrorHandler.registerCallbacks(
            [
                {actionType: AT.POST_SCORE_FEEDBACK_ASYNC, callback: this.onDismissError},
                {actionType: AT.RUN_SCORER_ASYNC, callback: this.onDismissError},
            ]
        );
    };

    componentWillUnmount() {
        if (this.callbacksId) {
            ErrorHandler.deleteCallbacks(this.callbacksId)
        }
    }
 
    @autobind
    onDismissError(errorType: AT): void {
        this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teach, this.props.app, this.props.editingPackageId, false, null, null); // False = abandon
        this.props.onClose();
    }

    componentWillReceiveProps(newProps: Props) {

        let webchatKey = this.state.webchatKey
        let hasTerminalAction = this.state.hasTerminalAction
        let isInitAvailable = this.state.isInitAvailable

        if (this.props.history !== newProps.history) {
            webchatKey = this.state.webchatKey + 1
            isInitAvailable = !newProps.history || newProps.history.length === 0
        }

        // If new session
        if (this.props.teach !== newProps.teach) {
            isInitAvailable = true
            hasTerminalAction = false
        }
        // Set terminal action from History but only if I just loaded it
        if (this.props.history !== newProps.history && newProps.history && newProps.history.length > 0) {
            hasTerminalAction = newProps.lastAction
                ? newProps.lastAction.isTerminal
                : false
        }

        if (webchatKey !== this.state.webchatKey || 
            hasTerminalAction !== this.state.hasTerminalAction ||
            isInitAvailable !== this.state.isInitAvailable) {
            this.setState({
                webchatKey: webchatKey,
                hasTerminalAction: hasTerminalAction,
                isInitAvailable: isInitAvailable
            })
        }   
    }

    @autobind
    onInitStateClicked() {
        this.setState({
            isInitStateOpen: true
        })
    }

    @autobind
    onCloseInitState(filledEntityMap?: CLM.FilledEntityMap) {
        if (filledEntityMap) {
            this.props.initMemoryThunkAsync(this.props.app.appId, this.props.teach.teachId, filledEntityMap)
        }
        this.setState({
            isInitStateOpen: false
        })
    }

    @autobind
    onClickAbandonTeach() {
        this.setState({
            isConfirmDeleteOpen: true
        })
    }

    @autobind
    onClickSave() {
        // If source was a trainDialog, delete the original
        let sourceTrainDialogId = this.props.sourceTrainDialog ? this.props.sourceTrainDialog.trainDialogId : null;
        let sourceLogDialogId = this.props.sourceLogDialog ? this.props.sourceLogDialog.logDialogId : null;

        this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teach, this.props.app, this.props.editingPackageId, true, sourceTrainDialogId, sourceLogDialogId)
        this.props.onClose()
    }

    @autobind
    onClickConfirmDelete() {
        this.setState(
            {
                isConfirmDeleteOpen: false
            },
            () => {
                this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teach, this.props.app, this.props.editingPackageId, false, null, null); // False = abandon
                this.props.onClose()
            })
    }

    @autobind
    onClickCancelDelete() {
        this.setState({
            isConfirmDeleteOpen: false
        })
    }

    @autobind
    onClickUndo() {

        // If on extractor step, just need to replay history (extractor step will be dropped)
        // otherwise pop the last train round
        let popRound = this.props.dialogMode !== CLM.DialogMode.Extractor;
        this.props.onUndo(popRound);
    }

    autoTeachChanged(ev: React.FormEvent<HTMLElement>, isChecked: boolean) {
        this.props.toggleAutoTeach(isChecked);
    }

    onWebChatPostActivity(activity: Activity) {
        if (activity.type === 'message') {

            let userInput: CLM.UserInput

            // Check if button submit info
            if (!activity.text && activity.value && activity.value['submit']) {
                userInput = { text: activity.value['submit'] }
            } 
            // Otherwise use text
            else {
                userInput = { text: activity.text! }
            }

            if (!this.props.teach) {
                throw new Error(`Current teach session is not defined. This may be due to race condition where you attempted to chat with the bot before the teach session has been created.`)
            }

            // No initialization allowed after first input
            this.setState({ isInitAvailable: false})

            this.props.runExtractorThunkAsync(this.props.app.appId, CLM.DialogType.TEACH, this.props.teach.teachId, null, userInput);
        }
    }

    renderAbandonText(intl: ReactIntl.InjectedIntl) {
        if (this.props.sourceLogDialog || this.props.sourceTrainDialog) {
            return intl.formatMessage({
                id: FM.TEACHSESSIONMODAL_EDIT_ABANDON_BUTTON_TEXT,
                defaultMessage: 'Abandon Edit'
            })
        }
        else {
            return intl.formatMessage({
                id: FM.TEACHSESSIONMODAL_TEACH_ABANDON_BUTTON_TEXT,
                defaultMessage: 'Abandon Teach'
            })
        }
    }

    renderDoneText(intl: ReactIntl.InjectedIntl) {
        if (this.props.sourceLogDialog || this.props.sourceTrainDialog) {
            return intl.formatMessage({
                id: FM.TEACHSESSIONMODAL_EDIT_DONE_BUTTON_TEXT,
                defaultMessage: 'Done Editing'
            })
        }
        else {
            return intl.formatMessage({
                id: FM.TEACHSESSIONMODAL_TEACH_DONE_BUTTON_TEXT,
                defaultMessage: 'Done Teaching'
            })
        }
    }

    renderConfirmText(intl: ReactIntl.InjectedIntl) {
        if (this.props.sourceLogDialog || this.props.sourceTrainDialog) {
            return intl.formatMessage({
                id: FM.TEACHSESSIONMODAL_EDIT_CONFIRMDELETE_TITLE,
                defaultMessage: 'Are you sure you want to abandon editing?'
            })
        }
        else {
            return intl.formatMessage({
                id: FM.TEACHSESSIONMODAL_TEACH_CONFIRMDELETE_TITLE,
                defaultMessage: 'Are you sure you want to abandon this teach session?'
            })
        }
    }

    render() {
        const { intl } = this.props

        // Put mask of webchat if not in input mode
        let chatDisable = (this.props.dialogMode !== CLM.DialogMode.Wait) ?
            <div className="cl-overlay"></div>
            : null;

        return (
            <div>
                <Modal
                    isOpen={this.props.isOpen}
                    isBlocking={true}
                    containerClassName="cl-modal cl-modal--large cl-modal--teach"
                >
                    <div className="cl-modal_body">
                        <div className="cl-chatmodal">
                            <div className="cl-chatmodal_webchat">
                                <Webchat
                                    data-testid="teachsession-modal-webchat"
                                    isOpen={this.props.isOpen}
                                    key={this.state.webchatKey}
                                    app={this.props.app}
                                    history={this.props.history}
                                    onPostActivity={activity => this.onWebChatPostActivity(activity)}
                                    onSelectActivity={() => { }}
                                    hideInput={this.props.dialogMode !== CLM.DialogMode.Wait}
                                    focusInput={this.props.dialogMode === CLM.DialogMode.Wait}
                                />
                                {chatDisable}
                            </div>
                            <div className="cl-chatmodal_controls">
                                <div className="cl-chatmodal_admin-controls">
                                    <TeachSessionAdmin
                                        data-testid="teachsession-admin"
                                        app={this.props.app}
                                        editingPackageId={this.props.editingPackageId}
                                        onScoredAction={(scoredAction) => {
                                            this.setState({hasTerminalAction: scoredAction.isTerminal})
                                            }
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="cl-modal_footer cl-modal_footer--border">
                        <div className="cl-modal-buttons">
                            <div className="cl-modal-buttons_secondary">
                                {this.state.isInitAvailable && 
                                    <OF.DefaultButton
                                            data-testid="teachsession-set-initial-state"
                                            disabled={false}
                                            onClick={this.onInitStateClicked}
                                            ariaDescription={intl.formatMessage({
                                                id: FM.TEACHSESSIONMODAL_INITSTATE_ARIADESCRIPTION,
                                                defaultMessage: "Set Initial State"
                                            })}
                                            text={intl.formatMessage({
                                                id: FM.TEACHSESSIONMODAL_INITSTATE_TEXT,
                                                defaultMessage: "Set Initial State"
                                            })}
                                    />
                                    }
                                </div>

                            <div className="cl-modal-buttons_primary">
                                <OF.PrimaryButton
                                    data-testid="teachsession-footer-button-done"
                                    disabled={!this.state.hasTerminalAction}
                                    onClick={this.onClickSave}
                                    ariaDescription={this.renderDoneText(intl)}
                                    text={this.renderDoneText(intl)}
                                />
                                <OF.DefaultButton
                                    data-testid="teachsession-footer-button-undo"
                                    disabled={!this.state.hasTerminalAction}
                                    onClick={this.onClickUndo}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.TEACHSESSIONMODAL_UNDO_ARIADESCRIPTION,
                                        defaultMessage: "Undo Step"
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.TEACHSESSIONMODAL_UNDO_TEXT,
                                        defaultMessage: "Undo Step"
                                    })}
                                />
                                <OF.DefaultButton
                                     data-testid="teachsession-footer-button-abandon"
                                    onClick={this.onClickAbandonTeach}
                                    ariaDescription={this.renderAbandonText(intl)}
                                    text={this.renderAbandonText(intl)}
                                />
                                
                            </div>
                        </div>
                    </div>
                    <ConfirmCancelModal
                        data-testid="teachsession-confirm-cancel"
                        open={this.state.isConfirmDeleteOpen}
                        onCancel={this.onClickCancelDelete}
                        onConfirm={this.onClickConfirmDelete}
                        title={this.renderConfirmText(intl)}
                    />

                </Modal>
                <TeachSessionInitState
                    isOpen={this.state.isInitStateOpen}
                    handleClose={this.onCloseInitState}
                />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteTeachSessionThunkAsync: actions.teach.deleteTeachSessionThunkAsync,
        fetchApplicationTrainingStatusThunkAsync: actions.app.fetchApplicationTrainingStatusThunkAsync,
        initMemoryThunkAsync: actions.teach.initMemoryThunkAsync,
        runExtractorThunkAsync: actions.teach.runExtractorThunkAsync,
        toggleAutoTeach: actions.teach.toggleAutoTeach
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render TeachSessionAdmin but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        user: state.user.user,
        teachSession: state.teachSessions
    }
}

export interface ReceivedProps {
    isOpen: boolean,
    onClose: Function,
    onUndo: (popRound: boolean) => void,
    app: CLM.AppBase,
    editingPackageId: string,
    teach: CLM.Teach,
    dialogMode: CLM.DialogMode,
    // When editing and existing log or train dialog
    sourceTrainDialog?: CLM.TrainDialog,
    sourceLogDialog?: CLM.LogDialog,
    history: Activity[],
    lastAction: CLM.ActionBase | null
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachModal))
