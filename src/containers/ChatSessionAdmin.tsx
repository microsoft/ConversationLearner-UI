import * as React from 'react';
import { createBLISApplication } from '../actions/createActions';
import { CommandButton } from 'office-ui-fabric-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { DisplayMode } from '../types/const';
import { setDisplayMode } from '../actions/updateActions'
import { deleteChatSession } from '../actions/deleteActions'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

class ChatSessionAdmin extends React.Component<any, any> {
    constructor(p: any){
        super(p)
        this.state = {
            open: false
        }
        this.handleAbandon = this.handleAbandon.bind(this)
        this.handleCloseModal = this.handleCloseModal.bind(this)
    }
    handleAbandon() {
        // TODO: Add confirmation modal
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteChatSession(this.props.userKey, this.props.chatSession, currentAppId);
    }
    handleCloseModal() {
        this.setState({
            open: false
        })
    }
    confirmDelete() {
        this.setState({
            open: true
        })
    }
    render() {
        return (
            <div className="container">
                <span className="ms-font-su goldText">
                    <CommandButton
                        data-automation-id='randomID16'
                        disabled={false}
                        onClick={this.confirmDelete.bind(this)}
                        className='goldButton buttonWithTextField'
                        ariaDescription='End Session'
                        text='End Session'
                    />
                </span>
                <ConfirmDeleteModal open={this.state.open} onCancel={() => this.handleCloseModal()} onConfirm={() => this.handleAbandon()} title="Are you sure you want to abandon this chat session?" />
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