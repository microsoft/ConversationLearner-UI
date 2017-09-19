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
import { LogDialog } from 'blis-models'

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
    logDialog: LogDialog
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect(mapStateToProps, mapDispatchToProps)(LogDialogModal);