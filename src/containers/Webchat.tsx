import * as React from 'react';
import { toggleTrainDialog } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState } from '../types';
import { Chat } from 'botframework-webchat'

class Webchat extends React.Component<any, any> {
    render() {
        return (
            <div className="container">
                <span className="ms-font-su goldText">WEBCHAT</span>
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        toggleTrainDialog: toggleTrainDialog
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Webchat as React.ComponentClass<any>);