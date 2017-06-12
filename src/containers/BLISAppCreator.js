import React, { Component } from 'react';
import { createBLISApplication } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton } from 'office-ui-fabric-react';
import { BLISApplication } from '../models/Application'
class BLISAppCreator extends Component {
    constructor(p) {
        super(p);
        this.state = {
            open: false,
            appNameVal: '',
            appDescVal: ''
        }
    }
    handleOpen() {
        this.setState({
            open: true
        })
    }
    handleClose() {
        this.setState({
            open: false,
            appNameVal: '',
            appDescVal: ''
        })
    }
    nameChanged(text) {
        this.setState({
            appNameVal: text
        })
    }
    descriptionChanged(text) {
        this.setState({
            appDescVal: text
        })
    }
    guid(){

    }
    createApplication(){
        
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
                    isOpen={this.state.open}
                    onDismiss={this.handleClose.bind(this)}
                    isBlocking={false}
                    containerClassName='createAppModal'
                >
                    <div className='appModalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>Create a BLIS App</span>
                    </div>
                    <div className='appModalContent'>
                        <TextField className="appModalContentTextField" onChanged={this.nameChanged.bind(this)} label="Name" required={true} placeholder="Application Name..." value={this.state.appNameVal} />
                        <TextField className="appModalContentTextField" multiline inputClassName="ms-font-m-plus" autoAdjustHeight onChanged={this.descriptionChanged.bind(this)} label="Description" required={true} placeholder="Application Description..." value={this.state.appDescVal} />
                    </div>
                    <div className='appModalFooter'>
                        <CommandButton
                            data-automation-id='randomID2'
                            disabled={false}
                            onClick={this.createApplication.bind(this)}
                            className='goldButtons'
                            ariaDescription='Create'
                            text='Create'
                        />
                        <CommandButton
                            data-automation-id='randomID3'
                            className="grayButton"
                            disabled={false}
                            onClick={this.handleClose.bind(this)}
                            ariaDescription='Cancel'
                            text='Cancel'
                        />
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