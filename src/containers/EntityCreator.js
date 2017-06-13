import React, { Component } from 'react';
import { createEntity } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown } from 'office-ui-fabric-react';
import { Entity, EntityMetadata } from '../models/Entity';
import { EntityTypes } from '../models/Constants'
class EntityCreator extends Component {
    constructor(p) {
        super(p);
        this.state = {
            open: false,
            entityNameVal: '',
            entityTypeVal: 'LOCAL',
            isBucketableVal: false,
            isNegatableVal: false,
            bucketableKey: 'bucketableFalse',
            negatableKey: 'negatableFalse'
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
            entityNameVal: '',
            entityTypeVal: 'LOCAL',
            isBucketableVal: false,
            isNegatableVal: false,
            bucketableKey: 'bucketableFalse',
            negatableKey: 'negatableFalse'
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
        let meta = new EntityMetadata(this.state.isBucketableVal, this.state.isNegatableVal, false, false);
        let entityToAdd = new Entity(randomGUID, this.state.entityTypeVal, null, this.state.entityNameVal, meta, this.props.blisApps.current.modelID);
        this.props.createEntity(entityToAdd);
        this.handleClose();
    }
    nameChanged(text) {
        this.setState({
            entityNameVal: text
        })
    }
    typeChanged(obj) {
        this.setState({
            entityTypeVal: obj.text
        })
    }
    bucketableChanged(event, option) {
        if (option.text == 'False') {
            this.setState({
                isBucketableVal: false,
                bucketableKey: 'bucketableFalse'
            })
        } else {
            this.setState({
                isBucketableVal: true,
                bucketableKey: 'bucketableTrue'
            })
        }
    }
    negatableChanged(event, option) {
        if (option.text == 'False') {
            this.setState({
                isNegatableVal: false,
                negatableKey: 'negatableFalse'
            })
        } else {
            this.setState({
                isNegatableVal: true,
                negatableKey: 'negatableTrue'
            })
        }
    }
    render() {
        let vals = Object.values(EntityTypes);
        let options = vals.map(v => {
            return {
                key: v,
                text: v
            }
        })
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
                    containerClassName='createModal'
                >
                    <div className='modalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>Create an Entity</span>
                    </div>
                    <div>
                        <TextField
                            onChanged={this.nameChanged.bind(this)}
                            label="Name"
                            required={true}
                            placeholder="Entity Name..."
                            value={this.state.entityNameVal} />
                        <Dropdown
                            label='Entity Type'
                            defaultSelectedKey='LOCAL'
                            options={options}
                            onChanged={this.typeChanged.bind(this)}
                            selectedKey={this.state.entityTypeVal}
                        />
                        <ChoiceGroup
                            options={[
                                {
                                    key: 'bucketableTrue',
                                    text: 'True'
                                },
                                {
                                    key: 'bucketableFalse',
                                    text: 'False',
                                }
                            ]}
                            label='Bucketable'
                            onChange={this.bucketableChanged.bind(this)}
                            selectedKey={this.state.bucketableKey}
                        />
                        <ChoiceGroup
                            defaultSelectedKey='negatableFalse'
                            options={[
                                {
                                    key: 'negatableTrue',
                                    text: 'True'
                                },
                                {
                                    key: 'negatableFalse',
                                    text: 'False',
                                }
                            ]}
                            label='Negatable'
                            onChange={this.negatableChanged.bind(this)}
                            selectedKey={this.state.negatableKey}
                        />
                    </div>
                    <div>
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
        entities: state.entities,
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(EntityCreator);