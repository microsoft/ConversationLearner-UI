import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader';
import EntityCreatorEditor from './EntityCreatorEditor';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { deleteEntityAsync } from '../actions/deleteActions'
import { DetailsList, CommandButton, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import { State } from '../types';
import { BlisAppBase, EntityBase, ActionBase } from 'blis-models'
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { findDOMNode } from 'react-dom';

let columns: IColumn[] = [
    {
        key: 'entityName',
        name: 'Entity Name',
        fieldName: 'entityName',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'entityType',
        name: 'Entity Type',
        fieldName: 'entityType',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'isBucketable',
        name: 'Bucketable',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'isNegatable',
        name: 'Reversible',
        fieldName: 'metadata',
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
    },
];

interface ComponentState {
    searchValue: string
    confirmDeleteEntityModalOpen: boolean
    createEditModalOpen: boolean
    entitySelected: EntityBase | null
    entityIDToDelete: string
    errorModalOpen: boolean
    columns: IColumn[]
    sortColumn: IColumn
}

class EntitiesList extends React.Component<Props, ComponentState> {
    constructor(p: any) {
        super(p);
        this.deleteSelectedEntity = this.deleteSelectedEntity.bind(this);
        this.renderItemColumn = this.renderItemColumn.bind(this)
        this.onChange = this.onChange.bind(this)
        this.renderEntityItems = this.renderEntityItems.bind(this)
        this.state = {
            searchValue: '',
            confirmDeleteEntityModalOpen: false,
            createEditModalOpen: false,
            entitySelected: null,
            entityIDToDelete: null,
            errorModalOpen: false,
            columns: columns,
            sortColumn: null
        }
    }
    componentDidMount() {
        this.focusNewEntityButton();
    }
    focusNewEntityButton(): void {
        findDOMNode<HTMLButtonElement>(this.refs.newEntity).focus();
    }
    deleteSelectedEntity() {
        let entityToDelete: EntityBase = this.props.entities.find((a: EntityBase) => a.entityId == this.state.entityIDToDelete)
        this.props.deleteEntityAsync(this.props.user.key, this.state.entityIDToDelete, entityToDelete, this.props.app.appId)
        this.setState({
            confirmDeleteEntityModalOpen: false,
            entityIDToDelete: null
        })

    }
    handleCloseDeleteModal() {
        this.setState({
            confirmDeleteEntityModalOpen: false,
            entityIDToDelete: null,
            errorModalOpen: false
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
            entitySelected: null
        })
        setTimeout(() => {
            this.focusNewEntityButton();
        }, 500);
    }
    openDeleteModal(guid: string) {
        let tiedToAction: boolean;
        this.props.actions.map((a: ActionBase) => {
            if (a.negativeEntities.includes(guid) || a.requiredEntities.includes(guid)) {
                tiedToAction = true;
                return;
            }
        })
        if (tiedToAction && tiedToAction === true) {
            this.setState({
                errorModalOpen: true
            })
        } else {
            this.setState({
                confirmDeleteEntityModalOpen: true,
                entityIDToDelete: guid
            })
        }
    }
    onColumnClick(event: any, column: any) {
        let { columns } = this.state;
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
            sortColumn: column
        });
    }

    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'isBucketable':
                if (fieldContent.isBucket == true) {
                    return <span className="ms-Icon ms-Icon--CheckMark checkIcon" aria-hidden="true"></span>;
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'isNegatable':
                if (fieldContent.isReversable == true) {
                    return <span className="ms-Icon ms-Icon--CheckMark checkIcon" aria-hidden="true"></span>;
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
    renderEntityItems(): EntityBase[] {
        //runs when user changes the text or sort
        let lcString = this.state.searchValue.toLowerCase();
        let filteredEntities = this.props.entities.filter((e: EntityBase) => {
            let nameMatch = e.entityName.toLowerCase().includes(lcString);
            let typeMatch = e.entityType.toLowerCase().includes(lcString);
            let match = nameMatch || typeMatch
            return match;
        })

        if (!this.state.sortColumn) {
            return filteredEntities;
        }

        // Sort the items.
        let sortedItems = filteredEntities.concat([]).sort((a: any, b: any) => {
            let firstValue = this.getValue(a, this.state.sortColumn);
            let secondValue = this.getValue(b, this.state.sortColumn);

            if (this.state.sortColumn.isSortedDescending) {
                return firstValue > secondValue ? -1 : 1;
            }
            else {
                return firstValue > secondValue ? 1 : -1;
            }
        });

        return sortedItems;
    }

    getValue(entity: any, col: IColumn): any {
        let value;
        if (col.key == 'isBucketable') {
            value = entity.metadata.isBucket;
        }
        else if (col.key == 'isNegatable') {
            value = entity.metadata.isReversable;
        }
        else {
            value = entity[col.fieldName];
        }

        if (typeof value == 'string' || value instanceof String) {
            return value.toLowerCase();
        }
        return value;
    }

    onChange(newValue: string) {
        //runs when user changes the text 
        let lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }
    render() {
        let entityItems = this.renderEntityItems();

        return (
            <div>
                <TrainingGroundArenaHeader title="Entities" description="Manage a list of entities in your application and track and control their instances within actions..." />
                <div className='entityCreator'>
                    <CommandButton
                        data-automation-id='randomID4'
                        disabled={false}
                        onClick={this.handleOpenCreateModal.bind(this)}
                        className='blis-button--gold'
                        ariaDescription='Create a New Entity'
                        text='New Entity'
                        ref='newEntity'
                    />
                    <EntityCreatorEditor open={this.state.createEditModalOpen} entity={this.state.entitySelected} handleClose={this.handleCloseCreateModal.bind(this)} />
                </div>
                <SearchBox
                    className="ms-font-m-plus"
                    onChange={(newValue) => this.onChange(newValue)}
                    onSearch={(newValue) => this.onChange(newValue)}
                />
                <DetailsList
                    className="ms-font-m-plus"
                    items={entityItems}
                    columns={this.state.columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn}
                    onColumnHeaderClick={this.onColumnClick.bind(this)}
                />
                <ConfirmDeleteModal open={this.state.confirmDeleteEntityModalOpen} onCancel={() => this.handleCloseDeleteModal()} onConfirm={() => this.deleteSelectedEntity()} title="Are you sure you want to delete this entity?" />
                <Modal
                    isOpen={this.state.errorModalOpen}
                    isBlocking={false}
                    containerClassName='createModal'
                >
                    <div className='modalHeader'>
                        <span className='ms-font-xl ms-fontWeight-semilight'>You cannot delete this entity because it is being used in an action.</span>
                    </div>
                    <div className='modalFooter'>
                        <CommandButton
                            disabled={false}
                            onClick={() => this.handleCloseDeleteModal()}
                            className='blis-button--gold'
                            ariaDescription='Close'
                            text='Close'
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteEntityAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        entities: state.entities,
        actions: state.actions
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(EntitiesList);
