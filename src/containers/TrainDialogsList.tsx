import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { DetailsList, CommandButton, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import { setDisplayMode, setCurrentTrainDialog, setCurrentTeachSession } from '../actions/displayActions'
import { createTrainDialog } from '../actions/createActions'
import { fetchAllTrainDialogsAsync } from '../actions/fetchActions';
import { State } from '../types'
import { TrainDialog } from 'blis-models'
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
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'firstUtterance': 
                return <span className='ms-font-m-plus'>{this.firstUtterance(item)}</span>;
            case 'lastUtterance': 
                return <span className='ms-font-m-plus'>{this.lastUtterance(item)}</span>;
            case 'turns':
                return <span className='ms-font-m-plus'>{item.rounds.length}</span>;
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    handleClick() {
        this.props.setDisplayMode(DisplayMode.Teach);  
    }
    handleSelection(selected: TrainDialog) {
       this.props.setCurrentTrainDialog(this.props.userKey, selected); 
       this.props.setDisplayMode(DisplayMode.TrainDialog);
    }
    onChange(newValue: string) {
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
                        data-automation-id='randomID9'
                        disabled={false}
                        onClick={this.handleClick.bind(this)}
                        className='blis-button--gold'
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