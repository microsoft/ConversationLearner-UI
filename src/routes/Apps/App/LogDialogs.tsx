import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DetailsList, CommandButton, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import { State } from '../../../types'
import { BlisAppBase, LogDialog } from 'blis-models'
import { ChatSessionWindow, LogDialogModal } from '../../../components/modals'

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
    isChatSessionWindowOpen: boolean,
    isLogDialogWindowOpen: boolean,
    currentLogDialog: LogDialog,
    searchValue: string
}

class LogDialogs extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        isChatSessionWindowOpen: false,
        isLogDialogWindowOpen: false,
        currentLogDialog: null,
        searchValue: ''
    }

    onClickNewChatSession() {
        this.setState({
            isChatSessionWindowOpen: true
        })
    }

    onCloseChatSessionWindow() {
        this.setState({
            isChatSessionWindowOpen: false
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
            currentLogDialog: null
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
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
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