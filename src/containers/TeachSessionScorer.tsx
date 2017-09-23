import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { returntypeof } from 'react-redux-typescript';
import { ModelUtils } from 'blis-models';
import { State } from '../types'
import { TrainScorerStep, ScoredBase, ActionBase, EntityBase, Memory, ScoredAction, UnscoredAction, ScoreReason } from 'blis-models';
import { postScorerFeedbackAsync, toggleAutoTeach } from '../actions/teachActions'
import { CommandButton } from 'office-ui-fabric-react';
import { TeachMode } from '../types/const'
import { IColumn, DetailsList, CheckboxVisibility, List } from 'office-ui-fabric-react';
import ActionResponseCreatorEditor from './ActionResponseCreatorEditor'
import { findDOMNode } from 'react-dom';

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
        maxWidth: 500,
        isMultiline: true,
        isResizable: true,
    },
    {
        key: 'arguments',
        name: 'Arguments',
        fieldName: 'arguments',
        minWidth: 80,
        maxWidth: 300,
        isResizable: true
    },
    {
        key: 'score',
        name: 'Score',
        fieldName: 'score',
        minWidth: 80,
        maxWidth: 80,
        isResizable: true,
        isSorted: true,
        isSortedDescending: true
    },
    {
        key: 'entities',
        name: 'Entities',
        fieldName: 'entities',
        minWidth: 100,
        maxWidth: 300,
        isResizable: true
    },
    {
        key: 'wait',
        name: 'Wait',
        fieldName: 'isTerminal',
        minWidth: 50,
        maxWidth: 50,
        isResizable: true
    },
    {
        key: 'type',
        name: 'Type',
        fieldName: 'type',
        minWidth: 80,
        maxWidth: 80,
        isResizable: true
    }
]

const initState = {
    actionModalOpen: false,
    columns: columns,
    sortColumn : columns[3] // "score"
}
class TeachSessionScorer extends React.Component<Props, any> {
    constructor(p: any) {
        super(p);
        this.state = initState;
    }
    componentDidUpdate() {
        this.autoSelect();
    }
    componentDidMount() {
        this.autoSelect();
    }
    autoSelect() {
        // If not in interactive mode select action automatically
        if (this.props.teachSession.autoTeach && this.props.teachSession.mode == TeachMode.Scorer) {

            let actions = (this.props.teachSession.scoreResponse.scoredActions as ScoredBase[]).concat(this.props.teachSession.scoreResponse.unscoredActions) || [];
            let bestAction = actions[0];

            // Make sure there is an available aciont
            if (bestAction['reason'] == ScoreReason.NotAvailable)
            {
                // If none available auto teach isn't possible.  User must create a new action
                this.props.toggleAutoTeach(false);
                return;
            }
            let selectedActionId = bestAction.actionId;
            this.handleActionSelection(selectedActionId);
        } else {
            // Put focus on first result so can select by pressing enter
            findDOMNode<HTMLButtonElement>(this.refs.acceptDefault).focus();
        }
    }
    handleCloseActionModal(newAction: ActionBase) {
        this.setState({
            actionModalOpen: false
        })
    }
    handleOpenActionModal() {
        this.setState({
            actionModalOpen: true
        })
    }
    onColumnClick(event: any, column : any) {
        let { columns } = this.state;
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
                if (memory["reason"] == ScoreReason.NotAvailable) {
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
    handleDefaultSelection() {
        // Look for a valid action
        let actionId = null;
        let scoreResponse = this.props.teachSession.scoreResponse;
        if (scoreResponse.scoredActions && scoreResponse.scoredActions.length > 0)
        {
            actionId = scoreResponse.scoredActions[0].actionId;
        }
        else if (scoreResponse.unscoredActions)
        {
            for (let unscoredAction of scoreResponse.unscoredActions) {
                if (unscoredAction.reason == ScoreReason.NotScorable) {
                    actionId = unscoredAction.actionId;
                    break;
                }
            }
        }
        if (actionId) {
            this.handleActionSelection(actionId);
        }
    }
    handleActionSelection(actionId : string)
    {
        let scoredAction = this.props.teachSession.scoreResponse.scoredActions.filter((a: ScoredAction) => a.actionId == actionId)[0]; 
        if (!scoredAction) {
            let unscoredAction = this.props.teachSession.scoreResponse.unscoredActions.filter((a: UnscoredAction) => a.actionId == actionId)[0]; 
            scoredAction = new ScoredAction(unscoredAction);
        }
        let trainScorerStep = new TrainScorerStep(
            {
                input: this.props.teachSession.scoreInput,
                labelAction: actionId,
                scoredAction: scoredAction
            });  
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        let waitForUser = scoredAction.isTerminal;

        // Pass score input (minus extractor step) for subsequent actions when this one is non-terminal
        let uiScoreInput = {...this.props.teachSession.uiScoreInput, trainExtractorStep: null};

        this.props.postScorerFeedback(this.props.user.key, appId, teachId, trainScorerStep, waitForUser, uiScoreInput);
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

        let items = [];
        for (let entityId of action.requiredEntities) {
            let found = this.entityInMemory(entityId);
            items.push({name: found.name, type: found.match ? "entityMatch" : "entityMismatch", neg: false});
        }
        for (let entityId of action.negativeEntities) {
            let found = this.entityInMemory(entityId);
            items.push({name: found.name, type: found.match? "entityMismatch" : "entityMatch", neg: true});
        }
        return (
            <List
                items={items}
                onRenderCell={(item, index) => {
                    return <span className={item.type}>{item.neg ? (<del>{item.name}</del>) : item.name}</span>
                }}
            />
        )
    }
    calculateReason(actionId: string) {
        let action = this.props.actions.filter((a : ActionBase) => a.actionId == actionId)[0];

        // If action is null - there's a bug somewhere
        if (!action) {
            return ScoreReason.NotAvailable;
        }

        for (let entityId of action.requiredEntities) {
            let found = this.entityInMemory(entityId);
            if (!found.match) {
                return ScoreReason.NotAvailable;
            }
        }
        for (let entityId of action.negativeEntities) {
            let found = this.entityInMemory(entityId);
            if (found.match) {
                return ScoreReason.NotAvailable;
            }
        }
        return ScoreReason.NotScorable;
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let fieldContent = item[column.fieldName];
        switch (column.key) {
            case 'select':
                let reason = item["reason"];
                if (reason == ScoreReason.NotCalculated) {
                    reason = this.calculateReason(item[column.fieldName]);
                }
                if (reason == ScoreReason.NotAvailable) {
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
            case 'type':
                return item.metadata.actionType;
            case 'wait':
                if (fieldContent == true) {
                    return <span className="ms-Icon ms-Icon--CheckMark checkIcon" aria-hidden="true"></span>;
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'arguments':
                let args = ModelUtils.GetArguments(item);
                if (args)
                {
                    return (
                        <List
                            items={args}
                            onRenderCell={(item, index) => (
                                <span className='ms-ListItem-primaryText'>{item}</span>
                            )}
                        />
                    )
                }
                return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
            case 'payload': 
                fieldContent = ModelUtils.GetPrimaryPayload(item);
            default:
                break;
        }
        return <span className='ms-font-m-plus'>{fieldContent}</span>
    }
    renderScores(): ScoredBase[] {
        if (!this.props.teachSession.scoreResponse) {
            return null;
        }

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
        if (!scores) {
            return null;
        }

        let noEdit =  (this.props.teachSession.autoTeach || this.props.teachSession.mode != TeachMode.Scorer);    
        let addAction = noEdit ? null : (
            <div>
                <CommandButton
                    data-automation-id='randomID8'
                    className="blis-button--hidden"
                    disabled={false}
                    onClick={this.handleDefaultSelection.bind(this)}
                    ariaDescription='Accept'
                    text=''
                    ref="acceptDefault"
                />
                <CommandButton
                    data-automation-id='randomID9'
                    className="blis-button--gold teachCreateButton"
                    disabled={false}
                    onClick={this.handleOpenActionModal.bind(this)}
                    ariaDescription='Cancel'
                    text='Action'
                    iconProps={{ iconName: 'CirclePlus' }}
                />
            </div>
        )
        return (
            <div>
                <div className='teachTitleBox'>
                    <div className='ms-font-l teachTitle'>Action Selection</div>
                    {addAction}
                </div>
                    <DetailsList
                        className="ms-font-m-plus"
                        items={scores}
                        columns={this.state.columns}
                        checkboxVisibility={CheckboxVisibility.hidden}
                        onRenderItemColumn={this.renderItemColumn.bind(this)}
                        onColumnHeaderClick={ this.onColumnClick.bind(this) }
                        ref='scoreList'
                    />
                    <ActionResponseCreatorEditor open={this.state.actionModalOpen} blisAction={null} handleClose={this.handleCloseActionModal.bind(this)} />
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        postScorerFeedback: postScorerFeedbackAsync,
        toggleAutoTeach: toggleAutoTeach
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