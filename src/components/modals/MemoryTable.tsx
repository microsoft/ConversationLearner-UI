import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import * as OF from 'office-ui-fabric-react';
import { onRenderDetailsHeader } from '../ToolTips'
import { EntityBase, EntityType, Memory } from 'blis-models'
import { DialogMode } from '../../types/const'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'

const columns: OF.IColumn[] = [
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
    },
    {
        key: 'isProgrammatic',
        name: 'Programmatic',
        fieldName: 'isProgrammatic',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
    },
    {
        key: 'isBucketable',
        name: 'Multi-Value',
        fieldName: 'isBucketable',
        minWidth: 80,
        maxWidth: 100,
        isResizable: true,
    },
    {
        key: 'isNegatable',
        name: 'Negatable',
        fieldName: 'isNegatable',
        minWidth: 80,
        maxWidth: 100,
        isResizable: true,
    }
]

interface ComponentState {
    columns: OF.IColumn[],
    sortColumn: OF.IColumn
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
    onColumnClick(event: any, column: OF.IColumn) {
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
    getValue(memory: any, col: OF.IColumn): any {
        let value = memory[col.fieldName];

        if (typeof value === 'string' || value instanceof String) {
            return value.toUpperCase();
        }
        return value;
    }
    previousMemory(entityName: string) {
        let prevMemories = this.props.prevMemories || [];
        return prevMemories.find(m => m.entityName === entityName);
    }
    renderEntityName(entityName: string) {

        let curEntity = this.props.memories.find(m => m.entityName === entityName);
        let prevEntity = this.props.prevMemories.find(m => m.entityName === entityName);
        let entityClass = 'ms-font-m-plus';

        // In old but not new
        if (prevEntity && !curEntity) {
            entityClass += ' blis-font--deleted';
        }
        // In new but not old
        else if (!prevEntity && curEntity) {
            entityClass += ' blis-font--emphasis';
        }

        return <span className={entityClass}>{entityName}</span>
    }
    renderEntityValues(entityName: string) {

        // Current entity values
        let entity = this.props.entities.find(e => e.entityName === entityName);
        let curMemory = this.props.memories.find(m => m.entityName === entityName);
        let curMemoryValues = curMemory ? curMemory.entityValues : [];
        let curValues = curMemoryValues.map(cmv => cmv.value);

        // Corresponding old memory values
        let prevMemory = this.props.prevMemories.find(m => m.entityName === entityName);
        let prevMemoryValues = prevMemory ? prevMemory.entityValues : [];
        let prevValues = prevMemoryValues.map(pmv => pmv.value);

        // Find union and remove duplicates
        let unionMemoryValues = [...curMemoryValues, ...prevMemoryValues.filter(pmv => !curMemoryValues.find(cmv => cmv.value === pmv.value))];

        // Print out list in friendly manner
        let display = [];
        let index = 0;
        for (let memoryValue of unionMemoryValues) {
            let entityClass = '';

            // Calculate prefix
            let prefix = '';
            if (!entity.metadata || !entity.metadata.isBucket) {
                prefix = ' ';
            } else if (unionMemoryValues.length !== 1 && index === unionMemoryValues.length - 1) {
                prefix = ' and ';
            } else if (index !== 0) {
                prefix = ', ';
            }

            // In old but not new
            if (prevValues.indexOf(memoryValue.value) >= 0 && curValues.indexOf(memoryValue.value) < 0) {
                entityClass = 'blis-font--deleted';
            }
            // In new but not old
            else if (prevValues.indexOf(memoryValue.value) < 0 && curValues.indexOf(memoryValue.value) >= 0) {
                entityClass = 'blis-font--emphasis';
            }

            // If a pre-built, show tool tip with extra info
            if (memoryValue.type || memoryValue.resolution) {
                entityClass += ' blisText--emphasis';
                display.push(
                    <div>
                    <OF.TooltipHost 
                        tooltipProps={{
                            onRenderContent: () => {
                                return (
                                    <div>
                                        <span><b>{memoryValue.type}</b><br/><br/></span>
                                        <span>{JSON.stringify(memoryValue.resolution)}</span>
                                    </div>
                                );
                            }
                        }}
                        calloutProps={ { gapSpace: 0 } }
                    >
                        <span className="ms-font-m-plus" key={memoryValue.value}>{prefix}<span className={entityClass}>{memoryValue.value}</span></span>
                    </OF.TooltipHost>
                  </div>
                )
            } else {
                display.push(<span className="ms-font-m-plus" key={memoryValue.value}>{prefix}<span className={entityClass}>{memoryValue.value}</span></span>);                
            }
 
            index++;
        }
        return display;

    }
    renderItemColumn(entityName?: string, index?: number, column?: OF.IColumn) {

        let entity = this.props.entities.filter((e: EntityBase) => e.entityName === entityName)[0];
        if (!entity) {
            return 'ERROR';
        }
        if (column.key === 'entityType') {
            let type = (entity.entityType === EntityType.LOCAL || entity.entityType === EntityType.LUIS) ? 'CUSTOM' : entity.entityType;
            return <span className="ms-font-m-plus">{type}</span>;
        } else if (column.key === 'entityValues') {
            return this.renderEntityValues(entityName);
        } else if (column.key === 'isProgrammatic') {
            return <span className={'ms-Icon blis-icon ' + (entity.entityType === EntityType.LOCAL ? 'ms-Icon--CheckMark' : 'ms-Icon--Remove')} aria-hidden="true"/>
        } else if (column.key === 'isBucketable') {
            return <span className={'ms-Icon blis-icon ' + (entity.metadata.isBucket ? 'ms-Icon--CheckMark' : 'ms-Icon--Remove')} aria-hidden="true"/>
        } else if (column.key === 'isNegatable') {
            return <span className={'ms-Icon blis-icon ' + (entity.metadata.isReversable ? 'ms-Icon--CheckMark' : 'ms-Icon--Remove')} aria-hidden="true"/>
        } else if (column.key === 'entityName') {
            return this.renderEntityName(entityName);
        }
        return null;
    }
    getMemoryNames(): string[] {

        let unionMemoryNames =
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
                } else {
                    return firstValue > secondValue ? 1 : -1;
                }
            });
        }

        return unionMemoryNames;
    }
    render() {
        const memoryNames = this.getMemoryNames()
        return (
            <div>
                {memoryNames.length === 0
                    ? <div className='ms-font-l teachEmptyMemory'>
                        <FormattedMessage
                            id={FM.MEMORYTABLE_EMPTY}
                            defaultMessage='Empty'
                        />
                    </div>
                    : <OF.DetailsList
                        className='ms-font-m-plus'
                        items={memoryNames}
                        columns={this.state.columns}
                        onColumnHeaderClick={this.onColumnClick}
                        onRenderItemColumn={this.renderItemColumn}
                        checkboxVisibility={OF.CheckboxVisibility.hidden}
                        onRenderDetailsHeader={(
                            detailsHeaderProps: OF.IDetailsHeaderProps,
                            defaultRender: OF.IRenderFunction<OF.IDetailsHeaderProps>) =>
                            onRenderDetailsHeader(detailsHeaderProps, defaultRender)}
                    />}
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
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(MemoryTable))