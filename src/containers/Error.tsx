import * as React from 'react';
import axios from 'axios';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown } from 'office-ui-fabric-react';
import { setErrorDisplay } from '../actions/updateActions'
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
        this.props.setErrorDisplay(null);
    }
    render() {
        return (
            <div>
                <Modal
                    isOpen={this.props.displayError != null}
                    onDismiss={this.handleClose.bind(this)}
                    isBlocking={false}
                    containerClassName='createModal'
                >
                    <div className='modalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>Error</span>
                    </div>
                    <span className='ms-font-l ms-fontWeight-semilight'>{this.props.displayError}</span>
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
        setErrorDisplay: setErrorDisplay
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        displayError: state.display.displayError
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(UIError);