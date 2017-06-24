import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader';
import { deleteAction } from '../actions/delete'
import { DetailsList, CommandButton, Link, CheckboxVisibility, List, IColumn, SearchBox } from 'office-ui-fabric-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Action } from '../models/Action'
import { Entity } from '../models/Entity'
import ActionResponseCreatorEditor from './ActionResponseCreatorEditor';
import EntityTile from '../components/EntityTile';
import { State } from '../reducers/stateTypes'

let columns: IColumn[] = [
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
        this.onChange = this.onChange.bind(this)
        this.renderActionItems = this.renderActionItems.bind(this)
        this.state = {
            searchValue: '',
            createEditModalOpen: false,
            actionSelected: null
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
    editSelectedAction(guid: string) {
        //do something
        let actionSelected = this.props.actions.find((a: Action) => a.id == guid)
        this.setState({
            actionSelected: actionSelected,
            createEditModalOpen: true
        })
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
    renderActionItems(): Action[] {
        //runs when user changes the text 
        let lcString = this.state.searchValue.toLowerCase();
        let filteredActions = this.props.actions.filter((a: Action) => {
            let nameMatch = a.content.toLowerCase().includes(lcString);
            let typeMatch = a.actionType.toLowerCase().includes(lcString);
            let positiveEntities = a.positiveEntities.map((ent: Entity) => {
                return ent.name;
            })
            let negativeEntities = a.negativeEntities.map((ent: Entity) => {
                return ent.name;
            })
            let requiredEnts = positiveEntities.join('');
            let negativeEnts = negativeEntities.join('');
            let reqEntsMatch = requiredEnts.toLowerCase().includes(lcString);
            let negEntsMatch = negativeEnts.toLowerCase().includes(lcString);
            let match = nameMatch || typeMatch || reqEntsMatch || negEntsMatch
            return match;
        })
        return filteredActions;
    }
    onChange(newValue: string) {
        //runs when user changes the text 
        let lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }
    handleOpenCreateModal() {
        this.setState({
            createEditModalOpen: true
        })
    }
    handleCloseCreateModal() {
        this.setState({
            createEditModalOpen: false,
            actionSelected: null
        })
    }
    render() {
        let actionItems = this.renderActionItems();
        return (
            <div>
                <TrainingGroundArenaHeader title="Actions" description="Manage a list of actions that your application can take given it's state and user input.." />
                <div className='actionResponseCreator'>
                    <CommandButton
                        data-automation-id='randomID4'
                        disabled={false}
                        onClick={this.handleOpenCreateModal.bind(this)}
                        className='goldButton'
                        ariaDescription='Create a New Action'
                        text='New Action'
                    />
                    <ActionResponseCreatorEditor open={this.state.createEditModalOpen} action={this.state.actionSelected} handleClose={this.handleCloseCreateModal.bind(this)} />
                </div>
                <SearchBox
                    className="ms-font-m-plus"
                    onChange={(newValue) => this.onChange(newValue)}
                    onSearch={(newValue) => this.onChange(newValue)}
                />
                <DetailsList
                    className="ms-font-m-plus"
                    items={actionItems}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn}
                />
                <ConfirmDeleteModal open={this.state.confirmDeleteActionModalOpen} onCancel={() => this.handleCloseModal()} onConfirm={() => this.deleteSelectedAction()} title="Are you sure you want to delete this action?" />

            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteAction: deleteAction
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        actions: state.actions
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ActionResponsesHomepage);
