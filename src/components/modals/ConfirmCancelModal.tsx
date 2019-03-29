/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import { FM } from '../../react-intl-messages'
import { formatMessageId } from '../../Utils/util'
import { injectIntl, InjectedIntlProps } from 'react-intl'

// Renaming from Props because of https://github.com/Microsoft/tslint-microsoft-contrib/issues/339
interface ReceivedProps {
    onConfirm?: Function | null
    onCancel?: Function | null
    onOk?: Function | null
    open: boolean
    title: string
    message?: () => React.ReactNode
}

type Props = ReceivedProps & InjectedIntlProps

const ConfirmCancelModal: React.SFC<Props> = (props: Props) => {
    const { intl } = props
    const onDismiss = props.onCancel || props.onOk
    if (!onDismiss) {
        throw new Error("Must have cancel or ok callback")
    }
    return (
        <OF.Dialog
            hidden={!props.open}
            onDismiss={() => onDismiss()}
            dialogContentProps={{
                type: OF.DialogType.normal,
                title: props.title
            }}
            modalProps={{
                isBlocking: false
            }}
        >
            {typeof props.message === 'function' && props.message()}
            <OF.DialogFooter>
                {props.onConfirm &&
                    <OF.PrimaryButton
                        onClick={() => {
                            if (props.onConfirm) {
                                props.onConfirm()
                            }
                        }}
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
                {props.onOk &&
                    <OF.DefaultButton
                        onClick={() => {
                            if (props.onOk) {
                                props.onOk()
                            }
                        }}
                        text={formatMessageId(intl, FM.BUTTON_OK)}
                        iconProps={{ iconName: 'Accept' }}
                        data-testid="confirm-cancel-modal-ok"
                    />
                }
            </OF.DialogFooter>
        </OF.Dialog>
    )
}
export default injectIntl(ConfirmCancelModal)