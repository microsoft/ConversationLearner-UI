import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { EntityCreatorEditor, ConfirmDeleteModal } from '../../../components/modals'
import { deleteEntityAsync } from '../../../actions/deleteActions'
import { IButton, DetailsList, CommandButton, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import { State } from '../../../types';
import { BlisAppBase, EntityBase } from 'blis-models'
import { Modal } from 'office-ui-fabric-react/lib/Modal';

interface IRenderableColumn extends IColumn {
    render: (entity: EntityBase, component: Entities) => JSX.Element | JSX.Element[]
    getSortValue: (IRenderableColumn: EntityBase, component: Entities) => string
}

const columns: IRenderableColumn[] = [
    {
        key: 'entityName',
        name: 'Entity Name',
        fieldName: 'entityName',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        getSortValue: entity => entity.entityName.toLowerCase(),
        render: entity => <span className='ms-font-m-plus'>{entity.entityName}</span>
    },
    {
        key: 'entityType',
        name: 'Entity Type',
        fieldName: 'entityType',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        getSortValue: entity => entity.entityType.toLowerCase(),
        render: entity => <span className='ms-font-m-plus'>{entity.entityType}</span>
    },
    {
        key: 'isBucketable',
        name: 'Multi-Value',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        getSortValue: entity => entity.metadata.isBucket ? 'a' : 'b',
        render: entity => <span className={"ms-Icon blis-icon " + (entity.metadata.isBucket ? "ms-Icon--CheckMark" : "ms-Icon--Remove")} aria-hidden="true"></span>
    },
    {
        key: 'isNegatable',
        name: 'Negatable',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        getSortValue: entity => entity.metadata.isReversable ? 'a' : 'b',
        render: entity => <span className={"ms-Icon blis-icon " + (entity.metadata.isReversable ? "ms-Icon--CheckMark" : "ms-Icon--Remove")} aria-hidden="true"></span>
    }
];

interface ComponentState {
    searchValue: string
    confirmDeleteEntityModalOpen: boolean
    createEditModalOpen: boolean
    entitySelected: EntityBase | null
    entityIDToDelete: string
    errorModalOpen: boolean
    columns: IRenderableColumn[]
    sortColumn: IRenderableColumn
}

class Entities extends React.Component<Props, ComponentState> {
    newEntityButton: IButton

    state: ComponentState = {
        searchValue: '',
        confirmDeleteEntityModalOpen: false,
        createEditModalOpen: false,
        entitySelected: null,
        entityIDToDelete: null,
        errorModalOpen: false,
        columns: columns,
        sortColumn: null
    }

    constructor(p: any) {
        super(p);

        this.onClickConfirmDelete = this.onClickConfirmDelete.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onClickColumnHeader = this.onClickColumnHeader.bind(this)
        this.getFilteredAndSortedEntities = this.getFilteredAndSortedEntities.bind(this)
        this.handleOpenCreateModal = this.handleOpenCreateModal.bind(this)
        this.handleCloseCreateModal = this.handleCloseCreateModal.bind(this)
        this.openDeleteModal = this.openDeleteModal.bind(this)
    }

    componentDidMount() {
        this.newEntityButton.focus()
    }

    onClickConfirmDelete() {
        let entityToDelete = this.props.entities.find(entity => entity.entityId == this.state.entityIDToDelete)
        this.props.deleteEntityAsync(this.props.user.key, this.state.entityIDToDelete, entityToDelete, this.props.app.appId)
        this.setState({
            confirmDeleteEntityModalOpen: false,
            createEditModalOpen: false,
            entityIDToDelete: null
        })
    }

    onClickCancelDelete() {
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
            this.newEntityButton.focus();
        }, 500);
    }
    openDeleteModal(guid: string) {
        let tiedToAction = this.props.actions.some(a => a.negativeEntities.includes(guid) || a.requiredEntities.includes(guid))
        if (tiedToAction === true) {
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
    onSelectEntity(entity: EntityBase) {
        this.setState({
            entitySelected: entity,
            createEditModalOpen: true
        })
    }
    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        let { columns } = this.state;
        let isSortedDescending = clickedColumn.isSortedDescending;

        // If we've sorted this column, flip it.
        if (clickedColumn.isSorted) {
            isSortedDescending = !isSortedDescending;
        }

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map(col => {
                col.isSorted = (col.key === clickedColumn.key);

                if (col.isSorted) {
                    col.isSortedDescending = isSortedDescending;
                }

                return col;
            }),
            sortColumn: clickedColumn
        });
    }

    getFilteredAndSortedEntities(): EntityBase[] {
        //runs when user changes the text or sort
        let lcString = this.state.searchValue.toLowerCase();
        let filteredEntities = this.props.entities.filter(e => {
            let nameMatch = e.entityName.toLowerCase().includes(lcString);
            let typeMatch = e.entityType.toLowerCase().includes(lcString);
            let match = nameMatch || typeMatch
            return match && !e.metadata.positiveId;
        })

        if (!this.state.sortColumn) {
            return filteredEntities;
        }

        // Sort the items.
        filteredEntities
            .sort((a, b) => {
                const firstValue = this.state.sortColumn.getSortValue(a, this)
                const secondValue = this.state.sortColumn.getSortValue(b, this)
                const compareValue = firstValue.localeCompare(secondValue)
                return this.state.sortColumn.isSortedDescending
                    ? compareValue
                    : compareValue * -1
            })

        return filteredEntities;
    }

    onChange(newValue: string) {
        //runs when user changes the text 
        let lcString = newValue.toLowerCase();
        this.setState({
            searchValue: lcString
        })
    }

    render() {
        let entityItems = this.getFilteredAndSortedEntities()

        return (
            <div className="blis-page">
                <span className="ms-font-xxl">Entities</span>
                <span className="ms-font-m-plus">Manage a list of entities in your application and track and control their instances within actions...</span>
                <div>
                    <CommandButton
                        onClick={this.handleOpenCreateModal}
                        className='blis-button--gold'
                        ariaDescription='Create a New Entity'
                        text='New Entity'
                        componentRef={component => this.newEntityButton = component}
                    />
                    <EntityCreatorEditor
                        open={this.state.createEditModalOpen}
                        entity={this.state.entitySelected}
                        handleClose={this.handleCloseCreateModal}
                        handleOpenDeleteModal={this.openDeleteModal}
                    />
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
                    onRenderItemColumn={(entity: EntityBase, i, column: IRenderableColumn) => column.render(entity, this)}
                    onColumnHeaderClick={this.onClickColumnHeader}
                    onActiveItemChanged={entity => this.onSelectEntity(entity)}
                />
                <ConfirmDeleteModal
                    open={this.state.confirmDeleteEntityModalOpen}
                    onCancel={() => this.onClickCancelDelete()}
                    onConfirm={() => this.onClickConfirmDelete()}
                    title="Are you sure you want to delete this entity?"
                />
                <Modal
                    isOpen={this.state.errorModalOpen}
                    isBlocking={false}
                    containerClassName='blis-modal blis-modal--small blis-modal--border'
                >
                    <div className='blis-modal_title'>
                        <span className='ms-font-xl ms-fontWeight-semilight'>You cannot delete this entity because it is being used in an action.</span>
                    </div>
                    <div className='blis-modal_buttonbox'>
                        <CommandButton
                            onClick={() => this.onClickCancelDelete()}
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

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(Entities);
