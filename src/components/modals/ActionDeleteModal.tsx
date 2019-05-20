/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import { FM } from '../../react-intl-messages'
import { formatMessageId } from '../../Utils/util'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './ConfirmCancelModal.css'

// Renaming from Props because of https://github.com/Microsoft/tslint-microsoft-contrib/issues/339
interface ReceivedProps {
    onConfirm: (removePlaceholders: boolean) => void
    onCancel: (removePlaceholders?: boolean) => void
    open: boolean
    title: string
    message?: () => React.ReactNode
}

type Props = ReceivedProps & InjectedIntlProps

const ConfirmCancelModal: React.FC<Props> = (props) => {
    const { intl } = props
    const onDismiss = props.onCancel

    const [deleteType, setDeleteType] = React.useState(false)
    const onChangeDeleteType = React.useCallback((key) => {
        key === 'A'
            ? setDeleteType(false)
            : setDeleteType(true)
    }, []);
    React.useLayoutEffect(() => {
        if (props.open) {
            setDeleteType(false)
        }
    }, [props.open])
    React.useEffect(() => console.log(`deleteType: `, deleteType), [deleteType])

    return (
        <OF.Dialog
            hidden={!props.open}
            onDismiss={() => onDismiss(deleteType)}
            dialogContentProps={{
                type: OF.DialogType.normal,
                title: props.title
            }}
            modalProps={{
                isBlocking: false
            }}
        >
            {typeof props.message === 'function' && props.message()}
            <div className="cl-confirm-cancel_option" data-testid="confirm-cancel-option">
                <OF.ChoiceGroup
                    className="defaultChoiceGroup"
                    defaultSelectedKey="A"
                    options={[
                        {
                            key: 'A',
                            text: 'Keep Placeholders (Default)',
                        },
                        {
                            key: 'B',
                            text: 'Remove placeholders'
                        },
                    ]}
                    onChange={onChangeDeleteType}
                    label="Pick one"
                    required={true}
                />
            </div>

            <OF.DialogFooter>
                {props.onConfirm &&
                    <OF.PrimaryButton
                        onClick={() => props.onConfirm(deleteType)}
                        text={formatMessageId(intl, FM.CONFIRMCANCELMODAL_PRIMARYBUTTON_TEXT)}
                        iconProps={{ iconName: 'Accept' }}
                        data-testid="confirm-cancel-modal-accept"
                    />
                }
                {props.onCancel &&
                    <OF.DefaultButton
                        onClick={() => {
                            if (props.onCancel) {
                                props.onCancel()
                            }
                        }}
                        text={formatMessageId(intl, FM.CONFIRMCANCELMODAL_DEFAULTBUTTON_TEXT)}
                        iconProps={{ iconName: 'Cancel' }}
                        data-testid="confirm-cancel-modal-cancel"
                    />
                }
            </OF.DialogFooter>
        </OF.Dialog>
    )
}

export default injectIntl(ConfirmCancelModal)