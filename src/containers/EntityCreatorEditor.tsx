import * as React from 'react';
import { createEntity } from '../actions/create';
import { editEntity } from '../actions/update';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown } from 'office-ui-fabric-react';
import { Entity, EntityMetadata } from '../models/Entity';
import { EntityTypes } from '../models/Constants';
import { State } from '../types'

interface Props {
    open: boolean,
    entity: Entity | null,
    handleClose: Function
}
class EntityCreatorEditor extends React.Component<any, any> {
    constructor(p: Props) {
        super(p);
        this.state = {
            entityNameVal: '',
            entityTypeVal: 'LOCAL',
            isBucketableVal: false,
            isNegatableVal: false,
            bucketableKey: 'bucketableFalse',
            negatableKey: 'negatableFalse',
            editing: false
        };
    }
    componentWillReceiveProps(p: Props) {
        if (p.entity === null) {
            this.setState({
                entityNameVal: '',
                entityTypeVal: 'LOCAL',
                isBucketableVal: false,
                isNegatableVal: false,
                bucketableKey: 'bucketableFalse',
                negatableKey: 'negatableFalse',
                editing: false
            })
        } else {
            let initBucketableKey: string;
            let initNegatableKey: string;
            if (p.entity.metadata.bucket == false) {
                initBucketableKey = 'bucketableFalse'
            } else {
                initBucketableKey = 'bucketableTrue'
            }
            if (p.entity.metadata.negative == false) {
                initNegatableKey = 'negatableFalse'
            } else {
                initNegatableKey = 'negatableTrue'
            }
            this.setState({
                entityNameVal: p.entity.name,
                entityTypeVal: p.entity.entityType,
                isBucketableVal: p.entity.metadata.bucket,
                isNegatableVal: p.entity.metadata.negative,
                bucketableKey: initBucketableKey,
                negatableKey: initNegatableKey,
                editing: true
            })
        }
    }
    generateGUID(): string {
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
        let entityToAdd = new Entity(randomGUID, this.state.entityTypeVal, null, this.state.entityNameVal, meta, this.props.blisApps.current.appId);
        if (this.state.editing === false) {
            this.props.createEntity(entityToAdd);
        } else {
            this.editEntity(entityToAdd);
        }
        this.setState({
            entityNameVal: '',
            entityTypeVal: 'LOCAL',
            isBucketableVal: false,
            isNegatableVal: false,
            bucketableKey: 'bucketableFalse',
            negatableKey: 'negatableFalse',
            editing: false
        })
        this.props.handleClose();
    }
    editEntity(ent: Entity) {
        let meta = new EntityMetadata(this.state.isBucketableVal, this.state.isNegatableVal, false, false);
        let entityToAdd = new Entity(this.props.entity.id, this.state.entityTypeVal, null, this.state.entityNameVal, meta, this.props.blisApps.current.appId);
        this.props.editEntity(entityToAdd);
    }
    nameChanged(text: string) {
        this.setState({
            entityNameVal: text
        })
    }
    typeChanged(obj: { text: string }) {
        this.setState({
            entityTypeVal: obj.text
        })
    }
    bucketableChanged(event: any, option: { text: string }) {
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
    negatableChanged(event: any, option: { text: string }) {
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
        let title: string;
        if(this.state.editing == true){
            title = "Edit Entity"
        } else {
            title = "Create an Entity"
        }
        return (
            <div>
                <Modal
                    isOpen={this.props.open}
                    isBlocking={false}
                    containerClassName='createModal'
                >
                    <div className='modalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>{title}</span>
                    </div>
                    <div>
                        <TextField
                            onChanged={this.nameChanged.bind(this)}
                            label="Name"
                            placeholder="Entity Name..."
                            value={this.state.entityNameVal} />
                        <Dropdown
                            label='Entity Type'
                            defaultSelectedKey={this.state.entityTypeVal}
                            options={options}
                            onChanged={this.typeChanged.bind(this)}
                            selectedKey={this.state.entityTypeVal}
                            disabled={this.state.editing}
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
                    <div className='modalFooter'>
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
                            onClick={() => this.props.handleClose()}
                            ariaDescription='Cancel'
                            text='Cancel'
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createEntity: createEntity,
        editEntity: editEntity
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        entities: state.entities,
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(EntityCreatorEditor);