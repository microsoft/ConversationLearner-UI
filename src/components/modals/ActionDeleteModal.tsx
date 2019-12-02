/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Utils from '../../Utils/util'
import HelpIcon from '../HelpIcon'
import { ChoiceGroupOptionWithTestId } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { TipType } from '../ToolTips/ToolTips'
import './ActionDeleteModal.css'

// Renaming from Props because of https://github.com/Microsoft/tslint-microsoft-contrib/issues/339
interface ReceivedProps {
    onConfirm: (removePlaceholders: boolean) => void
    onCancel: (removePlaceholders?: boolean) => void
    open: boolean
    title: string
    message?: () => React.ReactNode
}

type Props = ReceivedProps & InjectedIntlProps

const deleteOptions: ChoiceGroupOptionWithTestId[] = [
    {
        key: 'A',
        text: 'Preserve Placeholders (Default)',
        'data-testid': 'action-modal-delete-type-a',
    },
    {
        key: 'B',
        text: 'Remove Placeholders',
        'data-testid': 'action-modal-delete-type-b',
    },
]
const defaultDeleteTypeKey = deleteOptions[0].key

const ConfirmCancelModal: React.FC<Props> = (props) => {
    const { intl } = props
    const onDismiss = props.onCancel

    const [deleteTypeKey, setDeleteTypeKey] = React.useState(defaultDeleteTypeKey)

    const onChangeDeleteType = React.useCallback((event: React.FormEvent<HTMLInputElement>, option: OF.IChoiceGroupOption) => {
        setDeleteTypeKey(option.key)
    }, []);
    React.useLayoutEffect(() => {
        if (props.open) {
            if (deleteTypeKey !== defaultDeleteTypeKey) {
                setDeleteTypeKey(defaultDeleteTypeKey)
            }
        }
    }, [props.open])

    return (
        <OF.Dialog
            hidden={!props.open}
            onDismiss={() => onDismiss(deleteTypeKey !== defaultDeleteTypeKey)}
            dialogContentProps={{
                type: OF.DialogType.normal,
                title: props.title
            }}
            modalProps={{
                isBlocking: false
            }}
        >
            {typeof props.message === 'function' && props.message()}
            <div className="cl-action-delete-modal__option" data-testid="action-delete-type">
                <OF.Label className="cl-label">Delete Type
                    <HelpIcon tipType={TipType.ACTION_DELETE_INUSE} />
                </OF.Label>
                <OF.ChoiceGroup
                    selectedKey={deleteTypeKey}
                    options={deleteOptions}
                    onChange={onChangeDeleteType}
                    label={undefined}
                    required={true}
                    disabled={typeof props.message !== 'function'}
                />
            </div>

            <OF.DialogFooter>
                <OF.PrimaryButton
                    onClick={() => props.onConfirm(deleteTypeKey !== defaultDeleteTypeKey)}
                    text={Utils.formatMessageId(intl, FM.CONFIRMCANCELMODAL_PRIMARYBUTTON_TEXT)}
                    iconProps={{ iconName: 'Accept' }}
                    data-testid="action-delete-confirm"
                />
                <OF.DefaultButton
                    onClick={() => props.onCancel()}
                    text={Utils.formatMessageId(intl, FM.CONFIRMCANCELMODAL_DEFAULTBUTTON_TEXT)}
                    iconProps={{ iconName: 'Cancel' }}
                    data-testid="confirm-cancel-modal-cancel"
                />
            </OF.DialogFooter>
        </OF.Dialog>
    )
}

export default injectIntl(ConfirmCancelModal)