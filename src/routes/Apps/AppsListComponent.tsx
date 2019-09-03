/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as moment from 'moment'
import * as CLM from '@conversationlearner/models'
import FormattedMessageId from '../../components/FormattedMessageId'
import { AppCreator as AppCreatorModal, TutorialImporterModal } from '../../components/modals'
import { InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import { User, AppCreatorType, FeatureStrings } from '../../types'
import { autobind } from 'core-decorators';
import { OBIImportData } from '../../Utils/obiUtils'
import DispatcherCreator, { DispatcherAlgorithmType } from 'src/components/modals/DispatcherCreator'

export interface ISortableRenderableColumn extends OF.IColumn {
    render: (app: CLM.AppBase, props: Props) => JSX.Element
    getSortValue: (app: CLM.AppBase) => number | string
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
            render: (app, props) => <span className={OF.FontClassNames.mediumPlus} data-testid="model-list-model-name" data-model-id={app.appId}>{app.appName}</span>
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
    apps: CLM.AppBase[]
    canImportOBI: boolean,
    activeApps: { [appId: string]: string }
    onClickApp: (app: CLM.AppBase) => void
    selection: OF.ISelection
    featuresString: string
    selectionCount: number

    isDispatcherCreateModalOpen: boolean
    isAppCreateModalOpen: boolean
    onSubmitAppCreateModal: (app: CLM.AppBase, source: CLM.AppDefinition | undefined) => void
    onCancelAppCreateModal: () => void
    appCreatorType: AppCreatorType

    onClickCreateNewApp: () => void
    onClickImportApp: () => void
    onClickImportDemoApps: () => void
    onClickCreateNewDispatcherModel: () => void

    onSubmitDispatcherCreateModal: (model: CLM.AppBase, algorithmType: DispatcherAlgorithmType) => void
    onCancelDispatcherCreateModal: () => void

    onClickImportOBI: () => void
    onSubmitImportOBI: (app: CLM.AppBase, obiImportData: OBIImportData) => void

    isImportTutorialsOpen: boolean
    tutorials: CLM.AppBase[]
    onCloseImportNotification: () => void
    onImportTutorial: (tutorial: CLM.AppBase) => void
}

interface ComponentState {
    columns: ISortableRenderableColumn[]
    sortColumn: ISortableRenderableColumn
}

const ifStringReturnLowerCase = (s: string | number) => {
    return (typeof s === "string") ? s.toLowerCase() : s
}

const getModelKey = (model: OF.IObjectWithKey) => (model as CLM.AppBase).appId

export class Component extends React.Component<Props, ComponentState> {
    constructor(props: Props) {
        super(props)

        const columns = getColumns(this.props.intl)
        const defaultSortColumnName = "appName"
        const defaultSortColumn = columns.find(c => c.key === defaultSortColumnName)
        if (!defaultSortColumn) {
            throw new Error(`Could not find column by name: ${defaultSortColumnName}`)
        }

        columns.forEach(col => {
            col.isSorted = false
            col.isSortedDescending = false

            if (col === defaultSortColumn) {
                col.isSorted = true
            }
        })

        this.state = {
            columns,
            sortColumn: defaultSortColumn
        }
    }

    @autobind
    onClickColumnHeader(event: React.MouseEvent<HTMLElement, MouseEvent>, clickedColumn: ISortableRenderableColumn) {
        const sortColumn = this.state.columns.find(c => c.key === clickedColumn.key)!
        const columns = this.state.columns.map(column => {
            column.isSorted = false
            column.isSortedDescending = false
            if (column === sortColumn) {
                column.isSorted = true
                column.isSortedDescending = !clickedColumn.isSortedDescending
            }
            return column
        })

        this.setState({
            columns,
            sortColumn,
        });
    }

    render() {
        const props = this.props
        const computedApps = this.getSortedApplications(this.state.sortColumn, this.props.apps)
        const isDispatcherFeaturesEnabled = this.props.featuresString.includes(FeatureStrings.DISPATCHER)

        return <div className="cl-o-app-columns">
            <div className="cl-app_content">
                <div className="cl-page">
                    <span className={OF.FontClassNames.xLarge} data-testid="model-list-title">
                        <FormattedMessageId id={FM.APPSLIST_SUBTITLE} />
                    </span>
                    <div className="cl-buttons-row">
                        <OF.PrimaryButton
                            data-testid="model-list-create-new-button"
                            onClick={props.onClickCreateNewApp}
                            ariaDescription={Util.formatMessageId(props.intl, FM.APPSLIST_CREATEBUTTONARIADESCRIPTION)}
                            text={Util.formatMessageId(props.intl, FM.APPSLIST_CREATEBUTTONTEXT)}
                            iconProps={{ iconName: 'Add' }}
                        />
                        <OF.DefaultButton
                            data-testid="model-list-import-model-button"
                            onClick={props.onClickImportApp}
                            ariaDescription={Util.formatMessageId(props.intl, FM.APPSLIST_IMPORTAPP_BUTTONARIADESCRIPTION)}
                            text={Util.formatMessageId(props.intl, FM.APPSLIST_IMPORTAPP_BUTTONTEXT)}
                            iconProps={{ iconName: 'DownloadDocument' }}
                        />

                        {!Util.isDemoAccount(props.user.id) &&
                            <OF.DefaultButton
                                data-testid="model-list-import-tutorials-button"
                                onClick={props.onClickImportDemoApps}
                                ariaDescription={Util.formatMessageId(props.intl, FM.APPSLIST_IMPORTTUTORIALS_BUTTONARIADESCRIPTION)}
                                text={Util.formatMessageId(props.intl, FM.APPSLIST_IMPORTTUTORIALS_BUTTONTEXT)}
                                iconProps={{ iconName: 'CloudDownload' }}
                            />
                        }
                        {this.props.canImportOBI &&
                            <OF.DefaultButton
                                onClick={props.onClickImportOBI}
                                ariaDescription={Util.formatMessageId(props.intl, FM.APPSLIST_IMPORTOBI_BUTTONARIADESCRIPTION)}
                                text={Util.formatMessageId(props.intl, FM.APPSLIST_IMPORTOBI_BUTTONTEXT)}
                                iconProps={{ iconName: 'CloudDownload' }}
                            />
                        }
                        {isDispatcherFeaturesEnabled
                            && (
                                <OF.DefaultButton
                                    data-testid="model-list-button-create-dispatcher"
                                    disabled={this.props.selectionCount < 2}
                                    onClick={props.onClickCreateNewDispatcherModel}
                                    ariaDescription={Util.formatMessageId(props.intl, FM.APPSLIST_CREATEDISPATCHER_BUTTONARIADESCRIPTION)}
                                    text={Util.formatMessageId(props.intl, FM.APPSLIST_CREATEDISPATCHER_BUTTONTEXT, { selectionCount: this.props.selectionCount })}
                                    iconProps={{ iconName: 'Add' }}
                                />
                            )}

                    </div>
                    {computedApps.length === 0
                        ? <div className="cl-page-placeholder">
                            <div className="cl-page-placeholder__content">
                                <div className={`cl-page-placeholder__description ${OF.FontClassNames.xxLarge}`}>{Util.formatMessageId(props.intl, FM.APPSLIST_EMPTY_TEXT)}</div>
                                <OF.PrimaryButton
                                    iconProps={{
                                        iconName: "Add"
                                    }}
                                    onClick={props.onClickCreateNewApp}
                                    ariaDescription={this.props.intl.formatMessage({
                                        id: FM.APPSLIST_CREATEBUTTONARIADESCRIPTION,
                                        defaultMessage: 'Create a New Model'
                                    })}
                                    text={this.props.intl.formatMessage({
                                        id: FM.APPSLIST_CREATEBUTTONTEXT,
                                        defaultMessage: 'Create a New Model'
                                    })}
                                />
                            </div>
                        </div>
                        : <OF.DetailsList
                            className={OF.FontClassNames.mediumPlus}
                            items={computedApps}
                            getKey={getModelKey}
                            setKey="selectionKey"
                            columns={this.state.columns}
                            selection={this.props.selection}
                            checkboxVisibility={isDispatcherFeaturesEnabled
                                ? OF.CheckboxVisibility.onHover
                                : OF.CheckboxVisibility.hidden}
                            onRenderRow={(myProps, defaultRender) => <div data-selection-invoke={true}>{defaultRender && defaultRender(myProps)}</div>}
                            onRenderItemColumn={(app, i, column: ISortableRenderableColumn) => column.render(app, props)}
                            onColumnHeaderClick={this.onClickColumnHeader}
                            onItemInvoked={app => this.props.onClickApp(app)}
                        />}
                    <AppCreatorModal
                        open={props.isAppCreateModalOpen}
                        onSubmit={props.onSubmitAppCreateModal}
                        onSubmitOBI={props.onSubmitImportOBI}
                        onCancel={props.onCancelAppCreateModal}
                        creatorType={props.appCreatorType}
                    />
                    <DispatcherCreator
                        open={props.isDispatcherCreateModalOpen}
                        onSubmit={props.onSubmitDispatcherCreateModal}
                        onCancel={props.onCancelDispatcherCreateModal}
                    />
                    <TutorialImporterModal
                        open={props.isImportTutorialsOpen}
                        apps={props.apps}
                        tutorials={props.tutorials}
                        handleClose={props.onCloseImportNotification}
                        onTutorialSelected={props.onImportTutorial}
                    />
                </div>
            </div>
        </div>
    }

    private getSortedApplications(sortColumn: ISortableRenderableColumn, apps: CLM.AppBase[]): CLM.AppBase[] {
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
}

export default Component