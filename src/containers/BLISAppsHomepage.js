import React, { Component } from 'react';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchTrainDialogs } from '../actions/fetch';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGround from './TrainingGround';
class BLISAppsHomepage extends Component {
    componentDidMount() {
        this.props.fetchAllActions();
        this.props.fetchAllEntities();
        this.props.fetchApplications();
        this.props.fetchTrainDialogs();
    }
    render() {
        console.log(this.props.blisApps)
        return (
            <div className='cont'>
                <span className="ms-font-su dummyText">My Apps</span>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        fetchApplications: fetchApplications,
        fetchAllActions: fetchAllActions,
        fetchAllEntities: fetchAllEntities,
        fetchTrainDialogs: fetchTrainDialogs
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BLISAppsHomepage);