/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { AppCreator as AppCreatorModal, TutorialImporterModal } from '../../components/modals'
import * as OF from 'office-ui-fabric-react';
import { AppBase, AppDefinition } from '@conversationlearner/models'
import FormattedMessageId from '../../components/FormattedMessageId'
import { InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import * as Util from '../../Utils/util'
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
            name: Util.formatMessageId(intl, FM.APPSLIST_COLUMN_NAME),
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
                const packageReference = Util.packageReferences(app).find(pv => pv.packageId === app.livePackageId)
                if (!packageReference) {
                    throw new Error(`Could not find package reference by id: ${app.livePackageId}`)
                }
                const tag = packageReference.packageVersion
                return <span className={OF.FontClassNames.mediumPlus} data-testid="model-list-is-live">{tag}</span>
            }
        },
        {
            key: 'isLoggingOn',
            name: Util.formatMessageId(intl, FM.APPSLIST_COLUMNS_LOGGING),
            fieldName: 'isloggingon',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            getSortValue: app => (app.metadata.isLoggingOn !== false) ? 'a' : 'b',
            render: (app) => <OF.Icon iconName={(app.metadata.isLoggingOn !== false) ? "CheckMark" : "Remove"} className="cl-icon" data-testid="model-list-is-logging-on" />
        },
        {
            key: 'lastModifiedDateTime',
            name: Util.formatMessageId(intl, FM.APPSLIST_COLUMNS_LAST_MODIFIED_DATE_TIME),
            fieldName: 'lastModifiedDateTime',
            minWidth: 100,
            maxWidth: 100,
            isResizable: false,
            getSortValue: app => moment(app.lastModifiedDateTime).format(`YYYYMMDDHHmmSS`),
            render: app => <span className={OF.FontClassNames.mediumPlus} data-testid="model-list-last-modified-time">{Util.earlierDateOrTimeToday(app.lastModifiedDateTime)}</span>
        },
        {
            key: 'createdDateTime',
            name: Util.formatMessageId(intl, FM.APPSLIST_COLUMNS_CREATED_DATE_TIME),
            fieldName: 'createdDateTime',
            minWidth: 100,
            maxWidth: 100,
            isResizable: false,
            getSortValue: app => moment(app.createdDateTime).format(`YYYYMMDDHHmmSS`),
            render: app => <span className={OF.FontClassNames.mediumPlus} data-testid="model-list-created-date-time">{Util.earlierDateOrTimeToday(app.createdDateTime)}</span>
        },
        {
            key: 'locale',
            name: Util.formatMessageId(intl, FM.APPSLIST_COLUMNS_LOCALE),
            fieldName: 'locale',
            minWidth: 100,
            maxWidth: 100,
            isResizable: false,
            getSortValue: app => app.locale,
            render: app => <span className={OF.FontClassNames.mediumPlus} data-testid="model-list-locale">{app.locale}</span>
        },
    ]
}

interface Props extends InjectedIntlProps {
    user: User
    apps: AppBase[]
    activeApps: { [appId: string]: string }
    onClickApp: (app: AppBase) => void

    isAppCreateModalOpen: boolean
    onSubmitAppCreateModal: (app: AppBase, source: AppDefinition | undefined) => void
    onCancelAppCreateModal: () => void
    appCreatorType: AppCreatorType

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
            <span className={OF.FontClassNames.mediumPlus} data-testid="model-list-title">
                <FormattedMessageId id={FM.APPSLIST_SUBTITLE} />
            </span>
            <div className="cl-buttons-row">
                <OF.PrimaryButton
                    data-testid="model-list-create-new-button"
                    onClick={props.onClickCreateNewApp}
                    ariaDescription={Util.formatMessageId(props.intl, FM.APPSLIST_CREATEBUTTONARIADESCRIPTION)}
                    text={Util.formatMessageId(props.intl, FM.APPSLIST_CREATEBUTTONTEXT)}
                />
                <OF.DefaultButton
                    data-testid="model-list-import-model-button"
                    onClick={props.onClickImportApp}
                    ariaDescription={Util.formatMessageId(props.intl, FM.APPSLIST_IMPORTAPP_BUTTONARIADESCRIPTION)}
                    text={Util.formatMessageId(props.intl, FM.APPSLIST_IMPORTAPP_BUTTONTEXT)}
                />
                {!Util.isDemoAccount(props.user.id) &&
                    <OF.DefaultButton
                        data-testid="model-list-import-tutorials-button"
                        onClick={props.onClickImportDemoApps}
                        ariaDescription={Util.formatMessageId(props.intl, FM.APPSLIST_IMPORTTUTORIALS_BUTTONARIADESCRIPTION)}
                        text={Util.formatMessageId(props.intl, FM.APPSLIST_IMPORTTUTORIALS_BUTTONTEXT)}
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