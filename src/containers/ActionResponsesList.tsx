import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader';
import { deleteActionAsync } from '../actions/deleteActions'
import { DetailsList, CommandButton, Link, CheckboxVisibility, List, IColumn, SearchBox } from 'office-ui-fabric-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { ActionBase, ActionMetaData, EntityBase, EntityMetaData } from 'blis-models'
import ActionResponseCreatorEditor from './ActionResponseCreatorEditor';
import EntityTile from '../components/EntityTile';
import { State } from '../types'

let columns: IColumn[] = [
    {
        key: 'payload',
        name: 'Payload',
        fieldName: 'payload',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        isMultiline: true
    },
    {
        key: 'actionType',
        name: 'Action Type',
        fieldName: 'metadata',
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
    }
];
class ActionResponsesHomepage extends React.Component<Props, any> {
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
            actionSelected: null,
            columns: columns,
            sortColumn : null
        }
        this.renderEntityList = this.renderEntityList.bind(this)
    }
    deleteSelectedAction() {
        let currentAppId: string = this.props.apps.current.appId;
        let actionToDelete: ActionBase = this.props.actions.find((a: ActionBase) => a.actionId == this.state.actionIDToDelete)
        this.props.deleteAction(this.props.userKey, this.state.actionIDToDelete, actionToDelete, currentAppId);
        this.setState({
            confirmDeleteActionModalOpen: false,
            createEditModalOpen: false,
            actionIDToDelete: null
        })

    }
    handleCloseDeleteModal() {
        this.setState({
            confirmDeleteActionModalOpen: false,
            actionIDToDelete: null
        })
    }
    handleOpenDeleteModal(guid: string) {
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
    onColumnClick(event: any, column : any) {
        let { sortedItems, columns } = this.state;
        let isSortedDescending = column.isSortedDescending;

        // If we've sorted this column, flip it.
        if (column.isSorted) {
            isSortedDescending = !isSortedDescending;
        }

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map((col: any) => {
                col.isSorted = (col.key === column.key);

                if (col.isSorted) {
                    col.isSortedDescending = isSortedDescending;
                }

                return col;
            }),
            sortColumn : column
        });
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
            case 'payload':
                return <span className='ms-font-m-plus'><Link onClick={() => this.editSelectedAction(item)}>{fieldContent}</Link></span>;
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
    getValue(entity: any, col: IColumn) : any
    {
        let value;
        if(col.key == 'actionType') {
            value = entity.metadata.actionType;
        }
        else {
            value = entity[col.fieldName];
        }
        
        if (typeof value == 'string' || value instanceof String) {
            return value.toLowerCase();
        }
        return value;
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

        if (this.state.sortColumn)
        {
            // Sort the items.
            filteredActions = filteredActions.concat([]).sort((a: any, b: any) => {
                let firstValue = this.getValue(a, this.state.sortColumn);
                let secondValue = this.getValue(b, this.state.sortColumn);

                if (this.state.sortColumn.isSortedDescending) {
                    return firstValue > secondValue ? -1 : 1;
                } 
                else {
                    return firstValue > secondValue ? 1 : -1;
                }
            });
        }

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
            createEditModalOpen: true,
            actionSelected: null
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
                    <ActionResponseCreatorEditor open={this.state.createEditModalOpen} blisAction={this.state.actionSelected} handleClose={this.handleCloseCreateModal.bind(this)} handleOpenDeleteModal={this.handleOpenDeleteModal.bind(this)} />
                </div>
                <SearchBox
                    className="ms-font-m-plus"
                    onChange={(newValue) => this.onChange(newValue)}
                    onSearch={(newValue) => this.onChange(newValue)}
                />
                <DetailsList
                    className="ms-font-m-plus"
                    items={actionItems}
                    columns={this.state.columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn}
                    onActiveItemChanged={(item) => this.editSelectedAction(item)}
                    onColumnHeaderClick={ this.onColumnClick.bind(this) }
                />
                <ConfirmDeleteModal open={this.state.confirmDeleteActionModalOpen} onCancel={() => this.handleCloseDeleteModal()} onConfirm={() => this.deleteSelectedAction()} title="Are you sure you want to delete this action?" />

            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteAction: deleteActionAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        userKey: state.user.key,
        actions: state.actions,
        entities: state.entities,
        apps: state.apps
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(ActionResponsesHomepage);
