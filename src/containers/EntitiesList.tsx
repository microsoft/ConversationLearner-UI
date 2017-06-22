import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader';
import EntityCreatorEditor from './EntityCreatorEditor';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { deleteEntity } from '../actions/delete'
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import { Entity } from '../models/Entity';

let columns: IColumn[] = [
    {
        key: 'name',
        name: 'Name',
        fieldName: 'name',
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
        name: 'Negatable',
        fieldName: 'metadata',
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
class EntitiesList extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.deleteSelectedEntity = this.deleteSelectedEntity.bind(this);
        this.editSelectedEntity = this.editSelectedEntity.bind(this)
        this.renderItemColumn = this.renderItemColumn.bind(this)
        this.onChange = this.onChange.bind(this)
        this.renderEntityItems = this.renderEntityItems.bind(this)
        this.state = {
            searchValue: '',
            createEditModalOpen: false,
            entitySelected: null
        }
    }
    deleteSelectedEntity() {
        this.props.deleteEntity(this.state.entityIDToDelete)
        this.setState({
            confirmDeleteEntityModalOpen: false,
            entityIDToDelete: null
        })

    }
    handleCloseDeleteModal() {
        this.setState({
            confirmDeleteEntityModalOpen: false,
            entityIDToDelete: null
        })
    }
    openDeleteModal(guid: string) {
        this.setState({
            confirmDeleteEntityModalOpen: true,
            entityIDToDelete: guid
        })
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'isBucketable':
                if (fieldContent.bucket == true) {
                    return <span className="ms-Icon ms-Icon--CheckMark checkIcon" aria-hidden="true"></span>;
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'isNegatable':
                if (fieldContent.negative == true) {
                    return <span className="ms-Icon ms-Icon--CheckMark checkIcon" aria-hidden="true"></span>;
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'actions':
                return (
                    <div>
                        <a onClick={() => this.openDeleteModal(fieldContent)}><span className="ms-Icon ms-Icon--Delete"></span>&nbsp;&nbsp;</a>
                        <a onClick={() => this.editSelectedEntity(fieldContent)}><span className="ms-Icon ms-Icon--Edit"></span></a>
                    </div>
                )
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    renderEntityItems(): Entity[] {
        //runs when user changes the text 
        let lcString = this.state.searchValue.toLowerCase();
        let filteredEntities = this.props.entities.filter((e: Entity) => {
            let nameMatch = e.name.toLowerCase().includes(lcString);
            let typeMatch = e.entityType.toLowerCase().includes(lcString);
            let match = nameMatch || typeMatch
            return match;
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
    editSelectedEntity(guid: string) {
        //do something
        let entitySelected = this.props.entities.find((e: Entity) => e.id == guid)
        this.setState({
            entitySelected: entitySelected,
            createEditModalOpen: true
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
                        className='goldButton'
                        ariaDescription='Create a New Entity'
                        text='New Entity'
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
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn}
                />
                <ConfirmDeleteModal open={this.state.confirmDeleteEntityModalOpen} onCancel={() => this.handleCloseDeleteModal()} onConfirm={() => this.deleteSelectedEntity()} title="Are you sure you want to delete this entity?" />

            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteEntity: deleteEntity
    }, dispatch)
}
const mapStateToProps = (state: any) => {
    return {
        entities: state.entities
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(EntitiesList);
