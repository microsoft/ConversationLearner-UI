import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import axios from 'axios';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { State } from '../types'

class SpinnerWindow extends React.Component<Props, any> {
    /* Tool for debugging a stuck spinner
        <div>
            {this.props.displaySpinner.join("\n\n")}
        </div>
    */
    render() {
        return (
            <div>
                <Modal
                    isOpen={this.props.displaySpinner.length > 0}
                    isBlocking={true}
                    containerClassName='spinnerBox'>
                    <Spinner size={ SpinnerSize.large } />
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = (state: State) => {
    return {
        displaySpinner: state.display.displaySpinner
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
type Props = typeof stateProps;

export default connect(mapStateToProps, null)(SpinnerWindow);