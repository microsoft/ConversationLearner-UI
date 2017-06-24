import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import { TrainDialog, Dialog, Turn, Input } from '../models/TrainDialog';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { setWebchatDisplay } from '../actions/update'
import { State } from '../reducers/stateTypes'

let columns: IColumn[] = [
    {
        key: 'id',
        name: 'DialogID',
        fieldName: 'id',
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
            case 'actions':
                return (
                    <div>
                        <a onClick={() => this.handleSelection(item)}><span className="ms-Icon ms-Icon--Edit"></span></a>
                    </div>
                )
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    handleClick(){
        this.props.setWebchatDisplay(true)
    }
    handleSelection(selected: TrainDialog){
        this.props.setWebchatDisplay(true)
    }
    render() {
        let trainDialogs = this.props.trainDialogs;
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
                    checkboxVisibility={CheckboxVisibility.onHover}
                    onRenderItemColumn={this.renderItemColumn.bind(this)}
                />
            </div>
        );
    }
}
const mapDispatchToProps  = (dispatch: any) => {
    return bindActionCreators({
        setWebchatDisplay: setWebchatDisplay
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TrainDialogsList);