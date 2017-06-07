import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class TrainDialogsHomepage extends Component {
    render() {
        return (
            <div>
                TrainDialogsHomepage
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, null)(TrainDialogsHomepage);