/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as OF from 'office-ui-fabric-react'
import * as React from 'react'

interface ComponentState {
    columns: IRenderableColumn[]
};

class ActionDetailsList extends React.Component<{}, ComponentState> {
    constructor(p: any) {
        super(p);
        const columns = getColumns()
        this.state = {
            columns: columns
        }
        this.onClickColumnHeader = this.onClickColumnHeader.bind(this);
    }

    validationError(): boolean {
        return false
    }

    sortActions() {
    }

    onClickColumnHeader(event: any, clickedColumn: IRenderableColumn) {
        const { columns } = this.state;
        const isSortedDescending = !clickedColumn.isSortedDescending;

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map(column => {
                column.isSorted = (column.key === clickedColumn.key);
                column.isSortedDescending = isSortedDescending;
                return column;
            })
        });
    }

    render() {
        const sortedActions = ["one", "two", "three"]
        return (
            <div>
                <OF.DetailsList
                    className={OF.FontClassNames.mediumPlus}
                    items={sortedActions}
                    columns={this.state.columns}
                    checkboxVisibility={OF.CheckboxVisibility.hidden}
                    onRenderItemColumn={(action: string, i, column: IRenderableColumn) => column.render(action, this)}
                    onActiveItemChanged={() => {}}
                    onColumnHeaderClick={this.onClickColumnHeader}
                    onRenderDetailsHeader={(detailsHeaderProps: OF.IDetailsHeaderProps,
                        defaultRender: OF.IRenderFunction<OF.IDetailsHeaderProps>) =>
                        { return <span>hi</span>}}
                />
            </div>
        )
    }
}

function getColumns(): IRenderableColumn[] {
    return [
        {
            key: 'actionResponse',
            name: 'actionResponse',
            fieldName: 'actionResponse',
            minWidth: 200,
            maxWidth: 400,
            isResizable: true,
            isMultiline: true,
            isSortedDescending: true,
            getSortValue: (action, component) => {

                try {
                    return "MyResponse"
                }
                catch (error) {
                    // Action has errors
                    return ''
                }
            },
            render: (action, component) => {
                return (
                    <span>
                        {
                            <OF.Icon
                                className={`cl-icon cl-color-error`}
                                iconName="IncidentTriangle"
                            />
                        }
                        {"MyResponse"}
                    </span>
                )
            }
        },
        {
            key: 'actionType',
            name: 'actionType',
            fieldName: 'metadata',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            getSortValue: action => '',
            render: action => <div>"ActionType"</div>
        },
        {
            key: 'requiredEntities',
            name: 'requiredEntities',
            fieldName: 'requiredEntities',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            // TODO: Previous implementation returned arrays for these which is incorrect.
            // Should be action.negativeEntities.join('').toLowerCase(), but need entity names which requires lookup
            // This lookup should be done ahead of time instead of on every render
            getSortValue: action => '',
            render: () => { return (<div>required</div>) }
        },
        {
            key: 'negativeEntities',
            name: 'negativeEntities',
            fieldName: 'negativeEntities',
            minWidth: 100,
            maxWidth: 200,
            isResizable: true,
            // TODO: Previous implementation returned arrays for these which is incorrect.
            // Should be action.negativeEntities.join('').toLowerCase(), but need entity names which requires lookup
            // This lookup should be done ahead of time instead of on every render
            getSortValue: action => '',
            render: () => { return (<div>negative</div>) }
        },
        {
            key: 'suggestedEntity',
            name: 'suggestedEntity',
            fieldName: 'suggestedEntity',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            getSortValue: action => '',
            render: (action, component) => {

                return (
                    <div className='ms-ListItem is-selectable ms-ListItem-primaryText' data-testid="action-details-expected-entity">
                        {'entityName'}
                    </div>
                )
            }
        },
        {
            key: 'isTerminal',
            name: 'isTerminal',
            fieldName: 'isTerminal',
            minWidth: 50,
            isResizable: false,
            getSortValue: () => "a",
            render: action => <OF.Icon iconName={'CheckMark'} className="cl-icon" data-testid="action-details-wait"/>
        },
        {
            key: 'createdDateTime',
            name: 'createdDateTime',
            fieldName: 'createdDateTime',
            minWidth: 100,
            isResizable: false,
            getSortValue: () => "today",
            render: action => <span className={OF.FontClassNames.mediumPlus}>{"today"}</span>
        }
    ]
}

interface IRenderableColumn extends OF.IColumn {
    render: (action: string, component: ActionDetailsList) => JSX.Element | JSX.Element[]
    getSortValue: (action: string, component: ActionDetailsList) => string
}
