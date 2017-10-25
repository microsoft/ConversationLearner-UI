import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { IColumn, DetailsList, CheckboxVisibility } from 'office-ui-fabric-react';
import { EntityBase, Memory } from 'blis-models'
import { DialogMode } from '../../types/const'

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
        key: 'entityValues',
        name: 'Value',
        fieldName: 'entityValues',
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

interface ComponentState {
    columns: IColumn[],
    sortColumn: IColumn
}

class MemoryTable extends React.Component<Props, ComponentState> {
    constructor(p: any) {
        super(p);
        this.state = {
            columns: columns,
            sortColumn: null
        }

        this.onColumnClick = this.onColumnClick.bind(this)
        this.renderItemColumn = this.renderItemColumn.bind(this)
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
    getValue(memory: any, col: IColumn): any {
        let value = memory[col.fieldName];

        if (typeof value == 'string' || value instanceof String) {
            return value.toUpperCase();
        }
        return value;
    }
    previousMemory(entityName: string) {
        let prevMemories = this.props.prevMemories || [];
        return prevMemories.find(m => m.entityName == entityName);
    }
    renderEntityName(entityName: string) {

        let curEntity = this.props.memories.find(m => m.entityName == entityName);
        let prevEntity = this.props.prevMemories.find(m => m.entityName == entityName);
        let entityClass = "ms-font-m-plus";

        // Show changes when editing
        if (this.props.dialogMode != DialogMode.Wait) {
            // In old but not new
            if (prevEntity && !curEntity) {
                entityClass += " blis-font--deleted";
            }
            // In new but not old
            else if (!prevEntity && curEntity) {
                entityClass += " blis-font--emphasis";
            }
        }
        return <span className={entityClass}>{entityName}</span>
    }
    renderEntityValues(entityName : string) {

        // Current entity values
        let curMemory = this.props.memories.find(m => m.entityName == entityName);
        let curValues = curMemory ? curMemory.entityValues : [];

        // Corresponding old memory values
        let prevMemory = this.props.prevMemories.find(m => m.entityName == entityName);
        let prevValues = prevMemory ? prevMemory.entityValues : [];
        
        // Find union and remove duplicates
        let unionValues = [...curValues, ...prevValues];
        unionValues = Array.from(new Set(unionValues));

        // Print out list in friendly manner
        let display = [];
        let index = 0;
        for (let value of unionValues)
        {
            let entityClass = "";

            // Calculate prefix
            let prefix = "";
            if (unionValues.length != 1 && index == unionValues.length-1) {
                prefix = " and ";
            }
            else if (index != 0) {
                prefix = ", ";
            }

            // Show changes when editing
            if (this.props.dialogMode != DialogMode.Wait) {
                // In old but not new
                if (prevValues.indexOf(value) >= 0  && curValues.indexOf(value) < 0) {
                    entityClass = "blis-font--deleted";
                }
                // In new but not old
                else if (prevValues.indexOf(value) < 0  && curValues.indexOf(value) >= 0) {
                    entityClass = "blis-font--emphasis";
                }
            }
            display.push(<span className='ms-font-m-plus' key={value}>{prefix}<span className={entityClass}>{value}</span></span>);

            index++;
        }
        return display; 

    }
    renderItemColumn(entityName?: any, index?: number, column?: IColumn) {

        if (column.key == 'entityType') {
            // Lookup entity type
            let entity = this.props.entities.filter((e: EntityBase) => e.entityName == entityName)[0];
            let type = entity ? entity.entityType : "ERROR";
            return <span className="ms-font-m-plus">{type}</span>;  
        }
        else if (column.key == 'entityValues') {
            return this.renderEntityValues(entityName);
        }
        else if (column.key == 'entityName')
        {
            return this.renderEntityName(entityName);
        }
        return null;
    }
    getMemoryNames(): string[] {

         let unionMemoryNames = this.props.dialogMode == DialogMode.Wait ?
            // If waiting for user input just show current entities
            [
                ...this.props.memories.map(m => m.entityName)
            ] :
            // Find union or old and new remove duplicates
            [
                ...this.props.memories.map(m => m.entityName), 
                ...this.props.prevMemories.map(m => m.entityName)
            ];
         
        unionMemoryNames = Array.from(new Set(unionMemoryNames));

        if (this.state.sortColumn) {
            // Sort the items.
            unionMemoryNames = unionMemoryNames.concat([]).sort((a: any, b: any) => {
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

        return unionMemoryNames;
    }
    render() {
        let memoryNames = this.getMemoryNames();
        let details = memoryNames.length == 0 ?
            <div className='ms-font-l teachEmptyMemory'>Empty</div> :
            <DetailsList
                className="ms-font-m-plus"
                items={memoryNames}
                columns={this.state.columns}
                onColumnHeaderClick={this.onColumnClick}
                onRenderItemColumn={this.renderItemColumn}
                checkboxVisibility={CheckboxVisibility.hidden}
            />
        return (
            <div>
                {details}
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        entities: state.entities,
        user: state.user,
    }
}

export interface ReceivedProps {
    dialogMode: DialogMode,
    memories: Memory[],
    prevMemories: Memory[]
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(MemoryTable);