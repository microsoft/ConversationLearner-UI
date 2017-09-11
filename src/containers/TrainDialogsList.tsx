import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { setDisplayMode, setCurrentTrainDialog, setCurrentTeachSession } from '../actions/displayActions'
import { createTrainDialog, createTeachSessionAsync } from '../actions/createActions'
import { deleteTrainDialogAsync } from '../actions/deleteActions'
import { fetchAllTrainDialogsAsync } from '../actions/fetchActions';
import { State } from '../types'
import { TrainDialog, Teach } from 'blis-models'
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
        key: 'id',
        name: 'DialogID',
        fieldName: 'id',
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

class TrainDialogsList extends React.Component<Props, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            searchValue: ''
        }
        this.handleSelection = this.handleSelection.bind(this)
    }
    openDeleteModal(guid: string) {
        this.setState({
            confirmDeleteModalOpen: true,
            dialogIDToDelete: guid
        })
    }
    handleCloseDeleteModal() {
        this.setState({
            confirmDeleteModalOpen: false,
            dialogIDToDelete: null
        })
    }
    deleteSelectedDialog() {
        let currentAppId: string = this.props.apps.current.appId;
        let dialogToDelete: TrainDialog = this.props.trainDialogs.all.find((a: TrainDialog) => a.trainDialogId == this.state.dialogIDToDelete);
        
        this.props.deleteTrainDialog(this.props.userKey, dialogToDelete, currentAppId);
        this.setState({
            confirmDeleteModalOpen: false,
            dialogIDToDelete: null
        })
    }
    firstUtterance(item: any)
    {
        try {
            return  item.rounds[0].extractorStep.textVariations[0].text;
        }
        catch (err) {
            return "??";
        }
    }
    lastUtterance(item: any)
    {
        try {
            return  item.rounds[item.rounds.length-1].extractorStep.textVariations[0].text;
        }
        catch (err) {
            return "??";
        }
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let self = this;
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'firstUtterance': 
                return <span className='ms-font-m-plus'>{this.firstUtterance(item)}</span>;
            case 'lastUtterance': 
                return <span className='ms-font-m-plus'>{this.lastUtterance(item)}</span>;
            case 'turns':
                return <span className='ms-font-m-plus'>{item.rounds.length}</span>;
            case 'id':
                return <span className='ms-font-m-plus'>{item.trainDialogId}</span>;
            case 'actions':
                return (
                    <div>
                        <a onClick={() => this.openDeleteModal(item.trainDialogId)}><span className="ms-Icon ms-Icon--Delete"></span></a>
                    </div>
                )
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    handleClick() {
        this.props.setDisplayMode(DisplayMode.Teach);
    }
    handleSelection(selected: TrainDialog) {
        this.props.setCurrentTrainDialog(this.props.userKey, selected);
    }
    onChange(newValue: string) {
        let lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }
    renderTrainDialogItems(): TrainDialog[] {
        let lcString = this.state.searchValue.toLowerCase();
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
                        data-automation-id='randomID9'
                        disabled={false}
                        onClick={this.handleClick.bind(this)}
                        className='goldButton'
                        ariaDescription='Create a New Teach Session'
                        text='New Teach Session'
                    />
                </div>
                <SearchBox
                    className="ms-font-m-plus"
                    onChange={(newValue) => this.onChange(newValue)}
                    onSearch={(newValue) => this.onChange(newValue)}
                />
                <DetailsList
                    className="ms-font-m-plus"
                    items={trainDialogItems}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn.bind(this)}
                    onActiveItemChanged={(item) => this.handleSelection(item)}
                />
                <ConfirmDeleteModal open={this.state.confirmDeleteModalOpen} onCancel={() => this.handleCloseDeleteModal()} onConfirm={() => this.deleteSelectedDialog()} title="Are you sure you want to delete this Training Dialog?" />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode: setDisplayMode,
        setCurrentTrainDialog: setCurrentTrainDialog,
        setCurrentTeachSession: setCurrentTeachSession,
        createTrainDialog: createTrainDialog,
        deleteTrainDialog: deleteTrainDialogAsync,
        fetchAllTrainDialogs : fetchAllTrainDialogsAsync,
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        userKey: state.user.key,
        apps: state.apps,
        trainDialogs: state.trainDialogs,
        teachSessions: state.teachSessions
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(TrainDialogsList);