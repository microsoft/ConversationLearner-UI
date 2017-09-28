import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { fetchAllActionsAsync, fetchAllEntitiesAsync, fetchAllTrainDialogsAsync, fetchAllLogDialogsAsync, fetchAllChatSessionsAsync } from '../actions/fetchActions';
import { setCurrentBLISApp } from '../actions/displayActions';
import { deleteBLISApplicationAsync } from '../actions/deleteActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BLISAppCreator from './BLISAppCreator'
import { DetailsList, Link, CheckboxVisibility, IColumn } from 'office-ui-fabric-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { State } from '../types';
import { BlisAppBase } from 'blis-models'

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

interface ComponentState {
    confirmDeleteAppModalOpen: boolean,
    appIDToDelete: string
    columns: IColumn[]
    sortColumn: IColumn
}

class BLISAppsList extends React.Component<Props, ComponentState> {
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
            sortColumn: null
        }
    }
    deleteApp() {
        let blisAppToDelete: BlisAppBase = this.props.blisApps.all.find((app: BlisAppBase) => app.appId == this.state.appIDToDelete);
        this.props.deleteBLISApplicationAsync(this.props.user.key, this.state.appIDToDelete, blisAppToDelete);
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
        this.props.fetchAllActionsAsync(this.props.user.key, appSelected.appId);
        this.props.fetchAllEntitiesAsync(this.props.user.key, appSelected.appId);
        this.props.fetchAllTrainDialogsAsync(this.props.user.key, appSelected.appId);
        this.props.fetchAllLogDialogsAsync(this.props.user.key, appSelected.appId);
        this.props.fetchAllChatSessionsAsync(this.props.user.key, appSelected.appId);
        // this.props.fetchAllTeachSessions(this.props.user.key, appSelected.appId);
    }
    onColumnClick(event: any, column: any) {
        let { columns } = this.state;
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
            sortColumn: column
        });
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'appName':
                return <span className='ms-font-m-plus'><Link onClick={() => this.BLISAppSelected(fieldContent)}>{fieldContent}</Link></span>;
            case 'bots':
                let botsCount = fieldContent ? fieldContent.botFrameworkApps.length : 0;
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

        if (this.state.sortColumn) {
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
    getValue(entity: any, col: IColumn): any {
        let value;
        if (col.key == 'bots') {
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
                    onColumnHeaderClick={this.onColumnClick.bind(this)}
                />
                <ConfirmDeleteModal open={this.state.confirmDeleteAppModalOpen} onCancel={() => this.handleCloseModal()} onConfirm={() => this.deleteApp()} title="Are you sure you want to delete this application?" />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchAllActionsAsync,
        fetchAllEntitiesAsync,
        fetchAllTrainDialogsAsync,
        fetchAllLogDialogsAsync,
        setCurrentBLISApp,
        deleteBLISApplicationAsync,
        fetchAllChatSessionsAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        blisApps: state.apps
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(BLISAppsList);