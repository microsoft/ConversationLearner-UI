import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader';
import { deleteAction } from '../actions/deleteActions'
import { DetailsList, CommandButton, Link, CheckboxVisibility, List, IColumn, SearchBox } from 'office-ui-fabric-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { ActionBase, ActionMetaData, EntityBase, EntityMetaData } from 'blis-models'
import ActionResponseCreatorEditor from './ActionResponseCreatorEditor';
import EntityTile from '../components/EntityTile';
import { State } from '../types'

let columns: IColumn[] = [
    {
        key: 'actionType',
        name: 'Action Type',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'payload',
        name: 'Payload',
        fieldName: 'payload',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'requiredEntities',
        name: 'Required Entities',
        fieldName: 'requiredEntities',
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
        fieldName: 'isTerminal',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'actions',
        name: 'Actions',
        fieldName: 'actionId',
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
        this.renderEntityList = this.renderEntityList.bind(this)
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
    editSelectedAction(action: ActionBase) {
        this.setState({
            actionSelected: action,
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
            case 'actionType':
                return <span className='ms-font-m-plus'>{fieldContent.actionType}</span>;
            case 'requiredEntities':
                if (fieldContent.length > 0) {
                    return this.renderEntityList(fieldContent)
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'negativeEntities':
                if (fieldContent.length > 0) {
                    return this.renderEntityList(fieldContent)
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'actions':
                return (
                    <div>
                        <a onClick={() => this.openDeleteModal(fieldContent)}><span className="ms-Icon ms-Icon--Delete"></span></a>
                    </div>
                )
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    renderEntityList(entityIDs: string[]) {
        let entityObjects: EntityBase[];
        entityObjects = entityIDs.map((id: string) => {
            return this.props.entities.find((e: EntityBase) => e.entityId == id)
        })
        return (
            <List
                items={entityObjects}
                onRenderCell={(item, index) => (
                    <EntityTile item={item} />
                )}
            />
        )

    }
    renderActionItems(): ActionBase[] {
        //runs when user changes the text 
        let lcString = this.state.searchValue.toLowerCase();
        let filteredActions = this.props.actions.filter((a: ActionBase) => {
            let nameMatch = a.payload.toLowerCase().includes(lcString);
            let typeMatch = a.metadata.actionType ? a.metadata.actionType.toLowerCase().includes(lcString) : true;
            let negativeEntities: string[] = a.negativeEntities.map((entityId: string) => {
                let found: EntityBase = this.props.entities.find((e: EntityBase) => e.entityId == entityId);
                return found.entityName;
            })
            let positiveEntities: string[] = a.requiredEntities.map((entityId: string) => {
                let found: EntityBase = this.props.entities.find((e: EntityBase) => e.entityId == entityId);
                return found.entityName;
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
                    onActiveItemChanged={(item) => this.editSelectedAction(item)}
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
        actions: state.actions,
        entities: state.entities
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ActionResponsesHomepage);
