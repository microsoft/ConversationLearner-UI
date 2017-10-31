import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { createEntityAsync } from '../../actions/createActions';
import { editEntityAsync } from '../../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react';
import ActionDetailsList from '../ActionDetailsList'
import { State, PreBuiltEntities } from '../../types';
import { BlisDropdownOption } from './BlisDropDownOption'
import { GetTip, TipType } from '../ToolTips'
import { EntityBase, EntityMetaData, EntityType, ActionBase } from 'blis-models'
import './EntityCreatorEditor.css'

const NEW_ENTITY = 'New Entity';

const initState: ComponentState = {
    entityNameVal: '',
    entityTypeVal: NEW_ENTITY,
    isBucketableVal: false,
    isNegatableVal: false,
    isProgrammaticVal: false,
    editing: false,
    title: ''
};

interface ComponentState {
    entityNameVal: string;
    entityTypeVal: string;
    isBucketableVal: boolean;
    isNegatableVal: boolean;
    isProgrammaticVal: boolean;
    editing: boolean;
    title: string;
}

const staticEntityOptions: BlisDropdownOption[] = [
    {
        key: NEW_ENTITY,
        text: 'New Type',
        itemType: OF.DropdownMenuItemType.Normal,
        style: 'blisDropdown--command'
    },
    {
        key: 'divider',
        text: '-',
        itemType: OF.DropdownMenuItemType.Divider,
        style: 'blisDropdown--normal'
    }
]

class EntityCreatorEditor extends React.Component<Props, ComponentState> {
    entityOptions: BlisDropdownOption[]
    state = initState

    componentWillReceiveProps(p: Props) {
        // Build entity options based on current applicaiton locale
        const currentAppLocale = this.props.blisApps.current.locale
        const localePreBuiltEntities = PreBuiltEntities
            .find(obj => obj.locale === currentAppLocale)

        // Filter out one that have already been used
        const unusedPreBuilts = localePreBuiltEntities.preBuiltEntities
            .filter(bp => {
                return !this.props.entities.find(e => e.entityType === bp);
            })

        const localePreBuildOptions = unusedPreBuilts
            .map<BlisDropdownOption>(entityName =>
                ({
                    key: entityName,
                    text: entityName,
                    itemType: OF.DropdownMenuItemType.Normal,
                    style: 'blisDropdown--normal'
                }))

        this.entityOptions = [...staticEntityOptions, ...localePreBuildOptions]

        if (p.entity === null) {
            this.setState({
                ...initState,
                title: 'Create an Entity',
                entityTypeVal: this.props.entityTypeFilter ? this.props.entityTypeFilter : NEW_ENTITY
            });
        } else {
            let entityType = p.entity.entityType;
            let isProgrammatic = false;
            if (entityType === EntityType.LUIS) {
                entityType = NEW_ENTITY;
            } else if (entityType === EntityType.LOCAL) {
                entityType = NEW_ENTITY;
                isProgrammatic = true;
            }
            this.setState({
                entityNameVal: p.entity.entityName,
                entityTypeVal: entityType,
                isBucketableVal: p.entity.metadata.isBucket,
                isNegatableVal: p.entity.metadata.isReversable,
                isProgrammaticVal: isProgrammatic,
                editing: true,
                title: 'Edit Entity'
            })
        }
    }

    convertStateToEntity(state: ComponentState): EntityBase {
        let entityType = this.state.entityTypeVal;
        if (entityType === NEW_ENTITY) {
            entityType = (this.state.isProgrammaticVal) ? EntityType.LOCAL : EntityType.LUIS;
        }
        return new EntityBase({
            entityName: this.state.entityNameVal,
            metadata: new EntityMetaData({
                isBucket: this.state.isBucketableVal,
                isReversable: this.state.isNegatableVal,
                negativeId: null,
                positiveId: null,
            }),
            entityType: entityType,
            version: null,
            packageCreationId: null,
            packageDeletionId: null
        })
    }

    onClickSubmit = () => {
        const entity = this.convertStateToEntity(this.state)
        let currentAppId = this.props.blisApps.current.appId;

        if (this.state.editing === false) {
            this.props.createEntityAsync(this.props.userKey, entity, currentAppId);
        } else {
            // TODO: Currently it's not possible to edit an entity, 
            // and the code below is incorrect because it doesn't pass the app id.
            // Set entity id if we're editing existing id.
            // entity.entityId = this.props.entity.entityId;
            // this.props.editEntityAsync(this.props.userKey, entity);
        }

        this.props.handleClose()
    }

    onClickCancel = () => {
        this.props.handleClose()
    }

    onChangedName = (text: string) => {
        this.setState({
            entityNameVal: text
        })
    }
    onChangedType = (obj: BlisDropdownOption) => {
        this.setState({
            entityTypeVal: obj.text
        })
    }
    onChangeProgrammatic = () => {
        this.setState({
            isProgrammaticVal: !this.state.isProgrammaticVal,
        })
    }
    onChangeBucketable = () => {
        this.setState({
            isBucketableVal: !this.state.isBucketableVal,
        })
    }
    onChangeReversible = () => {
        this.setState({
            isNegatableVal: !this.state.isNegatableVal,
        })
    }

    onGetNameErrorMessage = (value: string): string => {
        if (value.length === 0) {
            return 'Required Value';
        }

        if (!/^[a-zA-Z0-9-]+$/.test(value)) {
            return 'Entity name may only contain alphanumeric characters with no spaces.';
        }

        // Check that name isn't in use
        if (!this.state.editing) {
            let foundEntity = this.props.entities.find(e => e.entityName === this.state.entityNameVal);
            if (foundEntity) {
                return 'Name is already in use.';
            }
        }

        return '';
    }

    onKeyDownName = (key: React.KeyboardEvent<HTMLInputElement>) => {
        // On enter attempt to create the entity as long as name is set
        if (key.key === 'Enter' && this.onGetNameErrorMessage(this.state.entityNameVal) === '') {
            this.onClickSubmit();
        }
    }

    getBlockedActions(): ActionBase[] {
        let blockedActions = this.props.actions.filter(a => {
            return a.negativeEntities.find(id => id === this.props.entity.entityId) != null;
        });
        return blockedActions;
    }

    getRequiredActions(): ActionBase[] {
        let requiredActions = this.props.actions.filter(a => {
            return a.requiredEntities.find(id => id === this.props.entity.entityId) != null;
        });
        return requiredActions;
    }

    onRenderOption = (option: BlisDropdownOption): JSX.Element => {
        return (
            <div className="dropdownExample-option">
                <span className={option.style}>{option.text}</span>
            </div>
        );
    }

    renderEdit() {
        return (
            <div>
                <OF.TextField
                    onGetErrorMessage={this.onGetNameErrorMessage}
                    onChanged={this.onChangedName}
                    onKeyDown={this.onKeyDownName}
                    label="Entity Name"
                    placeholder="Name..."
                    required={true}
                    value={this.state.entityNameVal}
                    disabled={this.state.editing}
                />
                <OF.Dropdown
                    label="Entity Type"
                    options={this.entityOptions}
                    onChanged={this.onChangedType}
                    onRenderOption={(option) => this.onRenderOption(option as BlisDropdownOption)}
                    selectedKey={this.state.entityTypeVal}
                    disabled={this.state.editing || this.props.entityTypeFilter != null}
                />
                <div className="blis-entity-creator-checkbox">
                    <OF.Checkbox
                        label="Programmatic Only"
                        defaultChecked={this.state.isProgrammaticVal}
                        onChange={this.onChangeProgrammatic}
                        disabled={this.state.editing || this.state.entityTypeVal !== NEW_ENTITY}
                    />
                    <div className="ms-fontSize-s ms-fontColor-neutralSecondary">Entity only set by code. &nbsp;
                            <OF.TooltipHost
                                tooltipProps={{
                                    onRenderContent: () => {return GetTip(TipType.ENTITY_PROGAMMATIC)}
                                }}
                                delay={OF.TooltipDelay.zero}
                                directionalHint={OF.DirectionalHint.bottomCenter}
                            ><span className="ms-fontColor-themeTertiary">More</span>
                            </OF.TooltipHost>
                </div>
                <div className="blis-entity-creator-checkbox">
                    <OF.Checkbox
                        label="Multi-valued"
                        defaultChecked={this.state.isBucketableVal}
                        onChange={this.onChangeBucketable}
                        disabled={this.state.editing}
                    />
                    <div className="ms-fontSize-s ms-fontColor-neutralSecondary">Entity may hold multiple values. &nbsp;
                            <OF.TooltipHost
                                tooltipProps={{
                                    onRenderContent: () => {return GetTip(TipType.ENTITY_MULTIVALUE)}
                                }}
                                delay={OF.TooltipDelay.zero}
                                directionalHint={OF.DirectionalHint.bottomCenter}
                            ><span className="ms-fontColor-themeTertiary">More</span>
                            </OF.TooltipHost>
                        </div>
                    </div>
                    <div className="blis-entity-creator-checkbox">
                        <OF.Checkbox
                            label="Negatable"
                            defaultChecked={this.state.isNegatableVal}
                            onChange={this.onChangeReversible}
                            disabled={this.state.editing}
                        />
                        <div className="ms-fontSize-s ms-fontColor-neutralSecondary">Can remove or delete values in memory. &nbsp;
                            <OF.TooltipHost
                                tooltipProps={{
                                    onRenderContent: () => {return GetTip(TipType.ENTITY_NEGATABLE)}
                                }}
                                delay={OF.TooltipDelay.zero}
                                directionalHint={OF.DirectionalHint.bottomCenter}
                            ><span className="ms-fontColor-themeTertiary">More</span>
                            </OF.TooltipHost>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    render() {
        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={false}
                containerClassName='blis-modal blis-modal--medium blis-modal--border'
            >
                <div className='blis-modal_header'>
                    <span className='ms-font-xxl ms-fontWeight-semilight'>{this.state.editing ? this.props.entity.entityName : this.state.title}</span>
                </div>
                <div className='blis-modal_body'>
                    {this.state.editing
                        ? (
                            <div>
                                <OF.Pivot linkSize={OF.PivotLinkSize.large}>
                                    <OF.PivotItem linkText='Edit Entity'>
                                        {this.renderEdit()}
                                    </OF.PivotItem>
                                    <OF.PivotItem linkText='Required For Actions'>
                                        <ActionDetailsList
                                            actions={this.getRequiredActions()}
                                            onSelectAction={null}
                                        />
                                    </OF.PivotItem>
                                    <OF.PivotItem linkText='Blocked Actions'>
                                        <ActionDetailsList
                                            actions={this.getBlockedActions()}
                                            onSelectAction={null}
                                        />
                                    </OF.PivotItem>
                                </OF.Pivot>
                            </div>
                        ) : (
                            this.renderEdit()
                        )}
                </div>
                <div className="blis-modal_footer">
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary">
                            {!this.state.editing &&
                                <OF.PrimaryButton
                                    disabled={this.onGetNameErrorMessage(this.state.entityNameVal) != ''}
                                    onClick={this.onClickSubmit}
                                    ariaDescription="Create"
                                    text="Create"
                                />
                            }
                            {!this.state.editing &&
                                <OF.DefaultButton
                                    onClick={this.onClickCancel}
                                    ariaDescription="Cancel"
                                    text="Cancel"
                                />
                            }
                            {this.state.editing &&
                                <OF.PrimaryButton
                                    onClick={this.onClickCancel}
                                    ariaDescription="Done"
                                    text="Done"
                                />
                            }
                            {this.state.editing && this.props.handleOpenDeleteModal &&
                                <OF.DefaultButton
                                    onClick={() => this.props.handleOpenDeleteModal(this.props.entity.entityId)}
                                    ariaDescription="Delete"
                                    text="Delete"
                                />}
                        </div>
                        <div className="blis-modal-button_secondary" />
                    </div>
                </div>
            </Modal>
        )
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
        actions: state.actions,
        blisApps: state.apps
    }
}

export interface ReceivedProps {
    open: boolean,
    entity: EntityBase | null,
    handleClose: Function,
    entityTypeFilter: EntityType | null,
    handleOpenDeleteModal: (entityId: string) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(EntityCreatorEditor);