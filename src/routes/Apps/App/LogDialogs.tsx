import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DetailsList, CommandButton, CheckboxVisibility, IColumn, SearchBox, Dialog, DialogType, DialogFooter, PrimaryButton } from 'office-ui-fabric-react';
import { State } from '../../../types'
import { BlisAppBase, LogDialog, Session } from 'blis-models'
import { ChatSessionWindow, LogDialogModal } from '../../../components/modals'
import { createChatSessionThunkAsync } from '../../../actions/createActions'

interface IRenderableColumn extends IColumn {
    render: (x: LogDialog, component: LogDialogs) => React.ReactNode
}

const returnStringWhenError = (s: string) => {
    return (f: Function) => {
        try {
            return f()
        }
        catch (err)
        {
            return s
        }
    }
}

const returnErrorStringWhenError = returnStringWhenError("ERR")

let columns: IRenderableColumn[] = [
    {
        key: 'firstInput',
        name: 'First Input',
        fieldName: 'firstInput',
        minWidth: 100,
        maxWidth: 500,
        isResizable: true,
        render: logDialog => {
            if (logDialog.rounds && logDialog.rounds.length > 0) {
                let text = logDialog.rounds[0].extractorStep.text;
                return <span className='ms-font-m-plus'>{text}</span>;
            }
            return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
        }
    },
    {
        key: 'lastInput',
        name: 'Last Input',
        fieldName: 'lastInput',
        minWidth: 100,
        maxWidth: 500,
        isResizable: true,
        render: logDialog => {
            if (logDialog.rounds && logDialog.rounds.length > 0) {
                let text = logDialog.rounds[logDialog.rounds.length - 1].extractorStep.text;
                return <span className='ms-font-m-plus'>{text}</span>;
            }
            return <span className="ms-Icon ms-Icon--Remove notFoundIcon"></span>;
        }
    },
    {
        key: 'lastResponse',
        name: 'Last Response',
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
                        return <span className='ms-font-m-plus'>{action.payload}</span>;
                    }
                }
            }

            return <span className="ms-Icon ms-Icon--Remove notFoundIcon"></span>;
        }
    },
    {
        key: 'turns',
        name: 'Turns',
        fieldName: 'dialog',
        minWidth: 30,
        maxWidth: 50,
        render: logDialog => <span className='ms-font-m-plus'>{logDialog.rounds.length}</span>
    }
];

interface ComponentState {
    chatSession: Session
    isChatSessionWarningWindowOpen: boolean
    isChatSessionWindowOpen: boolean
    isLogDialogWindowOpen: boolean
    currentLogDialog: LogDialog
    searchValue: string
    dialogKey: number   // Allows user to re-open modal for same row ()
}

class LogDialogs extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        chatSession: null,
        isChatSessionWarningWindowOpen: false,
        isChatSessionWindowOpen: false,
        isLogDialogWindowOpen: false,
        currentLogDialog: null,
        searchValue: '',
        dialogKey: 0
    }

    onClickNewChatSession() {
        // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
        ((this.props.createChatSessionThunkAsync(this.props.user.key, this.props.app.appId) as any) as Promise<Session>)
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
            dialogKey: this.state.dialogKey+1
        })
    }

    onChange(newValue: string) {
        let lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }

    onLogDialogInvoked(logDialog: LogDialog) {
        this.setState({
            isLogDialogWindowOpen: true,
            currentLogDialog: logDialog
        })
    }

    onCloseLogDialogModal() {
        this.setState({
            isLogDialogWindowOpen: false,
            currentLogDialog: null,
            dialogKey: this.state.dialogKey+1
        })
    }

    onClickWarningWindowOk() {
        this.setState({
            isChatSessionWarningWindowOpen: false
        })
    }

    render() {
        const logDialogItems = this.props.logDialogs.all;
        const currentLogDialog = this.state.currentLogDialog;
        return (
            <div className="blis-page">
                <span className="ms-font-xxl">Log Dialogs</span>
                <div className="blis-modal-header blis-color-log"></div>
                <span className="ms-font-m-plus">Use this tool to test the current versions of your application, to check if you are progressing on the right track...</span>
                <div>
                    <CommandButton
                        onClick={() => this.onClickNewChatSession()}
                        className='blis-button--gold'
                        ariaDescription='Create a New Chat Session'
                        text='New Chat Session'
                    />
                    <ChatSessionWindow
                        app={this.props.app}
                        open={this.state.isChatSessionWindowOpen}
                        onClose={() => this.onCloseChatSessionWindow()}
                    />
                </div>
                <SearchBox
                    className="ms-font-m-plus"
                    onChange={(newValue) => this.onChange(newValue)}
                    onSearch={(newValue) => this.onChange(newValue)}
                />
                <DetailsList
                    key={this.state.dialogKey}
                    className="ms-font-m-plus"
                    items={logDialogItems}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={(logDialog, i, column: IRenderableColumn) => returnErrorStringWhenError(() => column.render(logDialog, this))}
                    onActiveItemChanged={logDialog => this.onLogDialogInvoked(logDialog)}
                />
                <LogDialogModal
                    open={this.state.isLogDialogWindowOpen}
                    app={this.props.app}
                    onClose={() => this.onCloseLogDialogModal()}
                    logDialog={currentLogDialog}
                />
                <Dialog
                    hidden={!this.state.isChatSessionWarningWindowOpen}
                    dialogContentProps={{
                        type: DialogType.normal,
                        title: 'You may not create chat session at this time. Please try again later.'
                    }}
                    onDismiss={() => this.onClickWarningWindowOk()}
                >
                    <DialogFooter>
                        <PrimaryButton onClick={() => this.onClickWarningWindowOk()} text='Ok' />
                    </DialogFooter>
                </Dialog>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createChatSessionThunkAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        logDialogs: state.logDialogs,
        user: state.user,
        actions: state.actions
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(LogDialogs);