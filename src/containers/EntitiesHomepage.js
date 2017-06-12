import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader';
import EntityCreator from './EntityCreator';
import { DetailsList, CommandButton, Link, CheckboxVisibility } from 'office-ui-fabric-react';
let columns = [
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
        fieldName: 'isBucketable',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'isNegatable',
        name: 'Negatable',
        fieldName: 'isNegatable',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
];
class EntitiesHomepage extends Component {
    constructor(props){
        super(props)
    }
    renderItemColumn(item, index, column) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'appName':
                return <span className='ms-font-m-plus'><Link href='#' onClick={() => this.BLISAppSelected(fieldContent)}>{fieldContent}</Link></span>;
            default:
                return <span className='ms-font-m-plus'>{fieldContent}</span>;
        }
    }
    render() {
        let entities = this.props.entities
        return (
            <div>
                <TrainingGroundArenaHeader title="Entities" description="Manage a list of entities in your application and track and control their instances within actions..."/>
                <EntityCreator />
                <DetailsList
                    className="ms-font-m-plus"
                    items={entities}
                    columns={columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={this.renderItemColumn}
                />

            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        entities: state.entities
    }
}
export default connect(mapStateToProps, null)(EntitiesHomepage);
