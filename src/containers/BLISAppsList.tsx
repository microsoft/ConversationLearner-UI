import * as React from 'react';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchAllTrainDialogs, fetchAllChatSessions } from '../actions/fetchActions';
import { setCurrentBLISApp, setBLISAppDisplay } from '../actions/updateActions';
import { deleteBLISApplication } from '../actions/deleteActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BLISAppCreator from './BLISAppCreator'
import TrainingGround from './TrainingGround';
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn } from 'office-ui-fabric-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { State } from '../types';
import { BlisAppBase, BlisAppList, BlisAppMetaData } from 'blis-models'

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
        key: 'bots',
        name: 'Linked Bots',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'actions',
        name: 'Actions',
        fieldName: 'appId',
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
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.state = {
            confirmDeleteAppModalOpen: false,
            appIDToDelete: null
        }
    }
    deleteApp() {
        let blisAppToDelete: BlisAppBase = this.props.blisApps.all.find((app: BlisAppBase) => app.appId == this.state.appIDToDelete);
        this.props.deleteBLISApplication(this.props.userKey, this.state.appIDToDelete, blisAppToDelete);
        this.setState({
            confirmDeleteAppModalOpen: false,
            appIDToDelete: null,
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
    BLISAppSelected(appName: string) {
        let appSelected = this.props.blisApps.all.find((app: BlisAppBase) => app.appName == appName);
        this.props.setCurrentBLISApp(this.props.userKey, appSelected);
        this.props.fetchAllActions(this.props.userKey, appSelected.appId);
        this.props.fetchAllEntities(this.props.userKey, appSelected.appId);
        this.props.fetchAllTrainDialogs(this.props.userKey, appSelected.appId);
        this.props.fetchAllChatSessions(this.props.userKey, appSelected.appId);
        this.props.setBLISAppDisplay("TrainingGround");
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'appName':
                return <span className='ms-font-m-plus'><Link onClick={() => this.BLISAppSelected(fieldContent)}>{fieldContent}</Link></span>;
            case 'bots':
                let botsCount = fieldContent? fieldContent.botFrameworkApps.length : 0;
                return <span className='ms-font-m-plus'>{botsCount}</span>;
            case 'actions':
                return (
                    <div>
                        <a onClick={() => this.openDeleteModal(fieldContent)}><span className="ms-Icon ms-Icon--Delete"></span>&nbsp;&nbsp;</a>
                    </div>
                )
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    render() {
        let allApps = this.props.blisApps.all || [];
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
                <ConfirmDeleteModal open={this.state.confirmDeleteAppModalOpen} onCancel={() => this.handleCloseModal()} onConfirm={() => this.deleteApp()} title="Are you sure you want to delete this application?" />
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
        deleteBLISApplication: deleteBLISApplication,
        fetchAllChatSessions: fetchAllChatSessions
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        userKey: state.user.key,
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BLISAppsList);