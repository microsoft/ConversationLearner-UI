/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as Util from '../../Utils/util'
import * as DialogUtils from '../../Utils/dialogUtils'
import * as OF from 'office-ui-fabric-react'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './MergeModal.css'

interface ReceivedProps {
    onCancel: Function
    onMerge: Function
    open: boolean
    trainDialog1: CLM.TrainDialog | null,
    trainDialog2: CLM.TrainDialog | null,
}

type Props = ReceivedProps & InjectedIntlProps

const ConfirmCancelModal: React.SFC<Props> = (props: Props) => {

    if (!props.trainDialog1 || !props.trainDialog2) {
        return null
    }

    const { intl } = props
    const onDismiss = props.onCancel || props.onMerge
    if (!onDismiss) {
        throw new Error("Must have cancel or ok callback")
    }
    return (
        <Modal
            containerClassName='cl-modal cl-modal--small'
            isOpen={props.open}
            isBlocking={true}
        >
            <div className='cl-modal_header'>
                <span className={OF.FontClassNames.xxLarge}>
                    {Util.formatMessageId(intl, FM.MERGE_TITLE)}
                </span>
            </div>
            <div>
                <div>
                    {Util.formatMessageId(intl, FM.MERGE_BODY1)}
                </div>
                <div>
                    {Util.formatMessageId(intl, FM.MERGE_BODY2)}
                </div>
                <div>
                    {Util.formatMessageId(intl, FM.MERGE_BODY3)}
                </div>
                <div className="cl-merge-box">
                    {DialogUtils.trainDialogRenderDescription(props.trainDialog1)}
                    {DialogUtils.trainDialogRenderTags(props.trainDialog1)}
                </div>
                <div className="cl-merge-box">
                    {DialogUtils.trainDialogRenderDescription(props.trainDialog2)}
                    {DialogUtils.trainDialogRenderTags(props.trainDialog2)}
                </div>
            </div>

            <OF.DialogFooter>
                <OF.PrimaryButton
                    onClick={() => {
                        if (props.onMerge) {
                            props.onMerge()
                        }
                    }}
                    text={Util.formatMessageId(intl, FM.MERGE_BUTTON_MERGE)}
                    iconProps={{ iconName: 'Accept' }}
                    data-testid="confirm-cancel-modal-ok"
                />
                <OF.DefaultButton
                    onClick={() => {
                        if (props.onCancel) {
                            props.onCancel()
                        }
                    }}
                    text={Util.formatMessageId(intl, FM.BUTTON_CANCEL)}
                    iconProps={{ iconName: 'Cancel' }}
                    data-testid="confirm-cancel-modal-cancel"
                />
            </OF.DialogFooter>
        </Modal>
    )
}
export default injectIntl(ConfirmCancelModal)