import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader';
import EntityCreator from './EntityCreator';
import { deleteEntity } from '../actions/delete'
import { DetailsList, CommandButton, Link, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import ConfirmationModal from '../components/ConfirmationModal';
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
        }
    }
    deleteSelectedEntity() {
        this.props.deleteEntity(this.state.entityIDToDelete)
        this.setState({
            confirmDeleteEntityModalOpen: false,
            entityIDToDelete: null
        })

    }
    handleCloseModal() {
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
    editSelectedEntity(GUID: string) {
        //do something
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let self = this;
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
    render() {
        let entityItems = this.renderEntityItems();
        return (
            <div>
                <TrainingGroundArenaHeader title="Entities" description="Manage a list of entities in your application and track and control their instances within actions..." />
                <EntityCreator />
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
                <ConfirmationModal open={this.state.confirmDeleteEntityModalOpen} onCancel={() => this.handleCloseModal()} onConfirm={() => this.deleteSelectedEntity()} title="Are you sure you want to delete this entity?" />

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
