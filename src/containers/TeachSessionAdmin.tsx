import * as React from 'react';
import { createBLISApplication } from '../actions/createActions';
import { CommandButton } from 'office-ui-fabric-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { UserInput } from 'blis-models'
import { DisplayMode, TeachMode } from '../types/const';
import { setDisplayMode } from '../actions/updateActions'
import { deleteTeachSession } from '../actions/deleteActions';
import { runExtractor } from '../actions/teachActions';
import TeachSessionScorer from './TeachSessionScorer';
import TeachSessionExtractor from './TeachSessionExtractor';
import TeachSessionMemory from './TeachSessionMemory';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

class TeachSessionAdmin extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            open: false
        }
        this.handleAbandon = this.handleAbandon.bind(this)
        this.handleCloseModal = this.handleCloseModal.bind(this)
    }
    handleAbandon() {
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteTeachSession(this.props.userKey, this.props.teachSession.current, currentAppId);
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
        let userWindow = null;
        switch (this.props.teachSession.mode) {
            case TeachMode.Extractor:
                userWindow = (
                    <div className="teachSessionModeContainer">
                        <TeachSessionMemory class={"teachSessionHalfMode"} />
                        <TeachSessionExtractor className="teachSessionHalfMode" />
                    </div>
                )
                break;
            case TeachMode.Scorer:
                userWindow = (
                    <div className="teachSessionModeContainer">
                        <TeachSessionMemory class={"teachSessionHalfMode"} />
                        <TeachSessionScorer />
                    </div>
                )
                break;
            default:
                userWindow = (
                    <div className="teachSessionModeContainer">
                        <TeachSessionMemory class={"teachSessionFullMode"} />
                    </div>
                )
                break;
        }
        return (
            <div className="container">
                <div className="teachSessionHeader">
                    <CommandButton
                        data-automation-id='randomID16'
                        disabled={false}
                        onClick={this.confirmDelete.bind(this)}
                        className='ms-font-su goldButton abandonTeach'
                        ariaDescription='Abandon Teach'
                        text='Abandon Teach'
                    />
                </div>
                {userWindow}
                <ConfirmDeleteModal open={this.state.open} onCancel={() => this.handleCloseModal()} onConfirm={() => this.handleAbandon()} title="Are you sure you want to abandon this teach session?" />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode: setDisplayMode,
        deleteTeachSession: deleteTeachSession,
        runExtractor: runExtractor
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        teachSession: state.teachSessions,
        apps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionAdmin);