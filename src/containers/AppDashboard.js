import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class AppDashboard extends Component {
    render() {
        return (
            <div>
                AppDashboard
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, null)(AppDashboard);
