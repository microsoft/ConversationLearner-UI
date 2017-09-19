import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { editEntityAsync } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CommandButton } from 'office-ui-fabric-react';
import { State } from '../types';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import Webchat from './Webchat'
import TrainDialogAdmin from './TrainDialogAdmin'
import { Activity } from 'botframework-directlinejs'
import { BlisAppBase, LogDialog } from 'blis-models'
import { deleteLogDialogAsync } from '../actions/deleteActions'

class LogDialogModal extends React.Component<Props, any> {
    
    generateHistory() : Activity[] {
        if (!this.props.logDialog) {
            return [];
        }

        const { actions, logDialog, user } = this.props;

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

            const botActivities: Activity[] = round.scorerSteps.map((scorerStep, j) => {
                let action = actions.filter(a => a.actionId === scorerStep.predictedAction)[0]
                return {
                    id: `${i}:${j}`,
                    from:{
                        id: "BlisTrainer",
                        name: "BlisTrainer"
                    },
                    type: "message",
                    text: action.payload
                } as Activity;
            })

            return [userActivity, ...botActivities]
        }).reduce((a, b) => a.concat(b));
    }

    onClickDelete() {
        this.props.deleteLogDialogAsync(this.props.app.appId, this.props.logDialog.logDialogId)
        // TODO: Would be better to close the dialog after it has been confirmed the delete was successful
        // How do we wait until the promise above has been resolved?
        this.props.onClose()
    }

    render() {
        let history = this.generateHistory();
        return (
            <div>
                <Modal
                    isOpen={this.props.open}
                    isBlocking={true}
                    containerClassName='modal modal--large'
                >
                    <div className="wc-gridContainer">
                        <div className="wc-gridWebchat">
                            <Webchat sessionType={"chat"} history={history} />
                        </div>
                        <div className="wc-gridAdmin">
                            <div className="wc-gridAdminContent">
                                {/* <TrainDialogAdmin /> */}
                            </div>
                            <div className="wc-gridFooter">
                                <CommandButton
                                    onClick={() => this.props.onClose()}
                                    className='ms-font-su goldButton teachSessionHeaderButton'
                                    ariaDescription='Done'
                                    text='Done'
                                />

                                <CommandButton
                                    onClick={() => this.onClickDelete()}
                                    className='ms-font-su grayButton teachSessionHeaderButton'
                                    ariaDescription='Delete'
                                    text='Delete'
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
    onClose: Function,
    logDialog: LogDialog,
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect(mapStateToProps, mapDispatchToProps)(LogDialogModal);