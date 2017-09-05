import * as React from 'react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton } from 'office-ui-fabric-react';

export interface Props {
    onConfirm: Function;
    open: boolean;
    title: string;
}

const PopUpMessage: React.SFC<Props> = (props: Props) => {
    return (
        <Modal
            isOpen={props.open}
            isBlocking={false}
            containerClassName='createModal'
        >
            <div className='modalHeader'>
                <span className='ms-font-xl ms-fontWeight-semilight'>{props.title}</span>
            </div>
            <div className='modalFooter'>
                <CommandButton
                    disabled={false}
                    onClick={() => props.onConfirm()}
                    className='goldButton'
                    ariaDescription='Ok'
                    text='Ok'
                />
            </div>
        </Modal>
    )
}
export default PopUpMessage;