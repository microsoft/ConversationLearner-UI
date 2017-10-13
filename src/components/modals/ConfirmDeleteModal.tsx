import * as React from 'react';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton } from 'office-ui-fabric-react';

export interface Props {
    onConfirm: Function;
    onCancel: Function;
    open: boolean;
    title: string;
}

const ConfirmDeleteModal: React.SFC<Props> = (props: Props) => {
    return (
        <Modal
            isOpen={props.open}
            isBlocking={false}
            containerClassName='blis-modal blis-modal--small blis-modal--border'
        >
            <div className='blis-modal_title'>
                <span className='ms-font-xl ms-fontWeight-semilight'>{props.title}</span>
            </div>
            <div className='blis-modal_buttonbox'>
                <CommandButton
                    onClick={() => props.onConfirm()}
                    className='blis-button--gold'
                    ariaDescription='Confirm'
                    text='Confirm'
                />
                <CommandButton
                    className="blis-button--gray"
                    onClick={() => props.onCancel()}
                    ariaDescription='Cancel'
                    text='Cancel'
                />
            </div>
        </Modal>
    )
}
export default ConfirmDeleteModal;