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
import { AppBase, LogDialog, Session, ModelUtils, Teach, TeachWithHistory, TrainDialog, ActionBase, ReplayError } from 'conversationlearner-models'
import { ChatSessionModal, LogDialogModal, TeachSessionModal } from '../../../components/modals'
import { 
    createChatSessionThunkAsync, 
    createTeachSessionFromHistoryThunkAsync,
    createTeachSessionFromUndoThunkAsync } from '../../../actions/createActions'
import { deleteLogDialogThunkAsync } from '../../../actions/deleteActions';
import { fetchAllLogDialogsAsync, fetchHistoryThunkAsync } from '../../../actions/fetchActions';
import { setErrorDisplay } from '../../../actions/displayActions';
import { injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { FM } from '../../../react-intl-messages'
import { Activity } from 'botframework-directlinejs';
import { getDefaultEntityMap } from '../../../util';
import { autobind } from 'office-ui-fabric-react/lib/Utilities'
import ReplayErrorList from '../../../components/modals/ReplayErrorList';

interface IRenderableColumn extends OF.IColumn {
    render: (x: LogDialog, component: LogDialogs) => React.ReactNode
    getSortValue: (logDialog: LogDialog, component: LogDialogs) => string
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

function getTagName(logDialog: LogDialog, component: LogDialogs): string {
    // Only show tag column on Master branch it's the only one containing multiple tag types
    if (component.props.editingPackageId !== component.props.app.devPackageId) {
        return '';
    }
    let tagName = `UNKNOWN`; // Cover bug case of missing package
    if (logDialog.packageId === component.props.app.devPackageId) {
        tagName = 'Master';
    }
    else 
    {
        let packageVersion = component.props.app.packageVersions.find(pv => pv.packageId === logDialog.packageId);
        if (packageVersion) {
            tagName = packageVersion.packageVersion;
        }
    }
    return tagName;
}

function getFirstInput(logDialog: LogDialog): string {
    if (logDialog.rounds && logDialog.rounds.length > 0) {
        let text = logDialog.rounds[0].extractorStep.text;
        return text;
    }
    return null;
}

function getLastInput(logDialog: LogDialog): string {
    if (logDialog.rounds && logDialog.rounds.length > 0) {
        let text = logDialog.rounds[logDialog.rounds.length - 1].extractorStep.text;
        return text;
    }
    return null;
}

function getLastResponse(logDialog: LogDialog, component: LogDialogs): string {
    // Find last action of last scorer step of last round
    // If found, return payload, otherwise return not found icon
    if (logDialog.rounds && logDialog.rounds.length > 0) {
        let scorerSteps = logDialog.rounds[logDialog.rounds.length - 1].scorerSteps;
        if (scorerSteps.length > 0) {
            let actionId = scorerSteps[scorerSteps.length - 1].predictedAction;
            let action = component.props.actions.find(a => a.actionId == actionId);
            if (action) {
                return ActionBase.GetPayload(action, getDefaultEntityMap(component.props.entities))
            }
        }
    }
    return null;
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
            minWidth: 30,
            maxWidth: 50,
            render: logDialog => <span className={OF.FontClassNames.mediumPlus}>{logDialog.rounds.length}</span>,
            getSortValue: logDialog => logDialog.rounds.length.toString().padStart(4, '0')
        }
    ]
}

interface ComponentState {
    columns: IRenderableColumn[],
    sortColumn: IRenderableColumn,
    chatSession: Session
    isChatSessionWindowOpen: boolean
    isLogDialogWindowOpen: boolean
    isTeachDialogModalOpen: boolean
    isValidationWarningOpen: boolean
    currentLogDialog: LogDialog
    searchValue: string
    dialogKey: number,   // Allows user to re-open modal for same row ()
    activities: Activity[],
    teachSession: Teach,
    validationErrors: ReplayError[],
    validationErrorTitleId: string | null, 
    validationErrorMessageId: string | null,
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
            currentLogDialog: null,
            searchValue: '',
            dialogKey: 0,
            activities: [],
            teachSession: null,
            validationErrors: [],
            validationErrorTitleId: null,
            validationErrorMessageId: null
        }
    }

    sortLogDialogs(logDialogs: LogDialog[]): LogDialog[] {
        // If column header selected sort the items
        if (this.state.sortColumn) {
            logDialogs
                .sort((a, b) => {
                    const firstValue = this.state.sortColumn.getSortValue(a, this)
                    const secondValue = this.state.sortColumn.getSortValue(b, this)
                    const compareValue = firstValue.localeCompare(secondValue)
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
            if (this.state.currentLogDialog) {
                let newLogDialog = newProps.logDialogs.find(t => t.logDialogId === this.state.currentLogDialog.logDialogId);
                this.setState({
                    currentLogDialog: newLogDialog
                })
            }
        }
    }

    @autobind
    onClickNewChatSession() {
        // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
        ((this.props.createChatSessionThunkAsync(this.props.app.appId, this.props.editingPackageId, this.props.app.metadata.isLoggingOn !== false) as any) as Promise<Session>)
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

    onClickLogDialogItem(logDialog: LogDialog) {
        
        // Convert to trainDialog until schema update change, and pass in app definition too
        let trainDialog = ModelUtils.ToTrainDialog(logDialog, this.props.actions, this.props.entities);

        ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<TeachWithHistory>)
        .then(teachWithHistory => {
            this.setState({
                activities: teachWithHistory.history,
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
            currentLogDialog: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    onClickSync() {
        this.props.fetchAllLogDialogsAsync(this.props.user.id, this.props.app, this.props.editingPackageId);
    }

    @autobind
    onDeleteLogDialog() {      
        this.props.deleteLogDialogThunkAsync(this.props.user.id, this.props.app, this.state.currentLogDialog.logDialogId, this.props.editingPackageId)
        this.onCloseLogDialogModal();
    }

    onEditLogDialog(logDialogId: string, newTrainDialog: TrainDialog, lastExtractionChanged: boolean) {
        
        // Create a new teach session from the train dialog
        ((this.props.createTeachSessionFromHistoryThunkAsync(this.props.app, newTrainDialog, this.props.user.name, this.props.user.id, lastExtractionChanged) as any) as Promise<TeachWithHistory>)
        .then(teachWithHistory => {
            if (teachWithHistory.replayErrors.length === 0) {
                // Note: Don't clear currentLogDialog so I can update it if I save my edits
                this.setState({
                    teachSession: teachWithHistory.teach, 
                    activities: teachWithHistory.history,
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
            teachSession: null,
            isTeachDialogModalOpen: false,
            activities: null,
            currentLogDialog: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    @autobind
    onCloseValidationWarning() {
        this.setState({
            isValidationWarningOpen: false
        })
    }

    onUndoTeachStep(popRound: boolean) {
        // Clear history first
        this.setState({
            activities: null
        });

        ((this.props.createTeachSessionFromUndoThunkAsync(this.props.app.appId, this.state.teachSession, popRound, this.props.user.name, this.props.user.id) as any) as Promise<TeachWithHistory>)
        .then(teachWithHistory => {
            if (teachWithHistory.replayErrors.length === 0) {
                this.setState({
                    teachSession: teachWithHistory.teach, 
                    activities: teachWithHistory.history,
                })
            } else {    
                this.setState({
                    validationErrors: teachWithHistory.replayErrors,
                    isValidationWarningOpen: true,
                    validationErrorTitleId: FM.REPLAYERROR_UNDO_TITLE,
                    validationErrorMessageId: FM.REPLAYERROR_FAILMESSAGE
                })
            }
        })
        .catch(error => {
            console.warn(`Error when attempting to create teach session from undo: `, error)
        })
    }

    renderLogDialogItems(): LogDialog[] {
        // Don't show log dialogs that have derived TrainDialogs as they've already been edited
        let filteredLogDialogs: LogDialog[] = this.props.logDialogs.filter(l => !l.targetTrainDialogIds || l.targetTrainDialogIds.length === 0);

        if (!this.state.searchValue) {
            filteredLogDialogs = this.props.logDialogs;
        }
        else {
        // TODO: Consider caching as not very efficient
            filteredLogDialogs = this.props.logDialogs.filter((l: LogDialog) => {
                let keys = [];
                for (let round of l.rounds) {
                    keys.push(round.extractorStep.text);
                    for (let le of round.extractorStep.predictedEntities) {
                        keys.push(this.props.entities.find(e => e.entityId === le.entityId).entityName);
                    }
                    for (let ss of round.scorerSteps) {
                        keys.push(this.props.actions.find(a => a.actionId === ss.predictedAction).payload);
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
        let logDialogItems = this.renderLogDialogItems()
        const currentLogDialog = this.state.currentLogDialog;
        return (
            <div className="cl-page">
                <div className={`cl-dialog-title cl-dialog-title--log ${OF.FontClassNames.xxLarge}`}>
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
                            defaultMessage="Use this tool to test the current versions of your application, to check if you are progressing on the right track..."
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
                <div>
                    <OF.PrimaryButton
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
                        componentRef={component => this.newChatSessionButton = component}
                    />
                    <ChatSessionModal
                        app={this.props.app}
                        editingPackageId={this.props.editingPackageId}
                        open={this.state.isChatSessionWindowOpen}
                        onClose={this.onCloseChatSessionWindow}
                    />
                </div>
                <OF.SearchBox
                    className={OF.FontClassNames.mediumPlus}
                    onChange={(newValue) => this.onChange(newValue)}
                    onSearch={(newValue) => this.onChange(newValue)}
                />
                <div>
                    <OF.PrimaryButton
                        onClick={() => this.onClickSync()}
                        ariaDescription="Refresh"
                        text="Refresh"
                        iconProps={{ iconName: 'Sync' }}
                    />
                </div>
                <OF.DetailsList
                    key={this.state.dialogKey}
                    className={OF.FontClassNames.mediumPlus}
                    items={logDialogItems}
                    columns={this.state.columns}
                    checkboxVisibility={OF.CheckboxVisibility.hidden}
                    onColumnHeaderClick={this.onClickColumnHeader}
                    onRenderItemColumn={(logDialog, i, column: IRenderableColumn) => returnErrorStringWhenError(() => column.render(logDialog, this))}
                    onActiveItemChanged={logDialog => this.onClickLogDialogItem(logDialog)}
                />
                <LogDialogModal
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    open={this.state.isLogDialogWindowOpen}
                    canEdit={this.props.editingPackageId === this.props.app.devPackageId && !this.props.invalidBot}
                    onClose={this.onCloseLogDialogModal}
                    onEdit={(logDialogId: string, newTrainDialog: TrainDialog, lastExtractionChanged: boolean) => this.onEditLogDialog(logDialogId, newTrainDialog, lastExtractionChanged)}
                    onDelete={this.onDeleteLogDialog}
                    logDialog={currentLogDialog}
                    history={this.state.isLogDialogWindowOpen ? this.state.activities : null}
                />
                <ReplayErrorList  
                    open={this.state.isValidationWarningOpen}
                    onClose={this.onCloseValidationWarning}
                    textItems={this.state.validationErrors}
                    formattedTitleId={this.state.validationErrorTitleId}
                    formattedMessageId={this.state.validationErrorMessageId}
                />
                <TeachSessionModal
                        app={this.props.app}
                        editingPackageId={this.props.editingPackageId}
                        teachSession={this.props.teachSessions.current}
                        dialogMode={this.props.teachSessions.mode}
                        open={this.state.isTeachDialogModalOpen}
                        onClose={this.onCloseTeachSession} 
                        onUndo={(popRound) => this.onUndoTeachStep(popRound)}
                        history={this.state.isTeachDialogModalOpen ? this.state.activities : null}
                        sourceLogDialog={this.state.currentLogDialog}
                />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createChatSessionThunkAsync,
        createTeachSessionFromHistoryThunkAsync,
        createTeachSessionFromUndoThunkAsync,
        deleteLogDialogThunkAsync,
        fetchAllLogDialogsAsync,
        fetchHistoryThunkAsync,
        setErrorDisplay
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        logDialogs: state.logDialogs,
        user: state.user,
        actions: state.actions,
        entities: state.entities,
        teachSessions: state.teachSessions
    }
}

export interface ReceivedProps {
    app: AppBase,
    invalidBot: boolean,
    editingPackageId: string
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(LogDialogs))