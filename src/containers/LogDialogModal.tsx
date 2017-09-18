import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { editEntityAsync } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CommandButton } from 'office-ui-fabric-react';
import { State } from '../types';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import Webchat from './Webchat'
import ChatSessionAdmin from './ChatSessionAdmin'

class LogDialogModal extends React.Component<Props, any> {
    render() {
        return (
            <div>
                <Modal
                    isOpen={this.props.open}
                    isBlocking={true}
                    containerClassName='modal modal--large'
                >
                    <div className='modal__main log-dialog'>
                        <div className="log-dialog__webchat">
                            WebChat
                            {/* <Webchat sessionType={"chat"} /> */}
                        </div>
                        <div className="log-dialog__admin">
                            <ChatSessionAdmin />
                        </div>
                        <div className="log-dialog__controls">
                            <CommandButton
                                data-automation-id='randomID3'
                                className="grayButton"
                                disabled={false}
                                onClick={() => this.props.onClose()}
                                ariaDescription='Close'
                                text='Close'
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: ReceivedProps) => {
    return {
    }
}

export interface ReceivedProps {
    open: boolean,
    onClose: Function
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect(mapStateToProps, mapDispatchToProps)(LogDialogModal);