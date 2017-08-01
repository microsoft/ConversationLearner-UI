import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { setDisplayMode } from '../actions/updateActions'
import { IColumn, DetailsList } from 'office-ui-fabric-react';
import { Memory } from 'blis-models'

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
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
    }
]

class TeachSessionMemory extends React.Component<any, any> {
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
        return (
            <div className='content'>
                <div className={this.props.class}>
                    Memory
                </div>
                <DetailsList
                        className="ms-font-m-plus"
                        items={memories}
                        columns={this.state.columns}
                        onColumnHeaderClick={ this.onColumnClick.bind(this) }
                />
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
        user: state.user
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionMemory as React.ComponentClass<any>);