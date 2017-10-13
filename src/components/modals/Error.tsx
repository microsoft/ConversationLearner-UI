import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton } from 'office-ui-fabric-react';
import { clearErrorDisplay } from '../../actions/displayActions'
import { State } from '../../types'

class UIError extends React.Component<Props, {}> {
    constructor(p: any) {
        super(p);

        this.handleClose = this.handleClose.bind(this)
    }
    handleClose() {
        this.props.clearErrorDisplay();
    }
    render() {
        let message = this.props.error.message ?
            <div className='ms-font-m ms-fontWeight-semilight'>{this.props.error.message}</div> :
            null;
        return (
            <Modal
                isOpen={this.props.error.error != null}
                onDismiss={this.handleClose}
                isBlocking={false}
                containerClassName='blis-modal blis-modal--small blis-modal--border'
            >
                <div className='blis-modal_title'>
                    <span className='ms-font-xxl ms-fontWeight-semilight'>Error</span>
                </div>
                <div className='ms-font-l ms-fontWeight-semilight'>{this.props.error.route} Failed</div>
                <div className='ms-font-m ms-fontWeight-semilight'>{this.props.error.error}</div>
                {message}
                <div className='blis-modal_buttonbox'>
                    <CommandButton
                        onClick={this.handleClose}
                        className='blis-button--gold'
                        ariaDescription='Ok'
                        text='Ok'
                    />
                </div>
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        clearErrorDisplay
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        error: state.error
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(UIError);