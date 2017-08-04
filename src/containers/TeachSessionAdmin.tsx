import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { createBLISApplicationAsync } from '../actions/createActions';
import { CommandButton } from 'office-ui-fabric-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { UserInput } from 'blis-models'
import { DisplayMode, TeachMode } from '../types/const';
import { setDisplayMode } from '../actions/displayActions'
import { deleteTeachSessionAsync } from '../actions/deleteActions';
import { runExtractorAsync } from '../actions/teachActions';
import TeachSessionScorer from './TeachSessionScorer';
import TeachSessionExtractor from './TeachSessionExtractor';
import TeachSessionMemory from './TeachSessionMemory';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

class TeachSessionAdmin extends React.Component<Props, any> {
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
        this.props.deleteTeachSession(this.props.user.key, this.props.teachSession.current, currentAppId);
        // TODO: Still need to delete the associated training dialog.  This needs to be two steps
    }
    handleSave() {
        this.props.setDisplayMode(DisplayMode.AppAdmin);
        let currentAppId: string = this.props.apps.current.appId;
        this.props.deleteTeachSession(this.props.user.key, this.props.teachSession.current, currentAppId);
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
                        <TeachSessionMemory className="teachSessionWindow" />
                        <TeachSessionExtractor className="teachSessionWindow" />
                    </div>
                )
                break;
            case TeachMode.Scorer:
                userWindow = (
                    <div className="teachSessionModeContainer">
                        <TeachSessionMemory className="teachSessionWindow" />
                        <TeachSessionScorer className="teachSessionWindow"  />
                    </div>
                )
                break;
            default:
                userWindow = (
                    <div className="teachSessionModeContainer">
                        <TeachSessionMemory className="teachSessionWindow" />
                    </div>
                )
                break;
        }
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
        return (
            <div className="container">
                <div className="teachSessionHeader">
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
                {userWindow}
                <ConfirmDeleteModal open={this.state.open} onCancel={() => this.handleCloseModal()} onConfirm={() => this.handleAbandon()} title="Are you sure you want to abandon this teach session?" />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode: setDisplayMode,
        deleteTeachSession: deleteTeachSessionAsync,
        runExtractor: runExtractorAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        teachSession: state.teachSessions,
        apps: state.apps
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionAdmin);