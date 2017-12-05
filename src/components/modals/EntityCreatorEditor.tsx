import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { fetchApplicationTrainingStatusThunkAsync } from '../../actions/fetchActions'
import { createEntityAsync } from '../../actions/createActions';
import { editEntityAsync } from '../../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react';
import * as TC from '../tipComponents/Components'
import ActionDetailsList from '../ActionDetailsList'
import { State, PreBuiltEntities } from '../../types';
import { BlisDropdownOption } from './BlisDropDownOption'
import * as ToolTip from '../ToolTips'
import { BlisAppBase, EntityBase, EntityMetaData, EntityType, ActionBase } from 'blis-models'
import './EntityCreatorEditor.css'
import { FM } from '../../react-intl-messages'
import { defineMessages, injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'

const messages = defineMessages({
    fieldErrorRequired: {
        id: FM.ENTITYCREATOREDITOR_FIELDERROR_REQUIREDVALUE,
        defaultMessage: 'Required Value'
    },
    fieldErrorAlphanumeric: {
        id: FM.ENTITYCREATOREDITOR_FIELDERROR_ALPHANUMERIC,
        defaultMessage: 'Entity name may only contain alphanumeric characters with no spaces.'
    },
    fieldErrorDistinct: {
        id: FM.ENTITYCREATOREDITOR_FIELDERROR_DISTINCT,
        defaultMessage: 'Name is already in use.'
    }
})

const initState: ComponentState = {
    entityNameVal: '',
    entityTypeVal: '',
    isPrebuilt: false,
    isBucketableVal: false,
    isNegatableVal: false,
    isProgrammaticVal: false,
    editing: false,
    title: ''
};

interface ComponentState {
    entityNameVal: string
    entityTypeVal: string
    isPrebuilt: boolean
    isBucketableVal: boolean
    isNegatableVal: boolean
    isProgrammaticVal: boolean
    editing: boolean
    title: string
}

class EntityCreatorEditor extends React.Component<Props, ComponentState> {
    staticEntityOptions: BlisDropdownOption[]
    entityOptions: BlisDropdownOption[]

    constructor(props: Props) {
        super(props)
        this.state = { ...initState, entityTypeVal: this.NEW_ENTITY }
        this.staticEntityOptions = this.getStaticEntityOptions(this.props.intl)
    }

    get NEW_ENTITY(): string {
        return this.props.intl.formatMessage({
            id: FM.ENTITYCREATOREDITOR_ENTITYOPTION_NEW,
            defaultMessage: 'New Entity Type'
        });
    }

    getStaticEntityOptions(intl: InjectedIntl): BlisDropdownOption[] {
        return [
            {
                key: this.NEW_ENTITY,
                text: this.NEW_ENTITY,
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
    }

    componentWillReceiveProps(nextProps: Props) {
        // Build entity options based on current application locale
        const currentAppLocale = this.props.app.locale
        const localePreBuiltOptions = PreBuiltEntities
            .find(entitiesList => entitiesList.locale === currentAppLocale).preBuiltEntities
            .map<BlisDropdownOption>(entityName =>
                ({
                    key: entityName,
                    text: entityName,
                    itemType: OF.DropdownMenuItemType.Normal,
                    style: 'blisDropdown--normal'
                }))

        if (nextProps.entity === null) {
            // Filter out one that have already been used so user can't create two of same type.
            const filteredPrebuilts = localePreBuiltOptions
                .filter(entityOption => !this.props.entities.some(e => e.entityType === entityOption.key))

            this.entityOptions = [...this.staticEntityOptions, ...filteredPrebuilts]

            this.setState({
                ...initState,
                title: nextProps.intl.formatMessage({
                    id: FM.ENTITYCREATOREDITOR_TITLE_CREATE,
                    defaultMessage: 'Create an Entity'
                }),
                entityTypeVal: this.props.entityTypeFilter ? this.props.entityTypeFilter : this.NEW_ENTITY
            });
        } else {
            this.entityOptions = [...this.staticEntityOptions, ...localePreBuiltOptions]
            let entityType = nextProps.entity.entityType;
            let isProgrammatic = false;
            let isPrebuilt = true;
            if (entityType === EntityType.LUIS) {
                entityType = this.NEW_ENTITY;
                isPrebuilt = false;
            } else if (entityType === EntityType.LOCAL) {
                entityType = this.NEW_ENTITY;
                isProgrammatic = true;
                isPrebuilt = false;
            }
            this.setState({
                entityNameVal: nextProps.entity.entityName,
                entityTypeVal: entityType,
                isPrebuilt: isPrebuilt,
                isBucketableVal: nextProps.entity.metadata.isBucket,
                isNegatableVal: nextProps.entity.metadata.isReversable,
                isProgrammaticVal: isProgrammatic,
                editing: true,
                title: nextProps.intl.formatMessage({
                    id: FM.ENTITYCREATOREDITOR_TITLE_EDIT,
                    defaultMessage: 'Edit Entity'
                })
            })
        }
    }

    convertStateToEntity(state: ComponentState): EntityBase {
        let entityName = this.state.entityNameVal
        let entityType = this.state.entityTypeVal
        if (this.state.isPrebuilt) {
            entityName = this.getPrebuiltEntityName(entityType)
        }
        else {
            entityType = this.state.isProgrammaticVal ? EntityType.LOCAL : EntityType.LUIS
        }

        return new EntityBase({
            entityName,
            metadata: new EntityMetaData({
                isBucket: this.state.isBucketableVal,
                isReversable: this.state.isNegatableVal,
                negativeId: null,
                positiveId: null,
            }),
            entityType,
            version: null,
            packageCreationId: null,
            packageDeletionId: null
        })
    }

    onClickSubmit = () => {
        const entity = this.convertStateToEntity(this.state)
        const appId = this.props.app.appId

        if (this.state.editing === false) {
            this.props.createEntityAsync(this.props.userKey, entity, appId)
        } else {
            // Set entity id if we're editing existing id.
            entity.entityId = this.props.entity.entityId

            // TODO: Currently it's not possible to edit an entity, 
            // and the code below is incorrect because it doesn't pass the app id.
            // this.props.editEntityAsync(this.props.userKey, entity)
        }

        this.props.fetchApplicationTrainingStatusThunkAsync(appId)
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
        const isPrebuilt = obj.text !== this.NEW_ENTITY
        const isNegatableVal = isPrebuilt ? false : this.state.isNegatableVal
        const isProgrammaticVal = isPrebuilt ? false : this.state.isProgrammaticVal
        const isBucketableVal = isPrebuilt ? true : this.state.isBucketableVal

        this.setState({
            isPrebuilt,
            isBucketableVal,
            isNegatableVal,
            isProgrammaticVal,
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
        const { intl } = this.props

        if (value.length === 0) {
            return intl.formatMessage(messages.fieldErrorRequired)
        }

        if (!/^[a-zA-Z0-9-]+$/.test(value)) {
            return intl.formatMessage(messages.fieldErrorAlphanumeric)
        }

        // Check that name isn't in use
        if (!this.state.editing) {
            let foundEntity = this.props.entities.find(e => e.entityName === this.state.entityNameVal);
            if (foundEntity) {
                return intl.formatMessage(messages.fieldErrorDistinct)
            }
        }

        return '';
    }

    onKeyDownName = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // On enter attempt to create the entity as long as name is set
        if (event.key === 'Enter' && this.onGetNameErrorMessage(this.state.entityNameVal) === '') {
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

    getPrebuiltEntityName(preBuiltType: string): string {
        return `luis-${preBuiltType.toLowerCase()}`
    }

    onRenderOption = (option: BlisDropdownOption): JSX.Element => {
        return (
            <div className="dropdownExample-option">
                <span className={option.style}>{option.text}</span>
            </div>
        );
    }

    renderEdit() {
        const { intl } = this.props
        return (
            <div>
                <OF.Dropdown
                    label={intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_FIELDS_TYPE_LABEL,
                        defaultMessage: 'Entity Type'
                    })}
                    options={this.entityOptions}
                    onChanged={this.onChangedType}
                    onRenderOption={(option) => this.onRenderOption(option as BlisDropdownOption)}
                    selectedKey={this.state.entityTypeVal}
                    disabled={this.state.editing || this.props.entityTypeFilter != null}
                />
                <OF.TextField
                    onGetErrorMessage={this.onGetNameErrorMessage}
                    onChanged={this.onChangedName}
                    onKeyDown={this.onKeyDownName}
                    label={intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_FIELDS_NAME_LABEL,
                        defaultMessage: 'Entity Name'
                    })}
                    placeholder={intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_FIELDS_NAME_PLACEHOLDER,
                        defaultMessage: 'Name...'
                    })}
                    required={true}
                    value={this.state.isPrebuilt ? this.getPrebuiltEntityName(this.state.entityTypeVal) : this.state.entityNameVal}
                    disabled={this.state.editing || this.state.isPrebuilt}
                />
                <div className="blis-entity-creator-checkbox">
                    <TC.Checkbox
                        label={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_FIELDS_PROGRAMMATICONLY_LABEL,
                            defaultMessage: 'Programmatic Only'
                        })}
                        checked={this.state.isProgrammaticVal}
                        onChange={this.onChangeProgrammatic}
                        disabled={this.state.editing || this.state.isPrebuilt}
                        tipType={ToolTip.TipType.ENTITY_PROGAMMATIC}
                    />
                </div>
                <div className="blis-entity-creator-checkbox">
                    <TC.Checkbox
                        label={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_FIELDS_MULTIVALUE_LABEL,
                            defaultMessage: 'Multi-valued'
                        })}
                        checked={this.state.isBucketableVal}
                        onChange={this.onChangeBucketable}
                        disabled={this.state.editing}
                        tipType={ToolTip.TipType.ENTITY_MULTIVALUE}
                    />
                </div>
                <div className="blis-entity-creator-checkbox">
                    <TC.Checkbox
                        label={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_FIELDS_NEGATAABLE_LABEL,
                            defaultMessage: 'Negatable'
                        })}
                        checked={this.state.isNegatableVal}
                        onChange={this.onChangeReversible}
                        disabled={this.state.editing || this.state.isPrebuilt}
                        tipType={ToolTip.TipType.ENTITY_NEGATABLE}
                    />
                </div>
            </div>
        )
    }
    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={false}
                containerClassName="blis-modal blis-modal--medium blis-modal--border"
            >
                <div className="blis-modal_header">
                    <span className="ms-font-xxl ms-fontWeight-semilight">{this.state.editing ? this.props.entity.entityName : this.state.title}</span>
                </div>
                <div className="blis-modal_body">
                    {this.state.editing
                        ? (
                            <div>
                                <OF.Pivot linkSize={OF.PivotLinkSize.large}>
                                    <OF.PivotItem
                                        linkText={intl.formatMessage({
                                            id: FM.ENTITYCREATOREDITOR_PIVOT_EDIT,
                                            defaultMessage: 'Edit Entity'
                                        })}
                                    >
                                        {this.renderEdit()}
                                    </OF.PivotItem>
                                    <OF.PivotItem
                                        ariaLabel={ToolTip.TipType.ENTITY_ACTION_REQUIRED}
                                        linkText={intl.formatMessage({ id: FM.ENTITYCREATOREDITOR_PIVOT_REQUIREDFOR, defaultMessage: 'Required For Actions' })}
                                        onRenderItemLink={(
                                            pivotItemProps: OF.IPivotItemProps,
                                            defaultRender: (link: OF.IPivotItemProps) => JSX.Element) =>
                                            ToolTip.onRenderPivotItem(pivotItemProps, defaultRender)}
                                    >
                                        <ActionDetailsList
                                            actions={this.getRequiredActions()}
                                            onSelectAction={null}
                                        />
                                    </OF.PivotItem>
                                    <OF.PivotItem
                                        ariaLabel={ToolTip.TipType.ENTITY_ACTION_BLOCKED}
                                        linkText={intl.formatMessage({ id: FM.ENTITYCREATOREDITOR_PIVOT_BLOCKEDACTIONS, defaultMessage: 'Blocked Actions' })}
                                        onRenderItemLink={(
                                            pivotItemProps: OF.IPivotItemProps,
                                            defaultRender: (link: OF.IPivotItemProps) => JSX.Element) =>
                                            ToolTip.onRenderPivotItem(pivotItemProps, defaultRender)}
                                    >
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
                                    disabled={(this.onGetNameErrorMessage(this.state.entityNameVal) !== '') && !this.state.isPrebuilt}
                                    onClick={this.onClickSubmit}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_CREATEBUTTON_ARIADESCRIPTION,
                                        defaultMessage: 'Create'
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_CREATEBUTTON_TEXT,
                                        defaultMessage: 'Create'
                                    })}
                                />
                            }
                            {!this.state.editing &&
                                <OF.DefaultButton
                                    onClick={this.onClickCancel}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_CANCELBUTTON_ARIADESCRIPTION,
                                        defaultMessage: 'Cancel'
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_CANCELBUTTON_TEXT,
                                        defaultMessage: 'Cancel'
                                    })}
                                />
                            }
                            {this.state.editing &&
                                <OF.PrimaryButton
                                    onClick={this.onClickCancel}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_DONEBUTTON_ARIADESCRIPTION,
                                        defaultMessage: 'Done'
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_DONEBUTTON_TEXT,
                                        defaultMessage: 'Done'
                                    })}
                                />
                            }
                            {this.state.editing && this.props.handleOpenDeleteModal &&
                                <OF.DefaultButton
                                    onClick={() => this.props.handleOpenDeleteModal(this.props.entity.entityId)}
                                    ariaDescription={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_DELETEBUTTON_ARIADESCRIPTION,
                                        defaultMessage: 'Delete'
                                    })}
                                    text={intl.formatMessage({
                                        id: FM.ENTITYCREATOREDITOR_DELETEBUTTON_TEXT,
                                        defaultMessage: 'Delete'
                                    })}
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
        editEntityAsync,
        fetchApplicationTrainingStatusThunkAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        userKey: state.user.key,
        entities: state.entities,
        actions: state.actions,
    }
}

export interface ReceivedProps {
    open: boolean,
    entity: EntityBase | null,
    handleClose: Function,
    entityTypeFilter: EntityType | null,
    app: BlisAppBase
    handleOpenDeleteModal: (entityId: string) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(EntityCreatorEditor))