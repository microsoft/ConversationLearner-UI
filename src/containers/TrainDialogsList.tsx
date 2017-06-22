import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import { TrainDialog } from '../models/TrainDialog';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

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
];

class TrainDialogsList extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
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
    render() {
        let trainDialogs = this.props.trainDialogs;
        return (
            <div>
                <TrainingGroundArenaHeader title="Train Dialogs" description="Use this tool to test the current and published versions of your application, to check if you are progressing on the right track ..." />
                <CommandButton
                    data-automation-id='randomID9'
                    disabled={false}
                    onClick={() => console.log('clicked')}
                    className='goldButton'
                    ariaDescription='Create a New Train Dialog'
                    text='New Train Dialog'
                />
                <DetailsList
                    className="ms-font-m-plus"
                    items={trainDialogs}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.onHover}
                    onRenderItemColumn={this.renderItemColumn}
                />
            </div>
        );
    }
}
const mapStateToProps = (state: any) => {
    return {
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, null)(TrainDialogsList);