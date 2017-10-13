import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PrimaryButton } from 'office-ui-fabric-react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { State } from '../../types';
import Webchat from '../Webchat'
import { BlisAppBase, Session } from 'blis-models'
import { deleteChatSessionAsync } from '../../actions/deleteActions'
import { createChatSessionAsync } from '../../actions/createActions'
import { Activity } from 'botframework-directlinejs';
// TODO: Investigate if this can be removed in favor of local state
import { addMessageToChatConversationStack } from '../../actions/displayActions';

interface ComponentState {
    chatSession: Session
}

class SessionWindow extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        chatSession: null
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.open === false && nextProps.open === true) {
            this.state.chatSession = new Session({ saveToLog: true })
            this.props.createChatSessionAsync(this.props.userKey, this.state.chatSession, this.props.app.appId);
        }
    }

    onClickDone() {
        if (this.props.chatSession.current !== null) {
            this.props.deleteChatSessionAsync(this.props.userKey, this.props.chatSession.current, this.props.app.appId)
        }

        this.props.onClose();
    }

    onWebChatPostActivity(activity: Activity) {
        if (activity.type === "message") {
            this.props.addMessageToChatConversationStack(activity)
        }
    }

    render() {
        return (
            <Modal
                isOpen={this.props.open && this.props.error == null}
                isBlocking={true}
                containerClassName='blis-modal-container blis-modal blis-modal--large'
            >
                <div className="blis-modal-header blis-color-log"></div>
                <div className="blis-modal-body">
                    <div className="blis-chatmodal">
                    
                        <div className="blis-chatmodal_webchat">
                            <Webchat
                                app={this.props.app}
                                history={null}
                                onPostActivity={activity => this.onWebChatPostActivity(activity)}
                                onSelectActivity={() => { }}
                                hideInput={false}
                            />
                        </div>
                        <div className="blis-chatmodal_controls">
                            <div className="blis-chatmodal_admin-controls">
                            </div>
                        </div>
                    </div>
                </div>
                <div className="blis-modal-footer blis-color-log">
                    <PrimaryButton
                        className="blis-button--right"
                        onClick={() => this.onClickDone()}
                        ariaDescription='Done Testing'
                        text='Done Testing'
                    />
                </div>
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        addMessageToChatConversationStack,
        createChatSessionAsync,
        deleteChatSessionAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        chatSession: state.chatSessions,
        userKey: state.user.key,
        error: state.error.error
    }
}

export interface ReceivedProps {
    open: boolean
    onClose: () => void
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(SessionWindow);
