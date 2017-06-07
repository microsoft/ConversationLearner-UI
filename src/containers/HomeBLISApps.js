import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class HomeBLISApps extends Component {
    render() {
        return (
            <div>
                BLIS Apps
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        apps: state.apps
    }
}
export default connect(mapStateToProps, null)(HomeBLISApps);
