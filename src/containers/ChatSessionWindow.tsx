import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Nav, INavLink, INavLinkGroup, Link, CommandButton } from 'office-ui-fabric-react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { State } from '../types';
import { DisplayMode } from '../types/const';
import Webchat from './Webchat'
import ChatSessionAdmin from './ChatSessionAdmin'
import { Session } from 'blis-models'
import { deleteChatSessionAsync } from '../actions/deleteActions'
import { createChatSessionAsync } from '../actions/createActions'
import { setCurrentTrainDialog, setCurrentTeachSession, setDisplayMode } from '../actions/displayActions'


class SessionWindow extends React.Component<Props, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            chatSession : new Session({saveToLog : true})
        }
        let currentAppId: string = this.props.apps.current.appId;
        this.props.createChatSession(this.props.userKey, this.state.chatSession, currentAppId);
    }
    handleQuit() {
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteChatSession(this.props.userKey, this.props.chatSession.current, currentAppId)
    }
    render() {
        return (
            <Modal
                isOpen={this.props.error == null}
                isBlocking={true}
                containerClassName='teachModal'>
                <div className="wc-gridContainer">
                    <div className="wc-gridWebchat">
                        <Webchat sessionType={"chat"} />
                    </div>
                    <div className="wc-gridAdmin">
                        <div className="wc-gridAdminContent">
                            <ChatSessionAdmin />
                        </div>
                        <div className="wc-gridFooter">
                        <CommandButton
                            data-automation-id='randomID16'
                            disabled={false}
                            onClick={this.handleQuit.bind(this)}
                            className='ms-font-su goldButton teachSessionHeaderButton'
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
