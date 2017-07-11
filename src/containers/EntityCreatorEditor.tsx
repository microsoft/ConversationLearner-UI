import * as React from 'react';
import { createEntity } from '../actions/createActions';
import { editEntity } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown } from 'office-ui-fabric-react';
import { State } from '../types';
import { EntityBase, EntityMetaData } from 'blis-models'

interface Props {
    open: boolean,
    entity: EntityBase | null,
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
        this.bucketableChanged = this.bucketableChanged.bind(this)
        this.negatableChanged = this.negatableChanged.bind(this)
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
            if (p.entity.metadata.isBucket == false) {
                initBucketableKey = 'bucketableFalse'
            } else {
                initBucketableKey = 'bucketableTrue'
            }
            if (p.entity.metadata.isReversable == false) {
                initNegatableKey = 'negatableFalse'
            } else {
                initNegatableKey = 'negatableTrue'
            }
            this.setState({
                entityNameVal: p.entity.entityName,
                entityTypeVal: p.entity.entityType,
                isBucketableVal: p.entity.metadata.isBucket,
                isNegatableVal: p.entity.metadata.isReversable,
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
        let meta2 = new EntityMetaData({
            isBucket: this.state.isBucketableVal,
            isReversable: this.state.isNegatableVal,
            negativeId: null,
            positiveId: null,
        })
        let entityToAdd = new EntityBase({
            entityId: randomGUID,
            entityName: this.state.entityNameVal,
            metadata: meta2,
            entityType: this.state.entityTypeVal,
            version: null,
            packageCreationId: null,
            packageDeletionId: null
        })
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
    editEntity(ent: EntityBase) {
        ent.entityId = this.props.entity.entityId;
        this.props.editEntity(ent);
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
        let vals: string[] = ["LOCAL", "LUIS"]
        let options = vals.map(v => {
            return {
                key: v,
                text: v
            }
        })
        let title: string;
        if (this.state.editing == true) {
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
                            onChange={this.bucketableChanged}
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
                            onChange={this.negatableChanged}
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