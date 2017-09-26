import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { State } from '../types';
import Webchat from './Webchat'
import TrainDialogAdmin from './TrainDialogAdmin'
import { ActionBase } from 'blis-models'
import { deleteTrainDialogAsync } from '../actions/deleteActions'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Activity } from 'botframework-directlinejs';

interface ComponentState {
    confirmDeleteModalOpen: boolean,
    display: string
    dialogIDToDelete: string
}

class TrainDialogWindow extends React.Component<Props, ComponentState> {
    state = {
        confirmDeleteModalOpen: false,
        display: null,
        dialogIDToDelete: null
    }

    onClickDone() {
        this.props.onClose()
    }

    onClickDelete() {
        this.setState({
            confirmDeleteModalOpen: true
        })
    }

    onClickCancelDelete() {
        this.setState({
            confirmDeleteModalOpen: false
        })
    }

    onClickConfirmDelete() {
        this.setState({
            confirmDeleteModalOpen: false
        }, () => {
            let currentAppId: string = this.props.apps.current.appId;
            this.props.deleteTrainDialogAsync(this.props.userKey, this.props.trainDialog, currentAppId);
            this.props.onClose()
        })
    }

    generateHistory(): Activity[] {
        if (!this.props.trainDialog || !this.props.trainDialog.rounds) {
            return [];
        }
        let activities = [];
        let roundNum = 0;
        for (let round of this.props.trainDialog.rounds) {
            let userText = round.extractorStep.textVariations[0].text;
            let id = `${roundNum}:0`;
            let userActivity = { id: id, from: { id: this.props.user.id, name: this.props.user.name }, type: "message", text: userText } as Activity;
            activities.push(userActivity);

            let scoreNum = 0;
            for (let scorerStep of round.scorerSteps) {
                let labelAction = scorerStep.labelAction;
                let action = this.props.actions.filter((a: ActionBase) => a.actionId == labelAction)[0];
                let payload = action ? action.payload : "ERROR: Missing Action";
                id = `${roundNum}:${scoreNum}`
                let botActivity = { id: id, from: { id: "BlisTrainer", name: "BlisTrainer" }, type: "message", text: payload } as Activity;
                activities.push(botActivity);
                scoreNum++;
            }
            roundNum++;
        }
        return activities;
    }
    render() {
        return (
            <Modal
                isOpen={this.props.open && this.props.error == null}
                isBlocking={true}
                containerClassName='blis-modal blis-modal--large'>
                <div className="blis-chatmodal">
                    <div className="blis-chatmodal_webchat">
                        {this.props.trainDialog &&
                            <Webchat
                                sessionType={"chat"}
                                history={this.generateHistory()}
                            />}
                    </div>
                    <div className="blis-chatmodal_controls">
                        <div className="blis-chatmodal_admin-controls">
                            <TrainDialogAdmin />
                        </div>
                        <div className="blis-chatmodal_modal-controls">
                            <PrimaryButton
                                onClick={() => this.onClickDone()}
                                ariaDescription='Done'
                                text='Done'
                            />
                            <DefaultButton
                                onClick={() => this.onClickDelete()}
                                ariaDescription='Delete'
                                text='Delete'
                            />
                        </div>
                    </div>
                </div>
                <ConfirmDeleteModal
                    open={this.state.confirmDeleteModalOpen}
                    onCancel={() => this.onClickCancelDelete()}
                    onConfirm={() => this.onClickConfirmDelete()}
                    title="Are you sure you want to delete this Training Dialog?"
                />
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteTrainDialogAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        userKey: state.user.key,
        apps: state.apps,
        user: state.user,
        error: state.error.error,
        trainDialog: state.trainDialogs.current,
        actions: state.actions,
        display: state.display,
        teachSession : state.teachSessions
    }
}

export interface ReceivedProps {
    open: boolean,
    onClose: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(TrainDialogWindow);
