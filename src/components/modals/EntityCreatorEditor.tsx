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
import { EntityBase, EntityMetaData, EntityType, ActionBase } from 'blis-models'
import './EntityCreatorEditor.css'

const initState: ComponentState = {
    entityNameVal: '',
    entityTypeVal: EntityType.LUIS,
    isBucketableVal: false,
    isNegatableVal: false,
    editing: false,
    title: ''
};

interface ComponentState {
    entityNameVal: string
    entityTypeVal: string
    isBucketableVal: boolean
    isNegatableVal: boolean
    editing: boolean
    title: string
}

const blisEntityTypes = [EntityType.LUIS, EntityType.LOCAL].map<OF.IDropdownOption>(value =>
    ({
        key: value,
        text: value
    }))

const staticEntityOptions: OF.IDropdownOption[] = [
    {
        key: 'BlisHeader',
        text: 'BLIS Entity Types',
        itemType: OF.DropdownMenuItemType.Header
    },
    ...blisEntityTypes,
    {
        key: 'divider',
        text: '-',
        itemType: OF.DropdownMenuItemType.Divider
    },
    {
        key: 'LuisHeader',
        text: 'LUIS Pre-Built Entity Types',
        itemType: OF.DropdownMenuItemType.Header
    }
]

class EntityCreatorEditor extends React.Component<Props, ComponentState> {
    entityOptions: OF.IDropdownOption[]
    state = initState

    componentWillReceiveProps(p: Props) {
        // Build entity options based on current applicaiton locale
        const currentAppLocale = this.props.blisApps.current.locale
        const localePreBuiltEntities = PreBuiltEntities
            .find(obj => obj.locale === currentAppLocale)

        const localePreBuildOptions = localePreBuiltEntities.preBuiltEntities
            .map<OF.IDropdownOption>(entityName =>
                ({
                    key: entityName,
                    text: entityName,
                    itemType: OF.DropdownMenuItemType.Normal
                }))

        this.entityOptions = [...staticEntityOptions, ...localePreBuildOptions]

        if (p.entity === null) {
            this.setState({
                ...initState,
                title: 'Create an Entity',
                entityTypeVal: this.props.entityTypeFilter ? this.props.entityTypeFilter : EntityType.LUIS
            });
        } else {
            this.setState({
                entityNameVal: p.entity.entityName,
                entityTypeVal: p.entity.entityType,
                isBucketableVal: p.entity.metadata.isBucket,
                isNegatableVal: p.entity.metadata.isReversable,
                editing: true,
                title: 'Edit Entity'
            })
        }
    }

    convertStateToEntity(state: ComponentState): EntityBase {
        return new EntityBase({
            entityName: this.state.entityNameVal,
            metadata: new EntityMetaData({
                isBucket: this.state.isBucketableVal,
                isReversable: this.state.isNegatableVal,
                negativeId: null,
                positiveId: null,
            }),
            entityType: this.state.entityTypeVal,
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
            // TODO: Currently it's not possible to edit an entity, and the code below is incorrect because it doesn't pass the app id.
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
    onChangedType = (obj: OF.IDropdownOption) => {
        this.setState({
            entityTypeVal: obj.text
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
            return "Required Value";
        }

        if (!/^[a-zA-Z0-9-]+$/.test(value)) {
            return "Entity name may only contain alphanumeric characters with no spaces.";
        }

        // Check that name isn't in use
        if (!this.state.editing) {
            let foundEntity = this.props.entities.find(e => e.entityName == this.state.entityNameVal);
            if (foundEntity) {
                return "Name is already in use.";
            }
        }

        return "";
    }

    onKeyDownName = (key: React.KeyboardEvent<HTMLInputElement>) => {
        // On enter attempt to create the entity as long as name is set
        if (key.key === 'Enter' && this.onGetNameErrorMessage(this.state.entityNameVal) === '') {
            this.onClickSubmit();
        }
    }

    getBlockedActions() : ActionBase[] {
        let blockedActions = this.props.actions.filter(a =>
            {
                return a.negativeEntities.find(id => id == this.props.entity.entityId) != null;
            });
        return blockedActions;
    }

    getRequiredActions() : ActionBase[] {
        let requiredActions = this.props.actions.filter(a =>
            {
                return a.requiredEntities.find(id => id == this.props.entity.entityId) != null;
            });
        return requiredActions;
    }

    renderEdit() {
        return (
            <div>
                <div>
                    <OF.TextField
                        onGetErrorMessage={this.onGetNameErrorMessage}
                        onChanged={this.onChangedName}
                        onKeyDown={this.onKeyDownName}
                        label="Entity Name"
                        placeholder="Name..."
                        required={true}
                        pattern="banana|cherry"
                        value={this.state.entityNameVal}
                        disabled={this.state.editing}
                    />
                    <OF.Dropdown
                        label='Entity Type'
                        options={this.entityOptions}
                        onChanged={this.onChangedType}
                        selectedKey={this.state.entityTypeVal}
                        disabled={this.state.editing || this.props.entityTypeFilter != null}
                    />
                    <div className="blis-entity-creator-checkbox">
                        <OF.Checkbox
                            label='Multi-valued'
                            defaultChecked={false}
                            onChange={this.onChangeBucketable}
                            disabled={this.state.editing}
                        />
                        <div className="ms-fontSize-s ms-fontColor-neutralSecondary">Entity may represent multiple values. &nbsp;
                            <OF.TooltipHost
                                tooltipProps={{
                                    onRenderContent: () => {
                                        return (
                                            <div>
                                                Multiple occurences of the entity within text add to a list of values. For non multi-value entites the last value replaces previous values.<br />
                                                <b>Example: Detect multiple toppings on a pizza</b>
                                                <dl className="blis-entity-example">
                                                    <dt>Entity:</dt><dd>toppings</dd>
                                                    <dt>Phrase:</dt><dd>I would like <i>cheese</i> and <i>pepperoni</i>.</dd>
                                                    <dt>Memory:</dt><dd>cheese, pepperoni</dd>
                                                </dl>
                                            </div>
                                        );
                                    }
                                }}
                                delay={OF.TooltipDelay.zero}
                                directionalHint={OF.DirectionalHint.bottomCenter}
                            ><span className="ms-fontColor-themeTertiary">More</span>
                            </OF.TooltipHost>
                        </div>
                    </div>
                    <div className="blis-entity-creator-checkbox">
                        <OF.Checkbox
                            label='Negatable'
                            defaultChecked={false}
                            onChange={this.onChangeReversible}
                            disabled={this.state.editing}
                        />
                        <div className="ms-fontSize-s ms-fontColor-neutralSecondary">Can remove or negate values in memory. &nbsp;
                            <OF.TooltipHost
                                tooltipProps={{
                                    onRenderContent: () => {
                                        return (
                                            <div>
                                                When checked this creates a corresponding 'negatable' entity that can be used scenarios where the user intends to remove previous memory values.<br />
                                                <b>Example: Changing existing pizza order</b>
                                                <dl className="blis-entity-example">
                                                    <dt>Entity:</dt><dd>toppings</dd>
                                                    <dt>Memory:</dt><dd>cheese, pepperoni</dd>
                                                    <dt>Phrase:</dt><dd>Actually, please add <i>sausage</i> instead of <i>pepperoni</i>.</dd>
                                                    <dt>Memory:</dt><dd>cheese, <del>pepperoni</del> sausage</dd>
                                                </dl>
                                            </div>
                                        );
                                    }
                                }}
                                delay={OF.TooltipDelay.zero}
                                directionalHint={OF.DirectionalHint.bottomCenter}
                            ><span className="ms-fontColor-themeTertiary">More</span>
                            </OF.TooltipHost>
                        </div>
                    </div>
                </div>
                <div className='blis-modal_buttonbox blis-modal_buttonbox--bottom'>
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary">
                            {!this.state.editing &&
                                <OF.PrimaryButton
                                    disabled={this.onGetNameErrorMessage(this.state.entityNameVal) != ''}
                                    onClick={this.onClickSubmit}
                                    ariaDescription='Create'
                                    text='Create'
                              
                                />
                            }
                            {!this.state.editing &&
                                <OF.DefaultButton
                                    onClick={this.onClickCancel}
                                    ariaDescription='Cancel'
                                    text='Cancel'
                                />
                            }
                            {this.state.editing &&
                                <OF.PrimaryButton
                                    onClick={this.onClickCancel}
                                    ariaDescription='Done'
                                    text='Done'
                                />
                            }
                            {this.state.editing && this.props.handleOpenDeleteModal &&
                                <OF.DefaultButton
                                    onClick={() => this.props.handleOpenDeleteModal(this.props.entity.entityId)}
                                    ariaDescription='Delete'
                                    text='Delete'
                                />}
                        </div>
                        <div className="blis-modal-button_secondary">
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
            {this.state.editing ? (
                <div>
                    <div className='blis-modal_title'>
                    <span className='ms-font-xxl ms-fontWeight-semilight'>{this.props.entity.entityName}</span>
                    </div>
                    <OF.Pivot linkSize={ OF.PivotLinkSize.large }>
                        <OF.PivotItem linkText='Edit Entity'>
                            {this.renderEdit()}
                        </OF.PivotItem>
                        <OF.PivotItem linkText='Required For Actions'>
                            <ActionDetailsList
                                actions={this.getRequiredActions()}
                                onSelectAction={null}
                            />
                            <div className='blis-modal_buttonbox blis-modal_buttonbox--bottom'>
                                <div className="blis-modal-buttons">
                                    <div className="blis-modal-buttons_primary">
                                        <OF.PrimaryButton
                                            onClick={this.onClickCancel}
                                            ariaDescription='Done'
                                            text='Done'
                                        />
                                    </div>
                                </div>
                            </div>
                        </OF.PivotItem>
                        <OF.PivotItem linkText='Blocked Actions'>
                            <ActionDetailsList
                                actions={this.getBlockedActions()}
                                onSelectAction={null}
                            />
                            <div className='blis-modal_buttonbox blis-modal_buttonbox--bottom'>
                                <div className="blis-modal-buttons">
                                    <div className="blis-modal-buttons_primary">
                                        <OF.PrimaryButton
                                            onClick={this.onClickCancel}
                                            ariaDescription='Done'
                                            text='Done'
                                    />
                                </div>
                            </div>
                        </div>
                        </OF.PivotItem>
                    </OF.Pivot>  
                </div>      
            ):(
                <div>
                    <div className='blis-modal_title'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>{this.state.title}</span>
                    </div>
                    {this.renderEdit()}
                </div>
            )}
            </Modal>
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