import React, { Component } from 'react';
import { createTrainDialog } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class TrainDialogCreator extends React.Component<any, any> {
    render() {
        return (
            <div className='arenaText'>
                <span className="ms-font-su">TrainDialogCreator</span>
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