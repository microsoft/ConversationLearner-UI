import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class BLISAppsHomepage extends Component {
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
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, null)(BLISAppsHomepage);
