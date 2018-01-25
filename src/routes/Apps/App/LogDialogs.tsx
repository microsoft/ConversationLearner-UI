import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as OF from 'office-ui-fabric-react';
import { State } from '../../../types'
import { BlisAppBase, LogDialog, Session, ModelUtils, Teach, TeachWithHistory, TrainDialog, ActionBase } from 'blis-models'
import { ChatSessionModal, LogDialogModal, TeachSessionModal } from '../../../components/modals'
import { ErrorType } from '../../../types/const';
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
                            return <span className={OF.FontClassNames.mediumPlus}>{ActionBase.GetPayload(action)}</span>;
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
    isChatSessionWarningWindowOpen: boolean
    isChatSessionWindowOpen: boolean
    isLogDialogWindowOpen: boolean
    isTeachDialogModalOpen: boolean
    currentLogDialog: LogDialog
    searchValue: string
    dialogKey: number,   // Allows user to re-open modal for same row ()
    activities: Activity[],
    teachSession: Teach
}

class LogDialogs extends React.Component<Props, ComponentState> {
    newChatSessionButton: OF.IButton

    state: ComponentState = {
        columns: getColumns(this.props.intl),
        chatSession: null,
        isChatSessionWarningWindowOpen: false,
        isChatSessionWindowOpen: false,
        isLogDialogWindowOpen: false,
        isTeachDialogModalOpen: false,
        currentLogDialog: null,
        searchValue: '',
        dialogKey: 0,
        activities: [],
        teachSession: null
    }

    componentDidMount() {
        this.newChatSessionButton.focus()
    }

    onClickNewChatSession() {
        // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
        ((this.props.createChatSessionThunkAsync(this.props.user.id, this.props.app.appId) as any) as Promise<Session>)
            .then(chatSession => {
                this.setState({
                    chatSession,
                    isChatSessionWindowOpen: true
                })
            })
            .catch(error => {
                console.warn(`Error when attempting to opening chat window: `, error)
                this.setState({
                    isChatSessionWarningWindowOpen: true
                })
            })
    }

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

        ((this.props.fetchHistoryThunkAsync(this.props.app.appId, trainDialog, this.props.user.name, this.props.user.id) as any) as Promise<Activity[]>)
        .then(activities => {
            this.setState({
                activities: activities,
                currentLogDialog: logDialog,
                isLogDialogWindowOpen: true
            })
        })
        .catch(error => {
            console.warn(`Error when attempting to create history: `, error)
        })
    }

    onCloseLogDialogModal() {
        this.setState({
            isLogDialogWindowOpen: false,
            currentLogDialog: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    onClickWarningWindowOk() {
        this.setState({
            isChatSessionWarningWindowOpen: false
        })
    }

    onClickSync() {
        this.props.fetchAllLogDialogsAsync(this.props.user.id, this.props.app.appId);
    }

    onDeleteLogDialog() {      
        this.props.deleteLogDialogThunkAsync(this.props.user.id, this.props.app.appId, this.state.currentLogDialog.logDialogId)
        this.onCloseLogDialogModal();
    }

    onEditLogDialog(logDialogId: string, newTrainDialog: TrainDialog) {
        
        // Delete log dialog
        this.props.deleteLogDialogThunkAsync(this.props.user.id, this.props.app.appId,logDialogId);
        
        // Create a new teach session from the train dialog
        ((this.props.createTeachSessionFromHistoryThunkAsync(this.props.app.appId, newTrainDialog, this.props.user.name, this.props.user.id) as any) as Promise<TeachWithHistory>)
        .then(teachWithHistory => {
            if (teachWithHistory.discrepancies.length === 0) {
                this.setState({
                    teachSession: teachWithHistory.teach, 
                    activities: teachWithHistory.history,
                    currentLogDialog: null,
                    isLogDialogWindowOpen: false,
                    isTeachDialogModalOpen: true
                })
            }
            else {
                //LARS internation
                setErrorDisplay(ErrorType.Error, "Unable to Edit", teachWithHistory.discrepancies, null);
            }
        })
        .catch(error => {
            console.warn(`Error when attempting to create teach session from log dialog: `, error)
        })
    }

    onCloseTeachSession() {
        this.setState({
            teachSession: null,
            isTeachDialogModalOpen: false,
            activities: null,
            dialogKey: this.state.dialogKey + 1
        })
    }

    onUndoTeachStep() {
        // Clear history first
        this.setState({
            activities: null
        });

        ((this.props.createTeachSessionFromUndoThunkAsync(this.props.app.appId, this.state.teachSession, this.props.user.name, this.props.user.id) as any) as Promise<TeachWithHistory>)
        .then(teachWithHistory => {
            if (teachWithHistory.discrepancies.length === 0) {
                this.setState({
                    teachSession: teachWithHistory.teach, 
                    activities: teachWithHistory.history,
                })
            } else {
                //lars INTERNATION
                setErrorDisplay(ErrorType.Error, "Unable to Undo", teachWithHistory.discrepancies, null);
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
                <div className={`blis-dialog-title blis-dialog-title--log ${OF.FontClassNames.xxLarge}`}>
                    <FormattedMessage
                        id={FM.LOGDIALOGS_TITLE}
                        defaultMessage="Log Dialogs"
                    />
                </div>
                <span className={OF.FontClassNames.mediumPlus}>
                    <FormattedMessage
                        id={FM.LOGDIALOGS_SUBTITLE}
                        defaultMessage="Use this tool to test the current versions of your application, to check if you are progressing on the right track..."
                    />
                </span>
                <div>
                    <OF.PrimaryButton
                        onClick={() => this.onClickNewChatSession()}
                        ariaDescription={this.props.intl.formatMessage({
                            id: FM.LOGDIALOGS_CREATEBUTTONARIALDESCRIPTION,
                            defaultMessage: 'Create a New Chat Session'
                        })}
                        text={this.props.intl.formatMessage({
                            id: FM.LOGDIALOGS_CREATEBUTTONTITLE,
                            defaultMessage: 'New Chat Session'
                        })}
                        componentRef={component => this.newChatSessionButton = component}
                    />
                    <ChatSessionModal
                        app={this.props.app}
                        open={this.state.isChatSessionWindowOpen}
                        onClose={() => this.onCloseChatSessionWindow()}
                    />
                </div>
                <OF.SearchBox
                    className={OF.FontClassNames.mediumPlus}
                    onChange={(newValue) => this.onChange(newValue)}
                    onSearch={(newValue) => this.onChange(newValue)}
                />
                <OF.PrimaryButton
                    className="blis-dropdownWithButton-button"
                    onClick={() => this.onClickSync()}
                    ariaDescription="Refresh"
                    text=""
                    iconProps={{ iconName: 'Sync' }}
                />
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
                    open={this.state.isLogDialogWindowOpen}
                    app={this.props.app}
                    onClose={() => this.onCloseLogDialogModal()}
                    onEdit={(logDialogId: string, newTrainDialog: TrainDialog) => this.onEditLogDialog(logDialogId, newTrainDialog)}
                    onDelete={() => this.onDeleteLogDialog()}
                    logDialog={currentLogDialog}
                    history={this.state.isLogDialogWindowOpen ? this.state.activities : null}
                />
                <TeachSessionModal
                        app={this.props.app}
                        teachSession={this.props.teachSessions.current}
                        dialogMode={this.props.teachSessions.mode}
                        open={this.state.isTeachDialogModalOpen}
                        onClose={() => this.onCloseTeachSession()} 
                        onUndo={() => this.onUndoTeachStep()}
                        history={this.state.isTeachDialogModalOpen ? this.state.activities : null}
                        trainDialog={null}
                    />
                <OF.Dialog
                    hidden={!this.state.isChatSessionWarningWindowOpen}
                    dialogContentProps={{
                        type: OF.DialogType.normal,
                        title: this.props.intl.formatMessage({
                            id: FM.LOGDIALOGS_SESSIONCREATIONWARNING_TITLE,
                            defaultMessage: 'You may not create chat session at this time. Please try again after training as completed.'
                        })
                    }}
                    onDismiss={() => this.onClickWarningWindowOk()}
                >
                    <OF.DialogFooter>
                        <OF.PrimaryButton
                            onClick={() => this.onClickWarningWindowOk()}
                            text={this.props.intl.formatMessage({
                                id: FM.LOGDIALOGS_SESSIONCREATIONWARNING_PRIMARYBUTTON,
                                defaultMessage: 'Ok'
                            })}
                        />
                    </OF.DialogFooter>
                </OF.Dialog>
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
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(LogDialogs))