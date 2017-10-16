import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { State } from '../../types';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import Webchat from '../Webchat'
import LogDialogAdmin from './LogDialogAdmin'
import { Activity } from 'botframework-directlinejs'
import { createTrainDialogAsync } from '../../actions/createActions'
import { BlisAppBase, TrainDialog, LogDialog } from 'blis-models'
import { deleteLogDialogAsync } from '../../actions/deleteActions'

interface ComponentState {
    selectedActivity: Activity | null
}

const initialState: ComponentState = {
    selectedActivity: null
}

class LogDialogModal extends React.Component<Props, ComponentState> {
    state = initialState

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.open === false && nextProps.open === true) {
            this.setState(initialState)
        }
    }

    generateHistory(props: Props): Activity[] {
        const { actions, logDialog, user } = props;

        if (!logDialog || !logDialog.rounds) {
            return [];
        }

        return logDialog.rounds.map((round, i) => {
            const userActivity: Activity = {
                id: `${i}:0`,
                from: {
                    id: user.id,
                    name: user.name
                },
                type: "message",
                text: round.extractorStep.text
            }

            const botActivities = round.scorerSteps.map<Activity>((scorerStep, j) => {
                if (scorerStep.predictedAction === null) {
                    return null
                }

                let action = actions.find(action => action.actionId === scorerStep.predictedAction)
                return {
                    id: `${i}:${j}`,
                    from: {
                        id: "BlisTrainer",
                        name: "BlisTrainer"
                    },
                    type: "message",
                    text: action.payload
                };
            }).filter(x => x)

            return [userActivity, ...botActivities]
        }).reduce((a, b) => a.concat(b));
    }

    onClickDelete() {
        this.props.deleteLogDialogAsync(this.props.app.appId, this.props.logDialog.logDialogId)
        // TODO: Would be better to close the dialog after it has been confirmed the delete was successful
        // How do we wait until the promise above has been resolved?
        this.props.onClose()
    }

    onSaveDialogChanges(trainDialog: TrainDialog) {
        console.log(`onSaveDialogChanges: `, trainDialog)
        this.props.createTrainDialogAsync(this.props.user.key, this.props.app.appId, trainDialog, this.props.logDialog.logDialogId)
        this.props.onClose()
    }

    onSelectWebChatActivity(activity: Activity) {
        this.setState({
            selectedActivity: activity
        })
    }

    onPostWebChatActivity(activity: Activity) {
        console.log(`activity posted: `, activity)
    }

    render() {
        let history = this.generateHistory(this.props);
        return (
            <div>
                <Modal
                    isOpen={this.props.open}
                    isBlocking={true}
                    containerClassName='blis-modal-container blis-modal blis-modal--large'
                >
                    <div className="blis-modal-header blis-color-log"></div>
                    <div className="blis-modal-body">
                        <div className="blis-chatmodal">
                            <div className="blis-chatmodal_webchat">
                                <Webchat
                                    app={this.props.app}
                                    history={history}
                                    onSelectActivity={activity => this.onSelectWebChatActivity(activity)}
                                    onPostActivity={activity => this.onPostWebChatActivity(activity)}
                                    hideInput={true}
                                    focusInput={true}
                                />
                            </div>
                            <div className="blis-chatmodal_controls">
                                <div className="blis-chatmodal_admin-controls">
                                    <LogDialogAdmin
                                        logDialog={this.props.logDialog}
                                        selectedActivity={this.state.selectedActivity}
                                        onSaveChanges={trainDialog => this.onSaveDialogChanges(trainDialog)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="blis-modal-footer blis-color-log">
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
                                    onClick={() => this.props.onClose()}
                                    ariaDescription='Done'
                                    text='Done'
                                />
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createTrainDialogAsync,
        deleteLogDialogAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: ReceivedProps) => {
    return {
        user: state.user,
        actions: state.actions
    }
}

export interface ReceivedProps {
    open: boolean,
    onClose: () => void,
    logDialog: LogDialog,
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(LogDialogModal);