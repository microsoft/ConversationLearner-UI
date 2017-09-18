import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { setDisplayMode, setCurrentLogDialog, setCurrentChatSession } from '../actions/displayActions'
import { createLogDialog, createChatSessionAsync } from '../actions/createActions'
import { deleteChatSessionAsync } from '../actions/deleteActions'
import { fetchAllLogDialogsAsync } from '../actions/fetchActions';
import { State } from '../types'
import { LogDialog, Session } from 'blis-models'
import { DisplayMode } from '../types/const';

let columns: IColumn[] = [
    {
        key: 'firstUtterance',
        name: 'First Utterance',
        fieldName: 'firstUtterance',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'lastUtterance',
        name: 'Last Utterance',
        fieldName: 'lastUtterance',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'turns',
        name: 'Turns',
        fieldName: 'dialog',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'actions',
        name: 'Actions',
        fieldName: 'entityId',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    }
];

class LogDialogsList extends React.Component<Props, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            searchValue: ''
        }
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let columnValue = 'unknown'

        switch (column.key) {
            case 'firstUtterance':
                columnValue = item.rounds[0].extractorStep.text
                break
            case 'lastUtterance':
                columnValue = item.rounds[item.rounds.length - 1].extractorStep.text
                break
            case 'turns':
                columnValue = item.rounds.length
                break
            case 'actions':
                return (
                    <button type="button" className="blis-action" onClick={e => {
                        e.stopPropagation()
                        this.onDeleteLogDialog(item.logDialogId)
                    }}><span className="ms-Icon ms-Icon--Delete"></span></button>
                )
            default:
                break
        }

        return <span className='ms-font-m-plus'>{columnValue}</span>
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

    onLogDialogInvoked(item: LogDialog, index: number, e: MouseEvent) {
        console.log('logDialog clicked', item)
    }
    onDeleteLogDialog(logDialogId: string) {
        console.log(`logDialog id: `, logDialogId)
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
                    onRenderItemColumn={(...args) => this.renderItemColumn(...args)}
                    onItemInvoked={(l, i, e) => this.onLogDialogInvoked(l,i, e as MouseEvent)}
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode: setDisplayMode,
        createChatSession: createChatSessionAsync,
        deleteChatSession: deleteChatSessionAsync,
        setCurrentChatSession: setCurrentChatSession,
        fetchAllLogDialogs: fetchAllLogDialogsAsync,
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