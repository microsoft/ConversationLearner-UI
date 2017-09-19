import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { setDisplayMode } from '../actions/displayActions'
import { createLogDialog, createChatSessionAsync } from '../actions/createActions'
import { State } from '../types'
import { LogDialog, Session } from 'blis-models'
import { DisplayMode } from '../types/const';
import LogDialogModal from './LogDialogModal';

interface IRenderableColumn extends IColumn {
    render: (x: LogDialog) => React.ReactNode
}

let columns: IRenderableColumn[] = [
    {
        key: 'firstUtterance',
        name: 'First Utterance',
        fieldName: 'firstUtterance',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: logDialog => <span className='ms-font-m-plus'>{logDialog.rounds[0].extractorStep.text}</span>
    },
    {
        key: 'lastUtterance',
        name: 'Last Utterance',
        fieldName: 'lastUtterance',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: logDialog => <span className='ms-font-m-plus'>{logDialog.rounds[logDialog.rounds.length - 1].extractorStep.text}</span>
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
    isLogDialogWindowOpen: boolean,
    currentLogDialog: LogDialog,
    searchValue: string
}

class LogDialogsList extends React.Component<Props, ComponentState> {
    constructor(p: Props) {
        super(p);
        this.state = {
            isLogDialogWindowOpen: false,
            currentLogDialog: null,
            searchValue: ''
        }
    }

    handleClick() {
        this.props.setDisplayMode(DisplayMode.Session);
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

    renderLogDialogItems(): LogDialog[] {
        let lcString = this.state.searchValue.toLowerCase();
        let filteredLogDialogs = this.props.logDialogs.all.filter((logDialogItems: LogDialog) => {
            return true
        })
        return filteredLogDialogs;
    }
    
    render() {
        const logDialogItems = this.props.logDialogs.all;
        const currentLogDialog = this.state.currentLogDialog;
        return (
            <div>
                <TrainingGroundArenaHeader title="Log Dialogs" description="Use this tool to test the current versions of your application, to check if you are progressing on the right track ..." />
                <div className="entityCreator">
                    <CommandButton
                        data-automation-id='randomID20'
                        disabled={false}
                        onClick={this.handleClick.bind(this)}
                        className='goldButton'
                        ariaDescription='Create a New Chat Session'
                        text='New Chat Session'
                    />
                    <LogDialogModal
                        open={this.state.isLogDialogWindowOpen}
                        logDialog={currentLogDialog}
                        app={this.props.apps.current}
                        onClose={() => this.onCloseLogDialogModal()}
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
                    onRenderItemColumn={(logDialog, i, column: IRenderableColumn) => column.render(logDialog)}
                    onActiveItemChanged={logDialog => this.onLogDialogInvoked(logDialog)}
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        logDialogs: state.logDialogs,
        userKey: state.user.key,
        apps: state.apps,
        chatSessions: state.chatSessions
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(LogDialogsList);