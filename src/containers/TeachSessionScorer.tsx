import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { returntypeof } from 'react-redux-typescript';
import { State } from '../types'
import { TrainScorerStep, ScoredBase, ActionBase, EntityBase, Memory } from 'blis-models';
import { postScorerFeedbackAsync } from '../actions/teachActions'
import { CommandButton } from 'office-ui-fabric-react';
import { IColumn, DetailsList, CheckboxVisibility } from 'office-ui-fabric-react';
import ActionResponseCreatorEditor from './ActionResponseCreatorEditor'

let columns: IColumn[] = [
    {
        key: 'select',
        name: '',
        fieldName: 'actionId',
        minWidth: 35,
        maxWidth: 35,
        isResizable: true
    },
    {
        key: 'payload',
        name: 'Payload',
        fieldName: 'payload',
        minWidth: 100,
        maxWidth: 400,
        isResizable: true
    },
    {
        key: 'score',
        name: 'Score',
        fieldName: 'score',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        isSorted: true,
        isSortedDescending: true
    },
    {
        key: 'entities',
        name: 'Entities',
        fieldName: 'entities',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        isSorted: true,
        isSortedDescending: true
    }
]

const initState = {
    actionModalOpen: false,
    columns: columns,
    sortColumn : columns[2] // "score"
}
class TeachSessionScorer extends React.Component<Props, any> {
    constructor(p: any) {
        super(p);
        this.state = initState;
    }
    handleCloseActionModal(newAction: ActionBase) {
        this.setState({
            actionModalOpen: false
        })
        if (newAction)
        {
            this.handleActionSelection(newAction.actionId);
        }
    }
    handleOpenActionModal() {
        this.setState({
            actionModalOpen: true
        })
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
            sortColumn: column
        });
    }
    getValue(memory: any, col: IColumn): any {
        let value = memory[col.fieldName]
        if (col.fieldName == "score" && !memory[col.fieldName]) {
                if (memory["reason"] == 'notAvailable') {
                    return -100;
                }
                else {  // notScorable
                    return -1;
                }
        }
        if (!value) value = "";

        if (typeof value == 'string' || value instanceof String) {
            return value.toUpperCase();
        }
        return value;
    }
    handleActionSelection(actionId : string)
    {
        let labelAction = actionId;
        // TEMP
        let trainScorerStep = new TrainScorerStep();  // TODO
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        this.props.postScorerFeedback(this.props.user.key, appId, teachId, trainScorerStep);
    }
    /** Check if entity is in memory and return it's name */
    entityInMemory(entityId : string) : {match: boolean, name: string} {
        let entity = this.props.entities.filter((e: EntityBase) => e.entityId == entityId)[0];

        // If entity is null - there's a bug somewhere
        if (!entity) {
            return {match: false, name: "ERROR"};
        }

        let memory = this.props.teachSession.memories.filter((m : Memory) => m.entityName == entity.entityName)[0];
        return {match: (memory != null), name: entity.entityName};
    }
    renderEntityRequirements(actionId: string) {
        let action = this.props.actions.filter((a : ActionBase) => a.actionId == actionId)[0];

        // If action is null - there's a bug somewhere
        if (!action) {
            return <div>ERROR: Missing Action</div>;
        }

        let response = [];
        for (let entityId of action.requiredEntities) {
            let found = this.entityInMemory(entityId);
            let key = `${actionId}_${found.name}`
            if (found.match) {
                response.push(<span key={key} className="entityMatch">{found.name}</span>);
            }
            else {
                response.push(<span key={key} className="entityMismatch">{found.name}</span>);
            }
        }
        for (let entityId of action.negativeEntities) {
            let found = this.entityInMemory(entityId);
            let key = `${actionId}_${found.name}`
            if (found.match) {
                response.push(<span key={key} className="entityMismatch"><del>{found.name}</del></span>);
            }
            else {
                response.push(<span key={key} className="entityMatch"><del>{found.name}</del></span>);
            }
        }
        return response;
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'select':
                if (item["reason"] == "notAvailable") {
                    return (
                        <div>
                            <a><span className="actionUnavailable ms-Icon ms-Icon--ChromeClose"></span></a>
                        </div>
                        )
                    }

                return (
                    <div>
                        <a onClick={() => this.handleActionSelection(fieldContent)}><span className="actionSelect ms-Icon ms-Icon--CompletedSolid"></span></a>
                    </div>
                )
            case 'score':
                if (fieldContent) {
                    fieldContent = (fieldContent * 100).toFixed(1) + "%"
                } else {
                    fieldContent = (item["reason"] == "notAvailable") ? "Disqualified" : "Training...";
                }
                break;
            case 'entities':
                return this.renderEntityRequirements(item.actionId);
            default:
                break;
        }
        return <span className='ms-font-m-plus'>{fieldContent}</span>
    }
    renderScores(): ScoredBase[] {
        let filteredScores = (this.props.teachSession.scoreResponse.scoredActions as ScoredBase[]).concat(this.props.teachSession.scoreResponse.unscoredActions) || [];

        if (this.state.sortColumn) {
            // Sort the items.
            filteredScores = filteredScores.sort((a: any, b: any) => {
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

        return filteredScores;
    }
    render() {
        let scores = this.renderScores();
        return (
            <div className='content'>
                <div className='ms-font-xl'>Action Selection</div>
                    <DetailsList
                        className="ms-font-m-plus"
                        items={scores}
                        columns={this.state.columns}
                        checkboxVisibility={CheckboxVisibility.hidden}
                        onRenderItemColumn={this.renderItemColumn.bind(this)}
                        onColumnHeaderClick={ this.onColumnClick.bind(this) }
                    />
                    <div className="modalFooter">
                        <CommandButton
                            data-automation-id='randomID8'
                            className="goldButton scorerCreateActionButton"
                            disabled={false}
                            onClick={this.handleOpenActionModal.bind(this)}
                            ariaDescription='Cancel'
                            text='Action'
                            iconProps={{ iconName: 'CirclePlus' }}
                        />
                    </div>
                    <ActionResponseCreatorEditor open={this.state.actionModalOpen} blisAction={null} handleClose={this.handleCloseActionModal.bind(this)} />
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        postScorerFeedback: postScorerFeedbackAsync,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        teachSession : state.teachSessions,
        apps: state.apps,
        entities: state.entities,
        actions: state.actions
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionScorer as React.ComponentClass<any>);