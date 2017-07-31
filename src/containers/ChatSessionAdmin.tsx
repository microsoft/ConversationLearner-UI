import * as React from 'react';
import { createBLISApplication } from '../actions/createActions';
import { CommandButton } from 'office-ui-fabric-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { DisplayMode } from '../types/const';
import { setDisplayMode } from '../actions/updateActions'
import { deleteChatSession } from '../actions/deleteActions'

class ChatSessionAdmin extends React.Component<any, any> {
    handleAbandon() {
        // TODO: Add confirmation modal
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteChatSession(this.props.userKey, this.props.chatSession, currentAppId);
    }

    render() {
        return (
            <div className="container">
                <span className="ms-font-su goldText">                        
                    <CommandButton
                            data-automation-id='randomID16'
                            disabled={false}
                            onClick={this.handleAbandon.bind(this)}
                            className='goldButton buttonWithTextField'
                            ariaDescription='End Session'
                            text='End Session'
                        />
                    </span>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode: setDisplayMode,
        deleteChatSession: deleteChatSession
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        chatSession: state.chatSessions.current,
        apps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ChatSessionAdmin);