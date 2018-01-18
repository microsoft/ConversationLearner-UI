import * as React from 'react';
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { AppCreator, ConfirmDeleteModal } from '../../components/modals'
import * as OF from 'office-ui-fabric-react';
import { State } from '../../types';
import { BlisAppBase } from 'blis-models'
import { injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { FM } from '../../react-intl-messages'

interface ISortableRenderableColumn extends OF.IColumn {
    render: (app: BlisAppBase, component: AppsList) => JSX.Element
    getSortValue: (app: BlisAppBase, component: AppsList) => number | string
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
            key: 'bots',
            name: intl.formatMessage({
                id: FM.APPSLIST_COLUMNS_LINKEDBOTS,
                defaultMessage: 'Linked Bots'
            }),
            fieldName: 'metadata',
            minWidth: 100,
            maxWidth: 100,
            isResizable: false,
            getSortValue: app => app.metadata.botFrameworkApps.length,
            render: app => <span className={OF.FontClassNames.mediumPlus}>{app.metadata.botFrameworkApps.length}</span>
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
            render: (app, component) => <a onClick={() => component.onClickDeleteApp(app)}><OF.Icon iconName="Delete"/>&nbsp;&nbsp;</a>
        },
    ]
}

interface ComponentState {
    isAppCreateModalOpen: boolean
    isConfirmDeleteAppModalOpen: boolean
    appToDelete: BlisAppBase
    columns: ISortableRenderableColumn[]
    sortColumn: ISortableRenderableColumn
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
            appToDelete: null,
            columns,
            sortColumn: defaultSortColumn
        }
    }

    onConfirmDeleteModal() {
        this.props.onClickDeleteApp(this.state.appToDelete)
        this.setState({
            isConfirmDeleteAppModalOpen: false,
            appToDelete: null,
        })
    }

    onCancelDeleteModal() {
        this.setState({
            isConfirmDeleteAppModalOpen: false,
            appToDelete: null
        })
    }

    onClickCreateNewApp = () => {
        this.setState({
            isAppCreateModalOpen: true
        })
    }
    onClickDeleteApp(app: BlisAppBase) {
        this.setState({
            isConfirmDeleteAppModalOpen: true,
            appToDelete: app
        })
    }
    onClickApp(app: BlisAppBase) {
        const { match, history } = this.props
        history.push(`${match.url}/${app.appId}`, { app })
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

    onSubmitAppCreateModal = (app: BlisAppBase) => {
        this.setState({
            isAppCreateModalOpen: false
        })
        this.props.onCreateApp(app)
    }

    onCancelAppCreateModal = () => {
        this.setState({
            isAppCreateModalOpen: false
        })
    }

    getSortedApplications(): BlisAppBase[] {
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
            <div className="blis-page">
                <span className={OF.FontClassNames.superLarge}>
                    <FormattedMessage
                        id={FM.APPSLIST_TITLE}
                        defaultMessage="My Apps"
                    />
                </span>
                <span className={OF.FontClassNames.mediumPlus}>
                    <FormattedMessage
                        id={FM.APPSLIST_SUBTITLE}
                        defaultMessage="Create and Manage your BLIS applications..."
                    />
                </span>
                <div>
                    <OF.PrimaryButton
                        onClick={() => this.onClickCreateNewApp()}
                        ariaDescription={this.props.intl.formatMessage({
                            id: FM.APPSLIST_CREATEBUTTONARIADESCRIPTION,
                            defaultMessage: 'Create a New Application'
                        })}
                        text={this.props.intl.formatMessage({
                            id: FM.APPSLIST_CREATEBUTTONTEXT,
                            defaultMessage: 'New App'
                        })}
                    />
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
                <ConfirmDeleteModal
                    open={this.state.isConfirmDeleteAppModalOpen}
                    onCancel={() => this.onCancelDeleteModal()}
                    onConfirm={() => this.onConfirmDeleteModal()}
                    title={this.props.intl.formatMessage({
                        id: FM.APPSLIST_CONFIRMDELETEMODALTITLE,
                        defaultMessage: 'Are you sure you want to delete this application?'
                    })}
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
    }
}

export interface ReceivedProps {
    apps: BlisAppBase[]
    onCreateApp: (app: BlisAppBase) => void
    onClickDeleteApp: (app: BlisAppBase) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(AppsList)))