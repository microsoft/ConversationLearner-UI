/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { 
    fetchApplicationTrainingStatusThunkAsync,
    fetchEntityEditValidationThunkAsync,
    fetchEntityDeleteValidationThunkAsync } from '../../actions/fetchActions'
import { createEntityThunkAsync } from '../../actions/createActions';
import { editEntityThunkAsync } from '../../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react';
import * as TC from '../tipComponents'
import ActionDetailsList from '../ActionDetailsList'
import ConfirmCancelModal from './ConfirmCancelModal'
import { State, PreBuiltEntities } from '../../types';
import { CLDropdownOption } from './CLDropDownOption'
import * as ToolTip from '../ToolTips'
import { AppBase, EntityBase, EntityType, ActionBase } from '@conversationlearner/models'
import './EntityCreatorEditor.css'
import { FM } from '../../react-intl-messages'
import { defineMessages, injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

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
    isMultivalueVal: false,
    isNegatableVal: false,
    isProgrammaticVal: false,
    isEditing: false,
    title: '',
    hasPendingChanges: false,
    isConfirmEditModalOpen: false,
    isConfirmDeleteModalOpen: false,
    isDeleteErrorModalOpen: false,
    showValidationWarning: false,
    newOrEditedEntity: null
};

interface ComponentState {
    entityNameVal: string
    entityTypeVal: string
    isPrebuilt: boolean
    isMultivalueVal: boolean
    isNegatableVal: boolean
    isProgrammaticVal: boolean
    isEditing: boolean
    title: string
    hasPendingChanges: boolean
    isConfirmEditModalOpen: boolean,
    isConfirmDeleteModalOpen: boolean,
    isDeleteErrorModalOpen: boolean,
    showValidationWarning: boolean,
    newOrEditedEntity: EntityBase
}

class EntityCreatorEditor extends React.Component<Props, ComponentState> {
    staticEntityOptions: CLDropdownOption[]
    entityOptions: CLDropdownOption[]

    constructor(props: Props) {
        super(props)
        this.state = { ...initState, entityTypeVal: this.NEW_ENTITY }
        this.staticEntityOptions = this.getStaticEntityOptions(this.props.intl)
    }

    get NEW_ENTITY(): string {
        return this.props.intl.formatMessage({
            id: FM.ENTITYCREATOREDITOR_ENTITYOPTION_NEW,
            defaultMessage: 'custom'
        });
    }

    getStaticEntityOptions(intl: InjectedIntl): CLDropdownOption[] {
        return [
            {
                key: this.NEW_ENTITY,
                text: this.NEW_ENTITY,
                itemType: OF.DropdownMenuItemType.Normal,
                style: 'clDropdown--command'
            },
            {
                key: 'divider',
                text: '-',
                itemType: OF.DropdownMenuItemType.Divider,
                style: 'clDropdown--normal'
            }
        ]
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.open !== this.props.open) {
            // Build entity options based on current model locale
            const currentAppLocale = nextProps.app.locale
            const localePreBuiltOptions = PreBuiltEntities
                .find(entitiesList => entitiesList.locale === currentAppLocale).preBuiltEntities
                .map<CLDropdownOption>(entityName =>
                    ({
                        key: entityName,
                        text: entityName,
                        itemType: OF.DropdownMenuItemType.Normal,
                        style: 'clDropdown--normal'
                    }))

            if (nextProps.entity === null) {
                // Filter out one that have already been used so user can't create two of same type.
                const filteredPrebuilts = localePreBuiltOptions
                    .filter(entityOption => !nextProps.entities.some(e => e.entityType === entityOption.key))

                this.entityOptions = [...this.staticEntityOptions, ...filteredPrebuilts]

                this.setState({
                    ...initState,
                    title: nextProps.intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_TITLE_CREATE,
                        defaultMessage: 'Create an Entity'
                    }),
                    entityTypeVal: nextProps.entityTypeFilter ? nextProps.entityTypeFilter : this.NEW_ENTITY
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
                    isMultivalueVal: nextProps.entity.isMultivalue,
                    isNegatableVal: nextProps.entity.isNegatible,
                    isProgrammaticVal: isProgrammatic,
                    isEditing: true,
                    title: nextProps.intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_TITLE_EDIT,
                        defaultMessage: 'Edit Entity'
                    })
                })
            }
        }
    }

    componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        const isProgrammaticChanged = this.props.entity && this.state.isProgrammaticVal !== (this.props.entity.entityType === EntityType.LOCAL)
        const isMultiValueChanged = this.props.entity && this.state.isMultivalueVal !== this.props.entity.isMultivalue
        const isNegatableChanged = this.props.entity && this.state.isNegatableVal !== this.props.entity.isNegatible
        const hasPendingChanges = isProgrammaticChanged || isMultiValueChanged || isNegatableChanged

        if (prevState.hasPendingChanges !== hasPendingChanges) {
            this.setState({
                hasPendingChanges
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

        const newOrEditedEntity = {
            entityId: undefined,
            entityName,
            isMultivalue: this.state.isMultivalueVal,
            isNegatible: this.state.isNegatableVal,
            negativeId: null,
            positiveId: null,
            entityType,
            version: null,
            packageCreationId: null,
            packageDeletionId: null
        } as EntityBase;

        // Set entity id if we're editing existing id.
        if (this.state.isEditing) {
            newOrEditedEntity.entityId = this.props.entity.entityId
        }

        return newOrEditedEntity;
    }

    @autobind
    onClickSaveCreate() {
        const newOrEditedEntity = this.convertStateToEntity(this.state)

        if (this.state.isEditing) {
            // Include non-editable fields
            newOrEditedEntity.positiveId = this.props.entity.positiveId;
            newOrEditedEntity.negativeId = this.props.entity.negativeId;
        } else {
            this.props.createEntityThunkAsync(this.props.app.appId, newOrEditedEntity)
            this.props.handleClose();
            return;
        } 
        
        // Otherwise need to validate changes
        ((this.props.fetchEntityEditValidationThunkAsync(this.props.app.appId, this.props.editingPackageId, newOrEditedEntity) as any) as Promise<string[]>)
        .then(invalidTrainingDialogIds => {

            if (invalidTrainingDialogIds) {
                if (invalidTrainingDialogIds.length > 0) {
                    this.setState(
                    {
                        isConfirmEditModalOpen: true,
                        showValidationWarning: true,
                        newOrEditedEntity: newOrEditedEntity
                    });
                } else {
                    this.props.editEntityThunkAsync(this.props.app.appId, newOrEditedEntity);
                    this.props.handleClose();
                }
            }
        })
        .catch(error => {
            console.warn(`Error when attempting to validate edit: `, error)
        })
    }

    onClickCancel = () => {
        this.props.handleClose()
    }

    onChangedName = (text: string) => {
        const { entity } = this.props
        const hasPendingChanges = entity && entity.entityName !== text
        this.setState({
            entityNameVal: text,
            hasPendingChanges
        })
    }
    onChangedType = (obj: CLDropdownOption) => {
        const isPrebuilt = obj.text !== this.NEW_ENTITY
        const isNegatableVal = isPrebuilt ? false : this.state.isNegatableVal
        const isProgrammaticVal = isPrebuilt ? false : this.state.isProgrammaticVal
        const isMultivalueVal = isPrebuilt ? true : this.state.isMultivalueVal

        this.setState({
            isPrebuilt,
            isMultivalueVal,
            isNegatableVal,
            isProgrammaticVal,
            entityTypeVal: obj.text
        })
    }
    onChangeProgrammatic = () => {
        this.setState(prevState => ({
            isProgrammaticVal: !prevState.isProgrammaticVal
        }))
    }
    onChangeMultivalue = () => {
        this.setState(prevState => ({
            isMultivalueVal: !prevState.isMultivalueVal,
        }))
    }
    onChangeReversible = () => {
        this.setState(prevState => ({
            isNegatableVal: !prevState.isNegatableVal,
        }))
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
        if (!this.state.isEditing) {
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
            this.onClickSaveCreate();
        }
    }

    getDisqualifiedActions(): ActionBase[] {
        let disqualifiedActions = this.props.actions.filter(a => {
            return a.negativeEntities.find(id => id === this.props.entity.entityId) != null;
        });
        return disqualifiedActions;
    }

    getRequiredActions(): ActionBase[] {
        let requiredActions = this.props.actions.filter(a => {
            return a.requiredEntities.find(id => id === this.props.entity.entityId) != null;
        });
        return requiredActions;
    }

    getPrebuiltEntityName(preBuiltType: string): string {
        return `builtin-${preBuiltType.toLowerCase()}`
    }

    onRenderOption = (option: CLDropdownOption): JSX.Element => {
        return (
            <div className="dropdownExample-option">
                <span className={option.style}>{option.text}</span>
            </div>
        );
    }

    isInUse(): boolean {
        return this.isUsedByActions() || this.isUsedByTrainingDialogs()
    }

    isRequiredForActions(): boolean {
        return this.props.actions.some(a => [...a.requiredEntitiesFromPayload, ...(a.suggestedEntity ? [a.suggestedEntity] : [])].includes(this.props.entity.entityId))
    }

    isUsedByActions(): boolean {
        return this.props.actions.some(a => [...a.negativeEntities, ...a.requiredEntities, ...(a.suggestedEntity ? [a.suggestedEntity] : [])].includes(this.props.entity.entityId))
    }

    isUsedByTrainingDialogs() : boolean {
        let tdString = JSON.stringify(this.props.trainDialogs)
        return tdString.indexOf(this.props.entity.entityId) > -1
    }

    @autobind
    onClickDelete() {
        // Check if used by actions (ok if used by TrainDialogs)
        if (this.isRequiredForActions()) {
            this.setState({
                isDeleteErrorModalOpen: true
            })
            return
        }

        ((this.props.fetchEntityDeleteValidationThunkAsync(this.props.app.appId, this.props.editingPackageId, this.props.entity.entityId) as any) as Promise<string[]>)
            .then(invalidTrainingDialogIds => {
                this.setState({
                    isConfirmDeleteModalOpen: true,
                    showValidationWarning: invalidTrainingDialogIds.length > 0
                });
            })
            .catch(error => {
                console.warn(`Error when attempting to validate delete: `, error)
            }
        )
    }

    @autobind
    onCancelDelete() {
        this.setState({
            isConfirmDeleteModalOpen: false,
            isDeleteErrorModalOpen: false
        })
    }

    @autobind
    onConfirmDelete() {
        this.setState(
            { isConfirmDeleteModalOpen: false },
            () => {
                this.props.handleDelete(this.props.entity.entityId)
            })
    }

    @autobind
    onCancelEdit() {
        this.setState({
            isConfirmEditModalOpen: false,
            newOrEditedEntity: null
        })
    }

    @autobind
    onConfirmEdit() {
        this.props.editEntityThunkAsync(this.props.app.appId, this.state.newOrEditedEntity);

        this.setState({
            isConfirmEditModalOpen: false,
            newOrEditedEntity: null
        })
    }

    @autobind
    onClickTrainDialogs() {
        const { history } = this.props
        history.push(`/home/${this.props.app.appId}/trainDialogs`, { app: this.props.app, entityFilter: this.props.entity })
    }

    renderEdit() {
        const { intl } = this.props
        const disabled = this.state.isEditing && this.isInUse()
        return (
            <div>
                <OF.Dropdown
                    ariaLabel={intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_FIELDS_TYPE_LABEL,
                        defaultMessage: 'Entity Type'
                    })}
                    label={intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_FIELDS_TYPE_LABEL,
                        defaultMessage: 'Entity Type'
                    })}
                    options={this.entityOptions}
                    onChanged={this.onChangedType}
                    onRenderOption={(option) => this.onRenderOption(option as CLDropdownOption)}
                    selectedKey={this.state.entityTypeVal}
                    disabled={disabled || this.props.entityTypeFilter != null}
                />
                <OF.TextField
                    data-testid="entity-creator-input-name"
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
                    disabled={this.state.isPrebuilt}
                />
                <br />
                <div className="cl-entity-creator-checkbox">
                    <TC.Checkbox
                        data-testid="entitycreator-checkbox-programmaticonly"
                        label={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_FIELDS_PROGRAMMATICONLY_LABEL,
                            defaultMessage: 'Programmatic Only'
                        })}
                        checked={this.state.isProgrammaticVal}
                        onChange={this.onChangeProgrammatic}
                        disabled={disabled || this.state.isPrebuilt}
                        tipType={ToolTip.TipType.ENTITY_PROGAMMATIC}
                    />
                </div>
                <div className="cl-entity-creator-checkbox">
                    <TC.Checkbox
                        data-testid="entitycreator-checkbox-multivalued"
                        label={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_FIELDS_MULTIVALUE_LABEL,
                            defaultMessage: 'Multi-valued'
                        })}
                        checked={this.state.isMultivalueVal}
                        onChange={this.onChangeMultivalue}
                        disabled={disabled}
                        tipType={ToolTip.TipType.ENTITY_MULTIVALUE}
                    />
                </div>
                <div className="cl-entity-creator-checkbox">
                    <TC.Checkbox
                        data-testid="entitycreator-checkbox-negatable"
                        label={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_FIELDS_NEGATABLE_LABEL,
                            defaultMessage: 'Negatable'
                        })}
                        checked={this.state.isNegatableVal}
                        onChange={this.onChangeReversible}
                        disabled={disabled || this.state.isPrebuilt}
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
                containerClassName="cl-modal cl-modal--medium"
            >
                <div className="cl-modal_header">
                    <span className={OF.FontClassNames.xxLarge}>{this.state.isEditing ? this.props.entity.entityName : this.state.title}</span>
                </div>
                <div className="cl-modal_body">
                    {this.state.isEditing
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
                                        ariaLabel={ToolTip.TipType.ENTITY_ACTION_DISQUALIFIED}
                                        linkText={intl.formatMessage({ id: FM.ENTITYCREATOREDITOR_PIVOT_DISQUALIFIEDACTIONS, defaultMessage: 'Disqualified Actions' })}
                                        onRenderItemLink={(
                                            pivotItemProps: OF.IPivotItemProps,
                                            defaultRender: (link: OF.IPivotItemProps) => JSX.Element) =>
                                            ToolTip.onRenderPivotItem(pivotItemProps, defaultRender)}
                                    >
                                        <ActionDetailsList
                                            actions={this.getDisqualifiedActions()}
                                            onSelectAction={null}
                                        />
                                    </OF.PivotItem>
                                </OF.Pivot>
                            </div>
                        ) : (
                            this.renderEdit()
                        )}
                </div>
                <div className="cl-modal_footer cl-modal-buttons">
                    <div className="cl-modal-buttons_secondary">
                        {this.state.isEditing &&
                            <OF.DefaultButton
                                onClick={this.onClickTrainDialogs}
                                iconProps={{ iconName: 'QueryList' }}
                                ariaDescription={intl.formatMessage({
                                    id: FM.ENTITYCREATOREDITOR_TRAINDIALOGSBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Train Dialogs'
                                })}
                                text={intl.formatMessage({
                                    id: FM.ENTITYCREATOREDITOR_TRAINDIALOGSBUTTON_TEXT,
                                    defaultMessage: 'Trail Dialogs'
                                })}
                            />
                        }
                    </div>
                    <div className="cl-modal-buttons_primary">
                        <OF.PrimaryButton
                            data-testid="entity-creator-button-save"
                            disabled={(this.onGetNameErrorMessage(this.state.entityNameVal) !== '') && !this.state.isPrebuilt || (this.state.isEditing && !this.state.hasPendingChanges)}
                            onClick={this.onClickSaveCreate}
                            ariaDescription={this.state.isEditing
                                ? intl.formatMessage({
                                    id: FM.ENTITYCREATOREDITOR_SAVEBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Save'
                                })
                                : intl.formatMessage({
                                    id: FM.ENTITYCREATOREDITOR_CREATEBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Create'
                                })}
                            text={this.state.isEditing
                                ? intl.formatMessage({
                                    id: FM.ENTITYCREATOREDITOR_SAVEBUTTON_TEXT,
                                    defaultMessage: 'Save'
                                })
                                : intl.formatMessage({
                                    id: FM.ENTITYCREATOREDITOR_CREATEBUTTON_TEXT,
                                    defaultMessage: 'Create'
                                })}
                        />

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

                        {this.state.isEditing && this.props.handleDelete &&
                            <OF.DefaultButton
                                className="cl-button-delete"
                                onClick={this.onClickDelete}
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

                </div>
                <ConfirmCancelModal
                    open={this.state.isConfirmDeleteModalOpen}
                    onCancel={this.onCancelDelete}
                    onConfirm={this.onConfirmDelete}
                    title={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_CONFIRM_DELETE_TITLE,
                            defaultMessage: 'Are you sure you want to delete this Entity?'
                        })}
                    message={() => this.state.showValidationWarning &&
                        <div className={`${OF.FontClassNames.medium} cl-text--warning`}>
                            <OF.Icon iconName="Warning" className="cl-icon" /> Warning:&nbsp;
                            <FormattedMessage
                                id={FM.ENTITYCREATOREDITOR_CONFIRM_DELETE_WARNING}
                                defaultMessage='This Entity is used by one or more Actions or Training Dialogs.  If you proceed it will also be removed from these Actions and Training Dialogs.'
                            />
                    </div>}
                />
                <ConfirmCancelModal
                    open={this.state.isConfirmEditModalOpen}
                    onCancel={this.onCancelEdit} 
                    onConfirm={this.onConfirmEdit}
                    title={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_CONFIRM_EDIT_TITLE,
                            defaultMessage: 'Are you sure you want to edit this Entity?'
                        })}
                    message={() => <div className={`${OF.FontClassNames.medium} cl-text--warning`}>
                        <OF.Icon iconName="Warning" className="cl-icon" /> Warning:&nbsp;
                        <FormattedMessage
                            id={FM.ENTITYCREATOREDITOR_CONFIRM_EDIT_WARNING}
                            defaultMessage='This edit will invalidate one or more Training Dialogs.  If you proceed they will removed from training until fixed.'
                        />
                    </div>}
                    />
                <ConfirmCancelModal
                    open={this.state.isDeleteErrorModalOpen}
                    onCancel={this.onCancelDelete} 
                    onConfirm={null}
                    title={intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_DELETE_ERROR_TITLE,
                        defaultMessage: 'Unable to delete'
                    })}
                    message={() => <div className={`${OF.FontClassNames.medium} cl-text--error`}>
                        <OF.Icon iconName="Error" className="cl-icon" /> Error:&nbsp;
                        <FormattedMessage
                            id={FM.ENTITYCREATOREDITOR_DELETE_ERROR_WARNING}
                            defaultMessage='It is either referenced within the payload or used as suggested entity by one or more Actions.'
                        />
                    </div>}
                />
            </Modal>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createEntityThunkAsync,
        editEntityThunkAsync,
        fetchApplicationTrainingStatusThunkAsync,
        fetchEntityDeleteValidationThunkAsync,
        fetchEntityEditValidationThunkAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs
    }
}

export interface ReceivedProps {
    app: AppBase,
    editingPackageId: string,
    open: boolean,
    entity: EntityBase | null,
    entityTypeFilter: EntityType | null
    handleClose: () => void,
    handleDelete: (entityId: string) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(EntityCreatorEditor)))