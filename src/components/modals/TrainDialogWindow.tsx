import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { State } from '../../types';
import Webchat from '../Webchat'
import TrainDialogAdmin from './TrainDialogAdmin'
import { BlisAppBase, TrainDialog} from 'blis-models'
import { deleteTrainDialogThunkAsync } from '../../actions/deleteActions'
import { fetchApplicationTrainingStatusThunkAsync } from '../../actions/fetchActions'
// TODO: Investigate if this can be removed in favor of local state
import { addMessageToChatConversationStack } from '../../actions/displayActions'
import { Activity } from 'botframework-directlinejs';
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'

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
        if (this.state.currentTrainDialog !== nextProps.trainDialog) {
            // Force webchat to re-mount as history prop can't be updated
            this.setState({
                currentTrainDialog: nextProps.trainDialog,
                webchatKey: this.state.webchatKey + 1
            });
        }
    }

    onClickBranch() {
        if (this.state.selectedActivity) {
            let roundIndex = this.state.selectedActivity.id.split(':').map(s => parseInt(s))[1];
            this.props.onBranch(roundIndex);
        }
        //LARS TODO pop up telling to seledct a round
        // also check that not round 0
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
        this.setState(
            { confirmDeleteModalOpen: false },
            async () => {
                try {
                    await this.props.deleteTrainDialogThunkAsync(this.props.app.appId, this.props.trainDialog)
                    this.props.fetchApplicationTrainingStatusThunkAsync(this.props.app.appId)
                    this.props.onClose()
                }
                catch (e) {
                    console.error(e)
                }
            })
    }

    // TODO: Investigate if this can be removed.
    // Lars mentioned people shouldn't be able to / expected to chat when viewing existing dialogs
    // which means this should not ever be called and whatever it's doing now is likely unnecessary
    onWebChatPostActivity(activity: Activity) {
        console.log(`post activity: `, activity)
        if (activity.type === 'message') {
            this.props.addMessageToChatConversationStack(activity)
        }
    }

    onWebChatSelectActivity(activity: Activity) {
        this.setState({
            selectedActivity: activity
        })
    }

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open && this.props.error == null}
                isBlocking={true}
                containerClassName="blis-modal blis-modal--large blis-modal--teach">
                <div className="blis-modal_body">
                    <div className="blis-chatmodal">
                        <div className="blis-chatmodal_webchat">
                            <Webchat
                                key={this.state.webchatKey}
                                app={this.props.app}
                                history={this.props.history}
                                onPostActivity={activity => this.onWebChatPostActivity(activity)}
                                onSelectActivity={activity => this.onWebChatSelectActivity(activity)}
                                hideInput={true}
                                focusInput={false}
                            />
                        </div>
                        <div className="blis-chatmodal_controls">
                            <div className="blis-chatmodal_admin-controls">
                                <TrainDialogAdmin
                                    app={this.props.app}
                                    trainDialog={this.props.trainDialog}
                                    selectedActivity={this.state.selectedActivity}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="blis-modal_footer">
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary" />
                        <div className="blis-modal-buttons_secondary">
                            <DefaultButton
                                    onClick={() => this.onClickBranch()}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.TRAINDIALOGWINDOW_BRANCH_ARIADESCRIPTION,
                                        defaultMessage: 'Branch'
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.TRAINDIALOGWINDOW_BRANCH_TEXT,
                                        defaultMessage: 'Branch'
                                    })}
                            />
                            <DefaultButton
                                onClick={() => this.onClickDelete()}
                                ariaDescription={intl.formatMessage({
                                    id: FM.TRAINDIALOGWINDOW_DEFAULTBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Delete'
                                })}
                                text={intl.formatMessage({
                                    id: FM.TRAINDIALOGWINDOW_DEFAULTBUTTON_TEXT,
                                    defaultMessage: 'Delete'
                                })}
                            />
                            <PrimaryButton
                                onClick={() => this.onClickDone()}
                                ariaDescription={intl.formatMessage({
                                    id: FM.TRAINDIALOGWINDOW_PRIMARYBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Done'
                                })}
                                text={intl.formatMessage({
                                    id: FM.TRAINDIALOGWINDOW_PRIMARYBUTTON_TEXT,
                                    defaultMessage: 'Done'
                                })}
                            />
                        </div>
                    </div>
                </div>
                <ConfirmDeleteModal
                    open={this.state.confirmDeleteModalOpen}
                    onCancel={() => this.onClickCancelDelete()}
                    onConfirm={() => this.onClickConfirmDelete()}
                    title={intl.formatMessage({
                        id: FM.TRAINDIALOGWINDOW_CONFIRMDELETE_TITLE,
                        defaultMessage: `Are you sure you want to delete this Training Dialog?`
                    })}
                />
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        addMessageToChatConversationStack,
        deleteTrainDialogThunkAsync,
        fetchApplicationTrainingStatusThunkAsync
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
    onBranch: (turnIndex: number) => void
    open: boolean
    trainDialog: TrainDialog
    history: Activity[]
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TrainDialogWindow))
