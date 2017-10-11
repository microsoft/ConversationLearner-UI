import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createActionAsync } from '../../../actions/createActions'
import { editActionAsync } from '../../../actions/updateActions'
import { deleteActionAsync } from '../../../actions/deleteActions'
import { DetailsList, CommandButton, CheckboxVisibility, IColumn, SearchBox } from 'office-ui-fabric-react';
import { BlisAppBase, ActionBase, ModelUtils } from 'blis-models'
import { ConfirmDeleteModal, ActionResponseCreatorEditor } from '../../../components/modals'
import { State } from '../../../types'
import { findDOMNode } from 'react-dom';

interface IRenderableColumn extends IColumn {
    render: (action: ActionBase, component: Actions) => JSX.Element | JSX.Element[]
    getSortValue: (action: ActionBase, component: Actions) => string
}

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
        render: (action, component) => <span className='ms-font-m-plus' onClick={() => component.onSelectAction(action)}>{ModelUtils.GetPrimaryPayload(action)}</span>
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

interface ComponentState {
    actionSelected: ActionBase | null
    actionIDToDelete: string
    columns: IRenderableColumn[]
    isConfirmDeleteActionModalOpen: boolean
    isActionEditorModalOpen: boolean
    searchValue: string
    sortColumn: IRenderableColumn
}

class Actions extends React.Component<Props, ComponentState> {
    constructor(p: any) {
        super(p);
        this.state = {
            actionIDToDelete: null,
            actionSelected: null,
            searchValue: '',
            isConfirmDeleteActionModalOpen: false,
            isActionEditorModalOpen: false,
            columns: columns,
            sortColumn: null
        }
        this.onClickConfirmDelete = this.onClickConfirmDelete.bind(this);
        this.onSelectAction = this.onSelectAction.bind(this)
        this.onChangeSearchString = this.onChangeSearchString.bind(this)
        this.onClickColumnHeader = this.onClickColumnHeader.bind(this)
        this.onClickCreateAction = this.onClickCreateAction.bind(this)
        this.onClickCloseActionEditor = this.onClickCloseActionEditor.bind(this)
        this.onClickDeleteAction = this.onClickDeleteAction.bind(this)
    }

    componentDidMount() {
        this.focusNewActionButton();
    }

    focusNewActionButton(): void {
        findDOMNode<HTMLButtonElement>(this.refs.newAction).focus();
    }

    onClickConfirmDelete() {
        let actionToDelete = this.props.actions.find(a => a.actionId == this.state.actionIDToDelete)
        this.props.deleteActionAsync(this.props.user.key, this.state.actionIDToDelete, actionToDelete, this.props.app.appId);
        this.setState({
            isConfirmDeleteActionModalOpen: false,
            isActionEditorModalOpen: false,
            actionIDToDelete: null
        })

    }

    onClickCancelDelete() {
        this.setState({
            isConfirmDeleteActionModalOpen: false,
            actionIDToDelete: null
        })
    }
    onClickDeleteAction(guid: string) {
        this.setState({
            isConfirmDeleteActionModalOpen: true,
            actionIDToDelete: guid
        })
    }
    onClickCreateAction() {
        this.setState({
            isActionEditorModalOpen: true,
            actionSelected: null
        })
    }
    onClickCloseActionEditor() {
        this.setState({
            isActionEditorModalOpen: false,
            actionSelected: null
        })
        setTimeout(() => {
            this.focusNewActionButton();
        }, 500);
    }

    onSelectAction(action: ActionBase) {
        this.setState({
            actionSelected: action,
            isActionEditorModalOpen: true
        })
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

    getFilteredAndSortedActions(): ActionBase[] {
        //runs when user changes the text 
        let lcString = this.state.searchValue.toLowerCase();
        let filteredActions = this.props.actions.filter(a => {
            let nameMatch = a.payload.toLowerCase().includes(lcString);
            let typeMatch = a.metadata.actionType ? a.metadata.actionType.toLowerCase().includes(lcString) : true;
            let negativeEntities = a.negativeEntities.map(entityId => {
                let found = this.props.entities.find(e => e.entityId == entityId);
                return found.entityName;
            })
            let positiveEntities = a.requiredEntities.map(entityId => {
                let found = this.props.entities.find(e => e.entityId == entityId);
                return found.entityName;
            })
            let requiredEnts = positiveEntities.join('');
            let negativeEnts = negativeEntities.join('');
            let reqEntsMatch = requiredEnts.toLowerCase().includes(lcString);
            let negEntsMatch = negativeEnts.toLowerCase().includes(lcString);
            let match = nameMatch || typeMatch || reqEntsMatch || negEntsMatch
            return match;
        })

        // If column header selected sort the items
        if (this.state.sortColumn) {
            filteredActions
                .sort((a, b) => {
                    const firstValue = this.state.sortColumn.getSortValue(a, this)
                    const secondValue = this.state.sortColumn.getSortValue(b, this)
                    const compareValue = firstValue.localeCompare(secondValue)
                    return this.state.sortColumn.isSortedDescending
                        ? compareValue
                        : compareValue * -1
                })
        }

        return filteredActions;
    }

    onChangeSearchString(searchString: string) {
        this.setState({
            searchValue: searchString.toLowerCase()
        })
    }

    render() {
        // TODO: Look to move this up to the set state calls instead of forcing it to be on every render
        const actions = this.getFilteredAndSortedActions();
        return (
            <div className="blis-page">
                <span className="ms-font-xxl">Actions</span>
                <span className="ms-font-m-plus">Manage a list of actions that your application can take given it's state and user input...</span>
                <div>
                    <CommandButton
                        onClick={this.onClickCreateAction}
                        className='blis-button--gold'
                        ariaDescription='Create a New Action'
                        text='New Action'
                        ref='newAction'
                    />
                </div>
                <SearchBox
                    className="ms-font-m-plus"
                    onChange={searchString => this.onChangeSearchString(searchString)}
                    onSearch={searchString => this.onChangeSearchString(searchString)}
                />
                <DetailsList
                    className="ms-font-m-plus"
                    items={actions}
                    columns={this.state.columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={(action: ActionBase, i, column: IRenderableColumn) => column.render(action, this)}
                    onActiveItemChanged={action => this.onSelectAction(action)}
                    onColumnHeaderClick={this.onClickColumnHeader}
                />
                <ConfirmDeleteModal
                    open={this.state.isConfirmDeleteActionModalOpen}
                    onCancel={() => this.onClickCancelDelete()}
                    onConfirm={() => this.onClickConfirmDelete()}
                    title="Are you sure you want to delete this action?"
                />
                <ActionResponseCreatorEditor
                    open={this.state.isActionEditorModalOpen}
                    blisAction={this.state.actionSelected}
                    handleClose={this.onClickCloseActionEditor}
                    handleOpenDeleteModal={this.onClickDeleteAction}
                />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createActionAsync,
        editActionAsync,
        deleteActionAsync
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        actions: state.actions,
        entities: state.entities
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(Actions);
