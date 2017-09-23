import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PrimaryButton } from 'office-ui-fabric-react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { State } from '../types';
import { DisplayMode } from '../types/const';
import Webchat from './Webchat'
import ChatSessionAdmin from './ChatSessionAdmin'
import { Session } from 'blis-models'
import { deleteChatSessionAsync } from '../actions/deleteActions'
import { createChatSessionAsync } from '../actions/createActions'
import { setDisplayMode } from '../actions/displayActions'


class SessionWindow extends React.Component<Props, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            chatSession : new Session({saveToLog : true})
        }
    }
    componentWillMount() {
        let currentAppId: string = this.props.apps.current.appId;
        this.props.createChatSession(this.props.userKey, this.state.chatSession, currentAppId);
    }
    handleQuit() {
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;

        if (this.props.chatSession.current !== null) {
            this.props.deleteChatSession(this.props.userKey, this.props.chatSession.current, currentAppId)
        }
    }
    render() {
        return (
            <Modal
                isOpen={this.props.error == null}
                isBlocking={true}
                containerClassName='blis-modal blis-modal--large'
            >
                <div className="blis-chatmodal">
                    <div className="blis-chatmodal_webchat">
                        <Webchat sessionType={"chat"} />
                    </div>
                    <div className="blis-chatmodal_controls">
                        <div className="blis-chatmodal_admin-controls">
                            <ChatSessionAdmin />
                        </div>
                        <div className="blis-chatmodal_modal-controls">
                        <PrimaryButton
                            onClick={() => this.handleQuit()}
                            ariaDescription='Done Testing'
                            text='Done Testing'
                        />
                        </div>    
                    </div>
                </div>
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createChatSession: createChatSessionAsync,
        deleteChatSession: deleteChatSessionAsync,
        setDisplayMode: setDisplayMode
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        chatSession: state.chatSessions,
        userKey: state.user.key,
        apps: state.apps,
        error: state.error.error
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(SessionWindow);
