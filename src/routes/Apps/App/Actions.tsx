import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteActionAsync } from '../../../actions/deleteActions'
import { DetailsList, CommandButton, Link, CheckboxVisibility, List, IColumn, SearchBox } from 'office-ui-fabric-react';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import { BlisAppBase, ActionBase, ModelUtils } from 'blis-models'
import ActionResponseCreatorEditor from '../../../components/ActionResponseCreatorEditor';
import EntityTile from '../../../components/EntityTile';
import { State } from '../../../types'
import { findDOMNode } from 'react-dom';

let columns: IColumn[] = [
    {
        key: 'payload',
        name: 'Payload',
        fieldName: 'payload',
        minWidth: 100,
        maxWidth: 400,
        isResizable: true,
        isMultiline: true
    },
    {
        key: 'arguments',
        name: 'Arguments',
        fieldName: 'arguments',
        minWidth: 80,
        maxWidth: 300,
        isResizable: true
    },
    {
        key: 'actionType',
        name: 'Action Type',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 100,
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
        name: 'Blocking Entities',
        fieldName: 'negativeEntities',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'suggestedEntity',
        name: 'Expected Entity',
        fieldName: 'suggestedEntity',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true
    },
    {
        key: 'wait',
        name: 'Wait',
        fieldName: 'isTerminal',
        minWidth: 50,
        maxWidth: 50,
        isResizable: true
    }
];

interface ComponentState {
    actionSelected: ActionBase | null
    actionIDToDelete: string
    columns: IColumn[]
    confirmDeleteActionModalOpen: boolean
    createEditModalOpen: boolean
    searchValue: string
    sortColumn: IColumn
}

class ActionResponsesHomepage extends React.Component<Props, ComponentState> {
    constructor(p: any) {
        super(p);
        this.state = {
            actionIDToDelete: null,
            actionSelected: null,
            searchValue: '',
            confirmDeleteActionModalOpen: false,
            createEditModalOpen: false,
            columns: columns,
            sortColumn: null
        }
        this.deleteSelectedAction = this.deleteSelectedAction.bind(this);
        this.editSelectedAction = this.editSelectedAction.bind(this)
        this.renderItemColumn = this.renderItemColumn.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onColumnClick = this.onColumnClick.bind(this)
        this.renderActionItems = this.renderActionItems.bind(this)
        this.renderEntityList = this.renderEntityList.bind(this)
        this.handleOpenCreateModal = this.handleOpenCreateModal.bind(this)
        this.handleCloseCreateModal = this.handleCloseCreateModal.bind(this)
        this.handleOpenDeleteModal = this.handleOpenDeleteModal.bind(this)
    }
    componentDidMount() {
        this.focusNewActionButton();
    }
    deleteSelectedAction() {
        let actionToDelete = this.props.actions.find(a => a.actionId == this.state.actionIDToDelete)
        this.props.deleteActionAsync(this.props.user.key, this.state.actionIDToDelete, actionToDelete, this.props.app.appId);
        this.setState({
            confirmDeleteActionModalOpen: false,
            createEditModalOpen: false,
            actionIDToDelete: null
        })

    }
    focusNewActionButton() : void {
        findDOMNode<HTMLButtonElement>(this.refs.newAction).focus();
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
        setTimeout(() => {
            this.focusNewActionButton();
        }, 500);
    }
    editSelectedAction(action: ActionBase) {
        this.setState({
            actionSelected: action,
            createEditModalOpen: true
        })
    }
    onColumnClick(event: any, column: IColumn) {
        let { columns } = this.state;
        let isSortedDescending = column.isSortedDescending;

        // If we've sorted this column, flip it.
        if (column.isSorted) {
            isSortedDescending = !isSortedDescending;
        }

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map(col => {
                col.isSorted = (col.key === column.key);

                if (col.isSorted) {
                    col.isSortedDescending = isSortedDescending;
                }

                return col;
            }),
            sortColumn: column
        });
    }
    renderItemColumn(item?: ActionBase, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'wait':
                if (fieldContent == true) {
                    return <span className="ms-Icon ms-Icon--CheckMark blis-icon" aria-hidden="true"></span>;
                } else {
                    return <span className="ms-Icon ms-Icon--Remove blis-icon" aria-hidden="true"></span>;
                }
            case 'actionType':
                return <span className='ms-font-m-plus'>{fieldContent.actionType}</span>;
            case 'requiredEntities':
                if (fieldContent.length > 0) {
                    return this.renderEntityList(fieldContent)
                } else {
                    return <span className="ms-Icon ms-Icon--Remove blis-icon" aria-hidden="true"></span>;
                }
            case 'negativeEntities':
                if (fieldContent.length > 0) {
                    return this.renderEntityList(fieldContent)
                } else {
                    return <span className="ms-Icon ms-Icon--Remove blis-icon" aria-hidden="true"></span>;
                }
            case 'suggestedEntity':
                if (fieldContent != null) {
                    let entity = this.props.entities.find(e => e.entityId == fieldContent);
                    let name = entity ? entity.entityName : "!! MISSING ENTITY !!";
                    return (
                        <div className='ms-ListItem is-selectable'>
                            <span className='ms-ListItem-primaryText'>{name}</span>
                        </div>
                    )
                } else {
                    return <span className="ms-Icon ms-Icon--Remove blis-icon" aria-hidden="true"></span>;
                }
            case 'payload':
                fieldContent = ModelUtils.GetPrimaryPayload(item);
                return <span className='ms-font-m-plus'><Link onClick={() => this.editSelectedAction(item)}>{fieldContent}</Link></span>;
            case 'arguments':  
                let args = ModelUtils.GetArguments(item);
                if (args)
                {
                    return (
                        <List
                            items={args}
                            onRenderCell={(item, index) => (
                                <span className='ms-ListItem-primaryText'>{item}</span>
                            )}
                        />
                    )
                }
                return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    renderEntityList(entityIDs: string[]) {
        let entityObjects = entityIDs.map(id => this.props.entities.find(e => e.entityId == id))
        return (
            <List
                items={entityObjects}
                onRenderCell={(item, index) => (
                    <EntityTile item={item} />
                )}
            />
        )
    }
    getValue(action: ActionBase, col: IColumn): any {
        let value;
        if (col.key == 'actionType') {
            value = action.metadata.actionType;
        }
        else {
            value = action[col.fieldName];
        }

        if (typeof value == 'string' || value instanceof String) {
            return value.toLowerCase();
        }
        return value;
    }

    renderActionItems(): ActionBase[] {
        //runs when user changes the text 
        let lcString = this.state.searchValue.toLowerCase();
        let filteredActions = this.props.actions.filter(a => {
            let nameMatch = a.payload.toLowerCase().includes(lcString);
            let typeMatch = a.metadata.actionType ? a.metadata.actionType.toLowerCase().includes(lcString) : true;
            let negativeEntities = a.negativeEntities.map(entityId => {
                let found = this.props.entities.find(e => e.entityId == entityId);
                return found.entityName;
            })
            let positiveEntities = a.requiredEntities.map(entityId => {
                let found = this.props.entities.find(e => e.entityId == entityId);
                return found.entityName;
            })
            let requiredEnts = positiveEntities.join('');
            let negativeEnts = negativeEntities.join('');
            let reqEntsMatch = requiredEnts.toLowerCase().includes(lcString);
            let negEntsMatch = negativeEnts.toLowerCase().includes(lcString);
            let match = nameMatch || typeMatch || reqEntsMatch || negEntsMatch
            return match;
        })

        if (this.state.sortColumn) {
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
    render() {
        let actionItems = this.renderActionItems();
        return (
            <div className="blis-page">
                <span className="ms-font-xxl">Actions</span>
                <span className="ms-font-m-plus">Manage a list of actions that your application can take given it's state and user input...</span>
                <div>
                    <CommandButton
                        onClick={this.handleOpenCreateModal}
                        className='blis-button--gold'
                        ariaDescription='Create a New Action'
                        text='New Action'
                        ref='newAction'
                    />
                    <ActionResponseCreatorEditor
                        open={this.state.createEditModalOpen}
                        blisAction={this.state.actionSelected}
                        handleClose={this.handleCloseCreateModal}
                        handleOpenDeleteModal={this.handleOpenDeleteModal}
                    />
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
                    onColumnHeaderClick={this.onColumnClick}
                />
                <ConfirmDeleteModal open={this.state.confirmDeleteActionModalOpen} onCancel={() => this.handleCloseDeleteModal()} onConfirm={() => this.deleteSelectedAction()} title="Are you sure you want to delete this action?" />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteActionAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        actions: state.actions,
        entities: state.entities
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(ActionResponsesHomepage);
