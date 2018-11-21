/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import * as OF from 'office-ui-fabric-react';
import { onRenderDetailsHeader, prebuilt, entityObject } from '../ToolTips/ToolTips'
import { EntityBase, EntityType, Memory } from '@conversationlearner/models'
import { FM } from '../../react-intl-messages'
import FormattedMessageId from '../FormattedMessageId'
import { injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl'

interface IRenderableColumn extends OF.IColumn {
    render: (x: EntityBase, component: MemoryTable) => React.ReactNode
    getSortValue: (entity: EntityBase, component: MemoryTable) => string
}

enum MemoryChangeStatus {
    Unchanged = "Unchanged",
    Added = "Added",
    Removed = "Removed"
}

const memoryChangeClassMap = {
    [MemoryChangeStatus.Added]: 'cl-font--emphasis',
    [MemoryChangeStatus.Removed]: 'cl-font--deleted',
}

function getColumns(intl: InjectedIntl): IRenderableColumn[] {
    return [
        {
            key: 'entityName',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_NAME,
                defaultMessage: 'Entity Name'
            }),
            fieldName: 'entityName',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            render: (entity, component) => {
                const changeStatus = component.getMemoryChangeStatus(entity.entityName)
                const changeClass = memoryChangeClassMap[changeStatus] || ''

                return <span className={`${OF.FontClassNames.mediumPlus} ${changeClass}`} data-testid="entity-memory-name">{entity.entityName}</span>
            },
            getSortValue: entity => entity.entityName.toUpperCase()
        },
        {
            key: 'entityValues',
            name: 'Value',
            fieldName: 'entityValues',
            minWidth: 200,
            maxWidth: 400,
            isResizable: true,
            render: (entity, component) => {
                const entityValues = component.getEntityValues(entity)
                
                return (<React.Fragment>
                    {entityValues.map((value, i) => {
                        const changeClass = memoryChangeClassMap[value.changeStatus] || ''
                        let renderedValue;

                        let valuesAsObject = component.valuesAsObject(value.displayText)
                        if (valuesAsObject && value.displayText) {
                            renderedValue = <span>{value.prefix}<span className={`${changeClass} cl-font--action`} data-testid="entity-memory-value">{value.displayText.slice(0, 20)}...</span></span>
                            renderedValue = entityObject(valuesAsObject, renderedValue)
                        }
                        else {
                            let resolutionClass = (value.memoryValue.builtinType && Object.keys(value.memoryValue.resolution).length > 0) ? 'cl-font--action' : ''
                            renderedValue = <span>{value.prefix}<span className={`${changeClass} ${resolutionClass}`} data-testid="entity-memory-value">{value.displayText}</span></span>
                            
                            // Decorate with resolution if it exists
                            renderedValue = prebuilt(value.memoryValue, renderedValue)
                        }

                        return <span className={`${OF.FontClassNames.mediumPlus} cl-font--preserve`} key={i}>{renderedValue}</span>
                    })}
                </React.Fragment>)
            },
            getSortValue: entity => ''
        },
        {
            key: 'entityType',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_TYPE,
                defaultMessage: 'Type'
            }),
            fieldName: 'entityType',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            render: entity => {
                let display = entity.entityType
                if (display === EntityType.LOCAL) {
                    display = "PROGRAMMATIC"
                }
                else if (display === EntityType.LUIS) {
                    display = "CUSTOM"
                }
                return <span className={OF.FontClassNames.mediumPlus} data-testid="entity-memory-type">{display}</span>
            },
            getSortValue: entity => entity.entityType.toUpperCase()
        },
        {
            key: 'entityResolver',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_RESOLVER,
                defaultMessage: 'Resolver Type'
            }),
            fieldName: 'entityResolver',
            minWidth: 180,
            maxWidth: 180,
            isResizable: true,
            getSortValue: entity => {
                let display = entity.resolverType === undefined || entity.resolverType === null ? "none" : entity.resolverType;
                return display.toLowerCase();
            },
            render: entity => {
                let display = entity.resolverType === undefined || entity.resolverType === null ? "none" : entity.resolverType
                if (display.toLowerCase() === "none") {
                    return (
                        <OF.Icon iconName="Remove" className="cl-icon" />
                    )
                }
                return (
                    <span className={OF.FontClassNames.mediumPlus}>
                        {display}
                    </span>)
            }
        },
        {
            key: 'isBucketable',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_IS_BUCKETABLE,
                defaultMessage: 'Multi-Value'
            }),
            fieldName: 'isBucketable',
            minWidth: 80,
            maxWidth: 100,
            isResizable: true,
            render: entity => <OF.Icon iconName={entity.isMultivalue ? "CheckMark" : "Remove"} className="cl-icon" data-testid="entity-memory-multi-value"/>,
            getSortValue: entity => entity.isMultivalue ? 'a' : 'b'
        },
        {
            key: 'isNegatable',
            name: intl.formatMessage({
                id: FM.ENTITIES_COLUMNS_IS_NEGATABLE,
                defaultMessage: 'Negatable'
            }),
            fieldName: 'isNegatable',
            minWidth: 80,
            maxWidth: 100,
            isResizable: true,
            render: entity => <OF.Icon iconName={entity.isNegatible ? "CheckMark" : "Remove"} className="cl-icon" data-testid="entity-memory-negatable"/>,
            getSortValue: entity => entity.isNegatible ? 'a' : 'b'
        }
    ]
}

interface ComponentState {
    columns: IRenderableColumn[],
    sortColumn: IRenderableColumn | null
}

class MemoryTable extends React.Component<Props, ComponentState> {
    constructor(p: any) {
        super(p);
        this.state = {
            columns: getColumns(this.props.intl),
            sortColumn: null
        }

        this.onColumnClick = this.onColumnClick.bind(this)
        this.renderItemColumn = this.renderItemColumn.bind(this)
    }
    onColumnClick(event: any, column: IRenderableColumn) {
        let {columns} = this.state;
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
        let prevMemories = this.props.prevMemories
        return prevMemories.find(m => m.entityName === entityName);
    }

    getMemoryChangeStatus(entityName: string): MemoryChangeStatus {
        let curEntity = this.props.memories.find(m => m.entityName === entityName);
        let prevEntity = this.props.prevMemories.find(m => m.entityName === entityName);

        // In old but not new
        if (prevEntity && !curEntity) {
            return MemoryChangeStatus.Removed
        }
        // In new but not old
        else if (!prevEntity && curEntity) {
            return MemoryChangeStatus.Added
        }

        return MemoryChangeStatus.Unchanged
    }

    isPrebuilt(entity: EntityBase): boolean {
        return entity.entityType !== EntityType.LUIS && entity.entityType !== EntityType.LOCAL
    }

    // If text parses as an object, return it
    valuesAsObject(entityValues: string | null): Object | null {
        if (!entityValues) {
            return null
        }

        try {
            let obj = JSON.parse(entityValues);
            if (typeof obj !== 'number' && typeof obj !== 'boolean') {
                return obj;
            }
            return null;
        } catch (err) {
            return null;
        }
    }
    getEntityValues(entity: EntityBase) {
        // Current entity values
        let curMemory = this.props.memories.find(m => m.entityName === entity.entityName);
        let curMemoryValues = curMemory ? curMemory.entityValues : [];
        let curValues = curMemoryValues.map(cmv => cmv.userText);

        // Corresponding old memory values
        let prevMemory = this.props.prevMemories.find(m => m.entityName === entity.entityName);
        let prevMemoryValues = prevMemory ? prevMemory.entityValues : [];
        let prevValues = prevMemoryValues.map(pmv => pmv.userText);

        // Find union and remove duplicates
        const unionMemoryValues = [...curMemoryValues, ...prevMemoryValues.filter(pmv => !curMemoryValues.some(cmv => cmv.userText === pmv.userText))];

        return unionMemoryValues.map((memoryValue, index) => {
            let changeStatus = MemoryChangeStatus.Unchanged
            // In old but not new
            if (prevValues.indexOf(memoryValue.userText) >= 0 && curValues.indexOf(memoryValue.userText) < 0) {
                changeStatus = MemoryChangeStatus.Removed
            }
            // In new but not old
            else if (prevValues.indexOf(memoryValue.userText) < 0 && curValues.indexOf(memoryValue.userText) >= 0) {
                changeStatus = MemoryChangeStatus.Added
            }

            const isPrebuilt = this.isPrebuilt(entity)
            // Calculate prefix
            let prefix = '';
            if (!entity.isMultivalue) {
                prefix = ' ';
            } else if (unionMemoryValues.length !== 1 && index === unionMemoryValues.length - 1) {
                prefix = ' and ';
            } else if (index !== 0) {
                prefix = ', ';
            }

            return {
                prefix,
                changeStatus,
                memoryValue, 
                isPrebuilt,
                // TODO: Why is it called displayText if it's not always used for display...
                displayText: isPrebuilt ? memoryValue.displayText : memoryValue.userText
            }
        })
    }

    renderItemColumn(entityName: string, index: number, column: IRenderableColumn) {
        const entity = this.props.entities.find(e => e.entityName === entityName)
        if (!entity) {
            console.warn(`Attempted to render entity: ${entityName} for column: ${column.name} but the entity could not be found.`)
            return (column.key === `entityName`) ? 
                <span className="cl-font--warning">MISSING ENTITY</span> : '';
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

        // TODO: Refactor, this strips memories down to a entity name string to perform union
        // then re-merges back with original data.  This could be done in one pass only adding
        // entity information to memories, preserving original data, then reducing down to name on render
        const sortColumn = this.state.sortColumn
        if (sortColumn) {
            // Sort the items.
            unionMemoryNames = unionMemoryNames.concat([]).sort((a, b) => {
                const aEntity = this.props.entities.find(e => e.entityName === a)
                const bEntity = this.props.entities.find(e => e.entityName === b)
                if (!aEntity) {
                    throw new Error(`Could not find entity by name: ${a} in list of entities`)
                }
                if (!bEntity) {
                    throw new Error(`Could not find entity by name: ${b} in list of entities`)
                }

                const firstValue = sortColumn.getSortValue(aEntity, this)
                const secondValue = sortColumn.getSortValue(bEntity, this)

                if (sortColumn.isSortedDescending) {
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
                    ? <div className={`${OF.FontClassNames.large} teachEmptyMemory`} data-testid="memory-table-empty">
                        <FormattedMessageId id={FM.MEMORYTABLE_EMPTY} />
                    </div>
                    : <OF.DetailsList
                        className={OF.FontClassNames.mediumPlus}
                        items={memoryNames}
                        columns={this.state.columns}
                        onColumnHeaderClick={this.onColumnClick}
                        onRenderItemColumn={this.renderItemColumn}
                        checkboxVisibility={OF.CheckboxVisibility.hidden}
                        constrainMode={OF.ConstrainMode.horizontalConstrained}
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
        entities: state.entities
    }
}

export interface ReceivedProps {
    memories: Memory[],
    prevMemories: Memory[]
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(MemoryTable) as any)