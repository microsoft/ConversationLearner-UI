import * as React from 'react';
import { PrimaryButton, DefaultButton, Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react';
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface ReceivedProps {
    onConfirm: Function;
    onCancel: Function;
    open: boolean;
    title: string;
}

type Props = ReceivedProps & InjectedIntlProps

const ConfirmDeleteModal: React.SFC<Props> = (props: Props) => {
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
            <DialogFooter>
                <PrimaryButton
                    onClick={() => props.onConfirm()}
                    text={intl.formatMessage({
                        id: FM.CONFIRMDELETEMODAL_PRIMARYBUTTON_TEXT,
                        defaultMessage: 'Confirm'
                    })}
                />
                <DefaultButton
                    onClick={() => props.onCancel()}
                    text={intl.formatMessage({
                        id: FM.CONFIRMDELETEMODAL_DEFAULTBUTTON_TEXT,
                        defaultMessage: 'Cancel'
                    })}
                />
            </DialogFooter>
        </Dialog>
    )
}
export default injectIntl(ConfirmDeleteModal)