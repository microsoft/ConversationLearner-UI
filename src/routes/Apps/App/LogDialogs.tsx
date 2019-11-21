/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as Util from '../../../Utils/util'
import * as DialogUtils from '../../../Utils/dialogUtils'
import * as OF from 'office-ui-fabric-react'
import * as moment from 'moment'
import FormattedMessageId from '../../../components/FormattedMessageId'
import actionTypes from '../../../actions'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../../types'
import LogDialogEditor from '../../../components/LogDialogEditor'
import { EditDialogType } from '../../../types/const'
import { ChatSessionModal, ConfirmCancelModal } from '../../../components/modals'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../../react-intl-messages'
import { autobind } from 'core-decorators'

interface IRenderableColumn extends OF.IColumn {
    render: (logDialog: CLM.LogDialog, component: LogDialogs) => React.ReactNode
    getSortValue: (logDialog: CLM.LogDialog, component: LogDialogs) => string
}

const returnErrorStringWhenError = Util.returnStringWhenError("ERR")

function getTagName(logDialog: CLM.LogDialog, component: LogDialogs): string {
    // Only show tag column on Master branch it's the only one containing multiple tag types
    if (component.props.editingPackageId !== component.props.app.devPackageId) {
        return ''
    }
    let tagName = `UNKNOWN`; // Cover bug case of missing package
    if (logDialog.packageId === component.props.app.devPackageId) {
        tagName = 'Master'
    }
    else {
        const packageVersion = component.props.app.packageVersions.find((pv: any) => pv.packageId === logDialog.packageId);
        if (packageVersion) {
            tagName = packageVersion.packageVersion;
        }
    }
    return tagName;
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'version',
            name: Util.formatMessageId(intl, FM.LOGDIALOGS_MODEL_VERSION),
            fieldName: 'version',
            minWidth: 80,
            maxWidth: 120,
            isResizable: true,
            render: (logDialog, component) => {
                const tagName = getTagName(logDialog, component);
                return <span className={OF.FontClassNames.mediumPlus}>{tagName}</span>;
            },
            getSortValue: (logDialog, component) => {
                const tagName = getTagName(logDialog, component)
                return tagName ? tagName.toLowerCase() : ''
            }
        },
        {
            key: `description`,
            name: Util.formatMessageId(intl, FM.LOGDIALOGS_USERINPUT),
            fieldName: `description`,
            minWidth: 100,
            maxWidth: 1500,
            isResizable: true,
            render: (logDialog, component) => {
                return <>
                    <span className={OF.FontClassNames.mediumPlus} data-testid="log-dialogs-description">
                        {DialogUtils.dialogSampleInput(logDialog)}
                    </span>
                </>
            },
            getSortValue: logDialog => {
                return DialogUtils.dialogSampleInput(logDialog)
            }
        },
        {
            key: 'turns',
            name: Util.formatMessageId(intl, FM.LOGDIALOGS_TURNS),
            fieldName: 'dialog',
            minWidth: 50,
            maxWidth: 50,
            isResizable: false,
            render: logDialog => <span className={OF.FontClassNames.mediumPlus} data-testid="log-dialogs-turns">{logDialog.rounds.length}</span>,
            getSortValue: logDialog => logDialog.rounds.length.toString().padStart(4, '0')
        },
        {
            key: 'created',
            name: Util.formatMessageId(intl, FM.TRAINDIALOGS_CREATED_DATE_TIME),
            fieldName: 'created',
            minWidth: 100,
            isResizable: false,
            isSortedDescending: false,
            render: logDialog => <span className={OF.FontClassNames.mediumPlus}>{Util.earlierDateOrTimeToday(logDialog.createdDateTime)}</span>,
            getSortValue: logDialog => moment(logDialog.createdDateTime).valueOf().toString()
        }
    ]
}

const getDialogKey = (logDialog: OF.IObjectWithKey) => (logDialog as CLM.LogDialog).logDialogId

interface ComponentState {
    columns: IRenderableColumn[]
    sortColumn: IRenderableColumn
    chatSession: CLM.Session | null
    isConfirmDeleteModalOpen: boolean
    isChatSessionWindowOpen: boolean
    selectionCount: number
    // Currently selected LogDialog
    editingLogDialog: CLM.LogDialog | undefined
    // Is Dialog being edited a new one, a TrainDialog or a LogDialog
    editType: EditDialogType
    searchValue: string
    // Allows user to re-open modal for same row ()
    detailListKey: number
}

// TODO: This component is highly redundant with TrainDialogs.  Should collapse
class LogDialogs extends React.Component<Props, ComponentState> {
    newChatSessionButtonRef = React.createRef<OF.IButton>()
    state: ComponentState

    private selection: OF.ISelection = new OF.Selection({
        getKey: getDialogKey,
        onSelectionChanged: this.onSelectionChanged
    })

    constructor(props: Props) {
        super(props)
        const columns = getColumns(this.props.intl)
        const sortColumn = columns.find(c => c.key === 'created')
        if (!sortColumn) {
            throw new Error(`Cannot find initial sort column by key 'created'`)
        }
        columns.forEach(col => {
            col.isSorted = false
            col.isSortedDescending = false

            if (col === sortColumn) {
                col.isSorted = true
            }
        })

        this.state = {
            columns,
            sortColumn,
            chatSession: null,
            isConfirmDeleteModalOpen: false,
            isChatSessionWindowOpen: false,
            selectionCount: 0,
            editingLogDialog: undefined,
            editType: EditDialogType.LOG_ORIGINAL,
            searchValue: '',
            detailListKey: 0
        }
    }

    @autobind
    onSelectionChanged() {
        const selectionCount = this.selection.getSelectedCount()
        this.setState({ selectionCount })
    }

    sortLogDialogs(
        logDialogs: CLM.LogDialog[],
        columns: IRenderableColumn[],
        sortColumn: IRenderableColumn | undefined,
    ): CLM.LogDialog[] {
        // If column header not selected, no sorting needed, return items
        if (!sortColumn) {
            return logDialogs
        }

        return [...logDialogs]
            .sort((a, b) => {
                let firstValue = sortColumn.getSortValue(a, this)
                let secondValue = sortColumn.getSortValue(b, this)
                let compareValue = firstValue.localeCompare(secondValue)

                // If primary sort is the same do secondary sort on another column, to prevent sort jumping around
                if (compareValue === 0) {
                    const sortColumn2 = sortColumn !== columns[1]
                        ? columns[1]
                        : columns[2]
                    firstValue = sortColumn2.getSortValue(a, this)
                    secondValue = sortColumn2.getSortValue(b, this)
                    compareValue = firstValue.localeCompare(secondValue)
                }

                return sortColumn.isSortedDescending
                    ? compareValue
                    : compareValue * -1
            })
    }

    @autobind
    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        const sortColumn = this.state.columns.find(c => c.key === clickedColumn.key)!
        // Toggle isSortedDescending of clickedColumn and reset all other columns
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
        })
    }

    componentDidMount() {
        this.focusNewChatButton()
        this.handleQueryParameters(this.props.location.search)
    }

    componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        void this.handleQueryParameters(this.props.location.search, prevProps.location.search)
    }

    async handleQueryParameters(newSearch: string, oldSearch?: string): Promise<void> {

        const searchParams = new URLSearchParams(newSearch)
        const selectedDialogId = searchParams.get(DialogUtils.DialogQueryParams.id)

        // Check that I need to update
        if (oldSearch) {
            const searchParamsPrev = new URLSearchParams(oldSearch)
            const selectedDialogIdPrev = searchParamsPrev.get(DialogUtils.DialogQueryParams.id)
            if (selectedDialogId === selectedDialogIdPrev) {
                return
            }
        }

        // If dialog id is in query param and edit modal not open, open it
        if (selectedDialogId) {
            let logDialog = this.props.logDialogs.find(ld => ld.logDialogId === selectedDialogId)
            if (!logDialog) {
                // If log isn't loaded yet attempt to load it
                logDialog = await ((this.props.fetchLogDialogAsync(this.props.app.appId, selectedDialogId, true, true) as any) as Promise<CLM.LogDialog>)
                if (!logDialog) {
                    // Invalid log dialog, go back to LD list
                    this.props.history.replace(this.props.match.url, { app: this.props.app })
                    return
                }
            }
            await this.openLogDialog(logDialog)
        }
    }

    @autobind
    async onClickNewChatSession() {
        try {
            // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
            const chatSession = await ((this.props.createChatSessionThunkAsync(this.props.app.appId, this.props.editingPackageId, this.props.app.metadata.isLoggingOn !== false) as any) as Promise<CLM.Session>)
            this.setState({
                chatSession,
                isChatSessionWindowOpen: true,
                editType: EditDialogType.LOG_ORIGINAL
            })
        }
        catch (e) {
            const error = e as Error
            console.warn(`Error when attempting to opening chat window: `, error)
        }
    }

    @autobind
    onCloseChatSessionWindow() {
        this.setState({
            chatSession: null,
            isChatSessionWindowOpen: false,
            detailListKey: this.state.detailListKey + 1
        })
    }

    @autobind
    onCloseEditModal() {
        // Allows user to open same log dialog row a second time in a row
        this.setState({
            detailListKey: this.state.detailListKey + 1,
        })
    }

    @autobind
    onChangeSearchString(event?: React.ChangeEvent<HTMLInputElement>, newValue?: string) {
        if (newValue === undefined) {
            return
        }

        this.onSearch(newValue)
    }

    @autobind
    onSearch(newValue: string) {
        const lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }

    @autobind
    async onClickLogDialogItem(logDialog: CLM.LogDialog) {
        const { history } = this.props
        let url = `${this.props.match.url}?id=${logDialog.logDialogId}`
        history.push(url, { app: this.props.app })
    }

    async onClickSync() {
        const clear = this.props.logDialogs.length > 0 && !this.props.logConinuationToken
        await ((this.props.fetchLogDialogsThunkAsync(this.props.app, this.props.editingPackageId, clear, this.props.logConinuationToken, false) as any) as Promise<void>)
    }

    getFilteredDialogs(
        logDialogs: CLM.LogDialog[],
        entities: CLM.EntityBase[],
        actions: CLM.ActionBase[],
        searchValue: string
    ): CLM.LogDialog[] {
        if (!searchValue) {
            return logDialogs
        }

        return logDialogs
            .filter(logDialog => {
                const keys = [];
                for (const round of logDialog.rounds) {
                    keys.push(round.extractorStep.text)

                    for (const le of round.extractorStep.predictedEntities) {
                        const entity = entities.find(e => e.entityId === le.entityId)
                        if (!entity) {
                            throw new Error(`Could not find entity by id: ${le.entityId} in list of entities`)
                        }
                        keys.push(entity.entityName)
                    }

                    for (const ss of round.scorerSteps) {
                        const action = actions.find(a => a.actionId === ss.predictedAction)
                        if (!action) {
                            throw new Error(`Could not find action by id: ${ss.predictedAction} in list of actions`)
                        }

                        let payload = ''
                        try {
                            payload = CLM.ActionBase.GetPayload(action, Util.getDefaultEntityMap(this.props.entities))
                        }
                        catch {
                            // Backwards compatibility to models with old payload type
                        }
                        keys.push(payload)
                    }
                }

                const searchString = keys.join(' ').toLowerCase();
                return searchString.includes(searchValue);
            })
    }

    @autobind
    onClickDeleteSelected() {
        this.setState({
            isConfirmDeleteModalOpen: true
        })
    }

    @autobind
    onClickCancelDelete() {
        this.setState({
            isConfirmDeleteModalOpen: false
        })
    }

    @autobind
    onClickConfirmDelete() {
        const logDialogs = this.selection.getSelection() as CLM.LogDialog[]
        const logDialogIds = logDialogs.map(logDialog => logDialog.logDialogId)
        this.props.deleteLogDialogsThunkAsync(this.props.app, logDialogIds, this.props.editingPackageId)
        this.setState({
            isConfirmDeleteModalOpen: false
        })
    }

    getFilteredAndSortedDialogs() {
        let computedLogDialogs = this.getFilteredDialogs(
            this.props.logDialogs,
            this.props.entities,
            this.props.actions,
            this.state.searchValue)

        computedLogDialogs = this.sortLogDialogs(computedLogDialogs, this.state.columns, this.state.sortColumn)
        return computedLogDialogs
    }

    render() {
        const { intl } = this.props
        const computedLogDialogs = this.getFilteredAndSortedDialogs()
        const isPlaceholderVisible = this.props.logDialogs.length === 0
        const isEditingDisabled = this.props.editingPackageId !== this.props.app.devPackageId || this.props.invalidBot;
        
        return (
            <div className="cl-page">
                <div data-testid="log-dialogs-title" className={`cl-dialog-title cl-dialog-title--log ${OF.FontClassNames.xxLarge}`}>
                    <OF.Icon iconName="UserFollowed" />
                    <FormattedMessageId id={FM.LOGDIALOGS_TITLE} />
                </div>
                {this.props.editingPackageId === this.props.app.devPackageId ?
                    <span className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.LOGDIALOGS_SUBTITLE} />
                    </span>
                    :
                    <span className="cl-errorpanel">Editing is only allowed in Master Tag</span>
                }
                {this.props.app.metadata.isLoggingOn === false &&
                    <span className="ms-TextField-errorMessage label-error">
                        <FormattedMessageId id={FM.LOGDIALOGS_LOGDISABLED} />
                    </span>
                }
                <div className="cl-buttons-row">
                    <OF.PrimaryButton
                        data-testid="log-dialogs-new-button"
                        disabled={isEditingDisabled}
                        onClick={this.onClickNewChatSession}
                        ariaDescription={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                        text={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONTITLE)}
                        componentRef={this.newChatSessionButtonRef}
                        iconProps={{ iconName: 'Add' }}
                    />
                    <OF.DefaultButton
                        disabled={this.props.logDialogs.length === 0 || this.props.logConinuationToken === undefined}
                        data-testid="logdialogs-button-refresh"
                        onClick={() => this.onClickSync()}
                        ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_MORE_LOGS)}
                        text={Util.formatMessageId(this.props.intl, FM.BUTTON_MORE_LOGS)}
                        iconProps={{ iconName: 'AddNotes' }}
                    />
                    <OF.DefaultButton
                        disabled={this.props.logDialogs.length > 0 && this.props.logConinuationToken !== undefined}
                        data-testid="logdialogs-button-refresh"
                        onClick={() => this.onClickSync()}
                        ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_REFRESH)}
                        text={Util.formatMessageId(this.props.intl, FM.BUTTON_REFRESH)}
                        iconProps={{ iconName: 'Sync' }}
                    />
                    <OF.DefaultButton
                        data-testid="logdialogs-button-deleteall"
                        className="cl-button-delete"
                        disabled={this.state.selectionCount === 0}
                        onClick={this.onClickDeleteSelected}
                        ariaDescription={Util.formatMessageId(intl, FM.LOGDIALOGS_BUTTON_DELETESELECTED, { selectionCount: this.state.selectionCount })}
                        text={Util.formatMessageId(intl, FM.LOGDIALOGS_BUTTON_DELETESELECTED, { selectionCount: this.state.selectionCount })}
                        iconProps={{ iconName: 'Delete' }}
                    />
                </div>
                <div className={`cl-page-placeholder ${isPlaceholderVisible ? '' : 'cl-page-placeholder--none'}`}>
                    <div className="cl-page-placeholder__content">
                        <div className={`cl-page-placeholder__description ${OF.FontClassNames.xxLarge}`}>Create a Log Dialog</div>
                        <OF.PrimaryButton
                            iconProps={{
                                iconName: "Add"
                            }}
                            disabled={isEditingDisabled}
                            onClick={this.onClickNewChatSession}
                            ariaDescription={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONARIALDESCRIPTION)}
                            text={Util.formatMessageId(this.props.intl, FM.LOGDIALOGS_CREATEBUTTONTITLE)}
                        />
                    </div>
                </div>
                <>
                    <div className={isPlaceholderVisible ? 'cl-hidden' : ''}>
                        <OF.Label htmlFor="logdialogs-input-search" className={OF.FontClassNames.medium}>
                            Search:
                            </OF.Label>
                        <OF.SearchBox
                            id="logdialogs-input-search"
                            data-testid="logdialogs-search-box"
                            className={OF.FontClassNames.mediumPlus}
                            onChange={this.onChangeSearchString}
                            onSearch={this.onSearch}
                        />
                    </div>
                    <OF.DetailsList
                        data-testid="logdialogs-details-list"
                        key={this.state.detailListKey}
                        className={`${OF.FontClassNames.mediumPlus} ${isPlaceholderVisible ? 'cl-hidden' : ''}`}
                        items={computedLogDialogs}
                        selection={this.selection}
                        getKey={getDialogKey}
                        setKey="selectionKey"
                        columns={this.state.columns}
                        checkboxVisibility={OF.CheckboxVisibility.onHover}
                        onColumnHeaderClick={this.onClickColumnHeader}
                        onRenderRow={(props, defaultRender) => <div data-selection-invoke={true}>{defaultRender && defaultRender(props)}</div>}
                        onRenderItemColumn={(logDialog, i, column: IRenderableColumn) => returnErrorStringWhenError(() => column.render(logDialog, this))}
                        onActiveItemChanged={logDialog => this.onClickLogDialogItem(logDialog)}
                    />
                </>
                <ChatSessionModal
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    open={this.state.isChatSessionWindowOpen}
                    onClose={this.onCloseChatSessionWindow}
                />
                <LogDialogEditor
                    app={this.props.app}
                    invalidBot={this.props.invalidBot}
                    editingPackageId={this.props.editingPackageId}
                    logDialog={this.state.editingLogDialog}
                    onCloseEdit={this.onCloseEditModal}
                />
                <ConfirmCancelModal
                    open={this.state.isConfirmDeleteModalOpen}
                    onCancel={this.onClickCancelDelete}
                    onConfirm={this.onClickConfirmDelete}
                    title={Util.formatMessageId(intl, FM.LOGDIALOGS_CONFIRMCANCEL_DELETESELECTED, { selectionCount: this.state.selectionCount })}
                />
            </div>
        );
    }

    private focusNewChatButton() {
        if (this.newChatSessionButtonRef.current) {
            this.newChatSessionButtonRef.current.focus()
        }
    }

    private async openLogDialog(logDialog: CLM.LogDialog) {
        this.setState({ editingLogDialog: logDialog })
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        clearWebchatScrollPosition: actionTypes.display.clearWebchatScrollPosition,
        createChatSessionThunkAsync: actionTypes.chat.createChatSessionThunkAsync,
        deleteLogDialogsThunkAsync: actionTypes.log.deleteLogDialogsThunkAsync,
        fetchLogDialogAsync: actionTypes.log.fetchLogDialogThunkAsync,
        fetchLogDialogsThunkAsync: actionTypes.log.fetchLogDialogsThunkAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render LogDialogs but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        logDialogs: state.logDialogState.logDialogs,
        logConinuationToken: state.logDialogState.continuationToken,
        trainDialogs: state.trainDialogs,
        user: state.user.user,
        actions: state.actions,
        entities: state.entities,
        teachSession: state.teachSession,
        // Get all tags from all train dialogs then put in Set to get unique tags
        allUniqueTags: [...new Set(state.trainDialogs.reduce((tags, trainDialog) => [...tags, ...trainDialog.tags], []))]
    }
}

export interface ReceivedProps {
    app: CLM.AppBase,
    invalidBot: boolean,
    editingPackageId: string
}

// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>
type dispatchProps = ReturnType<typeof mapDispatchToProps>
type Props = stateProps & dispatchProps & ReceivedProps & InjectedIntlProps & RouteComponentProps<any>

export default connect<stateProps, dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(LogDialogs)))