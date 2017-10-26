import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { CommandButton } from 'office-ui-fabric-react'
import { State } from '../../types'

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
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={this.onDismiss}
                containerClassName='blis-modal blis-modal--small blis-modal--border'
            >
                <div className='blis-modal_title'>
                    <span className='ms-font-xxl ms-fontWeight-semilight'>Log Out</span>
                </div>
                <div className="blis-modal-buttons">
                    <div className="blis-modal-buttons_primary">
                        <CommandButton
                            onClick={this.onClickLogout}
                            className='blis-button--gold'
                            ariaDescription='Log Out'
                            text='Log Out'
                        />
                        <CommandButton
                            className="blis-button--gray"
                            onClick={this.onClickCancel}
                            ariaDescription='Cancel'
                            text='Cancel'
                        />
                    </div>
                </div>
                <div className='blis-modal_buttonbox'>

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
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(LogoutModal);