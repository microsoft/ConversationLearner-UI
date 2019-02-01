/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { PrimaryButton, DefaultButton, Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react'
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
        <Dialog
            hidden={!props.open}
            onDismiss={() => onDismiss()}
            dialogContentProps={{
                type: DialogType.normal,
                title: props.title
            }}
            modalProps={{
                isBlocking: false
            }}
        >
            {typeof props.message === 'function' && props.message()}
            <DialogFooter>
                {props.onConfirm &&
                    <PrimaryButton
                        onClick={() => {
                            if (props.onConfirm) {
                                props.onConfirm()
                            }
                        }}
                        text={formatMessageId(intl, FM.CONFIRMCANCELMODAL_PRIMARYBUTTON_TEXT)}
                    />
                }
                {props.onCancel &&
                    <DefaultButton
                        onClick={() => {
                            if (props.onCancel) {
                                props.onCancel()
                            }
                        }}
                        text={formatMessageId(intl, FM.CONFIRMCANCELMODAL_DEFAULTBUTTON_TEXT)}
                    />
                }
                {props.onOk &&
                    <DefaultButton
                        onClick={() => {
                            if (props.onOk) {
                                props.onOk()
                            }
                        }}
                        text={formatMessageId(intl, FM.BUTTON_OK)}
                    />
                }
            </DialogFooter>
        </Dialog>
    )
}
export default injectIntl(ConfirmCancelModal)