import * as React from 'react'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { PrimaryButton } from 'office-ui-fabric-react'

interface IProps {
    open: boolean
    close: () => void
    cancel: () => void
}

const component = (props: IProps) => (
    <Modal
        isOpen={props.open}
        onDismiss={() => props.cancel()}
        isBlocking={false}
        containerClassName='blis-modal blis-modal--large'
    >
        <header className="blis-modal__header">
            <h1>Lorem Ipsum</h1>
        </header>

        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas lorem nulla, malesuada ut sagittis sit amet, vulputate in leo. Maecenas vulputate congue sapien eu tincidunt. Etiam eu sem turpis. Fusce tempor sagittis nunc, ut interdum ipsum vestibulum non. Proin dolor elit, aliquam eget tincidunt non, vestibulum ut turpis. In hac habitasse platea dictumst. In a odio eget enim porttitor maximus. Aliquam nulla nibh, ullamcorper aliquam placerat eu, viverra et dui. Phasellus ex lectus, maximus in mollis ac, luctus vel eros. Vivamus ultrices, turpis sed malesuada gravida, eros ipsum venenatis elit, et volutpat eros dui et ante. Quisque ultricies mi nec leo ultricies mollis. Vivamus egestas volutpat lacinia. Quisque pharetra eleifend efficitur. </p>

        <footer className="blis-modal__footer">
            <PrimaryButton
                onClick={() => props.close()}
            >Close</PrimaryButton>
            <PrimaryButton
                onClick={() => props.cancel()}
            >Cancel</PrimaryButton>
        </footer>
    </Modal>
)

export default component