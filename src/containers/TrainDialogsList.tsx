import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import { TrainDialog, Dialog, Turn, Input } from '../models/TrainDialog';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { setWebchatDisplay, setCurrentTrainDialog } from '../actions/update'
import { createTrainDialog } from '../actions/create'
import { State } from '../types'

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

class TrainDialogsList extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.handleSelection = this.handleSelection.bind(this)
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let self = this;
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'turns':
                return <span className='ms-font-m-plus'>{fieldContent.turns.length}</span>;
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    handleClick(){
        let turns : Turn [] = [];
        let dialog = new Dialog(turns)
        let trainDialog = new TrainDialog(this.generateGUID(), dialog, this.props.blisApps.current.modelID)
        this.props.setWebchatDisplay(true)
        this.props.createTrainDialog(trainDialog);
    }
    generateGUID(): string {
        let d = new Date().getTime();
        let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (char == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return guid;
    }
    handleSelection(selected: TrainDialog){
        this.props.setWebchatDisplay(true)
        this.props.setCurrentTrainDialog(selected);
    }
    render() {
        let trainDialogs = this.props.trainDialogs.all;
        return (
            <div>
                <TrainingGroundArenaHeader title="Train Dialogs" description="Use this tool to test the current and published versions of your application, to check if you are progressing on the right track ..." />
                <CommandButton
                    data-automation-id='randomID9'
                    disabled={false}
                    onClick={this.handleClick.bind(this)}
                    className='goldButton'
                    ariaDescription='Create a New Train Dialog'
                    text='New Train Dialog'
                />
                <DetailsList
                    className="ms-font-m-plus"
                    items={trainDialogs}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn.bind(this)}
                    onActiveItemChanged={(item) => this.handleSelection(item)}
                />
            </div>
        );
    }
}
const mapDispatchToProps  = (dispatch: any) => {
    return bindActionCreators({
        setWebchatDisplay: setWebchatDisplay,
        setCurrentTrainDialog: setCurrentTrainDialog,
        createTrainDialog: createTrainDialog
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        blisApps: state.apps,
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TrainDialogsList);