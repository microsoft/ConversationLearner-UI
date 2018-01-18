import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import * as OF from 'office-ui-fabric-react';
import { onRenderDetailsHeader, Prebuilt } from '../ToolTips'
import { EntityBase, EntityType, Memory } from 'blis-models'
import { DialogMode } from '../../types/const'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'

interface IRenderableColumn extends OF.IColumn {
    render: (x: EntityBase, component: MemoryTable) => React.ReactNode
    getSortValue: (entity: EntityBase, component: MemoryTable) => string
}

const columns: IRenderableColumn[] = [
    {
        key: 'entityName',
        name: 'Name',
        fieldName: 'entityName',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: (entity, component) => component.renderEntityName(entity.entityName),
        getSortValue: entity => entity.entityName.toUpperCase()
    },
    {
        key: 'entityValues',
        name: 'Value',
        fieldName: 'entityValues',
        minWidth: 200,
        maxWidth: 400,
        isResizable: true,
        render: (entity, component) => component.renderEntityValues(entity),
        getSortValue: entity => ''
    },
    {
        key: 'entityType',
        name: 'Type',
        fieldName: 'entityType',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        render: entity => {
            const type = (entity.entityType === EntityType.LOCAL || entity.entityType === EntityType.LUIS) ? "CUSTOM" : entity.entityType
            return <span className={OF.FontClassNames.mediumPlus}>{type}</span>
        },
        getSortValue: entity => entity.entityType.toUpperCase()
    },
    {
        key: 'isProgrammatic',
        name: 'Programmatic',
        fieldName: 'isProgrammatic',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
        render: entity => <OF.Icon iconName={entity.entityType === EntityType.LOCAL ? "CheckMark" : "Remove"} className="blis-icon" />,
        getSortValue: entity => entity.entityType === EntityType.LOCAL ? 'a' : 'b'
    },
    {
        key: 'isBucketable',
        name: 'Multi-Value',
        fieldName: 'isBucketable',
        minWidth: 80,
        maxWidth: 100,
        isResizable: true,
        render: entity => <OF.Icon iconName={entity.metadata.isBucket ? "CheckMark" : "Remove"} className="blis-icon" />,
        getSortValue: entity => entity.metadata.isBucket ? 'a' : 'b'
    },
    {
        key: 'isNegatable',
        name: 'Negatable',
        fieldName: 'isNegatable',
        minWidth: 80,
        maxWidth: 100,
        isResizable: true,
        render: entity => <OF.Icon iconName={entity.metadata.isReversable ? "CheckMark" : "Remove"} className="blis-icon" />,
        getSortValue: entity => entity.metadata.isReversable ? 'a' : 'b'
    }
]

interface ComponentState {
    columns: IRenderableColumn[],
    sortColumn: IRenderableColumn
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
    onColumnClick(event: any, column: IRenderableColumn) {
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

    previousMemory(entityName: string) {
        let prevMemories = this.props.prevMemories || [];
        return prevMemories.find(m => m.entityName === entityName);
    }

    renderEntityName(entityName: string) {
        let curEntity = this.props.memories.find(m => m.entityName === entityName);
        let prevEntity = this.props.prevMemories.find(m => m.entityName === entityName);
        let entityClass = OF.FontClassNames.mediumPlus;

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

    renderEntityValues(entity: EntityBase) {
        // Current entity values
        let curMemory = this.props.memories.find(m => m.entityName === entity.entityName);
        let curMemoryValues = curMemory ? curMemory.entityValues : [];
        let curValues = curMemoryValues.map(cmv => cmv.userText);

        // Corresponding old memory values
        let prevMemory = this.props.prevMemories.find(m => m.entityName === entity.entityName);
        let prevMemoryValues = prevMemory ? prevMemory.entityValues : [];
        let prevValues = prevMemoryValues.map(pmv => pmv.userText);

        // Find union and remove duplicates
        let unionMemoryValues = [...curMemoryValues, ...prevMemoryValues.filter(pmv => !curMemoryValues.some(cmv => cmv.userText === pmv.userText))];

        // Print out list in friendly manner
        let display = [];
        let key = 0;
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
            if (prevValues.indexOf(memoryValue.userText) >= 0 && curValues.indexOf(memoryValue.userText) < 0) {
                entityClass = 'blis-font--deleted';
            }
            // In new but not old
            else if (prevValues.indexOf(memoryValue.userText) < 0 && curValues.indexOf(memoryValue.userText) >= 0) {
                entityClass = 'blis-font--emphasis';
            }

            let isPrebuilt = memoryValue.builtinType || (memoryValue.resolution && Object.keys(memoryValue.resolution).length > 0);
            // If a pre-built, show tool tip with extra info
            if (isPrebuilt) {
                entityClass += ' blisText--emphasis';
                display.push(
                    Prebuilt(memoryValue, (<span className={OF.FontClassNames.mediumPlus} key={key++}>{prefix}<span className={entityClass}>{memoryValue.displayText}</span></span>))
                )
            } else {
                display.push(<span className={OF.FontClassNames.mediumPlus} key={key++}>{prefix}<span className={entityClass}>{memoryValue.userText}</span></span>);
            }

            index++;
        }
        return display;
    }

    renderItemColumn(entityName: string, index: number, column: IRenderableColumn) {
        const entity = this.props.entities.find(e => e.entityName == entityName)
        if (!entity) {
            console.warn(`Attempted to render entity: ${entityName} for column: ${column.name} but the entity could not be found.`)
            return 'ERROR';
        }

        return column.render(entity, this)
    }

    getMemoryNames(): string[] {
        let unionMemoryNames =
            // Find union or old and new remove duplicates
            [
                ...this.props.memories.map(m => m.entityName),
                ...this.props.prevMemories.map(m => m.entityName)
            ];

        unionMemoryNames = Array.from(new Set(unionMemoryNames));

        // TODO: Refactor, this strips memorys down to a entity name string to perform union
        // then re-merges back with original data.  This could be done in one pass only adding
        // entity information to memorys, preserving original data, then reducing down to name on render

        if (this.state.sortColumn) {
            // Sort the items.
            unionMemoryNames = unionMemoryNames.concat([]).sort((a, b) => {
                const aEntity = this.props.entities.find(e => e.entityName == a)
                const bEntity = this.props.entities.find(e => e.entityName == b)
                let firstValue = this.state.sortColumn.getSortValue(aEntity, this)
                let secondValue = this.state.sortColumn.getSortValue(bEntity, this)

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
                    ? <div className={`${OF.FontClassNames.large} teachEmptyMemory`}>
                        <FormattedMessage
                            id={FM.MEMORYTABLE_EMPTY}
                            defaultMessage='Empty'
                        />
                    </div>
                    : <OF.DetailsList
                        className={OF.FontClassNames.mediumPlus}
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