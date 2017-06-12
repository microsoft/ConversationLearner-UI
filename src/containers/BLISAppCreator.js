import React, { Component } from 'react';
import { createBLISApplication } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup } from 'office-ui-fabric-react';
class BLISAppCreator extends Component {
    constructor(p) {
        super(p);
        this.state = {
            open: false
        }
    }
    handleOpen(){
        this.setState({
            open: true
        })
    }
    handleClose(){
        this.setState({
            open: false
        })
    }
    render() {
        return (
            <div>
                <CommandButton
                    data-automation-id='randomID'
                    disabled={false}
                    onClick={this.handleOpen.bind(this)}
                    className='goldButton'
                    ariaDescription='Create a New Application'
                    text='New App'
                /> 
                <Modal
                    isOpen={ this.state.open }
                    onDismiss={ this.handleClose.bind(this) }
                    isBlocking={ false }
                    containerClassName='createAppModal'
                    >
                    <div className='appModalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>Create a BLIS App</span>
                    </div>
                    <div className='appModalContent'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>Create a BLIS App</span>
                    </div>
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        createBLISApplication: createBLISApplication,
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BLISAppCreator);