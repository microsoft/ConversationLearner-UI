import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as OF from 'office-ui-fabric-react';
import { State } from '../../../types'
import { BlisAppBase, LogDialog, Session, ModelUtils, Teach, TeachWithHistory, TrainDialog, ActionBase, ReplayError } from 'blis-models'
import { ChatSessionModal, LogDialogModal, TeachSessionModal } from '../../../components/modals'
import { 
    createChatSessionThunkAsync, 
    createTeachSessionFromHistoryThunkAsync,
    createTeachSessionFromUndoThunkAsync } from '../../../actions/createActions'
import { fetchAllLogDialogsAsync, fetchHistoryThunkAsync } from '../../../actions/fetchActions';
import { setErrorDisplay } from '../../../actions/displayActions';
import { deleteLogDialogThunkAsync } from '../../../actions/deleteActions';
import { injectIntl, InjectedIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { FM } from '../../../react-intl-messages'
import { Activity } from 'botframework-directlinejs';
import { getDefaultEntityMap } from '../../../util';
import { autobind } from 'office-ui-fabric-react/lib/Utilities'
import ReplayErrorList from '../../../components/modals/ReplayErrorList';

interface IRenderableColumn extends OF.IColumn {
    render: (x: LogDialog, component: LogDialogs) => React.ReactNode
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

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'tag',
            name: 'Tag',
            fieldName: 'tag',
            minWidth: 100,
            maxWidth: 500,
            isResizable: true,
            render: (logDialog, component) => {
                // Only show tag column on Master branch it's the only one containing multiple tag types
                if (component.props.editingPackageId !== component.props.app.devPackageId) {
                    return null;
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
                return <span className={OF.FontClassNames.mediumPlus}>{tagName}</span>;
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
            maxWidth: 500,
            isResizable: true,
            render: logDialog => {
                if (logDialog.rounds && logDialog.rounds.length > 0) {
                    let text = logDialog.rounds[0].extractorStep.text;
                    return <span className={OF.FontClassNames.mediumPlus}>{text}</span>;
                }
                return <OF.Icon iconName="Remove" className="notFoundIcon" />
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
            maxWidth: 500,
            isResizable: true,
            render: logDialog => {
                if (logDialog.rounds && logDialog.rounds.length > 0) {
                    let text = logDialog.rounds[logDialog.rounds.length - 1].extractorStep.text;
                    return <span className={OF.FontClassNames.mediumPlus}>{text}</span>;
                }
                return <OF.Icon iconName="Remove" className="notFoundIcon" />
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
            maxWidth: 500,
            isResizable: true,
            render: (logDialog, component) => {
                // Find last action of last scorer step of last round
                // If found, return payload, otherwise return not found icon
                if (logDialog.rounds && logDialog.rounds.length > 0) {
                    let scorerSteps = logDialog.rounds[logDialog.rounds.length - 1].scorerSteps;
                    if (scorerSteps.length > 0) {
                        let actionId = scorerSteps[scorerSteps.length - 1].predictedAction;
                        let action = component.props.actions.find(a => a.actionId == actionId);
                        if (action) {
                            return <span className={OF.FontClassNames.mediumPlus}>{ActionBase.GetPayload(action, getDefaultEntityMap(component.props.entities))}</span>;
                        }
                    }
                }

                return <OF.Icon iconName="Remove" className="notFoundIcon" />;
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
            render: logDialog => <span className={OF.FontClassNames.mediumPlus}>{logDialog.rounds.length}</span>
        }
    ]
}

interface ComponentState {
    columns: IRenderableColumn[]
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
    validationErrorTitle: string, 
    validationErrorMessage: string,
}

class LogDialogs extends React.Component<Props, ComponentState> {
    newChatSessionButton: OF.IButton

    state: ComponentState = {
        columns: getColumns(this.props.intl),
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
        validationErrorTitle: null,
        validationErrorMessage: null
    }

    componentDidMount() {
        this.newChatSessionButton.focus()
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
                validationErrorTitle: FM.REPLAYERROR_LOGDIALOG_VALIDATION_TITLE,
                validationErrorMessage: FM.REPLAYERROR_LOGDIALOG_VALIDATION_MESSAGE
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
        this.props.fetchAllLogDialogsAsync(this.props.user.id, this.props.app.appId, this.props.editingPackageId);
    }

    @autobind
    onDeleteLogDialog() {      
        this.props.deleteLogDialogThunkAsync(this.props.user.id, this.props.app.appId, this.state.currentLogDialog.logDialogId, this.props.editingPackageId)
        this.onCloseLogDialogModal();
    }

    onEditLogDialog(logDialogId: string, newTrainDialog: TrainDialog, lastExtractionChanged: boolean) {
        
        // Create a new teach session from the train dialog
        ((this.props.createTeachSessionFromHistoryThunkAsync(this.props.app.appId, newTrainDialog, this.props.user.name, this.props.user.id, null, lastExtractionChanged) as any) as Promise<TeachWithHistory>)
        .then(teachWithHistory => {
            if (teachWithHistory.replayErrors.length === 0) {
                // Note: Don't clear currentLogDialog so I can delete it if I save my edits
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
                    validationErrorTitle: FM.REPLAYERROR_CONVERT_TITLE,
                    validationErrorMessage: FM.REPLAYERROR_FAILMESSAGE
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
                    validationErrorTitle: FM.REPLAYERROR_UNDO_TITLE,
                    validationErrorMessage: FM.REPLAYERROR_FAILMESSAGE
                })
            }
        })
        .catch(error => {
            console.warn(`Error when attempting to create teach session from undo: `, error)
        })
    }

    renderLogDialogItems(): LogDialog[] {
        if (!this.state.searchValue) {
            return this.props.logDialogs.all;
        }
        // TODO: Consider caching as not very efficient
        let filteredTrainDialogs = this.props.logDialogs.all.filter((l: LogDialog) => {
            let keys = [];
            for (let round of l.rounds) {
                keys.push(round.extractorStep.text);
                for (let le of round.extractorStep.predictedEntities) {
                    keys.push(this.props.entities.find(e => e.entityId == le.entityId).entityName);
                }
                for (let ss of round.scorerSteps) {
                    keys.push(this.props.actions.find(a => a.actionId == ss.predictedAction).payload);
                }
            }
            let searchString = keys.join(' ').toLowerCase();
            return searchString.indexOf(this.state.searchValue) > -1;
        })
        return filteredTrainDialogs;
    }

    render() {
        let logDialogItems = this.renderLogDialogItems()
        const currentLogDialog = this.state.currentLogDialog;
        return (
            <div className="blis-page">
                <div className={`blis-dialog-title ${OF.FontClassNames.xxLarge}`}>
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
                    <span className="blis-errorpanel">Editing is only allowed in Master Tag</span>
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
                        disabled={this.props.editingPackageId !== this.props.app.devPackageId}                      
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
                    onRenderItemColumn={(logDialog, i, column: IRenderableColumn) => returnErrorStringWhenError(() => column.render(logDialog, this))}
                    onActiveItemChanged={logDialog => this.onClickLogDialogItem(logDialog)}
                />
                <LogDialogModal
                    app={this.props.app}
                    editingPackageId={this.props.editingPackageId}
                    open={this.state.isLogDialogWindowOpen}
                    canEdit={this.props.editingPackageId === this.props.app.devPackageId}
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
                    formattedTitleId={this.state.validationErrorTitle}
                    formattedMessageId={this.state.validationErrorMessage}
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
                        trainDialog={null}
                        logDialog={this.state.currentLogDialog}
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
    app: BlisAppBase,
    editingPackageId: string
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(LogDialogs))