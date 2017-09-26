import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { PrimaryButton, DefaultButton, Checkbox } from 'office-ui-fabric-react';
import { State } from '../types';
import { TeachMode } from '../types/const';
import Webchat from './Webchat'
import TeachSessionAdmin from './TeachSessionAdmin'
import { Teach, BlisAppBase, UserInput } from 'blis-models'
import { Activity } from 'botframework-directlinejs'
import { deleteTeachSessionAsync } from '../actions/deleteActions'
import { toggleAutoTeach, runExtractorAsync } from '../actions/teachActions'
import { createTeachSessionAsync } from '../actions/createActions'
import { addMessageToTeachConversationStack, setDisplayMode } from '../actions/displayActions'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

interface ComponentState {
    isConfirmDeleteOpen: boolean
    teachSession: Teach
    editing: boolean
}

class TeachWindow extends React.Component<Props, ComponentState> {
    state = {
        isConfirmDeleteOpen: false,
        teachSession: null,
        editing: false
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.open === false && nextProps.open === true) {
            this.state.teachSession = new Teach({})
            let currentAppId: string = this.props.apps.current.appId;
            this.props.createTeachSessionAsync(this.props.user.key, this.state.teachSession, currentAppId)
        }
    }

    onClickAbandonTeach() {
        this.setState({
            isConfirmDeleteOpen: true
        })
    }

    onClickSave() {
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteTeachSessionAsync(this.props.user.key, this.props.teachSessions.current, currentAppId, true); // True = save to train dialog
        this.props.onClose()
    }

    onClickConfirmDelete() {
        this.setState({
            isConfirmDeleteOpen: false
        }, () => {
            let currentAppId: string = this.props.apps.current.appId;
            this.props.deleteTeachSessionAsync(this.props.user.key, this.props.teachSessions.current, currentAppId, false); // False = abandon
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
        if (activity.type === "message") {
            this.props.addMessageToTeachConversationStack(activity.text)

            let userInput = new UserInput({ text: activity.text });
            let appId: string = this.props.apps.current.appId;
            let teachId: string = this.props.teachSessions.current.teachId;
            this.props.runExtractorAsync(this.props.user.key, appId, teachId, userInput);
        }
    }

    render() {
        // Show done button if at least on round and at end of round
        let showDone = this.props.teachSessions.currentConversationStack.length > 0 && this.props.teachSessions.mode == TeachMode.Wait;

        // Put mask of webchat if not in input mode
        let chatDisable = (this.props.teachSessions.mode != TeachMode.Wait) ?
            <div className="wc-disable"></div>
            : null;

        // Mask controls if autoTeach is enabled
        let mask = (this.props.teachSessions.autoTeach) ? <div className="teachAutoMask"></div> : null;
        return (
            <Modal
                isOpen={this.props.open && this.props.error === null}
                isBlocking={true}
                containerClassName='blis-modal blis-modal--large'
            >
                <div className="blis-chatmodal">
                    <div className="blis-chatmodal_webchat">
                        <Webchat
                            history={null}
                            onPostActivity={activity => this.onWebChatPostActivity(activity)}
                            onSelectActivity={() => {}}
                        />
                        {chatDisable}
                    </div>
                    <div className="blis-chatmodal_controls">
                        <div className="blis-chatmodal_admin-controls">
                            <TeachSessionAdmin />
                            {mask}
                        </div>
                        <div className="blis-chatmodal_modal-controls">
                            <PrimaryButton
                                disabled={!showDone}
                                onClick={() => this.onClickSave()}
                                ariaDescription='Done Teaching'
                                text='Done Teaching'
                            />
                            <DefaultButton
                                onClick={() => this.onClickAbandonTeach()}
                                ariaDescription='Abandon Teach'
                                text='Abandon Teach'
                            />
                            <Checkbox
                                label='Auto Teach?'
                                checked={this.props.teachSessions.autoTeach}
                                onChange={(e, value) => this.autoTeachChanged(e, value)}
                                disabled={this.state.editing}
                            />
                        </div>
                    </div>
                </div>
                <ConfirmDeleteModal
                    open={this.state.isConfirmDeleteOpen}
                    onCancel={() => this.onClickCancelDelete()}
                    onConfirm={() => this.onClickConfirmDelete()}
                    title="Are you sure you want to abandon this teach session?"
                />
            </Modal>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        addMessageToTeachConversationStack,
        createTeachSessionAsync,
        deleteTeachSessionAsync,
        runExtractorAsync,
        setDisplayMode,
        toggleAutoTeach
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        teachSessions: state.teachSessions,
        apps: state.apps,
        user: state.user,
        error: state.error.error
    }
}

export interface ReceivedProps {
    open: boolean,
    onClose: Function,
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(TeachWindow);
