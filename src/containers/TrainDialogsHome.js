import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class TrainDialogsHome extends Component {
    render() {
        return (
            <div>
                TrainDialogsHome
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, null)(TrainDialogsHome);