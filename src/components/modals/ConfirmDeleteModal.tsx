import * as React from 'react';
import { PrimaryButton, DefaultButton, Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react';

export interface Props {
    onConfirm: Function;
    onCancel: Function;
    open: boolean;
    title: string;
}

const ConfirmDeleteModal: React.SFC<Props> = (props: Props) => {
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
                <PrimaryButton onClick={() => props.onConfirm()} text='Confirm' />
                <DefaultButton onClick={() => props.onCancel()} text='Cancel' />
            </DialogFooter>
        </Dialog>
    )
}
export default ConfirmDeleteModal;