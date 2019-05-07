/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import * as OF from 'office-ui-fabric-react'
import * as TC from '../../tipComponents'
import * as ToolTip from '../../ToolTips/ToolTips'
import * as CLM from '@conversationlearner/models'
import * as Util from '../../../Utils/util'
import ActionDetailsList from '../../ActionDetailsList'
import ConfirmCancelModal from '../ConfirmCancelModal'
import { CLDropdownOption } from '../CLDropDownOption'
import './styles.css'
import { FM } from '../../../react-intl-messages'
import FormattedMessageId from '../../FormattedMessageId'
import { InjectedIntlProps } from 'react-intl'

export interface IEnumValueForDisplay extends CLM.EnumValue {
    allowDelete: boolean
}

// Renaming from Props because of https://github.com/Microsoft/tslint-microsoft-contrib/issues/339
interface ReceivedProps {
    open: boolean
    title: string

    entityOptions: OF.IDropdownOption[]

    entityTypeKey: CLM.EntityType | string
    isTypeDisabled: boolean
    onChangedType: (option: OF.IDropdownOption) => void

    name: string
    isNameDisabled: boolean
    onGetNameErrorMessage: (value: string) => string
    onChangedName: (name: string) => void
    onKeyDownName: React.KeyboardEventHandler<HTMLInputElement>

    isMultiValue: boolean
    isMultiValueDisabled: boolean
    onChangeMultiValue: (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => void

    isNegatable: boolean
    onChangeNegatable: (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => void

    isEditing: boolean
    requiredActions: CLM.ActionBase[]
    disqualifiedActions: CLM.ActionBase[]

    onClickTrainDialogs: () => void

    isSaveButtonDisabled: boolean
    onClickSaveCreate: () => void

    onClickCancel: () => void

    isConfirmDeleteModalOpen: boolean
    showValidationWarning: boolean
    isDeleteErrorModalOpen: boolean
    showDelete: boolean
    onClickDelete: () => void
    onCancelDelete: () => void
    onConfirmDelete: () => void

    isConfirmEditModalOpen: boolean
    onCancelEdit: () => void
    onConfirmEdit: () => void

    needPrebuiltWarning: string | null
    onClosePrebuiltWarning: () => void

    selectedResolverKey: string
    resolverOptions: OF.IDropdownOption[]
    onResolverChanged: (option: OF.IDropdownOption) => void

    enumValues: (IEnumValueForDisplay | null)[]
    onChangedEnum: (index: number, value: string) => void
    onDeleteEnum: (enumValue: CLM.EnumValue) => void
    onGetEnumErrorMessage: (enumValue: CLM.EnumValue | null) => string
    onCancelEnumDelete: () => void
    onConfirmEnumDelete: () => void
    deleteEnumCheck: CLM.EnumValue | null
}

type Props = ReceivedProps & InjectedIntlProps

const EditComponent: React.SFC<Props> = (props) => {
    return <div className="cl-entity-creator-form">
        <TC.Dropdown
            data-testid="entity-creator-entity-type-dropdown"
            ariaLabel={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_FIELDS_TYPE_LABEL)}
            label={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_FIELDS_TYPE_LABEL)}
            options={props.entityOptions}
            onChanged={props.onChangedType}
            onRenderOption={(option: CLDropdownOption) =>
                <div className="dropdownExample-option">
                    <span className={option.style}>{option.text}</span>
                </div>
            }
            selectedKey={props.entityTypeKey}
            disabled={props.isTypeDisabled}
            tipType={ToolTip.TipType.ENTITY_TYPE}
        />
        <OF.TextField
            data-testid="entity-creator-entity-name-text"
            onGetErrorMessage={props.onGetNameErrorMessage}
            onChanged={props.onChangedName}
            onKeyDown={props.onKeyDownName}
            label={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_FIELDS_NAME_LABEL)}
            placeholder={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_FIELDS_NAME_PLACEHOLDER)}
            required={true}
            value={props.name}
            disabled={props.isNameDisabled}
            ref={setFocused}
            autoComplete="off"
        />
        {props.entityTypeKey === CLM.EntityType.LUIS &&
            <TC.Dropdown
                data-testid="entity-creator-resolver-type-dropdown"
                ariaLabel={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_FIELDS_RESOLVER_LABEL)}
                label={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_FIELDS_RESOLVER_LABEL)}
                options={props.resolverOptions}
                onChanged={props.onResolverChanged}
                onRenderOption={(option: CLDropdownOption) =>
                    <div className="dropdownExample-option">
                        <span className={option.style}>{option.text}</span>
                    </div>
                }
                selectedKey={props.selectedResolverKey}
                tipType={ToolTip.TipType.ENTITY_RESOLVER}
            />
        }
        {props.entityTypeKey === CLM.EntityType.ENUM &&
            
            props.enumValues.map((value, index) => {
                return (
                    <div
                        data-testid="entity-enum-value"
                        className="cl-inputWithButton-input"
                        key={index}
                    >
                        <OF.TextField
                            key={index}
                            className={OF.FontClassNames.mediumPlus}
                            onChanged={(text) => props.onChangedEnum(index, text)}
                            label={index === 0 ? Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_FIELDS_ENUM_LABEL) : ""}
                            errorMessage={props.onGetEnumErrorMessage(value)}
                            value={value ? value.enumValue : ""}
                            data-testid="entity-enum-value-value-name"
                        />
                        {value && value.enumValueId &&
                            <OF.IconButton
                                data-testid="entity-enum-value-button-delete"
                                disabled={value ? !value.allowDelete : false}
                                className={`cl-inputWithButton-button`}
                                iconProps={{ iconName: 'Delete' }}
                                onClick={() => props.onDeleteEnum(value)}
                                ariaDescription="Delete Turn"
                            />
                        }
                    </div>
                )
            })

        }
        <div className="cl-entity-creator-checkboxes cl-entity-creator-form">
            {props.entityTypeKey !== CLM.EntityType.ENUM &&            
                <TC.Checkbox
                    data-testid="entity-creator-multi-valued-checkbox"
                    label={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_FIELDS_MULTIVALUE_LABEL)}
                    checked={props.isMultiValue}
                    onChange={props.onChangeMultiValue}
                    disabled={props.isMultiValueDisabled}
                    tipType={ToolTip.TipType.ENTITY_MULTIVALUE}
                />
            }
            {props.entityTypeKey === CLM.EntityType.LUIS &&
                <TC.Checkbox
                    data-testid="entity-creator-negatable-checkbox"
                    label={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_FIELDS_NEGATABLE_LABEL)}
                    checked={props.isNegatable}
                    onChange={props.onChangeNegatable}
                    tipType={ToolTip.TipType.ENTITY_NEGATABLE}
                />
            }
        </div>
    </div>
}

const Component: React.SFC<Props> = (props) => {
    return <Modal
        isOpen={props.open}
        isBlocking={false}
        containerClassName="cl-modal cl-modal--medium"
    >
        <div data-testid="entity-creator-modal" className={`cl-modal_header ${OF.FontClassNames.xxLarge}`}>
            {props.title}
        </div>
        <div className="cl-modal_body">
            {props.isEditing
                ? (
                    <div>
                        <OF.Pivot linkSize={OF.PivotLinkSize.large}>
                            <OF.PivotItem
                                linkText={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_PIVOT_EDIT)}
                            >
                                <EditComponent {...props} />
                            </OF.PivotItem>
                            <OF.PivotItem
                                ariaLabel={ToolTip.TipType.ENTITY_ACTION_REQUIRED}
                                linkText={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_PIVOT_REQUIREDFOR)}
                                onRenderItemLink={(
                                    pivotItemProps: OF.IPivotItemProps,
                                    defaultRender: (link: OF.IPivotItemProps) => JSX.Element) =>
                                    ToolTip.onRenderPivotItem(pivotItemProps, defaultRender)}
                            >
                                <ActionDetailsList
                                    actions={props.requiredActions}
                                    onSelectAction={() => { }}
                                />
                            </OF.PivotItem>
                            <OF.PivotItem
                                ariaLabel={ToolTip.TipType.ENTITY_ACTION_DISQUALIFIED}
                                linkText={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_PIVOT_DISQUALIFIEDACTIONS)}
                                onRenderItemLink={(
                                    pivotItemProps: OF.IPivotItemProps,
                                    defaultRender: (link: OF.IPivotItemProps) => JSX.Element) =>
                                    ToolTip.onRenderPivotItem(pivotItemProps, defaultRender)}
                            >
                                <ActionDetailsList
                                    actions={props.disqualifiedActions}
                                    onSelectAction={() => { }}
                                />
                            </OF.PivotItem>
                        </OF.Pivot>
                    </div >
                )
                : <EditComponent {...props} />}
        </div >
        <div className="cl-modal_footer cl-modal-buttons">
            <div className="cl-modal-buttons_secondary">
                {props.isEditing && 
                    <OF.DefaultButton
                        onClick={props.onClickTrainDialogs}
                        disabled={!props.isSaveButtonDisabled} // Disable so user doesn't lose work if clicked
                        iconProps={{ iconName: 'QueryList' }}
                        ariaDescription={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_TRAINDIALOGSBUTTON_ARIADESCRIPTION)}
                        text={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_TRAINDIALOGSBUTTON_TEXT)}
                    />
                }
            </div>
            <div className="cl-modal-buttons_primary">
                <OF.PrimaryButton
                    data-testid="entity-creator-button-save"
                    disabled={props.isSaveButtonDisabled}
                    onClick={props.onClickSaveCreate}
                    ariaDescription={props.isEditing
                        ? Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_SAVEBUTTON_ARIADESCRIPTION)
                        : Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_CREATEBUTTON_ARIADESCRIPTION)}
                    text={props.isEditing
                        ? Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_SAVEBUTTON_TEXT)
                        : Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_CREATEBUTTON_TEXT)}
                    iconProps={{ iconName: 'Accept' }}
                />

                <OF.DefaultButton
                    data-testid="entity-button-cancel"
                    onClick={props.onClickCancel}
                    ariaDescription={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_CANCELBUTTON_ARIADESCRIPTION)}
                    text={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_CANCELBUTTON_TEXT)}
                    iconProps={{ iconName: 'Cancel' }}
                />

                {props.showDelete &&
                    <OF.DefaultButton
                        data-testid="entity-button-delete"
                        className="cl-button-delete"
                        onClick={props.onClickDelete}
                        ariaDescription={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_DELETEBUTTON_ARIADESCRIPTION)}
                        text={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_DELETEBUTTON_TEXT)}
                        iconProps={{ iconName: 'Delete' }}
                    />}
            </div>

        </div>
        <ConfirmCancelModal
            open={props.isConfirmDeleteModalOpen}
            onCancel={props.onCancelDelete}
            onConfirm={props.onConfirmDelete}
            title={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_CONFIRM_DELETE_TITLE)}
            message={() => props.showValidationWarning &&
                <div className={`${OF.FontClassNames.medium} cl-text--warning`}>
                    <OF.Icon iconName="Warning" className="cl-icon" /> Warning:&nbsp;
                    <FormattedMessageId id={FM.ENTITYCREATOREDITOR_CONFIRM_DELETE_WARNING} />
                </div>}
        />
        <ConfirmCancelModal
            open={props.isConfirmEditModalOpen}
            onCancel={props.onCancelEdit}
            onConfirm={props.onConfirmEdit}
            title={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_CONFIRM_EDIT_TITLE)}
            message={() => <div className={`${OF.FontClassNames.medium} cl-text--warning`}>
                <OF.Icon iconName="Warning" className="cl-icon" /> Warning:&nbsp;
                <FormattedMessageId id={FM.ENTITYCREATOREDITOR_CONFIRM_EDIT_WARNING} />
            </div>}
        />
        <ConfirmCancelModal
            open={props.needPrebuiltWarning != null && !props.isConfirmEditModalOpen}
            onOk={props.onClosePrebuiltWarning}
            title={props.needPrebuiltWarning || ""}
            message={() => <FormattedMessageId id={FM.ENTITYCREATOREDITOR_PREBUILT_WARNING} />}
        />
        <ConfirmCancelModal
            open={props.isDeleteErrorModalOpen}
            onCancel={props.onCancelDelete}
            title={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_DELETE_ERROR_TITLE)}
            message={() => <div className={`${OF.FontClassNames.medium} cl-text--error`}>
                <OF.Icon iconName="Error" className="cl-icon" /> Error:&nbsp;
                <FormattedMessageId id={FM.ENTITYCREATOREDITOR_DELETE_ERROR_WARNING} />
            </div>}
        />
        <ConfirmCancelModal
            open={props.deleteEnumCheck != null}
            onCancel={props.onCancelEnumDelete}
            onConfirm={props.onConfirmEnumDelete}
            title={Util.formatMessageId(props.intl, FM.ENTITYCREATOREDITOR_DELETE_ENUM_ERROR_TITLE)}
            message={() => <div className={`${OF.FontClassNames.medium} cl-text--error`}>
                <OF.Icon iconName="Warning" className="cl-icon" />
                <FormattedMessageId id={FM.ENTITYCREATOREDITOR_DELETE_ENUM_ERROR_WARNING} />
            </div>}
        />
    </Modal >
}

function setFocused(ref: OF.TextField) {
    if (ref) ref.focus()
}

export default Component