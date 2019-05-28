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
    onConfirm?: (option: boolean) => void
    onCancel?: (option?: boolean) => void
    onOk?: (option: boolean) => void
    open: boolean
    title: string
    optionMessage?: string
    message?: () => React.ReactNode
}

type Props = ReceivedProps & InjectedIntlProps

const ConfirmCancelModal: React.FC<Props> = (props) => {
    const { intl } = props
    const onDismiss = props.onCancel || props.onOk
    if (!onDismiss) {
        throw new Error("Must have cancel or ok callback")
    }

    const [option, setOption] = React.useState(false)
    React.useLayoutEffect(() => {
        if (props.open) {
            setOption(false)
        }
    }, [props.open])

    return (
        <OF.Dialog
            hidden={!props.open}
            onDismiss={() => onDismiss(option)}
            dialogContentProps={{
                type: OF.DialogType.normal,
                title: props.title
            }}
            modalProps={{
                isBlocking: false
            }}
        >
            {typeof props.message === 'function' && props.message()}
            {props.optionMessage
                && (
                    <div className="cl-confirm-cancel_option" data-testid="confirm-cancel-option">
                        <OF.Checkbox
                            label={props.optionMessage}
                            checked={option}
                            onChange={() => setOption(o => !o)}
                        />
                    </div>
                )}
            <OF.DialogFooter>
                {props.onConfirm &&
                    <OF.PrimaryButton
                        onClick={() => {
                            if (props.onConfirm) {
                                props.onConfirm(option)
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
                                props.onOk(option)
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