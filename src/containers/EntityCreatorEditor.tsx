import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { createEntityAsync } from '../actions/createActions';
import { editEntityAsync } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, IDropdownOption, Dropdown, DropdownMenuItemType, Checkbox } from 'office-ui-fabric-react';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
import { State, PreBuiltEntities } from '../types';
import { EntityBase, EntityMetaData, EntityType } from 'blis-models'

const initState: ComponentState = {
    entityNameVal: '',
    entityTypeVal: EntityType.LUIS,
    isBucketableVal: false,
    isNegatableVal: false,
    editing: false
};

interface ComponentState {
    entityNameVal: string
    entityTypeVal: string,
    isBucketableVal: boolean
    isNegatableVal: boolean
    editing: boolean
}

class EntityCreatorEditor extends React.Component<Props, ComponentState> {
    state = initState

    constructor(p: Props) {
        super(p)

        this.checkIfBlank = this.checkIfBlank.bind(this)
        this.createEntity = this.createEntity.bind(this)
        this.nameChanged = this.nameChanged.bind(this)
        this.nameKeyDown = this.nameKeyDown.bind(this)
        this.typeChanged = this.typeChanged.bind(this)
        this.handleCheckBucketable = this.handleCheckBucketable.bind(this)
        this.handleCheckReversible = this.handleCheckReversible.bind(this)
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
    nameKeyDown(key: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
        // On enter attempt to create the entity as long as name is set
        if (key.keyCode == 13 && this.state.entityNameVal) {
            this.createEntity();
        }
    }
    createEntity() {
        let currentAppId = this.props.blisApps.current.appId;
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
    typeChanged(obj: IDropdownOption) {
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
        let options = [EntityType.LOCAL, EntityType.LUIS].map<IDropdownOption>(v =>
            ({
                key: v,
                text: v
            }))

        options.unshift({ key: 'BlisHeader', text: 'BLIS Entity Types', itemType: DropdownMenuItemType.Header })
        options.push({ key: 'divider', text: '-', itemType: DropdownMenuItemType.Divider })
        options.push({ key: 'LuisHeader', text: 'LUIS Pre-Built Entity Types', itemType: DropdownMenuItemType.Header })

        let localePreBuilts = PreBuiltEntities.find(obj => obj.locale === this.props.blisApps.current.locale)
        localePreBuilts.preBuiltEntities.forEach(entityName => {
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
                    containerClassName='blis-modal blis-modal--small blis-modal--border'
                >
                    <div className='blis-modal_header'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>{title}</span>
                    </div>
                    <div>
                        <TextFieldPlaceholder
                            onGetErrorMessage={this.checkIfBlank}
                            onChanged={this.nameChanged}
                            onKeyDown={this.nameKeyDown}
                            label="Entity Name"
                            placeholder="Name..."
                            value={this.state.entityNameVal} />
                        <Dropdown
                            label='Entity Type'
                            options={options}
                            onChanged={this.typeChanged}
                            selectedKey={this.state.entityTypeVal}
                            disabled={this.state.editing}
                        />
                        <Checkbox
                            label='Bucketable'
                            defaultChecked={false}
                            onChange={this.handleCheckBucketable}
                            style={{ marginTop: "1em", marginRight: "3em", display: "inline-block" }}
                        />
                        <Checkbox
                            label='Reversible'
                            defaultChecked={false}
                            onChange={this.handleCheckReversible}
                            style={{ marginTop: "1em", display: "inline-block" }}
                        />
                    </div>
                    <div className='blis-modal_footer'>
                        <CommandButton
                            disabled={!this.state.entityNameVal}
                            onClick={this.createEntity}
                            className='blis-button--gold'
                            ariaDescription='Create'
                            text={createButtonText}
                        />
                        <CommandButton
                            className="blis-button--gray"
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

export interface ReceivedProps {
    open: boolean,
    entity: EntityBase | null,
    handleClose: Function
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(EntityCreatorEditor);