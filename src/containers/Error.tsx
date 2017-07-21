import * as React from 'react';
import axios from 'axios';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown } from 'office-ui-fabric-react';
import { clearErrorDisplay } from '../actions/updateActions'
import { State } from '../types'
type CultureObject = {
    CultureCode: string;
    CultureName: string;
}
class UIError extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
    }
    handleClose() {
        this.props.clearErrorDisplay();
    }
    render() {
        return (
            <div>
                <Modal
                    isOpen={this.props.error.error != null}
                    onDismiss={this.handleClose.bind(this)}
                    isBlocking={false}
                    containerClassName='createModal'
                >
                    <div className='modalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>Error</span>
                    </div>
                    <div className='ms-font-l ms-fontWeight-semilight'>{this.props.error.route} Failed</div>
                    <div className='ms-font-m ms-fontWeight-semilight'>{this.props.error.error}</div>
                    <div className='modalFooter'>
                        <CommandButton
                            data-automation-id='randomID2'
                            disabled={false}
                            onClick={this.handleClose.bind(this)}  
                            className='goldButton'
                            ariaDescription='Ok'
                            text='Ok'
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        clearErrorDisplay: clearErrorDisplay
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        error: state.error
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(UIError);