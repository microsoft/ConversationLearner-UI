import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { State } from '../../types';
import Webchat from '../Webchat'
import TrainDialogAdmin from './TrainDialogAdmin'
import { BlisAppBase, ActionBase, TrainDialog } from 'blis-models'
import { deleteTrainDialogAsync } from '../../actions/deleteActions'
import { Activity } from 'botframework-directlinejs';
import { SenderType } from '../../types/const';
import ConfirmDeleteModal from './ConfirmDeleteModal'
// TODO: Investigate if this can be removed in favor of local state
import { addMessageToChatConversationStack } from '../../actions/displayActions';

interface ComponentState {
    confirmDeleteModalOpen: boolean,
    selectedActivity: Activity | null,
    webchatKey: number,
    currentTrainDialog: TrainDialog
}

const initialState: ComponentState = {
    confirmDeleteModalOpen: false,
    selectedActivity: null,
    webchatKey: 0,
    currentTrainDialog: null,
}

class TrainDialogWindow extends React.Component<Props, ComponentState> {
    state = initialState

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.open === false && nextProps.open === true) {
            this.setState(initialState);
        }
        if (this.state.currentTrainDialog != nextProps.trainDialog) {
            // Force webchat to re-mount as history prop can't be updated
            this.setState({
                currentTrainDialog: nextProps.trainDialog,
                webchatKey: this.state.webchatKey + 1
            });
        }
    }

    onClickDone() {
        this.props.onClose()
    }

    onClickDelete() {
        this.setState({
            confirmDeleteModalOpen: true
        })
    }

    onClickCancelDelete = () => {
        this.setState({
            confirmDeleteModalOpen: false
        })
    }

    onClickConfirmDelete = () => {
        this.setState({
            confirmDeleteModalOpen: false
        }, () => {
            this.props.deleteTrainDialogAsync(this.props.user.key, this.props.trainDialog, this.props.app.appId)
            this.props.onClose()
        })
    }

    // TODO: Investigate if this can be removed.
    // Lars mentioned people shouldn't be able to / expected to chat when viewing existing dialogs
    // which means this should not ever be called and whatever it's doing now is likely unnecessary
    onWebChatPostActivity(activity: Activity) {
        console.log(`post activity: `, activity)
        if (activity.type === "message") {
            this.props.addMessageToChatConversationStack(activity)
        }
    }

    onWebChatSelectActivity(activity: Activity) {
        this.setState({
            selectedActivity: activity
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
            let id = `${SenderType.User}:${roundNum}:0`;
            let userActivity = { id: id, from: { id: this.props.user.id, name: this.props.user.name }, type: "message", text: userText } as Activity;
            activities.push(userActivity);

            let scoreNum = 0;
            for (let scorerStep of round.scorerSteps) {
                let labelAction = scorerStep.labelAction;
                let action = this.props.actions.filter((a: ActionBase) => a.actionId == labelAction)[0];
                let payload = action ? action.payload : "ERROR: Missing Action";
                id = `${SenderType.Bot}:${roundNum}:${scoreNum}`
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
                containerClassName='blis-modal blis-modal--large blis-modal--teach'>
                <div className="blis-modal_body">
                    <div className="blis-chatmodal">
                        <div className="blis-chatmodal_webchat">
                            <Webchat
                                key={this.state.webchatKey}
                                app={this.props.app}
                                history={this.generateHistory()}
                                onPostActivity={activity => this.onWebChatPostActivity(activity)}
                                onSelectActivity={activity => this.onWebChatSelectActivity(activity)}
                                hideInput={true}
                                focusInput={false}
                            />
                        </div>
                        <div className="blis-chatmodal_controls">
                            <div className="blis-chatmodal_admin-controls">
                                <TrainDialogAdmin
                                    trainDialog={this.props.trainDialog}
                                    selectedActivity={this.state.selectedActivity}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="blis-modal_footer">
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary">
                        </div>
                        <div className="blis-modal-buttons_secondary">
                            <DefaultButton
                                onClick={() => this.onClickDelete()}
                                ariaDescription='Delete'
                                text='Delete'
                            />
                            <PrimaryButton
                                onClick={() => this.onClickDone()}
                                ariaDescription='Done'
                                text='Done'
                            />
                        </div>
                    </div>
                </div>
                <ConfirmDeleteModal
                    open={this.state.confirmDeleteModalOpen}
                    onCancel={() => this.onClickCancelDelete()}
                    onConfirm={() => this.onClickConfirmDelete()}
                    title={`Are you sure you want to delete this Training Dialog?`}
                />
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        addMessageToChatConversationStack,
        deleteTrainDialogAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        error: state.error.error,
        actions: state.actions
    }
}

export interface ReceivedProps {
    app: BlisAppBase
    onClose: () => void
    open: boolean
    trainDialog: TrainDialog
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(TrainDialogWindow);
