import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader';
import ActionResponseCreator from './ActionResponseCreator';
import { deleteAction } from '../actions/delete'
import { DetailsList, CommandButton, Link, CheckboxVisibility, List, IColumn } from 'office-ui-fabric-react';
import ConfirmationModal from '../components/ConfirmationModal';

let columns : IColumn[] = [
    {
        key: 'actionType',
        name: 'Action Type',
        fieldName: 'actionType',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'content',
        name: 'Content',
        fieldName: 'content',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'positiveEntities',
        name: 'Required Entities',
        fieldName: 'positiveEntities',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'negativeEntities',
        name: 'Negative Entities',
        fieldName: 'negativeEntities',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'wait',
        name: 'Wait',
        fieldName: 'waitAction',
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
class ActionResponsesHomepage extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.deleteSelectedAction = this.deleteSelectedAction.bind(this);
        this.editSelectedAction = this.editSelectedAction.bind(this)
        this.renderItemColumn = this.renderItemColumn.bind(this)
        this.state = {
            confirmDeleteActionModalOpen: false,
            actionIDToDelete: null
        }
    }
    deleteSelectedAction() {
        this.props.deleteAction(this.state.actionIDToDelete)
        this.setState({
            confirmDeleteActionModalOpen: false,
            actionIDToDelete: null
        })

    }
    handleCloseModal() {
        this.setState({
            confirmDeleteActionModalOpen: false,
            actionIDToDelete: null
        })
    }
    openDeleteModal(guid: string) {
        this.setState({
            confirmDeleteActionModalOpen: true,
            actionIDToDelete: guid
        })
    }
    editSelectedAction(GUID: string) {
        //do something
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'wait':
                if (fieldContent == true) {
                    return <span className="ms-Icon ms-Icon--CheckMark checkIcon" aria-hidden="true"></span>;
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'positiveEntities':
                if (fieldContent.length > 0) {
                    return (
                        <List
                            items={fieldContent}
                            onRenderCell={(item, index) => (
                                <EntityTile item={item} />
                            )}
                        />
                    )
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'negativeEntities':
                if (fieldContent.length > 0) {
                    return (
                        <List
                            items={fieldContent}
                            onRenderCell={(item, index) => (
                                <EntityTile item={item} />
                            )}
                        />
                    )
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'actions':
                return (
                    <div>
                        <a onClick={() => this.openDeleteModal(fieldContent)}><span className="ms-Icon ms-Icon--Delete"></span>&nbsp;&nbsp;</a>
                        <a onClick={() => this.editSelectedAction(fieldContent)}><span className="ms-Icon ms-Icon--Edit"></span></a>
                    </div>
                )
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    render() {
        let actions = this.props.actions
        return (
            <div>
                <TrainingGroundArenaHeader title="Actions" description="Manage a list of actions that your application can take given it's state and user input.." />
                <ActionResponseCreator />
                <DetailsList
                    className="ms-font-m-plus"
                    items={actions}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn}
                />
                <ConfirmationModal open={this.state.confirmDeleteActionModalOpen} onCancel={() => this.handleCloseModal()} onConfirm={() => this.deleteSelectedAction()} title="Are you sure you want to delete this action?" />

            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteAction: deleteAction
    }, dispatch)
}
const mapStateToProps = (state: any) => {
    return {
        actions: state.actions
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ActionResponsesHomepage);

export class EntityTile extends React.Component<any, any> {
    render() {
        let { item } = this.props;
        return (
            <div className='ms-ListItem is-selectable'>
                <span className='ms-ListItem-primaryText'>{item.name}</span>
            </div>
        );
    }
}
