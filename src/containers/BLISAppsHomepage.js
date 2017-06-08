import React, { Component } from 'react';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchTrainDialogs } from '../actions/fetch';
import { setCurrentBLISApp } from '../actions/update';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGround from './TrainingGround';
import { DetailsList, CommandButton, Link } from 'office-ui-fabric-react';
let columns = [
    {
        key: 'appName',
        name: 'App Name',
        fieldName: 'appName',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'modelID',
        name: 'Model ID',
        fieldName: 'modelID',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'actions',
        name: 'Actions',
        fieldName: 'actions',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
];
class BLISAppsHomepage extends Component {
    constructor(p){
        super(p);
        this.renderItemColumn = this.renderItemColumn.bind(this);
        this.BLISAppSelected = this.BLISAppSelected.bind(this)
    }
    componentDidMount() {
        this.props.fetchAllActions();
        this.props.fetchAllEntities();
        this.props.fetchApplications();
        this.props.fetchTrainDialogs();
    }
    BLISAppSelected(appName) {
        let appSelected = this.props.blisApps.all.find(app => app.appName == appName);
        this.props.setCurrentBLISApp(appSelected)
    }
    renderItemColumn(item, index, column) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'appName':
                return <Link href='#' onClick={() => this.BLISAppSelected(fieldContent)}>{fieldContent}</Link>;
            case 'color':
                return <span data-selection-disabled={true} style={{ color: fieldContent }}>{fieldContent}</span>;

            default:
                return <span>{fieldContent}</span>;
        }
    }
    render() {
        let allApps = this.props.blisApps.all;
        return (
            <div className='content'>
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
                    onRenderItemColumn={this.renderItemColumn}
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