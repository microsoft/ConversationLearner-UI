import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { Nav, INavLink, INavLinkGroup, Link, CommandButton } from 'office-ui-fabric-react';
import { State } from '../types';
import { DisplayMode, TeachMode } from '../types/const';
import Webchat from './Webchat'
import TeachSessionAdmin from './TeachSessionAdmin'
import { Teach } from 'blis-models'
import { deleteTeachSessionAsync } from '../actions/deleteActions'
import { createTrainDialog, createTeachSessionAsync } from '../actions/createActions'
import { setCurrentTrainDialog, setCurrentTeachSession, setDisplayMode } from '../actions/displayActions'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

class TeachWindow extends React.Component<Props, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            teachSession: new Teach({})
        }
        let currentAppId: string = this.props.apps.current.appId;
        this.props.createTeachSession(this.props.userKey, this.state.teachSession, currentAppId)
        // this.props.deleteTeachSession(this.props.userKey, testTeachSession, currentAppId)
        // this.props.setCurrentTeachSession(this.props.teachSessions.all.find((t: Teach) => t.teachId == ""))
        //need to create a new teach session
    }
    handleAbandon() {
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteTeachSession(this.props.user.key, this.props.teachSession.current, currentAppId, false); // False = abandon
    }
    handleSave() {
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteTeachSession(this.props.user.key, this.props.teachSession.current, currentAppId, true); // True = save to train dialog
    }
    confirmDelete() {
        this.setState({
            open: true
        })
    }
    handleCloseModal() {
        this.setState({
            open: false
        })
    }
    render() {
        // Show done button if at least on round and at end of round
        let showDone = this.props.teachSession.currentConversationStack.length > 0 && this.props.teachSession.mode == TeachMode.Wait;
        let doneButton = (showDone) ?
            <CommandButton
                data-automation-id='randomID16'
                disabled={false}
                onClick={this.handleSave.bind(this)}
                className='ms-font-su goldButton teachSessionHeaderButton'
                ariaDescription='Done Teaching'
                text='Done Teaching'
            /> : null;

        // Put mask of webchat if not in input mode
        let chatDisable = (this.props.teachSession.mode != TeachMode.Wait) ?
                <div className="wc-disable"></div>
                : null;

        return (
            <Modal
                isOpen={this.props.error == null}
                isBlocking={true}
                containerClassName='teachModal'
            >
                <div className="wc-gridContainer">
                    <div className="wc-gridWebchat">
                        <Webchat sessionType={"teach"} />
                        {chatDisable}
                    </div>
                    <div className="wc-gridAdmin">
                        <div className="wc-gridAdminContent">
                            <TeachSessionAdmin />
                        </div>
                        <div className="wc-gridFooter">
                            {doneButton}
                            <CommandButton
                                data-automation-id='randomID16'
                                disabled={false}
                                onClick={this.confirmDelete.bind(this)}
                                className='ms-font-su grayButton teachSessionHeaderButton abandonTeach'
                                ariaDescription='Abandon Teach'
                                text='Abandon Teach'
                            />
                        </div>
                    </div>
                </div>
                <ConfirmDeleteModal open={this.state.open} onCancel={() => this.handleCloseModal()} onConfirm={() => this.handleAbandon()} title="Are you sure you want to abandon this teach session?" />
            </Modal>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createTeachSession: createTeachSessionAsync,
        deleteTeachSession: deleteTeachSessionAsync,
        setDisplayMode: setDisplayMode
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        teachSession: state.teachSessions,
        userKey: state.user.key,
        apps: state.apps,
        user: state.user,
        error: state.error.error
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(TeachWindow);
