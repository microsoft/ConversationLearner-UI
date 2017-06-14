import React, { Component } from 'react';
import { createBLISApplication } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
class AppSettings extends React.Component<any, any> {
    render() {
        return (
            <div>
                <TrainingGroundArenaHeader title="Settings" description="Control your application versions, who has access to it and whether it is public or private...."/>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        createBLISApplication: createBLISApplication,
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(AppSettings);