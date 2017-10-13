import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { returntypeof } from 'react-redux-typescript';
import { ModelUtils } from 'blis-models';
import { State } from '../../types'
import { TrainScorerStep, Memory, ScoredBase, ScoreInput, ScoreResponse, ActionBase, ScoredAction, UnscoredAction, ScoreReason, DialogType } from 'blis-models';
import { toggleAutoTeach } from '../../actions/teachActions'
import { CommandButton, PrimaryButton } from 'office-ui-fabric-react';
import { TeachMode } from '../../types/const'
import { IColumn, DetailsList, CheckboxVisibility, List } from 'office-ui-fabric-react';
import ActionResponseCreatorEditor from './ActionResponseCreatorEditor'

let columns: IColumn[] = [
    {
        key: 'select',
        name: '',
        fieldName: 'actionId',
        minWidth: 80,
        maxWidth: 80,
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

const initState: ComponentState = {
    actionModalOpen: false,
    columns: columns,
    sortColumn: columns[3] // "score"
}

interface ComponentState {
    actionModalOpen: boolean
    columns: IColumn[]
    sortColumn: IColumn
}

class ActionScorer extends React.Component<Props, ComponentState> {
    private primaryScoreButton : any = null;

    constructor(p: Props) {
        super(p);
        this.state = initState;
        this.handleActionSelection = this.handleActionSelection.bind(this);
        this.handleDefaultSelection = this.handleDefaultSelection.bind(this);
        this.handleOpenActionModal = this.handleOpenActionModal.bind(this);
        this.handleCloseActionModal = this.handleCloseActionModal.bind(this);
        this.renderItemColumn = this.renderItemColumn.bind(this);
        this.onColumnClick = this.onColumnClick.bind(this);
        this.focusPrimaryButton = this.focusPrimaryButton.bind(this);
        this.onClickOpenDeleteActionResponse = this.onClickOpenDeleteActionResponse.bind(this)
    }
    componentUpdate() {
        this.autoSelect();
    }
    componentDidUpdate() {
        this.autoSelect();
    }
    componentDidMount() {
        this.autoSelect();
    }
    autoSelect() {
        // If not in interactive mode select action automatically
        if (this.props.autoTeach && this.props.teachMode == TeachMode.Scorer) {

            let actions = (this.props.scoreResponse.scoredActions as ScoredBase[]).concat(this.props.scoreResponse.unscoredActions) || [];
            // Since actions are sorted by score descending (max first), assume first scored action is the "best" action
            let bestAction = actions[0];

            // Make sure there is an available aciont
            if ((bestAction as UnscoredAction).reason == ScoreReason.NotAvailable) {
                // If none available auto teach isn't possible.  User must create a new action
                this.props.toggleAutoTeach(false);
                return;
            }
            let selectedActionId = bestAction.actionId;
            this.handleActionSelection(selectedActionId);
        } else {
            setTimeout(this.focusPrimaryButton, 500);            
        }
    }
    focusPrimaryButton() : void {
        if (this.primaryScoreButton) {
            this.primaryScoreButton.focus();
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
    onColumnClick(event: any, column: any) {
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
        let scoreResponse = this.props.scoreResponse;
        if (scoreResponse.scoredActions && scoreResponse.scoredActions.length > 0) {
            actionId = scoreResponse.scoredActions[0].actionId;
        }
        else if (scoreResponse.unscoredActions) {
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
    handleActionSelection(actionId: string) {
        
        let scoredAction = this.props.scoreResponse.scoredActions.find(a => a.actionId == actionId);
        if (!scoredAction) {
            let unscoredAction = this.props.scoreResponse.unscoredActions.find(a => a.actionId == actionId);
            scoredAction = new ScoredAction(unscoredAction);
        }
        let trainScorerStep = new TrainScorerStep(
            {
                input: this.props.scoreInput,
                labelAction: actionId,
                scoredAction: scoredAction
            });
        
        this.props.onActionSelected(trainScorerStep);
     }

    /** Check if entity is in memory and return it's name */
    entityInMemory(entityId: string): { match: boolean, name: string } {
        let entity = this.props.entities.filter(e => e.entityId == entityId)[0];

        // If entity is null - there's a bug somewhere
        if (!entity) {
            return { match: false, name: "ERROR" };
        }

        let memory = this.props.memories.filter(m => m.entityName == entity.entityName)[0];
        return { match: (memory != null), name: entity.entityName };
    }
    renderEntityRequirements(actionId: string) {
        let action = this.props.actions.filter(a => a.actionId == actionId)[0];

        // If action is null - there's a bug somewhere
        if (!action) {
            return <div>ERROR: Missing Action</div>;
        }

        let items = [];
        for (let entityId of action.requiredEntities) {
            let found = this.entityInMemory(entityId);
            items.push({ name: found.name, type: found.match ? "blis-entity blis-entity--match" : "blis-entity--mismatch", neg: false });
        }
        for (let entityId of action.negativeEntities) {
            let found = this.entityInMemory(entityId);
            items.push({ name: found.name, type: found.match ? "blis-entity blis-entity--mismatch" : "blis-entity blis-entity--match", neg: true });
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
    calculateReason(unscoredAction: UnscoredAction) {

        if (!unscoredAction.reason || unscoredAction.reason == ScoreReason.NotCalculated) {
    
            let action = this.props.actions.filter((a: ActionBase) => a.actionId == unscoredAction.actionId)[0];

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
        return unscoredAction.reason;
    }
    isMasked(actionId: string): boolean {
        return (this.props.scoreInput.maskedActions && this.props.scoreInput.maskedActions.indexOf(actionId) > -1);
    }
    renderItemColumn(item?: any, index?: number, column?: IColumn) {
        let action = item as ScoredBase;
        let fieldContent = action[column.fieldName];
        switch (column.key) {
            case 'select':
                let buttonText = (this.props.dialogType == DialogType.LOGDIALOG && index == 0) ? "Selected" : "Select";
                let reason = (action as UnscoredAction).reason;
                if (reason == ScoreReason.NotAvailable) {
                    return (
                        <PrimaryButton
                            disabled={true}
                            ariaDescription={buttonText}
                            text={buttonText}
                        />
                    )
                }
                let ref = (index == 0) ? ((ref: any) => {this.primaryScoreButton = ref}) : null;
                return (
                    
                    <PrimaryButton
                        onClick={() => this.handleActionSelection(fieldContent)}
                        ariaDescription={buttonText}
                        text={buttonText}
                        componentRef={ref}
                    />
                )
            case 'score':
                if (fieldContent) {
                    fieldContent = (fieldContent * 100).toFixed(1) + "%"
                } else if (this.isMasked(action.actionId)) {
                    fieldContent = "Masked"
                }    
                else {
                    let reason = (action as UnscoredAction).reason;
                    fieldContent = (reason == "notAvailable") ? "Disqualified" : "Training...";
                }
                break;
            case 'entities':
                return this.renderEntityRequirements(action.actionId);
            case 'type':
                return action.metadata.actionType;
            case 'wait':
                if (fieldContent == true) {
                    return <span className="ms-Icon ms-Icon--CheckMark checkIcon" aria-hidden="true"></span>;
                } else {
                    return <span className="ms-Icon ms-Icon--Remove notFoundIcon" aria-hidden="true"></span>;
                }
            case 'arguments':
                let args = ModelUtils.GetArguments(item);
                if (args) {
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
    getScoredItems(): ScoredBase[] {
        if (!this.props.scoreResponse) {
            return null;
        }

        let scoredItems = (this.props.scoreResponse.scoredActions as ScoredBase[]).concat(this.props.scoreResponse.unscoredActions) || [];

        // Need to reassemble to scored item has full action info and reason
        scoredItems = scoredItems.map(e => {
            let action = this.props.actions.find(ee => ee.actionId == e.actionId);
            let score = (e as ScoredAction).score;
            let reason = score ? null : this.calculateReason(e as UnscoredAction);
            return {...action, reason: reason, score: score}
            });

        if (this.state.sortColumn) {
            // Sort the items.
            scoredItems = scoredItems.sort((a: any, b: any) => {
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

        return scoredItems;
    }

    onClickOpenDeleteActionResponse(actionId: string) {
        console.log(`Not Implemented: onClickOpenDeleteActionResponse(${actionId})`)
    }

    render() {
        let scores = this.getScoredItems();
        if (!scores) {
            return null;
        }

        let noEdit = (this.props.autoTeach || this.props.teachMode != TeachMode.Scorer);
        let addAction = noEdit ? null : (
            <div>
                <CommandButton
                    className="blis-button--gold teachCreateButton"
                    onClick={this.handleOpenActionModal}
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
                    onRenderItemColumn={this.renderItemColumn}
                    onColumnHeaderClick={this.onColumnClick}
                 />
                <ActionResponseCreatorEditor
                    open={this.state.actionModalOpen}
                    blisAction={null}
                    handleClose={this.handleCloseActionModal}
                    handleOpenDeleteModal={this.onClickOpenDeleteActionResponse}
                />
            </div>
        )
    }
}

export interface ReceivedProps {
    appId: string,
    dialogType: DialogType,
    sessionId: string
    autoTeach: boolean
    teachMode: TeachMode,
    scoreResponse: ScoreResponse,
    scoreInput: ScoreInput,
    memories: Memory[],
    onActionSelected: (trainScorerStep: TrainScorerStep) => void,
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        toggleAutoTeach
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        entities: state.entities,
        actions: state.actions
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(ActionScorer);