import React, { Component } from 'react';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchTrainDialogs } from '../actions/fetch';
import { setCurrentBLISApp } from '../actions/update';
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
    BLISAppSelected(){
        this.props.setCurrentBLISApp(this.props.blisApps.all[1])
    }
    render() {
        return (
            <div className='cont'>
                <span className="ms-font-su dummyText">My Apps</span>
                <button onClick={() => this.BLISAppSelected()} />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        fetchApplications: fetchApplications,
        fetchAllActions: fetchAllActions,
        fetchAllEntities: fetchAllEntities,
        fetchTrainDialogs: fetchTrainDialogs,
        setCurrentBLISApp: setCurrentBLISApp
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BLISAppsHomepage);