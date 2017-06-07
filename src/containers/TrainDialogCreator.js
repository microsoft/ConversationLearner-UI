import React, { Component } from 'react';
import { createTrainDialog } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class TrainDialogCreator extends Component {
    render() {
        return (
            <div>
                TrainDialogCreator
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        createTrainDialog: createTrainDialog,
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TrainDialogCreator);