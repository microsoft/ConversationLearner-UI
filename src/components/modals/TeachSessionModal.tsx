/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import './TeachSessionModal.css';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ErrorHandler } from './../../ErrorHandler'
import { AT } from '../../types/ActionTypes'
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { State } from '../../types';
import Webchat from '../Webchat'
import TeachSessionAdmin from './TeachSessionAdmin'
import { AppBase, UserInput, DialogType, TrainDialog, LogDialog, Teach, DialogMode } from 'conversationlearner-models'
import { Activity } from 'botframework-directlinejs'
import { deleteTeachSessionThunkAsync } from '../../actions/deleteActions'
import { toggleAutoTeach, runExtractorAsync } from '../../actions/teachActions'
import { fetchApplicationTrainingStatusThunkAsync } from '../../actions/fetchActions'
import ConfirmCancelModal from './ConfirmCancelModal'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

interface ComponentState {
    isConfirmDeleteOpen: boolean,
    webchatKey: number,
    editing: boolean,
    hasOneRound: boolean
}

class TeachModal extends React.Component<Props, ComponentState> {

    state: ComponentState = {
        isConfirmDeleteOpen: false,
        webchatKey: 0,
        editing: false,
        hasOneRound: false
    }

    private callbacksId: string = null;

    componentDidMount() {
        this.callbacksId = ErrorHandler.registerCallbacks(
            [
                {actionType: AT.POST_SCORE_FEEDBACK_ASYNC, callback: this.onDismissError},
                {actionType: AT.RUN_SCORER_ASYNC, callback: this.onDismissError},
            ]
        );
    };

    componentWillUnmount() {
        ErrorHandler.deleteCallbacks(this.callbacksId);
    }
 
    @autobind
    onDismissError(errorType: AT) : void {
        this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession, this.props.app, this.props.editingPackageId, false); // False = abandon
        this.props.onClose();
    }
    componentWillReceiveProps(newProps: Props) {

        let webchatKey = this.state.webchatKey;
        let hasOneRound = this.state.hasOneRound;

        if (this.props.history !== newProps.history) {
            webchatKey = this.state.webchatKey + 1
        }
        // Clear round if new session
        if (this.props.teachSession !== newProps.teachSession) {
            hasOneRound = false;
        }
        // History counts as having a round
        if (newProps.history != null && newProps.history.length > 0) {
            hasOneRound = true;
        }
        if (webchatKey !== this.state.webchatKey || hasOneRound !== this.state.hasOneRound) {
            this.setState({
                webchatKey: webchatKey,
                hasOneRound: hasOneRound
            })
        }   
    }

    onClickAbandonTeach() {
        this.setState({
            isConfirmDeleteOpen: true
        })
    }

    onClickSave() {
        // If source was a trainDialog, delete the original
        let deleteTrainId = this.props.sourceTrainDialog ? this.props.sourceTrainDialog.trainDialogId : null;

        ((this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession, this.props.app, this.props.editingPackageId, true, deleteTrainId) as any) as Promise<boolean>)
            .then(success => {
                if (success && this.props.sourceLogDialog) {
                    // If source was a log dialog, add pointer to trainDialog (server will also do this on it's enda)
                    this.props.sourceLogDialog.targetTrainDialogIds = [this.props.teachSession.trainDialogId]
                }
            })

        this.props.onClose()
    }

    onClickConfirmDelete() {
        this.setState(
            {
                isConfirmDeleteOpen: false
            },
            () => {
                this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession, this.props.app, this.props.editingPackageId, false); // False = abandon
                this.props.onClose()
            })
    }

    onClickCancelDelete() {
        this.setState({
            isConfirmDeleteOpen: false
        })
    }

    onClickUndo() {

        // If on extractor step, just need to replay history (extractor step will be dropped)
        // otherwise pop the last train round
        let popRound = this.props.dialogMode !== DialogMode.Extractor;
        this.props.onUndo(popRound);
    }

    autoTeachChanged(ev: React.FormEvent<HTMLElement>, isChecked: boolean) {
        this.props.toggleAutoTeach(isChecked);
    }

    onWebChatPostActivity(activity: Activity) {
        if (activity.type === 'message') {

            let userInput: UserInput = undefined
            // Check if button submit info
            if (!activity.text && activity.value && activity.value['submit']) {
                userInput = { text: activity.value['submit'] };
            } 
            // Otherwise use text
            else {
                userInput = { text: activity.text };
            }

            if (!this.props.teachSession) {
                throw new Error(`Current teach session is not defined. This may be due to race condition where you attempted to chat with the bot before the teach session has been created.`)
            }

            this.props.runExtractorAsync(this.props.user.id, this.props.app.appId, DialogType.TEACH, this.props.teachSession.teachId, null, userInput);
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
        let chatDisable = (this.props.dialogMode !== DialogMode.Wait) ?
            <div className="cl-overlay"></div>
            : null;

        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={true}
                containerClassName="cl-modal cl-modal--large cl-modal--teach"
            >
                <div className="cl-modal_body">
                    <div className="cl-chatmodal">
                        <div className="cl-chatmodal_webchat">
                            <Webchat
                                key={this.state.webchatKey}
                                app={this.props.app}
                                history={this.props.history}
                                onPostActivity={activity => this.onWebChatPostActivity(activity)}
                                onSelectActivity={() => { }}
                                hideInput={false}
                                focusInput={this.props.dialogMode === DialogMode.Wait}
                            />
                            {chatDisable}
                        </div>
                        <div className="cl-chatmodal_controls">
                            <div className="cl-chatmodal_admin-controls">
                                <TeachSessionAdmin
                                    app={this.props.app}
                                    editingPackageId={this.props.editingPackageId}
                                    onScoredAction={() => {this.setState({hasOneRound: true})}}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="cl-modal_footer cl-modal_footer--border">
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_primary" />
                        <div className="cl-modal-buttons_secondary">
                            <DefaultButton
                                disabled={!this.state.hasOneRound}
                                onClick={() => this.onClickUndo()}
                                ariaDescription={intl.formatMessage({
                                    id: FM.TEACHSESSIONMODAL_UNDO_ARIADESCRIPTION,
                                    defaultMessage: "Undo Step"
                                })}
                                text={intl.formatMessage({
                                    id: FM.TEACHSESSIONMODAL_UNDO_TEXT,
                                    defaultMessage: "Undo Step"
                                })}
                            />
                            <DefaultButton
                                onClick={() => this.onClickAbandonTeach()}
                                ariaDescription={this.renderAbandonText(intl)}
                                text={this.renderAbandonText(intl)}
                            />
                            <PrimaryButton
                                disabled={!this.state.hasOneRound}
                                onClick={() => this.onClickSave()}
                                ariaDescription={this.renderDoneText(intl)}
                                text={this.renderDoneText(intl)}
                            />
                        </div>
                    </div>
                </div>
                <ConfirmCancelModal
                    open={this.state.isConfirmDeleteOpen}
                    onCancel={() => this.onClickCancelDelete()}
                    onConfirm={() => this.onClickConfirmDelete()}
                    title={this.renderConfirmText(intl)}
                />
            </Modal>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteTeachSessionThunkAsync,
        fetchApplicationTrainingStatusThunkAsync,
        runExtractorAsync,
        toggleAutoTeach
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user
    }
}

export interface ReceivedProps {
    open: boolean,
    onClose: Function,
    onUndo: (popRound: boolean) => void,
    app: AppBase,
    editingPackageId: string,
    teachSession: Teach,
    dialogMode: DialogMode,
    // When editing and existing log or train dialog
    sourceTrainDialog?: TrainDialog,
    sourceLogDialog?: LogDialog,
    history: Activity[]       
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachModal))
