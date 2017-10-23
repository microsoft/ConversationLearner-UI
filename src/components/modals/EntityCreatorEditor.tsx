import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { createEntityAsync } from '../../actions/createActions';
import { editEntityAsync } from '../../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { PrimaryButton, DefaultButton, IDropdownOption, Dropdown, DropdownMenuItemType, Checkbox, TextField, TooltipHost, TooltipDelay, DirectionalHint } from 'office-ui-fabric-react';
import { State, PreBuiltEntities } from '../../types';
import { EntityBase, EntityMetaData, EntityType } from 'blis-models'
import './EntityCreatorEditor.css'

const initState: ComponentState = {
    entityNameVal: '',
    entityTypeVal: EntityType.LUIS,
    isBucketableVal: false,
    isNegatableVal: false,
    editing: false,
    title: '',
    submitButtonText: ''
};

interface ComponentState {
    entityNameVal: string
    entityTypeVal: string
    isBucketableVal: boolean
    isNegatableVal: boolean
    editing: boolean
    title: string
    submitButtonText: string
}

const blisEntityTypes = [EntityType.LUIS, EntityType.LOCAL].map<IDropdownOption>(value =>
    ({
        key: value,
        text: value
    }))

const staticEntityOptions: IDropdownOption[] = [
    {
        key: 'BlisHeader',
        text: 'BLIS Entity Types',
        itemType: DropdownMenuItemType.Header
    },
    ...blisEntityTypes,
    {
        key: 'divider',
        text: '-',
        itemType: DropdownMenuItemType.Divider
    },
    {
        key: 'LuisHeader',
        text: 'LUIS Pre-Built Entity Types',
        itemType: DropdownMenuItemType.Header
    }
]

class EntityCreatorEditor extends React.Component<Props, ComponentState> {
    entityOptions: IDropdownOption[]
    state = initState

    componentWillReceiveProps(p: Props) {
        // Build entity options based on current applicaiton locale
        const currentAppLocale = this.props.blisApps.current.locale
        const localePreBuiltEntities = PreBuiltEntities
            .find(obj => obj.locale === currentAppLocale)

        const localePreBuildOptions = localePreBuiltEntities.preBuiltEntities
            .map<IDropdownOption>(entityName =>
                ({
                    key: entityName,
                    text: entityName,
                    itemType: DropdownMenuItemType.Normal
                }))

        this.entityOptions = [...staticEntityOptions, ...localePreBuildOptions]

        if (p.entity === null) {
            this.setState({
                ...initState,
                title: 'Create an Entity',
                submitButtonText: 'Create'
            });
        } else {
            this.setState({
                entityNameVal: p.entity.entityName,
                entityTypeVal: p.entity.entityType,
                isBucketableVal: p.entity.metadata.isBucket,
                isNegatableVal: p.entity.metadata.isReversable,
                editing: true,
                title: 'Edit Entity',
                submitButtonText: 'Save'
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
    onChangedType = (obj: IDropdownOption) => {
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
        let foundEntity = this.props.entities.find(e => e.entityName == this.state.entityNameVal);
        if (foundEntity) {
            return "Name is already in use.";
        }

        return "";
    }

    onKeyDownName = (key: React.KeyboardEvent<HTMLInputElement>) => {
        // On enter attempt to create the entity as long as name is set
        if (key.key === 'Enter' && this.onGetNameErrorMessage(this.state.entityNameVal) === '') {
            this.onClickSubmit();
        }
    }

    render() {
        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={false}
                containerClassName='blis-modal blis-modal--small blis-modal--border'
            >
                <div className='blis-modal_title'>
                    <span className='ms-font-xxl ms-fontWeight-semilight'>{this.state.title}</span>
                </div>
                <div>
                    <TextField
                        onGetErrorMessage={this.onGetNameErrorMessage}
                        onChanged={this.onChangedName}
                        onKeyDown={this.onKeyDownName}
                        label="Entity Name"
                        placeholder="Name..."
                        required={true}
                        pattern="banana|cherry"
                        value={this.state.entityNameVal}
                    />
                    <Dropdown
                        label='Entity Type'
                        options={this.entityOptions}
                        onChanged={this.onChangedType}
                        selectedKey={this.state.entityTypeVal}
                        disabled={this.state.editing}
                    />
                    <div className="blis-entity-creator-checkbox">
                        <Checkbox
                            label='Multi-valued'
                            defaultChecked={false}
                            onChange={this.onChangeBucketable}
                        />
                        <div className="ms-fontSize-s ms-fontColor-neutralSecondary">Entity may represent multiple values. &nbsp;
                            <TooltipHost
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
                                delay={TooltipDelay.zero}
                                directionalHint={DirectionalHint.bottomCenter}
                            ><span className="ms-fontColor-themeTertiary">More</span>
                            </TooltipHost>
                        </div>
                    </div>
                    <div className="blis-entity-creator-checkbox">
                        <Checkbox
                            label='Negatable'
                            defaultChecked={false}
                            onChange={this.onChangeReversible}
                        />
                        <div className="ms-fontSize-s ms-fontColor-neutralSecondary">Can remove or negate values in memory. &nbsp;
                            <TooltipHost
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
                                delay={TooltipDelay.zero}
                                directionalHint={DirectionalHint.bottomCenter}
                            ><span className="ms-fontColor-themeTertiary">More</span>
                            </TooltipHost>
                        </div>
                    </div>
                </div>
                <div className='blis-modal_buttonbox'>
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary">
                            <PrimaryButton
                                disabled={this.onGetNameErrorMessage(this.state.entityNameVal) != ''
                            }
                                onClick={this.onClickSubmit}
                                ariaDescription='Create'
                                text={this.state.submitButtonText}
                            />
                            <DefaultButton
                                onClick={this.onClickCancel}
                                ariaDescription='Cancel'
                                text='Cancel'
                            />
                        </div>
                        <div className="blis-modal-button_secondary">
                        </div>
                    </div>
                </div>
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