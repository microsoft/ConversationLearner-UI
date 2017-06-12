import React, { Component } from 'react';
import { createEntity } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton } from 'office-ui-fabric-react';
import { Entity } from '../models/Entity'
class EntityCreator extends Component {
    constructor(p) {
        super(p);
        this.state = {
            open: false,
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
    createEntity() {
        let randomGUID = this.generateGUID();
        // this.props.createEntity(appToAdd);
        this.handleClose();
    }
    render() {
        return (
            <div className='entityCreator'>
                <CommandButton
                    data-automation-id='randomID4'
                    disabled={false}
                    onClick={this.handleOpen.bind(this)}
                    className='goldButton'
                    ariaDescription='Create a New Entity'
                    text='New Entity'
                />
                <Modal
                    isOpen={this.state.open}
                    onDismiss={this.handleClose.bind(this)}
                    isBlocking={false}
                    containerClassName='createAppModal'
                >
                    <div className='appModalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>Create an Entity</span>
                    </div>
                    <div className='appModalContent'>
                        
                    </div>
                    <div className='appModalFooter'>
                        <CommandButton
                            data-automation-id='randomID2'
                            disabled={false}
                            onClick={this.createEntity.bind(this)}
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
        createEntity: createEntity
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        entities: state.entities
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(EntityCreator);