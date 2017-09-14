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
        key: 'turns',
        name: 'Turns',
        fieldName: 'dialog',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'lastEdit',
        name: 'Last Edit',
        fieldName: 'lastEdit',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'id',
        name: 'DialogID',
        fieldName: 'id',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
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
            case 'id':
                columnValue = item.logDialogId
                break
            case 'firstUtterance':
                // TODO: Fix when real data is available
                columnValue = 'Stub Value'
                break
            case 'turns':
                columnValue = item.rounds.length
                break
            case 'lastEdit':
                // TODO: Find actual last edit value?
                columnValue = item.dialogEndDatetime
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

    onActiveItemChanged(item: LogDialog) {
        console.log('logDialog clicked', item)
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
                    onActiveItemChanged={(item) => this.onActiveItemChanged(item)}
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
        fetchAllLogDialogs : fetchAllLogDialogsAsync,
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