/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { PrimaryButton, DefaultButton, Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react';
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FontClassNames } from 'office-ui-fabric-react'

interface ReceivedProps {
    onConfirm: Function;
    onCancel: Function;
    open: boolean;
    title: string;
    warning?: string;
}

type Props = ReceivedProps & InjectedIntlProps

const ConfirmCancelModal: React.SFC<Props> = (props: Props) => {
    const { intl } = props
    return (
        <Dialog
            hidden={!props.open}
            onDismiss={() => props.onCancel()}
            dialogContentProps={{
                type: DialogType.normal,
                title: props.title
            }}
            modalProps={{
                isBlocking: false
            }}
        >
            {props.warning && 
                (
                    <div className="cl-errorpanel" >
                        <div className={FontClassNames.medium}>{props.warning}</div>
                    </div>
                )}
            <DialogFooter>
                {props.onConfirm &&
                    <PrimaryButton
                        onClick={() => props.onConfirm()}
                        text={intl.formatMessage({
                            id: FM.CONFIRMCANCELMODAL_PRIMARYBUTTON_TEXT,
                            defaultMessage: 'Confirm'
                        })}
                    />
                }
                <DefaultButton
                    onClick={() => props.onCancel()}
                    text={intl.formatMessage({
                        id: FM.CONFIRMCANCELMODAL_DEFAULTBUTTON_TEXT,
                        defaultMessage: 'Cancel'
                    })}
                />
            </DialogFooter>
        </Dialog>
    )
}
export default injectIntl(ConfirmCancelModal)