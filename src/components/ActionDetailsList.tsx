import * as React from 'react';
import { DetailsList } from 'office-ui-fabric-react';
import { returntypeof } from 'react-redux-typescript';
import { connect } from 'react-redux';
import { ActionBase, ModelUtils } from 'blis-models'
import { State } from '../types'
import { CheckboxVisibility, IColumn } from 'office-ui-fabric-react';

class ActionDetailsList extends React.Component<Props, ComponentState> {

    constructor(p: any) {
        super(p);
        this.state = {
            columns: columns,
            sortColumn: null
        }
        this.onClickColumnHeader = this.onClickColumnHeader.bind(this);
    }

    sortActions() : ActionBase[] {
        let actions = [...this.props.actions];
        // If column header selected sort the items
        if (this.state.sortColumn) {
            actions
                .sort((a, b) => {
                    const firstValue = this.state.sortColumn.getSortValue(a, this)
                    const secondValue = this.state.sortColumn.getSortValue(b, this)
                    const compareValue = firstValue.localeCompare(secondValue)
                    return this.state.sortColumn.isSortedDescending
                        ? compareValue
                        : compareValue * -1
                })
        }

        return actions;
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
            columns: columns.map(column => {
                column.isSorted = (column.key === clickedColumn.key);

                if (column.isSorted) {
                    column.isSortedDescending = isSortedDescending;
                }

                return column;
            }),
            sortColumn: clickedColumn
        });
    }

    render() {
        let sortedActions = this.sortActions();
        return (
            <DetailsList
                className="ms-font-m-plus"
                items={sortedActions}
                columns={this.state.columns}
                checkboxVisibility={CheckboxVisibility.hidden}
                onRenderItemColumn={(action: ActionBase, i, column: IRenderableColumn) => column.render(action, this)}
                onActiveItemChanged={action => this.props.onSelectAction(action)}
                onColumnHeaderClick={this.onClickColumnHeader}
            />
        )
    }
}

const mapStateToProps = (state: State) => {
    return {
        entities: state.entities,
    }
}

export interface ReceivedProps {
    actions: ActionBase[]
    onSelectAction: (action: ActionBase) => void
}

// Props types inferred from mapStateToProps 
const stateProps = returntypeof(mapStateToProps);
type Props = typeof stateProps & ReceivedProps;

export default connect<typeof stateProps, {}, ReceivedProps>(mapStateToProps, null)(ActionDetailsList);

const columns: IRenderableColumn[] = [
    {
        key: 'payload',
        name: 'Payload',
        fieldName: 'payload',
        minWidth: 100,
        maxWidth: 400,
        isResizable: true,
        isMultiline: true,
        getSortValue: action => action.payload.toLowerCase(),
        render: (action, component) => <span className='ms-font-m-plus' onClick={() => component.props.onSelectAction(action)}>{ModelUtils.GetPrimaryPayload(action)}</span>
    },
    {
        key: 'arguments',
        name: 'Arguments',
        fieldName: 'arguments',
        minWidth: 80,
        maxWidth: 300,
        isResizable: true,
        // TODO: There was no value in previous implementation, what should it be?
        getSortValue: action => ModelUtils.GetArguments(action).join('').toLowerCase(),
        render: action => {
            const args = ModelUtils.GetArguments(action);
            return (!args || args.length === 0)
                ? <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>
                : args.map((argument, i) => <span className='ms-ListItem-primaryText' key={i}>{argument}</span>)
        }
    },
    {
        key: 'actionType',
        name: 'Action Type',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
        getSortValue: action => action.metadata.actionType.toLowerCase(),
        render: action => <span className='ms-font-m-plus'>{action.metadata.actionType}</span>
    },
    {
        key: 'requiredEntities',
        name: 'Required Entities',
        fieldName: 'requiredEntities',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        // TODO: Previous implementation returned arrays for these which is incorrect.
        // Should be action.negativeEntities.join('').toLowerCase(), but need entity names which requires lookup
        // This lookup should be done ahead of time instead of on every render
        getSortValue: action => '',
        render: (action, component) => action.requiredEntities.length === 0
            ? <span className="ms-Icon ms-Icon--Remove blis-icon" aria-hidden="true"></span>
            : action.requiredEntities.map(entityId => {
                const entity = component.props.entities.find(e => e.entityId == entityId)
                return (
                    <div className='ms-ListItem is-selectable' key={entityId}>
                        <span className='ms-ListItem-primaryText'>{entity.entityName}</span>
                    </div>
                )
            })
    },
    {
        key: 'negativeEntities',
        name: 'Blocking Entities',
        fieldName: 'negativeEntities',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        // TODO: Previous implementation returned arrays for these which is incorrect.
        // Should be action.negativeEntities.join('').toLowerCase(), but need entity names which requires lookup
        // This lookup should be done ahead of time instead of on every render
        getSortValue: action => '',
        render: (action, component) => action.negativeEntities.length === 0
            ? <span className="ms-Icon ms-Icon--Remove blis-icon" aria-hidden="true"></span>
            : action.negativeEntities.map(entityId => {
                const entity = component.props.entities.find(e => e.entityId == entityId)
                return (
                    <div className='ms-ListItem is-selectable' key={entityId}>
                        <span className='ms-ListItem-primaryText'>{entity.entityName}</span>
                    </div>
                )
            })
    },
    {
        key: 'suggestedEntity',
        name: 'Expected Entity',
        fieldName: 'suggestedEntity',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
        getSortValue: action => '',
        render: action => {
            const entitySuggestion = (action.metadata as any).entitySuggestion
            if (!entitySuggestion) {
                return <span className="ms-Icon ms-Icon--Remove blis-icon" aria-hidden="true"></span>
            }

            return (
                <div className='ms-ListItem is-selectable'>
                    <span className='ms-ListItem-primaryText'>{entitySuggestion.entityName}</span>
                </div>
            )
        }
    },
    {
        key: 'wait',
        name: 'Wait',
        fieldName: 'isTerminal',
        minWidth: 50,
        maxWidth: 50,
        isResizable: true,
        getSortValue: action => action.isTerminal ? 'a' : 'b',
        render: action => <span className={"ms-Icon blis-icon " + (action.isTerminal ? 'ms-Icon--CheckMark' : 'ms-Icon--Remove')} aria-hidden="true"></span>
    }
];

interface IRenderableColumn extends IColumn {
    render: (action: ActionBase, component: ActionDetailsList) => JSX.Element | JSX.Element[]
    getSortValue: (action: ActionBase, component: ActionDetailsList) => string
}

interface ComponentState {
    columns: IRenderableColumn[]
    sortColumn: IRenderableColumn
}