import React, { Component } from 'react';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchTrainDialogs } from '../actions/fetch';
import { setCurrentBLISApp } from '../actions/update';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGround from './TrainingGround';
import { DetailsList, CommandButton } from 'office-ui-fabric-react';
let columns = [
    {
        key: 'column1',
        name: 'App Name',
        fieldName: 'appName',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'column2',
        name: 'Model ID',
        fieldName: 'modelID',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'column3',
        name: 'Actions',
        fieldName: 'actions',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
];
class BLISAppsHomepage extends Component {
    componentDidMount() {
        this.props.fetchAllActions();
        this.props.fetchAllEntities();
        this.props.fetchApplications();
        this.props.fetchTrainDialogs();
    }
    BLISAppSelected() {
        this.props.setCurrentBLISApp(this.props.blisApps.all[1])
    }
    render() {
        let allApps = this.props.blisApps.all;
        return (
            <div className='cont'>
                <span className="ms-font-su myAppsContentBlock">My Apps</span>
                <span className="ms-font-m-plus myAppsContentBlock">Create and Manage your BLIS applications...</span>
                <div className="myAppsContentBlock myAppsButtonsDiv">
                    <CommandButton
                        data-automation-id='randomID'
                        disabled={false}
                        className='goldButton'
                        ariaDescription='Create a New Application'
                        text='New App'
                        />
                </div>
                    <DetailsList
                        className="ms-font-m-plus"
                        items={allApps}
                        columns={columns}
                    />
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