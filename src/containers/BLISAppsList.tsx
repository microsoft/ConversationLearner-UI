import * as React from 'react';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchAllTrainDialogs } from '../actions/fetch';
import { setCurrentBLISApp, setBLISAppDisplay } from '../actions/update';
import { deleteBLISApplication } from '../actions/delete'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BLISAppCreator from './BLISAppCreator'
import TrainingGround from './TrainingGround';
import { BLISApplication } from '../models/Application';
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn } from 'office-ui-fabric-react';
import ConfirmationModal from '../components/ConfirmationModal';

let columns: IColumn[] = [
    {
        key: 'appName',
        name: 'App Name',
        fieldName: 'appName',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'luisKey',
        name: 'LUIS Key',
        fieldName: 'luisKey',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'locale',
        name: 'Locale',
        fieldName: 'locale',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'actions',
        name: 'Actions',
        fieldName: 'modelID',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
];
class BLISAppsList extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.renderItemColumn = this.renderItemColumn.bind(this);
        this.BLISAppSelected = this.BLISAppSelected.bind(this);
        this.deleteApp = this.deleteApp.bind(this);
        this.editApp = this.editApp.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.state = {
            confirmDeleteAppModalOpen: false,
            appIDToDelete: null
        }
    }
    deleteApp() {
        this.props.deleteBLISApplication(this.state.appIDToDelete)
        this.setState({
            confirmDeleteAppModalOpen: false,
            appIDToDelete: null
        })

    }
    handleCloseModal() {
        this.setState({
            confirmDeleteAppModalOpen: false,
            appIDToDelete: null
        })
    }
    openDeleteModal(guid: string) {
        this.setState({
            confirmDeleteAppModalOpen: true,
            appIDToDelete: guid
        })
    }
    editApp(GUID: string) {
        //do something
    }
    BLISAppSelected(appName: string) {
        let appSelected = this.props.blisApps.all.find((app: BLISApplication) => app.appName == appName);
        this.props.setCurrentBLISApp(appSelected);
        this.props.fetchAllActions(appSelected.modelID);
        this.props.fetchAllEntities(appSelected.modelID);
        this.props.fetchAllTrainDialogs(appSelected.modelID);
        this.props.setBLISAppDisplay("TrainingGround");
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'appName':
                return <span className='ms-font-m-plus'><Link onClick={() => this.BLISAppSelected(fieldContent)}>{fieldContent}</Link></span>;
            case 'actions':
                return (
                    <div>
                        <a onClick={() => this.openDeleteModal(fieldContent)}><span className="ms-Icon ms-Icon--Delete"></span>&nbsp;&nbsp;</a>
                        <a onClick={() => this.editApp(fieldContent)}><span className="ms-Icon ms-Icon--Edit"></span></a>
                    </div>
                )
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    render() {
        let allApps = this.props.blisApps.all;
        return (
            <div className='content'>
                <span className="ms-font-su myAppsHeaderContentBlock">My Apps</span>
                <span className="ms-font-m-plus myAppsHeaderContentBlock">Create and Manage your BLIS applications...</span>
                <div className="myAppsHeaderContentBlock myAppsButtonsDiv">
                    <BLISAppCreator />
                </div>
                <DetailsList
                    className="ms-font-m-plus"
                    items={allApps}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn}
                />
                <ConfirmationModal open={this.state.confirmDeleteAppModalOpen} onCancel={() => this.handleCloseModal()} onConfirm={() => this.deleteApp()} title="Are you sure you want to delete this application?" />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchApplications: fetchApplications,
        fetchAllActions: fetchAllActions,
        fetchAllEntities: fetchAllEntities,
        fetchAllTrainDialogs: fetchAllTrainDialogs,
        setCurrentBLISApp: setCurrentBLISApp,
        setBLISAppDisplay: setBLISAppDisplay,
        deleteBLISApplication: deleteBLISApplication
    }, dispatch);
}
const mapStateToProps = (state: any) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BLISAppsList);