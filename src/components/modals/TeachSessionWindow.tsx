import * as React from 'react';
import './TeachSessionWindow.css';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { State } from '../../types';
import { DialogMode } from '../../types/const';
import Webchat from '../Webchat'
import TeachSessionAdmin from './TeachSessionAdmin'
import { BlisAppBase, UserInput, DialogType, TrainDialog } from 'blis-models'
import { Activity } from 'botframework-directlinejs'
import { deleteTeachSessionAsync } from '../../actions/deleteActions'
import { toggleAutoTeach, runExtractorAsync } from '../../actions/teachActions'
import { fetchApplicationTrainingStatusThunkAsync } from '../../actions/fetchActions'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ComponentState {
    isConfirmDeleteOpen: boolean,
    webchatKey: number,
    editing: boolean,
    errorForId: string,
    hasOneRound: boolean
}

class TeachWindow extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        isConfirmDeleteOpen: false,
        webchatKey: 0,
        editing: false,
        errorForId: null,
        hasOneRound: false
    }

    componentWillReceiveProps(newProps: Props) {
        if (newProps.error && this.props.teachSessions.current) {
            this.setState({ errorForId: this.props.teachSessions.current.teachId });
        } else if (!newProps.error && this.state.errorForId) {
            this.setState({ errorForId: null }, () => {
                // End the teaching session after error is done displaying as I can't continue after an error
                if (newProps.teachSessions.current && this.state.errorForId === newProps.teachSessions.current.teachId) {
                    this.props.deleteTeachSessionAsync(this.props.user.id, this.props.teachSessions.current, this.props.app.appId, true);
                    this.props.onClose();
                }
            });
        }
        else {
            let webchatKey = this.state.webchatKey;
            let hasOneRound = this.state.hasOneRound;

            if (this.props.history !== newProps.history) {
                webchatKey = this.state.webchatKey + 1
            }
            // Clear round if new session
            if (this.props.teachSessions.current !== newProps.teachSessions.current) {
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
    }

    onClickAbandonTeach() {
        this.setState({
            isConfirmDeleteOpen: true
        })
    }

    onClickSave() {
        this.props.deleteTeachSessionAsync(this.props.user.id, this.props.teachSessions.current, this.props.app.appId, true); // True = save to train dialog
        this.props.fetchApplicationTrainingStatusThunkAsync(this.props.app.appId)
        this.props.onClose()
    }

    onClickConfirmDelete() {
        this.setState({
            isConfirmDeleteOpen: false
        }, () => {
            this.props.deleteTeachSessionAsync(this.props.user.id, this.props.teachSessions.current, this.props.app.appId, false); // False = abandon
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

            let userInput;
            // Check if button submit info
            if (!activity.text && activity.value && activity.value['submit']) {
                userInput = new UserInput({ text: activity.value['submit'] });
            } 
            // Otherwise use text
            else {
                userInput = new UserInput({ text: activity.text });
            }
            const teachSession = this.props.teachSessions.current
            if (!teachSession) {
                throw new Error(`Current teach session is not defined. This may be due to race condition where you attempted to chat with the bot before the teach session has been created.`)
            }

            this.props.runExtractorAsync(this.props.user.id, this.props.app.appId, DialogType.TEACH, teachSession.teachId, null, userInput);
        }
    }

    render() {
        const { intl } = this.props

        // Put mask of webchat if not in input mode
        let chatDisable = (this.props.teachSessions.mode !== DialogMode.Wait) ?
            <div className="wc-disable"></div>
            : null;

        // Mask controls if autoTeach is enabled
        let mask = (this.props.teachSessions.autoTeach) ? <div className="teachAutoMask" /> : null;
        return (
            <Modal
                isOpen={this.props.open && this.props.error === null}
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
                                focusInput={this.props.teachSessions.mode === DialogMode.Wait}
                            />
                            {chatDisable}
                        </div>
                        <div className="blis-chatmodal_controls">
                            <div className="blis-chatmodal_admin-controls">
                                <TeachSessionAdmin
                                    app={this.props.app}
                                    onScoredAction={() => {this.setState({hasOneRound: true})}}
                                />
                                {mask}
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
                                    id: FM.TEACHSESSIONWINDOW_UNDO_ARIADESCRIPTION,
                                    defaultMessage: "Undo Step"
                                })}
                                text={intl.formatMessage({
                                    id: FM.TEACHSESSIONWINDOW_UNDO_TEXT,
                                    defaultMessage: "Undo Step"
                                })}
                            />
                            <DefaultButton
                                onClick={() => this.onClickAbandonTeach()}
                                ariaDescription={intl.formatMessage({
                                    id: FM.TEACHSESSIONWINDOW_DEFAULTBUTTON_ARIADESCRIPTION,
                                    defaultMessage: "Abandon Teach"
                                })}
                                text={intl.formatMessage({
                                    id: FM.TEACHSESSIONWINDOW_DEFAULTBUTTON_TEXT,
                                    defaultMessage: "Abandon Teach"
                                })}
                            />
                            <PrimaryButton
                                disabled={!this.state.hasOneRound}
                                onClick={() => this.onClickSave()}
                                ariaDescription={intl.formatMessage({
                                    id: FM.TEACHSESSIONWINDOW_PRIMARYBUTTON_ARIADESCRIPTION,
                                    defaultMessage: "Done Teaching"
                                })}
                                text={intl.formatMessage({
                                    id: FM.TEACHSESSIONWINDOW_PRIMARYBUTTON_TEXT,
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
                        id: FM.TEACHSESSIONWINDOW_CONFIRMDELETE_TITLE,
                        defaultMessage: "Are you sure you want to abandon this teach session?"
                    })}
                />
            </Modal>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteTeachSessionAsync,
        fetchApplicationTrainingStatusThunkAsync,
        runExtractorAsync,
        toggleAutoTeach
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        teachSessions: state.teachSessions,
        user: state.user,
        error: state.error.error
    }
}

export interface ReceivedProps {
    open: boolean,
    onClose: Function,
    onUndo: Function,
    app: BlisAppBase,
    // When continuing existing TD
    trainDialog: TrainDialog,
    history: Activity[]       
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachWindow))
