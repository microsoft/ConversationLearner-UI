import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { State } from '../../types';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import Webchat from '../Webchat'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import LogDialogAdmin from './LogDialogAdmin'
import { Activity } from 'botframework-directlinejs'
import { createTrainDialogAsync } from '../../actions/createActions'
import { deleteLogDialogThunkAsync } from '../../actions/deleteActions'
import { fetchApplicationTrainingStatusThunkAsync } from '../../actions/fetchActions'
import { BlisAppBase, TrainDialog, LogDialog } from 'blis-models'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ComponentState {
    isConfirmDeleteModalOpen: boolean
    selectedActivity: Activity | null
}

const initialState: ComponentState = {
    isConfirmDeleteModalOpen: false,
    selectedActivity: null
}

class LogDialogModal extends React.Component<Props, ComponentState> {
    state = initialState

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.open === false && nextProps.open === true) {
            this.setState(initialState)
        }
    }

    onClickDelete() {
        this.setState({
            isConfirmDeleteModalOpen: true
        })
    }

    onClickCancelDelete = () => {
        this.setState({
            isConfirmDeleteModalOpen: false
        })
    }

    onClickConfirmDelete = async () => {
        try {
            await this.props.deleteLogDialogThunkAsync(this.props.app.appId, this.props.logDialog.logDialogId)
            this.props.onClose()
        }
        catch (e) {
            console.error(e)
        }
    }

    //LARS delete me
    onSaveDialogChanges(trainDialog: TrainDialog) {
        this.props.createTrainDialogAsync(this.props.user.id, this.props.app.appId, trainDialog, this.props.logDialog.logDialogId)
        this.props.fetchApplicationTrainingStatusThunkAsync(this.props.app.appId)
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
        const { intl } = this.props;
        return (
            <div>
                <Modal
                    isOpen={this.props.open}
                    isBlocking={true}
                    containerClassName='blis-modal blis-modal--large blis-modal--log'
                >
                    <div className="blis-modal_body">
                        <div className="blis-chatmodal">
                            <div className="blis-chatmodal_webchat">
                                <Webchat
                                    app={this.props.app}
                                    history={this.props.history}
                                    onSelectActivity={activity => this.onSelectWebChatActivity(activity)}
                                    onPostActivity={activity => this.onPostWebChatActivity(activity)}
                                    hideInput={true}
                                    focusInput={true}
                                />
                            </div>
                            <div className="blis-chatmodal_controls">
                                <div className="blis-chatmodal_admin-controls">
                                    <LogDialogAdmin
                                        app={this.props.app}
                                        logDialog={this.props.logDialog}
                                        selectedActivity={this.state.selectedActivity}
                                        onEdit={(logDialogId: string, newTrainDialog: TrainDialog) => this.props.onEdit(logDialogId, newTrainDialog)}
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
                                    ariaDescription={intl.formatMessage({
                                        id: FM.LOGDIALOGMODAL_DEFAULTBUTTON_ARIADESCRIPTION,
                                        defaultMessage: 'Delete'
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.LOGDIALOGMODAL_DEFAULTBUTTON_TEXT,
                                        defaultMessage: 'Delete'
                                    })}
                                />
                                <PrimaryButton
                                    onClick={() => this.props.onClose()}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.LOGDIALOGMODAL_PRIMARYBUTTON_ARIADESCRIPTION,
                                        defaultMessage: 'Done'
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.LOGDIALOGMODAL_PRIMARYBUTTON_TEXT,
                                        defaultMessage: 'Done'
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                    <ConfirmDeleteModal
                        open={this.state.isConfirmDeleteModalOpen}
                        onCancel={() => this.onClickCancelDelete()}
                        onConfirm={() => this.onClickConfirmDelete()}
                        title={intl.formatMessage({
                            id: FM.LOGDIALOGMODAL_CONFIRMDELETE_TITLE,
                            defaultMessage: `Are you sure you want to delete this Log Dialog?`
                        })}
                    />
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createTrainDialogAsync,
        deleteLogDialogThunkAsync,
        fetchApplicationTrainingStatusThunkAsync
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
    onEdit: (logDialogId: string, newTrainDialog: TrainDialog) => void,
    logDialog: LogDialog,
    app: BlisAppBase,
    history: Activity[]
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(LogDialogModal))