/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as OF from 'office-ui-fabric-react';
import { State } from '../../../types'
import * as CLM from '@conversationlearner/models'
import { ChatSessionModal, LogDialogModal, TeachSessionModal } from '../../../components/modals'
import actions from '../../../actions'
import { injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { FM } from '../../../react-intl-messages'
import { Activity } from 'botframework-directlinejs';
import { getDefaultEntityMap } from '../../../util';
import { autobind } from 'office-ui-fabric-react/lib/Utilities'
import ReplayErrorList from '../../../components/modals/ReplayErrorList';
import * as moment from 'moment'

interface IRenderableColumn extends OF.IColumn {
    render: (x: CLM.LogDialog, component: LogDialogs) => React.ReactNode
    getSortValue: (logDialog: CLM.LogDialog, component: LogDialogs) => string
}

const returnStringWhenError = (s: string) => {
    return (f: Function) => {
        try {
            return f()
        }
        catch (err) {
            return s
        }
    }
}

const returnErrorStringWhenError = returnStringWhenError("ERR")

function getTagName(logDialog: CLM.LogDialog, component: LogDialogs): string {
    // Only show tag column on Master branch it's the only one containing multiple tag types
    if (component.props.editingPackageId !== component.props.app.devPackageId) {
        return '';
    }
    let tagName = `UNKNOWN`; // Cover bug case of missing package
    if (logDialog.packageId === component.props.app.devPackageId) {
        tagName = 'Master';
    }
    else {
        let packageVersion = component.props.app.packageVersions.find((pv: any) => pv.packageId === logDialog.packageId);
        if (packageVersion) {
            tagName = packageVersion.packageVersion;
        }
    }
    return tagName;
}

function getFirstInput(logDialog: CLM.LogDialog): string | void {
    if (logDialog.rounds && logDialog.rounds.length > 0) {
        return logDialog.rounds[0].extractorStep.text
    }
}

function getLastInput(logDialog: CLM.LogDialog): string | void {
    if (logDialog.rounds && logDialog.rounds.length > 0) {
        return logDialog.rounds[logDialog.rounds.length - 1].extractorStep.text;
    }
}

function getLastResponse(logDialog: CLM.LogDialog, component: LogDialogs): string | void {
    // Find last action of last scorer step of last round
    // If found, return payload, otherwise return not found icon
    if (logDialog.rounds && logDialog.rounds.length > 0) {
        let scorerSteps = logDialog.rounds[logDialog.rounds.length - 1].scorerSteps;
        if (scorerSteps.length > 0) {
            let actionId = scorerSteps[scorerSteps.length - 1].predictedAction;
            let action = component.props.actions.find(a => a.actionId == actionId);
            if (action) {
                return CLM.ActionBase.GetPayload(action, getDefaultEntityMap(component.props.entities))
            }
        }
    }
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'tag',
            name: 'Tag',
            fieldName: 'tag',
            minWidth: 80,
            maxWidth: 120,
            isResizable: true,
            render: (logDialog, component) => {
                let tagName = getTagName(logDialog, component);
                return <span className={OF.FontClassNames.mediumPlus}>{tagName}</span>;
            },
            getSortValue: (logDialog, component) => {
                let tagName = getTagName(logDialog, component)
                return tagName ? tagName.toLowerCase() : ''
            }
        },
        {
            key: 'firstInput',
            name: intl.formatMessage({
                id: FM.LOGDIALOGS_FIRSTINPUT,
                defaultMessage: 'First Input'
            }),
            fieldName: 'firstInput',
            minWidth: 100,
            maxWidth: 300,
            isResizable: true,
            isSortedDescending: true,
            render: logDialog => {
                let firstInput = getFirstInput(logDialog);
                if (firstInput) {
                    return <span className={OF.FontClassNames.mediumPlus}>{firstInput}</span>;
                }
                return <OF.Icon iconName="Remove" className="notFoundIcon" />
            },
            getSortValue: logDialog => {
                let firstInput = getFirstInput(logDialog)
                return firstInput ? firstInput.toLowerCase() : ''
            }
        },
        {
            key: 'lastInput',
            name: intl.formatMessage({
                id: FM.LOGDIALOGS_LASTINPUT,
                defaultMessage: 'Last Input'
            }),
            fieldName: 'lastInput',
            minWidth: 100,
            maxWidth: 300,
            isResizable: true,
            render: logDialog => {
                let lastInput = getLastInput(logDialog)
                if (lastInput) {
                    return <span className={OF.FontClassNames.mediumPlus}>{lastInput}</span>;
                }
                return <OF.Icon iconName="Remove" className="notFoundIcon" />
            },
            getSortValue: logDialog => {
                let lastInput = getLastInput(logDialog)
                return lastInput ? lastInput.toLowerCase() : ''
            }
        },
        {
            key: 'lastResponse',
            name: intl.formatMessage({
                id: FM.LOGDIALOGS_LASTRESPONSE,
                defaultMessage: 'Last Response'
            }),
            fieldName: 'lastResponse',
            minWidth: 100,
            maxWidth: 300,
            isResizable: true,
            render: (logDialog, component) => {
                let lastResponse = getLastResponse(logDialog, component);
                if (lastResponse) {
                    return <span className={OF.FontClassNames.mediumPlus}>{lastResponse}</span>;
                }
                return <OF.Icon iconName="Remove" className="notFoundIcon" />;
            },
            getSortValue: (logDialog, component) => {
                let lastResponse = getLastResponse(logDialog, component)
                return lastResponse ? lastResponse.toLowerCase() : ''
            }
        },
        {
            key: 'turns',
            name: intl.formatMessage({
                id: FM.LOGDIALOGS_TURNS,
                defaultMessage: 'Turns'
            }),
            fieldName: 'dialog',
            minWidth: 50,
            isResizable: false,
            render: logDialog => <span className={OF.FontClassNames.mediumPlus}>{logDialog.rounds.length}</span>,
            getSortValue: logDialog => logDialog.rounds.length.toString().padStart(4, '0')
        },
        {
            key: 'lastModifiedDateTime',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_LAST_MODIFIED_DATE_TIME,
                defaultMessage: 'Last Modified'
            }),
            fieldName: 'lastModifiedDateTime',
            minWidth: 100,
            isResizable: false,
            render: logDialog => <span className={OF.FontClassNames.mediumPlus}>{moment(logDialog.lastModifiedDateTime).format('L')}</span>,
            getSortValue: logDialog => moment(logDialog.lastModifiedDateTime).valueOf().toString()
        },
        {
            key: 'created',
            name: intl.formatMessage({
                id: FM.TRAINDIALOGS_CREATED_DATE_TIME,
                defaultMessage: 'Created'
            }),
            fieldName: 'created',
            minWidth: 100,
            isResizable: false,
            render: logDialog => <span className={OF.FontClassNames.mediumPlus}>{moment(logDialog.createdDateTime).format('L')}</span>,
            getSortValue: logDialog => moment(logDialog.createdDateTime).valueOf().toString()
        }
    ]
}

interface ComponentState {
    columns: IRenderableColumn[]
    sortColumn: IRenderableColumn
    chatSession: CLM.Session | null
    isChatSessionWindowOpen: boolean
    isLogDialogWindowOpen: boolean
    isTeachDialogModalOpen: boolean
    isValidationWarningOpen: boolean
    currentLogDialog: CLM.LogDialog | undefined
    searchValue: string
    // Allows user to re-open modal for same row ()
    dialogKey: number
    history: Activity[]
    lastAction: CLM.ActionBase | null
    teachSession: CLM.Teach | undefined
    validationErrors: CLM.ReplayError[]
    validationErrorTitleId: string | null
    validationErrorMessageId: string | null
}

class LogDialogs extends React.Component<Props, ComponentState> {
    newChatSessionButton: OF.IButton
    state: ComponentState

    constructor(props: Props) {
        super(props)
        let columns = getColumns(this.props.intl);
        this.state = {
            columns: columns,
            sortColumn: columns[1],
            chatSession: null,
            isChatSessionWindowOpen: false,
            isLogDialogWindowOpen: false,
            isTeachDialogModalOpen: false,
            isValidationWarningOpen: false,
            currentLogDialog: undefined,
            searchValue: '',
            dialogKey: 0,
            history: [],
            lastAction: null,
            teachSession: undefined,
            validationErrors: [],
            validationErrorTitleId: null,
            validationErrorMessageId: null
        }
    }

    sortLogDialogs(logDialogs: CLM.LogDialog[]): CLM.LogDialog[] {
        // If column header selected sort the items
        if (this.state.sortColumn) {
            logDialogs
                .sort((a, b) => {
                    let firstValue = this.state.sortColumn.getSortValue(a, this)
                    let secondValue = this.state.sortColumn.getSortValue(b, this)
                    let compareValue = firstValue.localeCompare(secondValue)

                    // If primary sort is the same do secondary sort on another column, to prevent sort jumping around
                    if (compareValue === 0) {
                        let sortColumn2 = ((this.state.sortColumn !== this.state.columns[1]) ? this.state.columns[1] : this.state.columns[2]) as IRenderableColumn
                        firstValue = sortColumn2.getSortValue(a, this)
                        secondValue = sortColumn2.getSortValue(b, this)
                        compareValue = firstValue.localeCompare(secondValue)
                    }

                    return this.state.sortColumn.isSortedDescending
                        ? compareValue
                        : compareValue * -1
                })
        }

        return logDialogs;
    }

    @autobind
    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        let { columns } = this.state;
        let isSortedDescending = !clickedColumn.isSortedDescending;

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map(column => {
                column.isSorted = (column.key === clickedColumn.key);
                column.isSortedDescending = isSortedDescending;
                return column;
            }),
            sortColumn: clickedColumn
        });
    }

    componentDidMount() {
        this.newChatSessionButton.focus()
    }

    componentWillReceiveProps(newProps: Props) {

        // If log dialogs have been updated, update selected logDialog too
        if (this.props.logDialogs !== newProps.logDialogs) {
            const logDialog = this.state.currentLogDialog
            if (logDialog) {
                let newLogDialog = newProps.logDialogs.find(t => t.logDialogId === logDialog.logDialogId)
                this.setState({
                    currentLogDialog: newLogDialog
                })
            }
        }
    }

    @autobind
    onClickNewChatSession() {
        // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
        ((this.props.createChatSessionThunkAsync(this.props.app.appId, this.props.editingPackageId, this.props.app.metadata.isLoggingOn !== false) as any) as Promise<CLM.Session>)
            .then(chatSession => {
                this.setState({
                    chatSession,
                    isChatSessionWindowOpen: true
                })
            })
            .catch(error => {
                console.warn(`Error when attempting to opening chat window: `, error)
            })
    }

    @autobind
    onCloseChatSessionWindow() {
        this.setState({
            chatSession: null,
            isChatSessionWindowOpen: false,
            dialogKey: this.state.dialogKey + 1
        })
    }

    onChange(newValue: string) {
        let lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }

    onClickLogDialogItem(logDialog: CLM.LogDialog) {

        // Convert to trainDialog until schema update change, and pass in app definition too
        let trainDialog = CLM.ModelUtils.ToTrainDialog(logDialog, this.props.actions, this.props.entities);

        ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)
            .then(teachWithHistory => {
                this.setState({
                    history: teachWithHistory.history,
                    lastAction: teachWithHistory.lastAction,
                    currentLogDialog: logDialog,
                    isLogDialogWindowOpen: true,
                    validationErrors: teachWithHistory.replayErrors,
                    isValidationWarningOpen: teachWithHistory.replayErrors.length > 0,
                    validationErrorTitleId: FM.REPLAYERROR_LOGDIALOG_VALIDATION_TITLE,
                    validationErrorMessageId: FM.REPLAYERROR_LOGDIALOG_VALIDATION_MESSAGE
                })
            })
            .catch(error => {
                console.warn(`Error when attempting to create history: `, error)
            })
    }

    @autobind
    onCloseLogDialogModal() {
        this.setState({
            isLogDialogWindowOpen: false,
            currentLogDialog: undefined,
            dialogKey: this.state.dialogKey + 1
        })
    }

    onClickSync() {
        this.props.fetchAllLogDialogsThunkAsync(this.props.app, this.props.editingPackageId);
    }

    @autobind
    onDeleteLogDialog() {
        if (this.state.currentLogDialog) {
            this.props.deleteLogDialogThunkAsync(this.props.user.id, this.props.app, this.state.currentLogDialog.logDialogId, this.props.editingPackageId)
        }
        this.onCloseLogDialogModal();
    }

    onEditLogDialog(logDialogId: string, newTrainDialog: CLM.TrainDialog) {

        // Create a new teach session from the train dialog
        ((this.props.createTeachSessionFromHistoryThunkAsync(this.props.app, newTrainDialog, this.props.user.name, this.props.user.id) as any) as Promise<CLM.TeachWithHistory>)
            .then(teachWithHistory => {
                if (teachWithHistory.replayErrors.length === 0) {
                    // Note: Don't clear currentLogDialog so I can update it if I save my edits
                    this.setState({
                        teachSession: teachWithHistory.teach,
                        history: teachWithHistory.history,
                        lastAction: teachWithHistory.lastAction,
                        isLogDialogWindowOpen: false,
                        isTeachDialogModalOpen: true
                    })
                }
                else {
                    this.setState({
                        validationErrors: teachWithHistory.replayErrors,
                        isValidationWarningOpen: true,
                        validationErrorTitleId: FM.REPLAYERROR_CONVERT_TITLE,
                        validationErrorMessageId: FM.REPLAYERROR_FAILMESSAGE
                    })
                }
            })
            .catch(error => {
                console.warn(`Error when attempting to create teach session from log dialog: `, error)
            })
    }

    @autobind
    onCloseTeachSession() {
        this.setState({
            teachSession: undefined,
            isTeachDialogModalOpen: false,
            history: [],
            lastAction: null,
            currentLogDialog: undefined,
            dialogKey: this.state.dialogKey + 1
        })
    }

    @autobind
    onCloseValidationWarning() {
        this.setState({
            isValidationWarningOpen: false
        })
    }

    getFilteredAndSortedDialogs(): CLM.LogDialog[] {
        // Don't show log dialogs that have derived TrainDialogs as they've already been edited
        let filteredLogDialogs: CLM.LogDialog[] = this.props.logDialogs.filter(l => !l.targetTrainDialogIds || l.targetTrainDialogIds.length === 0);

        if (this.state.searchValue) {
            // TODO: Consider caching as not very efficient
            filteredLogDialogs = filteredLogDialogs.filter((l: CLM.LogDialog) => {
                let keys = [];
                for (let round of l.rounds) {
                    keys.push(round.extractorStep.text);
                    for (let le of round.extractorStep.predictedEntities) {
                        const entity = this.props.entities.find(e => e.entityId === le.entityId)
                        if (!entity) {
                            throw new Error(`Could not find entity by id: ${le.entityId} in list of entities`)
                        }
                        keys.push(entity.entityName)
                    }
                    for (let ss of round.scorerSteps) {
                        const action = this.props.actions.find(a => a.actionId === ss.predictedAction)
                        if (!action) {
                            throw new Error(`Could not find action by id: ${ss.predictedAction} in list of actions`)
                        }

                        keys.push(action.payload)
                    }
                }
                let searchString = keys.join(' ').toLowerCase();
                return searchString.indexOf(this.state.searchValue) > -1;
            })
        }

        filteredLogDialogs = this.sortLogDialogs(filteredLogDialogs);
        return filteredLogDialogs;
    }

    render() {
        const { logDialogs } = this.props
        const computedLogDialogs = this.getFilteredAndSortedDialogs()
        const currentLogDialog = this.state.currentLogDialog;
        return (
            <div className="cl-page">
                <div data-testid="logdialogs-title" className={`cl-dialog-title cl-dialog-title--log ${OF.FontClassNames.xxLarge}`}>
                    <OF.Icon iconName="UserFollowed" />
                    <FormattedMessage
                        id={FM.LOGDIALOGS_TITLE}
                        defaultMessage="Log Dialogs"
                    />
                </div>
                {this.props.editingPackageId === this.props.app.devPackageId ?
                    <span className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.LOGDIALOGS_SUBTITLE}
                            defaultMessage="Log Dialogs are records of conversations between users and your bot. You can make corrections to Log Dialogs to improve the bot."
                        />
                    </span>
                    :
                    <span className="cl-errorpanel">Editing is only allowed in Master Tag</span>
                }
                {this.props.app.metadata.isLoggingOn === false &&
                    <span className="ms-TextField-errorMessage label-error">
                        <FormattedMessage
                            id={FM.LOGDIALOGS_LOGDISABLED}
                            defaultMessage="Logging is Disabled"
                        />
                    </span>
                }
                <div className="cl-buttons-row">
                    <OF.PrimaryButton
                        data-testid="logdialogs-button-create"
                        disabled={this.props.editingPackageId !== this.props.app.devPackageId || this.props.invalidBot}
                        onClick={this.onClickNewChatSession}
                        ariaDescription={this.props.intl.formatMessage({
                            id: FM.LOGDIALOGS_CREATEBUTTONARIALDESCRIPTION,
                            defaultMessage: 'Create a New Log Dialog'
                        })}
                        text={this.props.intl.formatMessage({
                            id: FM.LOGDIALOGS_CREATEBUTTONTITLE,
                            defaultMessage: 'New Log Dialog'
                        })}
                        componentRef={component => this.newChatSessionButton = component!}
                    />
                    <OF.DefaultButton
                        data-testid="logdialogs-button-refresh"
                        onClick={() => this.onClickSync()}
                        ariaDescription="Refresh"
                        text="Refresh"
                        iconProps={{ iconName: 'Sync' }}
                    />
                </div>
                {logDialogs.length === 0
                    ? <div className="cl-page-placeholder">
                        <div className="cl-page-placeholder__content">
                            <div className={`cl-page-placeholder__description ${OF.FontClassNames.xxLarge}`}>Create a Log Dialog</div>
                            <OF.PrimaryButton
                                iconProps={{
                                    iconName: "Add"
                                }}
                                disabled={this.props.editingPackageId !== this.props.app.devPackageId || this.props.invalidBot}
                                onClick={this.onClickNewChatSession}
                                ariaDescription={this.props.intl.formatMessage({
                                    id: FM.LOGDIALOGS_CREATEBUTTONARIALDESCRIPTION,
                                    defaultMessage: 'Create a New Log Dialog'
                                })}
                                text={this.props.intl.formatMessage({
                                    id: FM.LOGDIALOGS_CREATEBUTTONTITLE,
                                    defaultMessage: 'New Log Dialog'
                                })}
                            />
                        </div>
                    </div>
                    : <React.Fragment>
                        <div>
                            <OF.Label htmlFor="logdialogs-input-search" className={OF.FontClassNames.medium}>
                                Search:
                            </OF.Label>
                            <OF.SearchBox
                                id="logdialogs-input-search"
                                data-testid="logdialogs-search-box"
                                className={OF.FontClassNames.mediumPlus}
                                onChange={(newValue) => this.onChange(newValue)}
                                onSearch={(newValue) => this.onChange(newValue)}
                            />
                        </div>

                        <OF.DetailsList
                            data-testid="logdialogs-details-list"
                            key={this.state.dialogKey}
                            className={OF.FontClassNames.mediumPlus}
                            items={computedLogDialogs}
                            columns={this.state.columns}
                            checkboxVisibility={OF.CheckboxVisibility.hidden}
                            onColumnHeaderClick={this.onClickColumnHeader}
                            onRenderItemColumn={(logDialog, i, column: IRenderableColumn) => returnErrorStringWhenError(() => column.render(logDialog, this))}
                            onActiveItemChanged={logDialog => this.onClickLogDialogItem(logDialog)}
                        />
                    </React.Fragment>}
                <ChatSessionModal
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    open={this.state.isChatSessionWindowOpen}
                    onClose={this.onCloseChatSessionWindow}
                />
                <LogDialogModal
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    open={this.state.isLogDialogWindowOpen}
                    canEdit={this.props.editingPackageId === this.props.app.devPackageId && !this.props.invalidBot}
                    onClose={this.onCloseLogDialogModal}
                    onEdit={(logDialogId, newTrainDialog) => this.onEditLogDialog(logDialogId, newTrainDialog)}
                    onDelete={this.onDeleteLogDialog}
                    logDialog={currentLogDialog!}
                    history={this.state.history}
                />
                <ReplayErrorList
                    open={this.state.isValidationWarningOpen}
                    onClose={this.onCloseValidationWarning}
                    textItems={this.state.validationErrors}
                    // Assume if `isValidationWarningOpen` is true then validationError ids are set
                    formattedTitleId={this.state.validationErrorTitleId!}
                    formattedMessageId={this.state.validationErrorMessageId!}
                />
                <TeachSessionModal
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    // Assume if `isTeachDialogModalOpen` is true, then `current` is also defined
                    teach={this.props.teachSessions.current!}
                    dialogMode={this.props.teachSessions.mode}
                    isOpen={this.state.isTeachDialogModalOpen}
                    onClose={this.onCloseTeachSession}
                    onSetInitialEntities={()=>{}} //  LARS TEMP
                    onEditTeach={()=>{}} // LARS TEMP
                    isNewDialog={false} // LARS TEMP
                    initialHistory={this.state.history}
                    lastAction={this.state.lastAction}
                    sourceLogDialog={this.state.currentLogDialog}
                />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createChatSessionThunkAsync: actions.chat.createChatSessionThunkAsync,
        createTeachSessionFromHistoryThunkAsync: actions.teach.createTeachSessionFromHistoryThunkAsync,
        deleteLogDialogThunkAsync: actions.log.deleteLogDialogThunkAsync,
        fetchAllLogDialogsThunkAsync: actions.log.fetchAllLogDialogsThunkAsync,
        fetchHistoryThunkAsync: actions.train.fetchHistoryThunkAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render LogDialogs but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        logDialogs: state.logDialogs,
        user: state.user.user,
        actions: state.actions,
        entities: state.entities,
        teachSessions: state.teachSessions
    }
}

export interface ReceivedProps {
    app: CLM.AppBase,
    invalidBot: boolean,
    editingPackageId: string
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(LogDialogs))