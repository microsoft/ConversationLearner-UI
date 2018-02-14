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
import { BlisAppBase, UserInput, DialogType, TrainDialog, LogDialog, Teach, DialogMode } from 'blis-models'
import { Activity } from 'botframework-directlinejs'
import { deleteTeachSessionThunkAsync, deleteLogDialogThunkAsync } from '../../actions/deleteActions'
import { toggleAutoTeach, runExtractorAsync } from '../../actions/teachActions'
import { fetchApplicationTrainingStatusThunkAsync } from '../../actions/fetchActions'
import ConfirmDeleteModal from './ConfirmDeleteModal'
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

    componentWillMount() {
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
        this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession, this.props.app.appId, false); // False = abandon
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

        ((this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession, this.props.app.appId, true  /* True = save to train dialog */) as any) as Promise<Activity[]>)
            .then((success) => {
                    // Delete source log dialog if there was one
                    if (success && this.props.logDialog) {  
                        this.props.deleteLogDialogThunkAsync(this.props.user.id, this.props.app.appId, this.props.logDialog.logDialogId);
                    }
                }
            );
        this.props.onClose()
    }

    onClickConfirmDelete() {
        this.setState({
            isConfirmDeleteOpen: false
        }, () => {
            this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession, this.props.app.appId, false); // False = abandon
            this.props.onClose()
        })
    }

    onClickCancelDelete() {
        this.setState({
            isConfirmDeleteOpen: false
        })
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

    render() {
        const { intl } = this.props

        // Put mask of webchat if not in input mode
        let chatDisable = (this.props.dialogMode !== DialogMode.Wait) ?
            <div className="wc-disable"></div>
            : null;

        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={true}
                containerClassName="blis-modal blis-modal--large blis-modal--teach"
            >
                <div className="blis-modal_body">
                    <div className="blis-chatmodal">
                        <div className="blis-chatmodal_webchat">
                            <Webchat
                                key={this.state.webchatKey}
                                app={this.props.app}
                                history={this.props.history}
                                onPostActivity={activity => this.onWebChatPostActivity(activity)}
                                onSelectActivity={() => { }}
                                hideInput={false}
                                focusInput={this.props.dialogMode === DialogMode.Wait}
                                viewOnly={false}
                            />
                            {chatDisable}
                        </div>
                        <div className="blis-chatmodal_controls">
                            <div className="blis-chatmodal_admin-controls">
                                <TeachSessionAdmin
                                    app={this.props.app}
                                    onScoredAction={() => {this.setState({hasOneRound: true})}}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="blis-modal_footer">
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary" />
                        <div className="blis-modal-buttons_secondary">
                            <DefaultButton
                                disabled={!this.state.hasOneRound}
                                onClick={() => this.props.onUndo()}
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
                                ariaDescription={intl.formatMessage({
                                    id: FM.TEACHSESSIONMODAL_DEFAULTBUTTON_ARIADESCRIPTION,
                                    defaultMessage: "Abandon Teach"
                                })}
                                text={intl.formatMessage({
                                    id: FM.TEACHSESSIONMODAL_DEFAULTBUTTON_TEXT,
                                    defaultMessage: "Abandon Teach"
                                })}
                            />
                            <PrimaryButton
                                disabled={!this.state.hasOneRound}
                                onClick={() => this.onClickSave()}
                                ariaDescription={intl.formatMessage({
                                    id: FM.TEACHSESSIONMODAL_PRIMARYBUTTON_ARIADESCRIPTION,
                                    defaultMessage: "Done Teaching"
                                })}
                                text={intl.formatMessage({
                                    id: FM.TEACHSESSIONMODAL_PRIMARYBUTTON_TEXT,
                                    defaultMessage: "Done Teaching"
                                })}
                            />
                        </div>
                    </div>
                </div>
                <ConfirmDeleteModal
                    open={this.state.isConfirmDeleteOpen}
                    onCancel={() => this.onClickCancelDelete()}
                    onConfirm={() => this.onClickConfirmDelete()}
                    title={intl.formatMessage({
                        id: FM.TEACHSESSIONMODAL_CONFIRMDELETE_TITLE,
                        defaultMessage: "Are you sure you want to abandon this teach session?"
                    })}
                />
            </Modal>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteTeachSessionThunkAsync,
        deleteLogDialogThunkAsync,
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
    onUndo: Function,
    app: BlisAppBase,
    teachSession: Teach,
    dialogMode: DialogMode,
    // When editing and exitins log or train dialog
    trainDialog: TrainDialog,
    logDialog?: LogDialog,
    history: Activity[]       
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachModal))
