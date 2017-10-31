import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PrimaryButton } from 'office-ui-fabric-react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { State } from '../../types';
import Webchat from '../Webchat'
import { BlisAppBase } from 'blis-models'
import { deleteChatSessionAsync } from '../../actions/deleteActions'
import { Activity } from 'botframework-directlinejs';
// TODO: Investigate if this can be removed in favor of local state
import { addMessageToChatConversationStack } from '../../actions/displayActions';
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ComponentState {
}

class SessionWindow extends React.Component<Props, ComponentState> {
    onClickDone() {
        if (this.props.chatSession.current !== null) {
            this.props.deleteChatSessionAsync(this.props.userKey, this.props.chatSession.current, this.props.app.appId)
        }

        this.props.onClose();
    }

    onWebChatPostActivity(activity: Activity) {
        if (activity.type === "message") {
            this.props.addMessageToChatConversationStack(activity)
        }
    }

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open && this.props.error == null}
                isBlocking={true}
                containerClassName='blis-modal blis-modal--large blis-modal--log'
            >
                <div className="blis-modal_body">
                    <div className="blis-chatmodal">
                        <div className="blis-chatmodal_webchat">
                            <Webchat
                                app={this.props.app}
                                history={null}
                                onPostActivity={activity => this.onWebChatPostActivity(activity)}
                                onSelectActivity={() => { }}
                                hideInput={false}
                                focusInput={true}
                            />
                        </div>
                        <div className="blis-chatmodal_controls">
                            <div className="blis-chatmodal_admin-controls">
                            </div>
                        </div>
                    </div>
                </div>
                <div className="blis-modal_footer">
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary">
                        </div>
                        <div className="blis-modal-buttons_secondary">
                            <PrimaryButton
                                onClick={() => this.onClickDone()}
                                ariaDescription={intl.formatMessage({
                                    id: FM.CHATSESSIONWINDOW_PRIMARYBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Done Testing'
                                })}
                                text={intl.formatMessage({
                                    id: FM.CHATSESSIONWINDOW_PRIMARYBUTTON_TEXT,
                                    defaultMessage: 'Done Testing'
                                })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        addMessageToChatConversationStack,
        deleteChatSessionAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        chatSession: state.chatSessions,
        userKey: state.user.key,
        error: state.error.error
    }
}

export interface ReceivedProps {
    open: boolean
    onClose: () => void
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(SessionWindow))
