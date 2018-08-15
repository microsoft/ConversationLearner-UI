/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import * as OF from 'office-ui-fabric-react'
import * as TC from '../../tipComponents'
import ActionDetailsList from '../../ActionDetailsList'
import ConfirmCancelModal from '../ConfirmCancelModal'
import { CLDropdownOption } from '../CLDropDownOption'
import * as ToolTip from '../../ToolTips'
import { ActionBase } from '@conversationlearner/models'
import './styles.css'
import { FM } from '../../../react-intl-messages'
import { InjectedIntlProps, FormattedMessage } from 'react-intl'

interface Props extends InjectedIntlProps {
    open: boolean
    title: string

    entityOptions: OF.IDropdownOption[]
    
    selectedTypeKey: string
    isTypeDisabled: boolean
    onChangedType: (option: OF.IDropdownOption) => void

    name: string
    isNameDisabled: boolean
    onGetNameErrorMessage: (value: string) => string
    onChangedName: (name: string) => void
    onKeyDownName: React.KeyboardEventHandler<HTMLInputElement>

    isProgrammatic: boolean
    isProgrammaticDisabled: boolean
    onChangeProgrammatic: (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => void

    isMultiValue: boolean
    isMultiValueDisabled: boolean
    onChangeMultiValue: (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => void

    isNegatable: boolean
    isNegatableDisabled: boolean
    onChangeNegatable: (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => void

    isEditing: boolean
    requiredActions: ActionBase[]
    disqualifiedActions: ActionBase[]

    onClickTrainDialogs: () => void

    isSaveButtonDisabled: boolean
    onClickSaveCreate: () => void

    onClickCancel: () => void

    isConfirmDeleteModalOpen: boolean
    isDeleteErrorModalOpen: boolean
    showDelete: boolean
    onClickDelete: () => void
    onCancelDelete: () => void
    onConfirmDelete: () => void

    isConfirmEditModalOpen: boolean
    onCancelEdit: () => void
    onConfirmEdit: () => void

    showValidationWarning: boolean
}

const EditComponent: React.SFC<Props> = (props: Props) => {
    return <div className="cl-entity-creator-form">
        <OF.Dropdown
            ariaLabel={props.intl.formatMessage({
                id: FM.ENTITYCREATOREDITOR_FIELDS_TYPE_LABEL,
                defaultMessage: 'Entity Type'
            })}
            label={props.intl.formatMessage({
                id: FM.ENTITYCREATOREDITOR_FIELDS_TYPE_LABEL,
                defaultMessage: 'Entity Type'
            })}
            options={props.entityOptions}
            onChanged={props.onChangedType}
            onRenderOption={(option: CLDropdownOption) =>
                <div className="dropdownExample-option">
                    <span className={option.style}>{option.text}</span>
                </div>
            }
            selectedKey={props.selectedTypeKey}
            disabled={props.isTypeDisabled}
        />
        <OF.TextField
            data-testid="entity-creator-input-name"
            onGetErrorMessage={props.onGetNameErrorMessage}
            onChanged={props.onChangedName}
            onKeyDown={props.onKeyDownName}
            label={props.intl.formatMessage({
                id: FM.ENTITYCREATOREDITOR_FIELDS_NAME_LABEL,
                defaultMessage: 'Entity Name'
            })}
            placeholder={props.intl.formatMessage({
                id: FM.ENTITYCREATOREDITOR_FIELDS_NAME_PLACEHOLDER,
                defaultMessage: 'Name...'
            })}
            required={true}
            value={props.name}
            disabled={props.isNameDisabled}
        />
        <div className="cl-entity-creator-checkboxes cl-entity-creator-form">
            <TC.Checkbox
                data-testid="entitycreator-checkbox-programmaticonly"
                label={props.intl.formatMessage({
                    id: FM.ENTITYCREATOREDITOR_FIELDS_PROGRAMMATICONLY_LABEL,
                    defaultMessage: 'Programmatic Only'
                })}
                checked={props.isProgrammatic}
                onChange={props.onChangeProgrammatic}
                disabled={props.isProgrammaticDisabled}
                tipType={ToolTip.TipType.ENTITY_PROGAMMATIC}
            />
            <TC.Checkbox
                data-testid="entitycreator-checkbox-multivalued"
                label={props.intl.formatMessage({
                    id: FM.ENTITYCREATOREDITOR_FIELDS_MULTIVALUE_LABEL,
                    defaultMessage: 'Multi-valued'
                })}
                checked={props.isMultiValue}
                onChange={props.onChangeMultiValue}
                disabled={props.isMultiValueDisabled}
                tipType={ToolTip.TipType.ENTITY_MULTIVALUE}
            />
            <TC.Checkbox
                data-testid="entitycreator-checkbox-negatable"
                label={props.intl.formatMessage({
                    id: FM.ENTITYCREATOREDITOR_FIELDS_NEGATABLE_LABEL,
                    defaultMessage: 'Negatable'
                })}
                checked={props.isNegatable}
                onChange={props.onChangeNegatable}
                disabled={props.isNegatableDisabled}
                tipType={ToolTip.TipType.ENTITY_NEGATABLE}
            />
        </div>
    </div>
}

const Component: React.SFC<Props> = (props) => {
    return <Modal
        isOpen={props.open}
        isBlocking={false}
        containerClassName="cl-modal cl-modal--medium"
    >
        <div className={`cl-modal_header ${OF.FontClassNames.xxLarge}`}>
            {props.title}
        </div>
        <div className="cl-modal_body">
            {props.isEditing
                ? (
                    <div>
                        <OF.Pivot linkSize={OF.PivotLinkSize.large}>
                            <OF.PivotItem
                                linkText={props.intl.formatMessage({
                                    id: FM.ENTITYCREATOREDITOR_PIVOT_EDIT,
                                    defaultMessage: 'Edit Entity'
                                })}
                            >
                                <EditComponent {...props} />
                            </OF.PivotItem>
                            <OF.PivotItem
                                ariaLabel={ToolTip.TipType.ENTITY_ACTION_REQUIRED}
                                linkText={props.intl.formatMessage({ id: FM.ENTITYCREATOREDITOR_PIVOT_REQUIREDFOR, defaultMessage: 'Required For Actions' })}
                                onRenderItemLink={(
                                    pivotItemProps: OF.IPivotItemProps,
                                    defaultRender: (link: OF.IPivotItemProps) => JSX.Element) =>
                                    ToolTip.onRenderPivotItem(pivotItemProps, defaultRender)}
                            >
                                <ActionDetailsList
                                    actions={props.requiredActions}
                                    onSelectAction={() => {}}
                                />
                            </OF.PivotItem>
                            <OF.PivotItem
                                ariaLabel={ToolTip.TipType.ENTITY_ACTION_DISQUALIFIED}
                                linkText={props.intl.formatMessage({ id: FM.ENTITYCREATOREDITOR_PIVOT_DISQUALIFIEDACTIONS, defaultMessage: 'Disqualified Actions' })}
                                onRenderItemLink={(
                                    pivotItemProps: OF.IPivotItemProps,
                                    defaultRender: (link: OF.IPivotItemProps) => JSX.Element) =>
                                        ToolTip.onRenderPivotItem(pivotItemProps, defaultRender)}
                                >
                                <ActionDetailsList
                                    actions={props.disqualifiedActions}
                                    onSelectAction={() => {}}
                                />
                            </OF.PivotItem>
                        </OF.Pivot>
                    </div>
                )
                : <EditComponent {...props} />}
        </div>
        <div className="cl-modal_footer cl-modal-buttons">
            <div className="cl-modal-buttons_secondary">
                {props.isEditing &&
                    <OF.DefaultButton
                        onClick={props.onClickTrainDialogs}
                        iconProps={{ iconName: 'QueryList' }}
                        ariaDescription={props.intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_TRAINDIALOGSBUTTON_ARIADESCRIPTION,
                            defaultMessage: 'Train Dialogs'
                        })}
                        text={props.intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_TRAINDIALOGSBUTTON_TEXT,
                            defaultMessage: 'Trail Dialogs'
                        })}
                    />
                }
            </div>
            <div className="cl-modal-buttons_primary">
                <OF.PrimaryButton
                    data-testid="entity-creator-button-save"
                    disabled={props.isSaveButtonDisabled}
                    onClick={props.onClickSaveCreate}
                    ariaDescription={props.isEditing
                        ? props.intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_SAVEBUTTON_ARIADESCRIPTION,
                            defaultMessage: 'Save'
                        })
                        : props.intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_CREATEBUTTON_ARIADESCRIPTION,
                            defaultMessage: 'Create'
                        })}
                    text={props.isEditing
                        ? props.intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_SAVEBUTTON_TEXT,
                            defaultMessage: 'Save'
                        })
                        : props.intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_CREATEBUTTON_TEXT,
                            defaultMessage: 'Create'
                        })}
                />

                <OF.DefaultButton
                    onClick={props.onClickCancel}
                    ariaDescription={props.intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_CANCELBUTTON_ARIADESCRIPTION,
                        defaultMessage: 'Cancel'
                    })}
                    text={props.intl.formatMessage({
                        id: FM.ENTITYCREATOREDITOR_CANCELBUTTON_TEXT,
                        defaultMessage: 'Cancel'
                    })}
                />

                {props.showDelete &&
                    <OF.DefaultButton
                        className="cl-button-delete"
                        onClick={props.onClickDelete}
                        ariaDescription={props.intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_DELETEBUTTON_ARIADESCRIPTION,
                            defaultMessage: 'Delete'
                        })}
                        text={props.intl.formatMessage({
                            id: FM.ENTITYCREATOREDITOR_DELETEBUTTON_TEXT,
                            defaultMessage: 'Delete'
                        })}
                    />}
            </div>

        </div>
        <ConfirmCancelModal
            open={props.isConfirmDeleteModalOpen}
            onCancel={props.onCancelDelete}
            onConfirm={props.onConfirmDelete}
            title={props.intl.formatMessage({
                    id: FM.ENTITYCREATOREDITOR_CONFIRM_DELETE_TITLE,
                    defaultMessage: 'Are you sure you want to delete this Entity?'
                })}
            message={() => props.showValidationWarning &&
                <div className={`${OF.FontClassNames.medium} cl-text--warning`}>
                    <OF.Icon iconName="Warning" className="cl-icon" /> Warning:&nbsp;
                    <FormattedMessage
                        id={FM.ENTITYCREATOREDITOR_CONFIRM_DELETE_WARNING}
                        defaultMessage='This Entity is used by one or more Actions or Training Dialogs.  If you proceed it will also be removed from these Actions and Training Dialogs.'
                    />
            </div>}
        />
        <ConfirmCancelModal
            open={props.isConfirmEditModalOpen}
            onCancel={props.onCancelEdit} 
            onConfirm={props.onConfirmEdit}
            title={props.intl.formatMessage({
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
            open={props.isDeleteErrorModalOpen}
            onCancel={props.onCancelDelete}
            onConfirm={() => {}}
            title={props.intl.formatMessage({
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
}

export default Component