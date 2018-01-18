import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import * as OF from 'office-ui-fabric-react'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'

interface ReceivedProps {
    open: boolean
    onDismiss: () => void
    onClickLogout: () => void
    onClickCancel: () => void
}

class LogoutModal extends React.Component<Props, {}> {
    onDismiss = () => {
        this.props.onDismiss()
    }

    onClickLogout = () => {
        this.props.onClickLogout()
    }

    onClickCancel = () => {
        this.props.onClickCancel()
    }

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={this.onDismiss}
                containerClassName='blis-modal blis-modal--small blis-modal--border'
            >
                <div className='blis-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        <FormattedMessage
                            id={FM.LOGOUT_TITLE}
                            defaultMessage="Log Out"
                        />
                    </span>
                </div>
                <div className='blis-modal_footer'>
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary">
                            <OF.PrimaryButton
                                onClick={this.onClickLogout}
                                ariaDescription={intl.formatMessage({
                                    id: FM.LOGOUT_PRIMARYBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Log Out'
                                })}
                                text={intl.formatMessage({
                                    id: FM.LOGOUT_PRIMARYBUTTON_TEXT,
                                    defaultMessage: 'Log Out'
                                })}
                            />
                            <OF.DefaultButton
                                onClick={this.onClickCancel}
                                ariaDescription={intl.formatMessage({
                                    id: FM.LOGOUT_DEFAULTBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Cancel'
                                })}
                                text={intl.formatMessage({
                                    id: FM.LOGOUT_DEFAULTBUTTON_TEXT,
                                    defaultMessage: 'Cancel'
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
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(LogoutModal))