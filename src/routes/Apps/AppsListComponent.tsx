/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { AppCreator as AppCreatorModal, TutorialImporterModal, ConfirmCancelModal } from '../../components/modals'
import * as OF from 'office-ui-fabric-react';
import { AppBase, AppDefinition } from '@conversationlearner/models'
import FormattedMessageId from '../../components/FormattedMessageId'
import { InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import * as util from '../../Utils/util'
import { User, AppCreatorType } from '../../types';
import * as moment from 'moment'

export interface ISortableRenderableColumn extends OF.IColumn {
    render: (app: AppBase, props: Props) => JSX.Element
    getSortValue: (app: AppBase) => number | string
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
            render: (app, props) => <span className={OF.FontClassNames.mediumPlus}><OF.Link onClick={() => props.onClickApp(app)} data-testid="model-list-model-name">{app.appName}</OF.Link></span>
        },
        {
            key: 'isEditing',
            name: 'Editing',
            fieldName: 'isEditing',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            getSortValue: app => (app.metadata.isLoggingOn !== false) ? 'a' : 'b',
            render: (app, props) => {
                const editPackage = props.activeApps[app.appId]
                let tag = 'Master'
                if (editPackage && editPackage !== app.devPackageId) {
                    const packageReference = app.packageVersions.find(pv => pv.packageId === editPackage)
                    if (packageReference) {
                        tag = packageReference.packageVersion
                    }
                }

                return <span className={OF.FontClassNames.mediumPlus} data-testid="model-list-is-editing">{tag}</span>;
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
                const packageReference = util.packageReferences(app).find(pv => pv.packageId === app.livePackageId)
                if (!packageReference) {
                    throw new Error(`Could not find package reference by id: ${app.livePackageId}`)
                }
                const tag = packageReference.packageVersion
                return <span className={OF.FontClassNames.mediumPlus} data-testid="model-list-is-live">{tag}</span>
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
            render: (app) => <OF.Icon iconName={(app.metadata.isLoggingOn !== false) ? "CheckMark" : "Remove"} className="cl-icon" data-testid="model-list-is-logging-on" />
        },
        {
            key: 'lastModifiedDateTime',
            name: intl.formatMessage({
                id: FM.APPSLIST_COLUMNS_LAST_MODIFIED_DATE_TIME,
                defaultMessage: 'Last Modified'
            }),
            fieldName: 'lastModifiedDateTime',
            minWidth: 100,
            maxWidth: 100,
            isResizable: false,
            getSortValue: app => moment(app.lastModifiedDateTime).format(`YYYYMMDDHHmmSS`),
            render: app => <span className={OF.FontClassNames.mediumPlus} data-testid="model-list-last-modified-time">{moment(app.lastModifiedDateTime).format('L')}</span>
        },
        {
            key: 'createdDateTime',
            name: intl.formatMessage({
                id: FM.APPSLIST_COLUMNS_CREATED_DATE_TIME,
                defaultMessage: 'Created'
            }),
            fieldName: 'createdDateTime',
            minWidth: 100,
            maxWidth: 100,
            isResizable: false,
            getSortValue: app => moment(app.createdDateTime).format(`YYYYMMDDHHmmSS`),
            render: app => <span className={OF.FontClassNames.mediumPlus} data-testid="model-list-created-date-time">{moment(app.createdDateTime).format('L')}</span>
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
            render: app => <span className={OF.FontClassNames.mediumPlus} data-testid="model-list-locale">{app.locale}</span>
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
            render: (app, props) => <a onClick={() => props.onClickDeleteApp(app)} data-testid="model-list-delete-button"><OF.Icon iconName="Delete" className="cl-icon" />&nbsp;&nbsp;</a>
        }
    ]
}

interface Props extends InjectedIntlProps {
    user: User
    apps: AppBase[]
    activeApps: { [appId: string]: string }
    onClickApp: (app: AppBase) => void
    onClickDeleteApp: (app: AppBase) => void

    isAppCreateModalOpen: boolean
    onSubmitAppCreateModal: (app: AppBase, source: AppDefinition | undefined) => void
    onCancelAppCreateModal: () => void
    appCreatorType: AppCreatorType

    isConfirmDeleteAppModalOpen: boolean
    onCancelDeleteModal: () => void
    onConfirmDeleteApp: () => void
    appToDelete: AppBase | null

    onClickCreateNewApp: () => void
    onClickImportApp: () => void
    onClickImportDemoApps: () => void

    isImportTutorialsOpen: boolean
    tutorials: AppBase[]
    onCloseImportNotification: () => void
    onImportTutorial: (tutorial: AppBase) => void
}

interface ComponentState {
    columns: ISortableRenderableColumn[]
    sortColumn: ISortableRenderableColumn
}

const ifStringReturnLowerCase = (s: string | number) => {
    return (typeof s === "string") ? s.toLowerCase() : s
}

export class Component extends React.Component<Props, ComponentState> {
    constructor(props: Props) {
        super(props)

        const columns = getColumns(this.props.intl)
        const defaultSortColumnName = "appName"
        const defaultSortColumn = columns.find(c => c.key === defaultSortColumnName)
        if (!defaultSortColumn) {
            throw new Error(`Could not find column by name: ${defaultSortColumnName}`)
        }

        columns.map(col => { col.isSorted = false; col.isSortedDescending = false })
        this.state = {
            columns,
            sortColumn: defaultSortColumn
        }
    }

    getSortedApplications(sortColumn: ISortableRenderableColumn, apps: AppBase[]): AppBase[] {
        let sortedApps = apps
        if (sortColumn) {
            // Sort the items.
            sortedApps = apps.concat([]).sort((a, b) => {
                const firstValue = ifStringReturnLowerCase(sortColumn.getSortValue(a))
                const secondValue = ifStringReturnLowerCase(sortColumn.getSortValue(b))

                if (sortColumn.isSortedDescending) {
                    return firstValue > secondValue ? -1 : 1;
                } else {
                    return firstValue > secondValue ? 1 : -1;
                }
            });
        }

        return sortedApps;
    }

    onClickColumnHeader = (event: any, column: ISortableRenderableColumn) => {
        let { columns } = this.state;
        this.setState({
            columns: columns.map(col => {
                col.isSorted = false;
                if (col.key === column.key) {
                    col.isSorted = true;
                    col.isSortedDescending = !col.isSortedDescending;
                }
                return col;
            }),
            sortColumn: column
        });
    }

    render() {
        const props = this.props
        const apps = this.getSortedApplications(this.state.sortColumn, props.apps);

        return <div className="cl-page">
            <span className={OF.FontClassNames.mediumPlus}>
                <FormattedMessageId id={FM.APPSLIST_SUBTITLE} />
            </span>
            <div className="cl-buttons-row">
                <OF.PrimaryButton
                    data-testid="model-list-create-new-button"
                    onClick={props.onClickCreateNewApp}
                    ariaDescription={props.intl.formatMessage({
                        id: FM.APPSLIST_CREATEBUTTONARIADESCRIPTION,
                        defaultMessage: 'Create a New Model'
                    })}
                    text={props.intl.formatMessage({
                        id: FM.APPSLIST_CREATEBUTTONTEXT,
                        defaultMessage: 'New Model'
                    })}
                />
                <OF.DefaultButton
                    data-testid="model-list-import-model-button"
                    onClick={props.onClickImportApp}
                    ariaDescription={props.intl.formatMessage({
                        id: FM.APPSLIST_IMPORTAPP_BUTTONARIADESCRIPTION,
                        defaultMessage: 'Import Model'
                    })}
                    text={props.intl.formatMessage({
                        id: FM.APPSLIST_IMPORTAPP_BUTTONTEXT,
                        defaultMessage: 'Import Model'
                    })}
                />
                {!util.isDemoAccount(props.user.id) &&
                    <OF.DefaultButton
                        data-testid="model-list-import-tutorials-button"
                        onClick={props.onClickImportDemoApps}
                        ariaDescription={props.intl.formatMessage({
                            id: FM.APPSLIST_IMPORTTUTORIALS_BUTTONARIADESCRIPTION,
                            defaultMessage: 'Import Demo Applicaitons'
                        })}
                        text={props.intl.formatMessage({
                            id: FM.APPSLIST_IMPORTTUTORIALS_BUTTONTEXT,
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
                onRenderItemColumn={(app, i, column: ISortableRenderableColumn) => column.render(app, props)}
                onColumnHeaderClick={this.onClickColumnHeader}
            />
            <AppCreatorModal
                open={props.isAppCreateModalOpen}
                onSubmit={props.onSubmitAppCreateModal}
                onCancel={props.onCancelAppCreateModal}
                creatorType={props.appCreatorType}
            />
            <ConfirmCancelModal
                open={props.isConfirmDeleteAppModalOpen}
                onCancel={props.onCancelDeleteModal}
                onConfirm={props.onConfirmDeleteApp}
                title={props.intl.formatMessage({
                    id: FM.APPSLIST_CONFIRMCANCELMODALTITLE,
                    defaultMessage: 'Are you sure you want to delete this model? {appName}'
                }, {
                        appName: props.appToDelete ? props.appToDelete.appName : ''
                    })}
            />
            <TutorialImporterModal
                open={props.isImportTutorialsOpen}
                apps={props.apps}
                tutorials={props.tutorials}
                handleClose={props.onCloseImportNotification}
                onTutorialSelected={props.onImportTutorial}
            />
        </div>
    }
}

export default Component