import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Nav, INavLink, INavLinkGroup, Link } from 'office-ui-fabric-react';
import { State } from '../types';
import { DisplayMode } from '../types/const';
import Webchat from './Webchat'
import ChatSessionAdmin from './ChatSessionAdmin'
import { Session } from 'blis-models'
import { createChatSession } from '../actions/createActions'
import { setCurrentTrainDialog, setCurrentTeachSession } from '../actions/updateActions'


class SessionWindow extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            chatSession : new Session({saveToLog : null})
        }
        let currentAppId: string = this.props.apps.current.appId;
        this.props.createChatSession(this.props.userKey, this.state.chatSession, currentAppId);
    }
    handleAbandon() {
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteTeachSession(this.props.userKey, this.state.teachSession, currentAppId)
    }
    render() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col webchat">
                        <Webchat sessionType={"chat"}/>
                    </div>
                    <div className="ms-Grid-col sessionAdmin">
                        <ChatSessionAdmin/>
                    </div>
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createChatSession: createChatSession
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        teachSession: state.teachSessions.current,
        userKey: state.user.key,
        apps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(SessionWindow);
