import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { createEntityAsync } from '../actions/createActions';
import { editEntityAsync } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dropdown, DropdownMenuItemType, Checkbox } from 'office-ui-fabric-react';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
import { State, PreBuiltEntities, LocalePreBuilts } from '../types';
import { EntityBase, EntityMetaData } from 'blis-models'

const initState = {
    entityNameVal: '',
    entityTypeVal: 'LUIS',
    isBucketableVal: false,
    isNegatableVal: false,
    editing: false
};

class EntityCreatorEditor extends React.Component<Props, any> {
    constructor(p: Props) {
        super(p);
        this.state = initState;
    }
    componentWillReceiveProps(p: Props) {
        if (p.entity === null) {
            this.setState({ ...initState });
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
    nameKeyDown(key: KeyboardEvent) {
        // On enter attempt to create the entity as long as name is set
        if (key.keyCode == 13 && this.state.entityNameVal) {
            this.createEntity();
        }
    }
    createEntity() {
        let currentAppId: string = this.props.blisApps.current.appId;
        let meta = new EntityMetaData({
            isBucket: this.state.isBucketableVal,
            isReversable: this.state.isNegatableVal,
            negativeId: null,
            positiveId: null,
        })
        let entityToAdd = new EntityBase({
            entityName: this.state.entityNameVal,
            metadata: meta,
            entityType: this.state.entityTypeVal,
            version: null,
            packageCreationId: null,
            packageDeletionId: null
        })
        if (this.state.editing === false) {
            this.props.createEntityAsync(this.props.userKey, entityToAdd, currentAppId);
        } else {
            this.editEntity(entityToAdd);
        }
        this.setState({ ...initState });
        this.props.handleClose();
    }
    editEntity(ent: EntityBase) {
        ent.entityId = this.props.entity.entityId;
        this.props.editEntityAsync(this.props.userKey, ent);
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
    checkIfBlank(value: string): string {
        return value ? "" : "Required Value";
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
                        <TextFieldPlaceholder
                            onGetErrorMessage={this.checkIfBlank.bind(this)}
                            onChanged={this.nameChanged.bind(this)}
                            onKeyDown={this.nameKeyDown.bind(this)}
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
                            disabled={!this.state.entityNameVal}
                            onClick={this.createEntity.bind(this)}
                            className='blis-button--gold'
                            ariaDescription='Create'
                            text={createButtonText}
                        />
                        <CommandButton
                            data-automation-id='randomID3'
                            className="blis-button--gray"
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
        createEntityAsync,
        editEntityAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        userKey: state.user.key,
        entities: state.entities,
        blisApps: state.apps
    }
}

interface ReceivedProps {
    open: boolean,
    entity: EntityBase | null,
    handleClose: Function
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect(mapStateToProps, mapDispatchToProps)(EntityCreatorEditor as React.ComponentClass<any>);