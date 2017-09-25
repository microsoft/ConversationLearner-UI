import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { DetailsList, CommandButton, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import { setDisplayMode, setCurrentTrainDialog } from '../actions/displayActions'
import { createTrainDialog } from '../actions/createActions'
import { fetchAllTrainDialogsAsync } from '../actions/fetchActions';
import { State } from '../types'
import { TrainDialog } from 'blis-models'
import { findDOMNode } from 'react-dom';
import TeachSessionWindow from './TeachSessionWindow'
import TrainDialogWindow from './TrainDialogWindow'

let columns: IColumn[] = [
    {
        key: 'firstInput',
        name: 'First Input',
        fieldName: 'firstInput',
        minWidth: 100,
        maxWidth: 500,
        isResizable: true
    },
    {
        key: 'lastInput',
        name: 'Last Input',
        fieldName: 'lastInput',
        minWidth: 100,
        maxWidth: 500,
        isResizable: true
    },
    {
        key: 'lastResponse',
        name: 'Last Response',
        fieldName: 'lastResponse',
        minWidth: 100,
        maxWidth: 500,
        isResizable: true
    },
    {
        key: 'turns',
        name: 'Turns',
        fieldName: 'dialog',
        minWidth: 50,
        maxWidth: 50,
        isResizable: true
    }
];

interface ComponentState {
    isTeachDialogModalOpen: boolean
    isTrainDialogModalOpen: boolean
    searchValue: string
}

class TrainDialogsList extends React.Component<Props, ComponentState> {
    state = {
        isTeachDialogModalOpen: false,
        isTrainDialogModalOpen: false,
        searchValue: ''
    }
    componentDidMount() {
        this.focusNewEntityButton();
    }
    focusNewEntityButton() : void {
        findDOMNode<HTMLButtonElement>(this.refs.newSession).focus();
    }
    firstUtterance(item: any)
    {
        try {
            if (item.rounds && item.rounds.length > 0) {
                let text = item.rounds[0].extractorStep.textVariations[0].text;
                return <span className='ms-font-m-plus'>{text}</span>;
            }
            return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
        }
        catch (err) {
            return "ERR";
        }
    }
    lastUtterance(item: any)
    {
        try {
            if (item.rounds && item.rounds.length > 0) {
                let text = item.rounds[item.rounds.length-1].extractorStep.textVariations[0].text;
                return <span className='ms-font-m-plus'>{text}</span>;
            }
            return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
        }
        catch (err) {
            return "ERR";
        }
    }
    lastResponse(item: any)
    {
        try {
            if (item.rounds && item.rounds.length > 0) {
                let scorerSteps = item.rounds[item.rounds.length-1].scorerSteps;
                if (scorerSteps.length > 0)
                {
                    let actionId = scorerSteps[scorerSteps.length-1].labelAction;
                    let action = this.props.actions.find(a => a.actionId == actionId);
                    if (action)
                    {
                        return <span className='ms-font-m-plus'>{action.payload}</span>;
                    }
                }
            }
            return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
        }
        catch (err) {
            return "ERR";
        }
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'firstInput': 
                return this.firstUtterance(item);
            case 'lastInput': 
                return this.lastUtterance(item);
            case 'lastResponse': 
                return this.lastResponse(item);
            case 'turns':
                let count = item.rounds ? item.rounds.length : 0;
                return <span className='ms-font-m-plus'>{count}</span>;
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }

    onClickNewTeachSession() {
        this.setState({
            isTeachDialogModalOpen: true
        })
    }

    onCloseTeachSession() {
        this.setState({
            isTeachDialogModalOpen: false
        })
    }

    onClickTrainDialogItem(trainDialog: TrainDialog) {
       this.props.setCurrentTrainDialog(this.props.userKey, trainDialog);
       this.setState({
            isTrainDialogModalOpen: true
        })
    }

    onCoseTrainDialogWindow() {
        this.setState({
            isTrainDialogModalOpen: false
        })
    }

    onChangeSearchString(newValue: string) {
        let lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }

    renderTrainDialogItems(): TrainDialog[] {
        // let lcString = this.state.searchValue.toLowerCase();
        let filteredTrainDialogs = this.props.trainDialogs.all.filter((t: TrainDialog) => {
            return true
        })
        return filteredTrainDialogs;
    }
    
    render() {
        let trainDialogItems = this.renderTrainDialogItems()
        return (
            <div>
                <TrainingGroundArenaHeader title="Train Dialogs" description="Use this tool to train and improve the current versions of your application ..." />
                <div className="entityCreator">
                    <CommandButton
                        onClick={() => this.onClickNewTeachSession()}
                        className='blis-button--gold'
                        ariaDescription='Create a New Teach Session'
                        text='New Teach Session'
                        ref="newSession"
                    />
                    <TeachSessionWindow
                        open={this.state.isTeachDialogModalOpen}
                        onClose={() => this.onCloseTeachSession()}
                        app={this.props.apps.current}
                    />
                </div>
                <SearchBox
                    className="ms-font-m-plus"
                    onChange={(newValue) => this.onChangeSearchString(newValue)}
                    onSearch={(newValue) => this.onChangeSearchString(newValue)}
                />
                <DetailsList
                    className="ms-font-m-plus"
                    items={trainDialogItems}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn.bind(this)}
                    onActiveItemChanged={trainDialog => this.onClickTrainDialogItem(trainDialog)}
                />
                <TrainDialogWindow
                    open={this.state.isTrainDialogModalOpen}
                    onClose={() => this.onCoseTrainDialogWindow()}
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode,
        setCurrentTrainDialog,
        createTrainDialog,
        fetchAllTrainDialogsAsync,
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        userKey: state.user.key,
        apps: state.apps,
        actions: state.actions,
        trainDialogs: state.trainDialogs,
        teachSessions: state.teachSessions
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(TrainDialogsList);