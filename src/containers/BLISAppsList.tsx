import * as React from 'react';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchAllTrainDialogs, fetchAllChatSessions, fetchAllTeachSessions } from '../actions/fetchActions';
import { setCurrentBLISApp, setDisplayMode } from '../actions/updateActions';
import { deleteBLISApplication } from '../actions/deleteActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BLISAppCreator from './BLISAppCreator'
import AppAdmin from './AppAdmin';
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn } from 'office-ui-fabric-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { State } from '../types';
import { BlisAppBase, BlisAppList, BlisAppMetaData } from 'blis-models'
import { DisplayMode } from '../types/const'


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
            appIDToDelete: null,
            columns: columns,
            sortColumn : null
        }
    }
    deleteApp() {
        let blisAppToDelete: BlisAppBase = this.props.blisApps.all.find((app: BlisAppBase) => app.appId == this.state.appIDToDelete);
        this.props.deleteBLISApplication(this.props.user.key, this.state.appIDToDelete, blisAppToDelete);
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
        this.props.setCurrentBLISApp(this.props.user.key, appSelected);
        this.props.fetchAllActions(this.props.user.key, appSelected.appId);
        this.props.fetchAllEntities(this.props.user.key, appSelected.appId);
        this.props.fetchAllTrainDialogs(this.props.user.key, appSelected.appId);
        this.props.fetchAllChatSessions(this.props.user.key, appSelected.appId);
        // this.props.fetchAllTeachSessions(this.props.user.key, appSelected.appId);
    }
    onColumnClick(event: any, column : any) {
        let { sortedItems, columns } = this.state;
        let isSortedDescending = column.isSortedDescending;

        // If we've sorted this column, flip it.
        if (column.isSorted) {
            isSortedDescending = !isSortedDescending;
        }

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map((col: any) => {
                col.isSorted = (col.key === column.key);

                if (col.isSorted) {
                col.isSortedDescending = isSortedDescending;
                }

                return col;
            }),
            sortColumn : column
        });
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
     renderAppItems(): BlisAppBase[] {
        let filteredApps = this.props.blisApps.all || [];

        if (this.state.sortColumn)
        {
            // Sort the items.
            filteredApps = filteredApps.concat([]).sort((a: any, b: any) => {
                let firstValue = this.getValue(a, this.state.sortColumn);
                let secondValue = this.getValue(b, this.state.sortColumn);

                if (this.state.sortColumn.isSortedDescending) {
                    return firstValue > secondValue ? -1 : 1;
                } 
                else {
                    return firstValue > secondValue ? 1 : -1;
                }
            });
        }

        return filteredApps;
    }
    getValue(entity: any, col: IColumn) : any
    {
        let value;
        if(col.key == 'bots') {
            value = entity.metadata.bots;
        }
        else {
            value = entity[col.fieldName];
        }

        if (typeof value == 'string' || value instanceof String) {
            return value.toLowerCase();
        }
        return value;
    }

    render() {
        let apps = this.renderAppItems();
        return (
            <div className='content'>
                <span className="ms-font-su myAppsHeaderContentBlock">My Apps</span>
                <span className="ms-font-m-plus myAppsHeaderContentBlock">Create and Manage your BLIS applications...</span>
                <div className="myAppsHeaderContentBlock myAppsButtonsDiv">
                    <BLISAppCreator />
                </div>
                <DetailsList
                    className="ms-font-m-plus"
                    items={apps}
                    columns={this.state.columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn}
                    onColumnHeaderClick={ this.onColumnClick.bind(this) }
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
        setDisplayMode: setDisplayMode,
        deleteBLISApplication: deleteBLISApplication,
        fetchAllChatSessions: fetchAllChatSessions,
        fetchAllTeachSessions: fetchAllTeachSessions
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BLISAppsList);