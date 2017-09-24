import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { PrimaryButton, DefaultButton, Checkbox } from 'office-ui-fabric-react';
import { State } from '../types';
import { DisplayMode, TeachMode } from '../types/const';
import Webchat from './Webchat'
import TeachSessionAdmin from './TeachSessionAdmin'
import { Teach } from 'blis-models'
import { deleteTeachSessionAsync } from '../actions/deleteActions'
import { toggleAutoTeach } from '../actions/teachActions'
import { createTeachSessionAsync } from '../actions/createActions'
import { setDisplayMode } from '../actions/displayActions'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

class TeachWindow extends React.Component<Props, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            teachSession: new Teach({})
        }
    }
    componentWillMount() {
        let currentAppId: string = this.props.apps.current.appId;
        this.props.createTeachSessionAsync(this.props.user.key, this.state.teachSession, currentAppId)
    }
    handleAbandon() {
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteTeachSessionAsync(this.props.user.key, this.props.teachSession.current, currentAppId, false); // False = abandon
    }
    handleSave() {
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteTeachSessionAsync(this.props.user.key, this.props.teachSession.current, currentAppId, true); // True = save to train dialog
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
    autoTeachChanged(ev: React.FormEvent<HTMLElement>, isChecked: boolean) {
        this.props.toggleAutoTeach(isChecked);
    }
    render() {
        // Show done button if at least on round and at end of round
        let showDone = this.props.teachSession.currentConversationStack.length > 0 && this.props.teachSession.mode == TeachMode.Wait;

        // Put mask of webchat if not in input mode
        let chatDisable = (this.props.teachSession.mode != TeachMode.Wait) ?
            <div className="wc-disable"></div>
            : null;

        // Mask controls if autoTeach is enabled
        let mask = (this.props.teachSession.autoTeach) ? <div className="teachAutoMask"></div> : null;
        return (
            <Modal
                isOpen={this.props.error == null}
                isBlocking={true}
                containerClassName='blis-modal blis-modal--large'
            >
                <div className="blis-chatmodal">
                    <div className="blis-chatmodal_webchat">
                        <Webchat sessionType={"teach"} />
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
                                onClick={this.handleSave.bind(this)}
                                ariaDescription='Done Teaching'
                                text='Done Teaching'
                            />
                            <DefaultButton
                                onClick={this.confirmDelete.bind(this)}
                                ariaDescription='Abandon Teach'
                                text='Abandon Teach'
                            />
                            <Checkbox
                                label='Auto Teach?'
                                checked={this.props.teachSession.autoTeach}
                                onChange={this.autoTeachChanged.bind(this)}
                                disabled={this.state.editing}
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
        createTeachSessionAsync,
        deleteTeachSessionAsync,
        setDisplayMode,
        toggleAutoTeach
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        teachSession: state.teachSessions,
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
