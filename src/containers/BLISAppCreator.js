import React, { Component } from 'react';
import { createBLISApplication } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton } from 'office-ui-fabric-react';
import { setBLISAppDisplay } from '../actions/update'
import { fetchAllActions, fetchAllEntities, fetchAllTrainDialogs } from '../actions/fetch'
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
    generateGUID() {
        let d = new Date().getTime();
        let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (char == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return guid;
    }
    createApplication() {
        let randomGUID = this.generateGUID();
        let appToAdd = new BLISApplication(randomGUID, this.state.appNameVal);
        this.props.createBLISApplication(appToAdd);
        this.props.fetchAllActions(randomGUID);
        this.props.fetchAllEntities(randomGUID);
        this.props.fetchAllTrainDialogs(randomGUID);
        this.handleClose();
        this.props.setBLISAppDisplay("TrainingGround");
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
                    <div className='modalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>Create a BLIS App</span>
                    </div>
                    <div>
                        <TextField onChanged={this.nameChanged.bind(this)} label="Name" required={true} placeholder="Application Name..." value={this.state.appNameVal} />
                        <TextField multiline inputClassName="ms-font-m-plus" autoAdjustHeight onChanged={this.descriptionChanged.bind(this)} label="Description" required={true} placeholder="Application Description..." value={this.state.appDescVal} />
                    </div>
                    <div className='modalFooter'>
                        <CommandButton
                            data-automation-id='randomID2'
                            disabled={false}
                            onClick={this.createApplication.bind(this)}
                            className='goldButton'
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
        fetchAllActions: fetchAllActions,
        fetchAllEntities: fetchAllEntities,
        fetchAllTrainDialogs: fetchAllTrainDialogs,
        setBLISAppDisplay: setBLISAppDisplay
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BLISAppCreator);