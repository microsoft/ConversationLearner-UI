/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchTutorialsThunkAsync } from '../../actions/fetchActions'
import { AppCreator, ConfirmCancelModal } from '../../components/modals'
import * as OF from 'office-ui-fabric-react';
import { State } from '../../types';
import { AppBase } from '@conversationlearner/models'
import { CL_IMPORT_ID, CL_DEMO_ID } from '../../types/const'
import { injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { FM } from '../../react-intl-messages'
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import * as util from '../../util'
import TutorialImporter from '../../components/modals/TutorialImporter';

interface ISortableRenderableColumn extends OF.IColumn {
    render: (app: AppBase, component: AppsList) => JSX.Element
    getSortValue: (app: AppBase, component: AppsList) => number | string
}

function getColumns(intl: InjectedIntl): ISortableRenderableColumn[] {
    return [
        {
            key: 'appName',
            name: intl.formatMessage({
                id: FM.APPSLIST_COLUMN_NAME,
                defaultMessage: 'Name'
            }),
            fieldName: 'appName',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            getSortValue: app => app.appName,
            render: (app, component) => <span className={OF.FontClassNames.mediumPlus}><OF.Link onClick={() => component.onClickApp(app)}>{app.appName}</OF.Link></span>
        },
        {
            key: 'isEditing',
            name: 'Editing',
            fieldName: 'isEditing',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            getSortValue: app => (app.metadata.isLoggingOn !== false) ? 'a' : 'b',
            render: (app, component) => {
                const editPackage = component.props.activeApps[app.appId];
                const tag = (!editPackage || editPackage === app.devPackageId) ? 
                    'Master' :
                    app.packageVersions.find(pv => pv.packageId === editPackage).packageVersion;
                return <span className={OF.FontClassNames.mediumPlus}>{tag}</span>;
            }
        },
        {
            key: 'isLive',
            name: 'Live Tag',
            fieldName: 'isLive',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            getSortValue: app => (app.metadata.isLoggingOn !== false) ? 'a' : 'b',
            render: (app) => {
                const tag = util.packageReferences(app).find(pv => pv.packageId === app.livePackageId).packageVersion;
                return <span className={OF.FontClassNames.mediumPlus}>{tag}</span>;
            }
        },        
        {
            key: 'isLoggingOn',
            name: intl.formatMessage({
                id: FM.APPSLIST_COLUMNS_LOGGING,
                defaultMessage: 'Logging Enabled'
            }),
            fieldName: 'isloggingon',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            getSortValue: app => (app.metadata.isLoggingOn !== false) ? 'a' : 'b',
            render: (app) => <OF.Icon iconName={(app.metadata.isLoggingOn !== false) ? "CheckMark" : "Remove"} className="cl-icon" />
        },
        {
            key: 'locale',
            name: intl.formatMessage({
                id: FM.APPSLIST_COLUMNS_LOCALE,
                defaultMessage: 'Locale'
            }),
            fieldName: 'locale',
            minWidth: 100,
            maxWidth: 100,
            isResizable: false,
            getSortValue: app => app.locale,
            render: app => <span className={OF.FontClassNames.mediumPlus}>{app.locale}</span>
        },
        {
            key: 'actions',
            name: intl.formatMessage({
                id: FM.APPSLIST_COLUMNS_ACTIONS,
                defaultMessage: 'Actions'
            }),
            fieldName: 'appId',
            minWidth: 100,
            maxWidth: 100,
            isResizable: false,
            getSortValue: app => 0,
            render: (app, component) => <a onClick={() => component.onClickDeleteApp(app)}><OF.Icon iconName="Delete" className="cl-icon" />&nbsp;&nbsp;</a>
        },
    ]
}

interface ComponentState {
    isAppCreateModalOpen: boolean
    isConfirmDeleteAppModalOpen: boolean
    isImportTutorialsOpen: boolean
    appToDelete: AppBase
    columns: ISortableRenderableColumn[]
    sortColumn: ISortableRenderableColumn
    tutorials: AppBase[]
}

const ifStringReturnLowerCase = (s: string | number) => {
    return (typeof s === "string") ? s.toLowerCase() : s
}

class AppsList extends React.Component<Props, ComponentState> {
    constructor(props: Props) {
        super(props)

        const columns = getColumns(this.props.intl)
        const defaultSortColumn = columns.find(c => c.key === "appName")
        defaultSortColumn.isSorted = true

        this.state = {
            isAppCreateModalOpen: false,
            isConfirmDeleteAppModalOpen: false,
            isImportTutorialsOpen: false,
            appToDelete: null,
            columns,
            sortColumn: defaultSortColumn,
            tutorials: null
        }
    }

    @autobind
    onConfirmDeleteApp() {
        this.props.onClickDeleteApp(this.state.appToDelete)
        this.setState({
            isConfirmDeleteAppModalOpen: false,
            appToDelete: null,
        })
    }

    @autobind
    onCancelDeleteModal() {
        this.setState({
            isConfirmDeleteAppModalOpen: false,
            appToDelete: null
        })
    }

    @autobind
    onClickCreateNewApp() {
        this.setState({
            isAppCreateModalOpen: true
        })
    }

    @autobind
    onClickImportDemoApps() {
        if (this.state.tutorials === null) {
            ((this.props.fetchTutorialsThunkAsync(CL_IMPORT_ID) as any) as Promise<AppBase[]>)
            .then(tutorials => {
                this.setState({
                    tutorials: tutorials,
                    isImportTutorialsOpen: true
                })
            })
            .catch(error => {
                console.warn(`Error when attempting get tutorials: `, error)
            })
        }
        else {
            this.setState({
                isImportTutorialsOpen: true
            })
        }
    }

    onClickDeleteApp(app: AppBase) {
        this.setState({
            isConfirmDeleteAppModalOpen: true,
            appToDelete: app
        })
    }
    onClickApp(app: AppBase) {
        const { match, history } = this.props
        history.push(`${match.url}/${app.appId}`, { app })
    }

    @autobind
    onCloseImportNotification() {
        this.setState({
            isImportTutorialsOpen: false
        })
    }

    onColumnClick = (event: any, column: ISortableRenderableColumn) => {
        let { columns } = this.state;
        let isSortedDescending = column.isSortedDescending;

        // If we've sorted this column, flip it.
        if (column.isSorted) {
            isSortedDescending = !isSortedDescending;
        }

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map(col => {
                col.isSorted = (col.key === column.key);

                if (col.isSorted) {
                    col.isSortedDescending = isSortedDescending;
                }

                return col;
            }),
            sortColumn: column
        });
    }

    onSubmitAppCreateModal = (app: AppBase) => {
        this.setState({
            isAppCreateModalOpen: false
        }, () => this.props.onCreateApp(app))
    }

    onCancelAppCreateModal = () => {
        this.setState({
            isAppCreateModalOpen: false
        })
    }

    getSortedApplications(): AppBase[] {
        let sortedApps = this.props.apps

        if (this.state.sortColumn) {
            // Sort the items.
            sortedApps = sortedApps.concat([]).sort((a, b) => {
                let firstValue = ifStringReturnLowerCase(this.state.sortColumn.getSortValue(a, this))
                let secondValue = ifStringReturnLowerCase(this.state.sortColumn.getSortValue(b, this))

                if (this.state.sortColumn.isSortedDescending) {
                    return firstValue > secondValue ? -1 : 1;
                } else {
                    return firstValue > secondValue ? 1 : -1;
                }
            });
        }

        return sortedApps;
    }

    render() {
        let apps = this.getSortedApplications();
        return (
            <div className="cl-page">
                <span className={OF.FontClassNames.mediumPlus}>
                    <FormattedMessage
                        id={FM.APPSLIST_SUBTITLE}
                        defaultMessage="Create and Manage your Conversation Learner applications..."
                    />
                </span>
                <div className="cl-modal-buttons_primary">
                    <OF.PrimaryButton
                        onClick={this.onClickCreateNewApp}
                        ariaDescription={this.props.intl.formatMessage({
                            id: FM.APPSLIST_CREATEBUTTONARIADESCRIPTION,
                            defaultMessage: 'Create a New Application'
                        })}
                        text={this.props.intl.formatMessage({
                            id: FM.APPSLIST_CREATEBUTTONTEXT,
                            defaultMessage: 'New App'
                        })}
                    />
                    {this.props.user.id !== CL_DEMO_ID &&
                        <OF.DefaultButton
                            onClick={this.onClickImportDemoApps}
                            ariaDescription={this.props.intl.formatMessage({
                                id: FM.APPSLIST_IMPORTBUTTONARIADESCRIPTION,
                                defaultMessage: 'Import Demo Applicaitons'
                            })}
                            text={this.props.intl.formatMessage({
                                id: FM.APPSLIST_IMPORTBUTTONTEXT,
                                defaultMessage: 'Import Tutorials'
                            })}
                        />
                    }  
                </div>
                <OF.DetailsList
                    className={OF.FontClassNames.mediumPlus}
                    items={apps}
                    columns={this.state.columns}
                    checkboxVisibility={OF.CheckboxVisibility.hidden}
                    onRenderItemColumn={(app, i, column: ISortableRenderableColumn) => column.render(app, this)}
                    onColumnHeaderClick={this.onColumnClick}
                />
                <AppCreator
                    open={this.state.isAppCreateModalOpen}
                    onSubmit={this.onSubmitAppCreateModal}
                    onCancel={this.onCancelAppCreateModal}
                />
                <ConfirmCancelModal
                    open={this.state.isConfirmDeleteAppModalOpen}
                    onCancel={this.onCancelDeleteModal}
                    onConfirm={this.onConfirmDeleteApp}
                    title={this.props.intl.formatMessage({
                        id: FM.APPSLIST_CONFIRMCANCELMODALTITLE,
                        defaultMessage: 'Are you sure you want to delete this application? {appName}'
                    }, {
                        appName: this.state.appToDelete ? this.state.appToDelete.appName : ''
                    })}
                />
                <TutorialImporter
                    open={this.state.isImportTutorialsOpen}
                    apps={this.props.apps}
                    tutorials={this.state.tutorials}
                    handleClose={this.onCloseImportNotification}
                    onTutorialSelected={(tutorial) => this.props.onImportTutorial(tutorial)}
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchTutorialsThunkAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        activeApps: state.apps.activeApps
    }
}

export interface ReceivedProps {
    apps: AppBase[]
    onCreateApp: (app: AppBase) => void
    onClickDeleteApp: (app: AppBase) => void
    onImportTutorial: (tutorial: AppBase) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(AppsList)))