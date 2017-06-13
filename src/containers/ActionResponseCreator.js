import React, { Component } from 'react';
import { createAction } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown } from 'office-ui-fabric-react';
import { Action, ActionMetadata } from '../models/Action';
import { ActionTypes, APITypes } from '../models/Constants'
class ActionResponseCreator extends Component {
    constructor(p) {
        super(p);
        this.state = {
            open: false,
            actionTypeVal: 'TEXT',
            apiTypeVal: null,
            contentVal: '',
            reqEntitiesVal: [],
            negEntitiesVal: [],
            waitVal: false,
            waitKey: 'waitFalse'
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
    createAction() {
        let randomGUID = this.generateGUID();
        this.handleClose();
    }
    render() {
        console.log(this.props.actions)
        let actionTypeVals = Object.values(ActionTypes);
        let apiTypeVals = Object.values(APITypes);
        let actionTypeOptions = actionTypeVals.map(v => {
            return {
                key: v,
                text: v
            }
        })
        let apiTypeOptions = apiTypeVals.map(v => {
            return {
                key: v,
                text: v
            }
        })
        return (
            <div className='actionResponseCreator'>
                <CommandButton
                    data-automation-id='randomID5'
                    disabled={false}
                    onClick={this.handleOpen.bind(this)}
                    className='goldButton'
                    ariaDescription='Create a New Action'
                    text='New Action'
                />
                <Modal
                    isOpen={this.state.open}
                    onDismiss={this.handleClose.bind(this)}
                    isBlocking={false}
                    containerClassName='createEntityModal'
                >
                    <div className='modalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>Create an Action</span>
                    </div>
                    <div>
                        
                    </div>
                    <div className='modalFooter'>
                        <CommandButton
                            data-automation-id='randomID6'
                            disabled={false}
                            onClick={this.createAction.bind(this)}
                            className='goldButton'
                            ariaDescription='Create'
                            text='Create'
                        />
                        <CommandButton
                            data-automation-id='randomID7'
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
        createAction: createAction
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        actions: state.actions,
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ActionResponseCreator);