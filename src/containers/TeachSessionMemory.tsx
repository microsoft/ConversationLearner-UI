import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { setDisplayMode } from '../actions/displayActions'
import { IColumn, DetailsList, CheckboxVisibility } from 'office-ui-fabric-react';
import { Memory, EntityBase } from 'blis-models'

let columns: IColumn[] = [
    {
        key: 'entityName',
        name: 'Name',
        fieldName: 'entityName',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    },
    {
        key: 'entityValue',
        name: 'Value',
        fieldName: 'entityValue',
        minWidth: 200,
        maxWidth: 400,
        isResizable: true
    },
    {
        key: 'entityType',
        name: 'Type',
        fieldName: 'entityType',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    }
]

class TeachSessionMemory extends React.Component<Props, any> {
        constructor(p: any) {
        super(p);
        this.state = {
            columns: columns,
            sortColumn : null
        }
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
    getValue(memory: any, col: IColumn) : any
    {
        let value = memory[col.fieldName];

        if (typeof value == 'string' || value instanceof String) {
            return value.toUpperCase();
        }
        return value;
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        if (column.key == 'entityType') {
            // Lookup entity type
            let entity = this.props.entities.filter((e: EntityBase) => e.entityName == item.entityName)[0];
            fieldContent = entity ? entity.entityType : "ERROR";
        }
        return <span className='ms-font-m-plus'>{fieldContent}</span>;
    }
    renderMemories(): Memory[] {
        let filteredMemories = this.props.teachSessions.memories || [];

        if (this.state.sortColumn)
        {
            // Sort the items.
            filteredMemories = filteredMemories.concat([]).sort((a: any, b: any) => {
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

        return filteredMemories;
    }
    render() {
        let memories = this.renderMemories();
        let details = memories.length == 0 ? 
            <div className='ms-font-l teachEmptyMemory'>Empty</div> :
            <DetailsList
                className="ms-font-m-plus"
                items={memories}
                columns={this.state.columns}
                onColumnHeaderClick={ this.onColumnClick.bind(this)}
                onRenderItemColumn={this.renderItemColumn.bind(this)}
                checkboxVisibility={CheckboxVisibility.hidden}
            />
        return (
            <div className='content'>
                <div className='teachTitleBox'>
                    <div className='ms-font-l teachTitle'>Memory</div>
                </div>
                {details}
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode: setDisplayMode
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        teachSessions: state.teachSessions,
        entities: state.entities,
        user: state.user
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionMemory as React.ComponentClass<any>);