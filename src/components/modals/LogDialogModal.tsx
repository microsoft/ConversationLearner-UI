import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { State } from '../../types';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import Webchat from '../Webchat'
import ConfirmCancelModal from './ConfirmCancelModal'
import LogDialogAdmin from './LogDialogAdmin'
import { Activity } from 'botframework-directlinejs'
import { createTrainDialogAsync } from '../../actions/createActions'
import { fetchApplicationTrainingStatusThunkAsync } from '../../actions/fetchActions'
import { BlisAppBase, TrainDialog, LogDialog } from 'blis-models'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ComponentState {
    isConfirmCancelModalOpen: boolean
    selectedActivity: Activity | null
    pendingExtractionChanges: boolean
}

const initialState: ComponentState = {
    isConfirmCancelModalOpen: false,
    selectedActivity: null,
    pendingExtractionChanges: false
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
            isConfirmCancelModalOpen: true
        })
    }

    onClickCancelDelete = () => {
        this.setState({
            isConfirmCancelModalOpen: false
        })
    }

    onClickConfirmDelete = async () => {
        this.props.onDelete();
        this.setState(
            { isConfirmCancelModalOpen: false }
        );
    }

    onSelectWebChatActivity(activity: Activity) {
        this.setState({
            selectedActivity: activity
        })
    }

    onPostWebChatActivity(activity: Activity) {
        console.log(`activity posted: `, activity)
    }

    onExtractionsChanged(changed: boolean) {
        // Put mask on webchat if changing extractions
        this.setState({
            pendingExtractionChanges: changed
        })
    }

    render() {
        const { intl } = this.props;
        let chatDisable = this.state.pendingExtractionChanges ? <div className="blis-overlay"/> : null;

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
                                {chatDisable}
                            </div>
                            <div className="blis-chatmodal_controls">
                                <div className="blis-chatmodal_admin-controls">
                                    <LogDialogAdmin
                                        app={this.props.app}
                                        editingPackageId={this.props.editingPackageId}
                                        canEdit={this.props.canEdit}
                                        logDialog={this.props.logDialog}
                                        selectedActivity={this.state.selectedActivity}
                                        onEdit={(logDialogId: string, newTrainDialog: TrainDialog, lastExtractChanged: boolean) => this.props.onEdit(logDialogId, newTrainDialog, lastExtractChanged)}
                                        onExtractionsChanged={(changed: boolean) => this.onExtractionsChanged(changed)}
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
                                    disabled={this.state.pendingExtractionChanges || !this.props.canEdit}
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
                                    disabled={this.state.pendingExtractionChanges}
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
                    <ConfirmCancelModal
                        open={this.state.isConfirmCancelModalOpen}
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
    app: BlisAppBase,
    editingPackageId: string,
    open: boolean,
    canEdit: boolean,
    onClose: () => void,
    onEdit: (logDialogId: string, newTrainDialog: TrainDialog, lastExtractChanged: boolean) => void,
    onDelete: ()=> void,
    logDialog: LogDialog,
    history: Activity[]
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(LogDialogModal))