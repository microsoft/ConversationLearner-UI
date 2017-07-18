import * as React from 'react';
import { createEntity, createReversibleEntity } from '../actions/createActions';
import { editEntity } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown, DropdownMenuItemType, Checkbox } from 'office-ui-fabric-react';
import { State, PreBuiltEntities, PreBuilts, LocalePreBuilts } from '../types';
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
            this.setState({
                entityNameVal: p.entity.entityName,
                entityTypeVal: p.entity.entityType,
                isBucketableVal: p.entity.metadata.isBucket,
                isNegatableVal: p.entity.metadata.isReversable,
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
        let currentAppId: string = this.props.blisApps.current.appId;
        let randomGUID = this.generateGUID();
        let meta = new EntityMetaData({
            isBucket: this.state.isBucketableVal,
            isReversable: this.state.isNegatableVal,
            negativeId: null,
            positiveId: null,
        })
        let entityToAdd = new EntityBase({
            entityId: randomGUID,
            entityName: this.state.entityNameVal,
            metadata: meta,
            entityType: this.state.entityTypeVal,
            version: null,
            packageCreationId: null,
            packageDeletionId: null
        })
        if (this.state.editing === false) {
            if (meta.isReversable === true) {
                this.props.createReversibleEntity(this.props.userKey, entityToAdd, currentAppId);
            } else {
                this.props.createEntity(this.props.userKey, entityToAdd, currentAppId);
            }
        } else {
            this.editEntity(entityToAdd);
        }
        console.log(entityToAdd)
        this.setState({
            entityNameVal: '',
            entityTypeVal: 'LOCAL',
            isBucketableVal: false,
            isNegatableVal: false,
            editing: false
        })
        this.props.handleClose();
    }
    editEntity(ent: EntityBase) {
        ent.entityId = this.props.entity.entityId;
        this.props.editEntity(this.props.userKey, ent);
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
    handleCheckBucketable() {
        this.setState({
            isBucketableVal: !this.state.isBucketableVal,
        })
    }
    handleCheckReversible() {
        this.setState({
            isNegatableVal: !this.state.isNegatableVal,
        })
    }
    render() {
        let vals: string[] = ["LOCAL", "LUIS"]
        let options: {}[] = vals.map(v => {
            return {
                key: v,
                text: v
            }
        })
        options.unshift({ key: 'BlisHeader', text: 'BLIS Entity Types', itemType: DropdownMenuItemType.Header })
        options.push({ key: 'divider', text: '-', itemType: DropdownMenuItemType.Divider })
        options.push({ key: 'LuisHeader', text: 'LUIS Pre-Built Entity Types', itemType: DropdownMenuItemType.Header })

        let localePreBuilts: LocalePreBuilts = PreBuiltEntities.find((obj: LocalePreBuilts) => obj.locale == this.props.blisApps.current.locale)
        let prebuiltVals: string[] = localePreBuilts.preBuiltEntities.map((entityName: string) => {
            return entityName
        })
        prebuiltVals.map((entityName: string) => {
            options.push({
                key: entityName,
                text: entityName
            })
        })
        let title: string;
        let createButtonText: string;
        if (this.state.editing == true) {
            title = "Edit Entity"
            createButtonText = "Save"
        } else {
            title = "Create an Entity"
            createButtonText = "Create"
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
                            label="Entity Name"
                            placeholder="Name..."
                            value={this.state.entityNameVal} />
                        <Dropdown
                            label='Entity Type'
                            options={options}
                            onChanged={this.typeChanged.bind(this)}
                            selectedKey={this.state.entityTypeVal}
                            disabled={this.state.editing}
                        />
                        <Checkbox
                            label='Bucketable'
                            defaultChecked={false}
                            onChange={this.handleCheckBucketable.bind(this)}
                            style={{ marginTop: "1em", marginRight: "3em", display: "inline-block" }}
                        />
                        <Checkbox
                            label='Reversible'
                            defaultChecked={false}
                            onChange={this.handleCheckReversible.bind(this)}
                            style={{ marginTop: "1em", display: "inline-block" }}
                        />
                    </div>
                    <div className='modalFooter'>
                        <CommandButton
                            data-automation-id='randomID2'
                            disabled={false}
                            onClick={this.createEntity.bind(this)}
                            className='goldButton'
                            ariaDescription='Create'
                            text={createButtonText}
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
        editEntity: editEntity,
        createReversibleEntity: createReversibleEntity
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        userKey: state.user.key,
        entities: state.entities,
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(EntityCreatorEditor as React.ComponentClass<any>);