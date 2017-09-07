import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { createBLISApplicationAsync } from '../actions/createActions';
import { CommandButton } from 'office-ui-fabric-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { DisplayMode } from '../types/const';
import { setDisplayMode } from '../actions/displayActions'
import { deleteChatSessionAsync } from '../actions/deleteActions'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

class ChatSessionAdmin extends React.Component<Props, any> {
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
                <ConfirmDeleteModal open={this.state.open} onCancel={() => this.handleCloseModal()} onConfirm={() => this.handleAbandon()} title="Are you sure you want to abandon this chat session?" />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode: setDisplayMode,
        deleteChatSession: deleteChatSessionAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        chatSession: state.chatSessions.current,
        apps: state.apps,
        userKey: state.user.key
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(ChatSessionAdmin);