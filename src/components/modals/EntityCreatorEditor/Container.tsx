/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import actions from '../../../actions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as OF from 'office-ui-fabric-react'
import * as TC from '../../tipComponents'
import { State, PreBuiltEntities } from '../../../types'
import { CLDropdownOption } from '../CLDropDownOption'
import * as ToolTip from '../../ToolTips'
import { AppBase, EntityBase, EntityType, ActionBase } from '@conversationlearner/models'
import { FM } from '../../../react-intl-messages'
import { defineMessages, injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { autobind } from 'office-ui-fabric-react/lib/Utilities'
import Component from './Component'

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
}

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
    newOrEditedEntity: EntityBase | null
}

class Container extends React.Component<Props, ComponentState> {
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
            const preBuiltLocale = PreBuiltEntities.find(entitiesList => entitiesList.locale === currentAppLocale)
            if (!preBuiltLocale) {
                throw new Error(`Could not find locale: ${currentAppLocale} within list of supported locales: ${PreBuiltEntities.map(e => e.locale).join(', ')}`)
            }

            const localePreBuiltOptions = preBuiltLocale.preBuiltEntities
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
        const entity = this.props.entity
        if (!entity) {
            return
        }

        const isNameChanged = this.state.entityNameVal !== entity.entityName
        const isProgrammaticChanged = this.state.isProgrammaticVal !== (entity.entityType === EntityType.LOCAL)
        const isMultiValueChanged = this.state.isMultivalueVal !== entity.isMultivalue
        const isNegatableChanged = this.state.isNegatableVal !== entity.isNegatible
        const hasPendingChanges = isNameChanged || isProgrammaticChanged || isMultiValueChanged || isNegatableChanged

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
            entityId: undefined!,
            entityName,
            createdDateTime: new Date().toJSON(),
            lastModifiedDateTime: new Date().toJSON(),
            isMultivalue: this.state.isMultivalueVal,
            isNegatible: this.state.isNegatableVal,
            negativeId: null,
            positiveId: null,
            entityType,
            version: null,
            packageCreationId: null,
            packageDeletionId: null
        } as EntityBase

        // Set entity id if we're editing existing id.
        if (this.state.isEditing && this.props.entity) {
            newOrEditedEntity.entityId = this.props.entity.entityId

            if (newOrEditedEntity.isNegatible) {
                newOrEditedEntity.positiveId = this.props.entity.positiveId
                newOrEditedEntity.negativeId = this.props.entity.negativeId
            }
        }

        return newOrEditedEntity
    }

    @autobind
    async onClickSaveCreate() {
        const newOrEditedEntity = this.convertStateToEntity(this.state)
        const appId = this.props.app.appId
        
        // If not editing (creating a new entity) simply create it and close
        // Otherwise request validation of changes from server to determine if confirmation dialog should be opened
        if (!this.state.isEditing) {
            this.props.createEntityThunkAsync(appId, newOrEditedEntity)
            this.props.handleClose()
            return
        }
        
        const invalidTrainingDialogIds = await (this.props.fetchEntityEditValidationThunkAsync(appId, this.props.editingPackageId, newOrEditedEntity) as any as Promise<string[]>)
        if (invalidTrainingDialogIds) {
            if (invalidTrainingDialogIds.length > 0) {
                this.setState(
                {
                    isConfirmEditModalOpen: true,
                    showValidationWarning: true,
                    newOrEditedEntity: newOrEditedEntity
                })
            } else {
                // We know props.entity is valid because we're not editing
                this.props.editEntityThunkAsync(appId, newOrEditedEntity, this.props.entity!)
                this.props.handleClose()
            }
        }
    }

    onClickCancel = () => {
        this.props.handleClose()
    }

    onChangedName = (text: string) => {
        this.setState({
            entityNameVal: text
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
        const { actions, entity } = this.props
        return !entity
            ? []
            : actions.filter(a => a.negativeEntities.some(id => id === entity.entityId))
    }

    getRequiredActions(): ActionBase[] {
        const { actions, entity } = this.props
        return !entity
            ? []
            : actions.filter(a => a.requiredEntities.find(id => id === entity.entityId))
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
        const { actions, entity } = this.props
        return !entity
            ? false
            : actions.some(a => [...a.requiredEntitiesFromPayload, ...(a.suggestedEntity ? [a.suggestedEntity] : [])].includes(entity.entityId))
    }

    isUsedByActions(): boolean {
        const { actions, entity } = this.props
        return !entity
            ? false
            : actions.some(a => [...a.negativeEntities, ...a.requiredEntities, ...(a.suggestedEntity ? [a.suggestedEntity] : [])].includes(entity.entityId))
    }

    isUsedByTrainingDialogs() : boolean {
        const { entity } = this.props
        return !entity
            ? false
            : JSON.stringify(this.props.trainDialogs).includes(entity.entityId)
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

        if (!this.props.entity) {
            console.warn(`You attempted to delete an entity, but entity prop was not given. This should not be possible. Contact support`)
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
        const entity = this.props.entity
        if (!entity) {
            console.warn(`You confirmed delete, but the entity prop was not provided. This should not be possible. Contact Support`)
            return
        }

        this.setState({
            isConfirmDeleteModalOpen: false
        }, () => {
            this.props.handleDelete(entity)
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
        const entity = this.state.newOrEditedEntity
        if (!entity) {
            console.warn(`You confirmed the edit, but the newOrEditedEntity state was not available. This should not be possible. Contact Support`)
            return
        }

        this.props.editEntityThunkAsync(this.props.app.appId, entity, this.props.entity!)

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
            <div className="cl-entity-creator-form">
                <OF.Dropdown
                    data-testid="entity-creator-entity-type-dropdown--isThisUsed"
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
                    data-testid="entity-creator-entity-name-text--isThisUsed"
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
                <div className="cl-entity-creator-checkboxes cl-entity-creator-form">
                    <TC.Checkbox
                        data-testid="entitycreator-checkbox-programmaticonly"
                        label={intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_FIELDS_PROGRAMMATICONLY_LABEL,
                            defaultMessage: 'Programmatic Only'
                        })}
                        checked={this.state.isProgrammaticVal}
                        onChange={this.onChangeProgrammatic}
                        disabled={disabled || this.state.isPrebuilt || this.state.isEditing}
                        tipType={ToolTip.TipType.ENTITY_PROGAMMATIC}
                    />
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
        const isEntityInUse = this.state.isEditing && this.isInUse()

        const title = this.props.entity
            ? this.props.entity.entityName
            : this.state.title

        const name = this.state.isPrebuilt
            ? this.getPrebuiltEntityName(this.state.entityTypeVal)
            : this.state.entityNameVal

        const isSaveButtonDisabled = (this.onGetNameErrorMessage(this.state.entityNameVal) !== '')
            && !this.state.isPrebuilt
            || (!!this.props.entity && !this.state.hasPendingChanges)

        return <Component
            open={this.props.open}
            title={title}
            intl={intl}
            entityOptions={this.entityOptions}
            
            selectedTypeKey={this.state.entityTypeVal}
            isTypeDisabled={isEntityInUse || this.props.entityTypeFilter != null}
            onChangedType={this.onChangedType}

            name={name}
            isNameDisabled={this.state.isPrebuilt}
            onGetNameErrorMessage={this.onGetNameErrorMessage}
            onChangedName={this.onChangedName}
            onKeyDownName={this.onKeyDownName}

            isProgrammatic={this.state.isProgrammaticVal}
            isProgrammaticDisabled={isEntityInUse || this.state.isPrebuilt || this.state.isEditing}
            onChangeProgrammatic={this.onChangeProgrammatic}

            isMultiValue={this.state.isMultivalueVal}
            isMultiValueDisabled={isEntityInUse}
            onChangeMultiValue={this.onChangeMultivalue}

            isNegatable={this.state.isNegatableVal}
            isNegatableDisabled={isEntityInUse || this.state.isPrebuilt}
            onChangeNegatable={this.onChangeReversible}

            isEditing={this.state.isEditing}
            requiredActions={this.getRequiredActions()}
            disqualifiedActions={this.getDisqualifiedActions()}

            onClickTrainDialogs={this.onClickTrainDialogs}

            isSaveButtonDisabled={isSaveButtonDisabled}
            onClickSaveCreate={this.onClickSaveCreate}
        
            onClickCancel={this.onClickCancel}

            isConfirmDeleteModalOpen={this.state.isConfirmDeleteModalOpen}
            isDeleteErrorModalOpen={this.state.isDeleteErrorModalOpen}
            showDelete={this.state.isEditing && !!this.props.handleDelete}
            onClickDelete={this.onClickDelete}
            onCancelDelete={this.onCancelDelete}
            onConfirmDelete={this.onConfirmDelete}

            isConfirmEditModalOpen={this.state.isConfirmEditModalOpen}
            onCancelEdit={this.onCancelEdit}
            onConfirmEdit={this.onConfirmEdit}

            showValidationWarning={this.state.showValidationWarning}
        />
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createEntityThunkAsync: actions.entity.createEntityThunkAsync,
        editEntityThunkAsync: actions.entity.editEntityThunkAsync,
        fetchApplicationTrainingStatusThunkAsync: actions.app.fetchApplicationTrainingStatusThunkAsync,
        fetchEntityDeleteValidationThunkAsync: actions.entity.fetchEntityDeleteValidationThunkAsync,
        fetchEntityEditValidationThunkAsync: actions.entity.fetchEntityEditValidationThunkAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
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
    handleDelete: (entity: EntityBase) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(Container)))