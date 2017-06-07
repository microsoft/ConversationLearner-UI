import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class HomeTrainDialogs extends Component {
    render() {
        return (
            <div>
                TrainDialogs
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, null)(HomeTrainDialogs);