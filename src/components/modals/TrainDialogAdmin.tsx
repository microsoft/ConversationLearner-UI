import * as React from 'react';
import "./TeachSessionWindow.css"
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { SenderType, TeachMode } from '../../types/const';
import { editTrainDialogAsync } from '../../actions/updateActions';
import { clearExtractResponses } from '../../actions/teachActions'
import EntityExtractor from './EntityExtractor';
import ActionScorer from './ActionScorer';
import { Activity } from 'botframework-directlinejs'
import * as OF from 'office-ui-fabric-react';
import { ActionBase, TrainDialog, TrainRound, ScoreReason, ScoredAction,
    TrainScorerStep, Memory, UnscoredAction, ScoreResponse,
    EntityBase, TextVariation, ExtractResponse, DialogType } from 'blis-models'

class TrainDialogAdmin extends React.Component<Props, ComponentState> {

    constructor(p: Props) {
        super(p);
        this.state = {
            saveTrainDialog: null,
            saveSliceRound: 0,
            senderType: null,
            roundIndex: null,
            scoreIndex: null
        }
        this.onEntityExtractorSubmit = this.onEntityExtractorSubmit.bind(this);
        this.onActionScorerSubmit = this.onActionScorerSubmit.bind(this);
    }

    componentWillReceiveProps(newProps: Props) {

        if (newProps.selectedActivity && newProps.trainDialog) {
            let [senderType, roundIndex, scoreIndex] = newProps.selectedActivity.id.split(":").map(s => parseInt(s));
            // If rounds were trimmed, selectedActivity could have been in deleted rounds
            if (roundIndex > newProps.trainDialog.rounds.length-1) { 
                this.setState({
                    senderType: senderType,
                    roundIndex: newProps.trainDialog.rounds.length-1,
                    scoreIndex: 0
                })
            }
            else {
                this.setState({
                    senderType: senderType,
                    roundIndex: roundIndex,
                    scoreIndex: scoreIndex
                })
            }
        }
    }

    findRoundAndScorerStep(trainDialog: TrainDialog, activity: Activity): { round: TrainRound, scorerStep: TrainScorerStep } {

        if (this.state.roundIndex > trainDialog.rounds.length-1) {
            throw new Error(`Index out of range: You are attempting to access round by index: ${this.state.roundIndex} but there are only: ${trainDialog.rounds.length} rounds.`)
        }

        const round = trainDialog.rounds[this.state.roundIndex];
        let scorerStep = null;
        if (round.scorerSteps.length > 0) {
            if (this.state.scoreIndex > round.scorerSteps.length-1) {
                throw new Error(`Index out of range: You are attempting to access scorer step by index: ${this.state.scoreIndex} but there are only: ${round.scorerSteps.length} scorere steps.`) 
            }
            scorerStep = round.scorerSteps[this.state.scoreIndex];
        }

        return {
            round,
            scorerStep
        }
    }

    // Determine if extracted entities are different than those in given round
    haveEntitiesChanged(extractResponse: ExtractResponse, roundIndex: number): boolean {
        let newEntities = extractResponse.predictedEntities.map((p) => { return p.entityId });

        // Get list of entities from first text variation
        let round = this.props.trainDialog.rounds[roundIndex]; 
        let oldEntities = round.extractorStep.textVariations[0].labelEntities.map((l) => { return l.entityId });

        let missingnew = newEntities.filter((i) => oldEntities.indexOf(i) < 0).length;
        let missingold = oldEntities.filter((i) => newEntities.indexOf(i) < 0).length;
        return (missingnew + missingold > 0);
    }

    // User has submitted new entity extractions / text variations for a round
    onEntityExtractorSubmit(extractResponse: ExtractResponse, textVariations: TextVariation[], roundIndex: number) : void {

        // Generate the new train dialog
        let round = this.props.trainDialog.rounds[roundIndex]; 
        let newExtractorStep = {...round.extractorStep, textVariations: textVariations};
        let newRound = {...round, extractorStep: newExtractorStep };
        let newRounds = [...this.props.trainDialog.rounds];
        newRounds[roundIndex] = newRound;
        let updatedTrainDialog = {...this.props.trainDialog, rounds: newRounds};

        // Determine if extracted entities have changed.  If so, save and show prompt to user
        if (this.haveEntitiesChanged(extractResponse, roundIndex)) {

            // Delete at steps after the current round and clear scorer steps
            let newRounds = updatedTrainDialog.rounds.slice(0,roundIndex+1);
            newRounds[roundIndex].scorerSteps = [];
            updatedTrainDialog = {...updatedTrainDialog, rounds: newRounds};

            // Save prompt will be shown to user
            this.setState({
                saveTrainDialog: updatedTrainDialog,
                saveSliceRound: roundIndex
            });
            return;
        }  
        // Otherwise just save with new text variations, remaining rounds are ok
        else {
            this.props.editTrainDialogAsync(this.props.user.key, updatedTrainDialog, this.props.appId);
            this.props.clearExtractResponses();
        }
    }    
    
    // User changed the selected action for a round
    onActionScorerSubmit(trainScorerStep: TrainScorerStep) : void {

        // Remove training rounds
        const rounds = this.props.trainDialog.rounds.slice(0, this.state.roundIndex+1);       
        let round = rounds[this.state.roundIndex]; 

        // Remove trailing scorer steps
        let newScorerSteps = round.scorerSteps.slice(0, this.state.scoreIndex+1);
        newScorerSteps[this.state.scoreIndex] = trainScorerStep;
        
        // Create new train round
        let newRound = new TrainRound({
            extractorStep: round.extractorStep,
            scorerSteps: newScorerSteps
        })

        // New rounds list with new round
        let newRounds = [...rounds];
        newRounds[this.state.roundIndex] = newRound;
        let updatedTrainDialog = {...this.props.trainDialog, rounds: newRounds};

        // Save prompt will be shown to user
        this.setState({
            saveTrainDialog: updatedTrainDialog,
            saveSliceRound: this.state.roundIndex
        });
    }

    onClickSaveCheckYes() {
        // Submit saved extractions
        this.props.editTrainDialogAsync(this.props.user.key, this.state.saveTrainDialog, this.props.appId);
        this.props.clearExtractResponses();

        this.setState({
            saveTrainDialog: null, 
            saveSliceRound: 0,
            roundIndex: this.state.saveSliceRound
        });
    }
    onClickSaveCheckNo() {
        // Reset the entity extractor
        this.setState({saveTrainDialog: null, saveSliceRound: 0});
        this.props.clearExtractResponses();
    }
    render() {
        let round: TrainRound = null;
        let scorerStep: TrainScorerStep = null;
        let selectedAction: ActionBase = null;
        let memories: Memory[] = [];
        let filledEntities: EntityBase[] = [];
        let scoreResponse: ScoreResponse = null;

        if (this.props.trainDialog && this.props.selectedActivity) {
            const result = this.findRoundAndScorerStep(this.props.trainDialog, this.props.selectedActivity)
            round = result.round
            scorerStep = result.scorerStep
            if (scorerStep != null) {
                selectedAction = this.props.actions.find(action => action.actionId == scorerStep.labelAction)
                filledEntities = this.props.entities.filter(entity => scorerStep.input.filledEntities.includes(entity.entityId))
                memories = filledEntities.map((e) => new Memory({entityName: e.entityName, entityValues: []}));     
                       
                let scoredAction = new ScoredAction({
                    actionId : selectedAction.actionId,
                    payload: selectedAction.payload,
                    isTerminal: selectedAction.isTerminal,
                    score: 1.0
                })
                // Generate list of all actions (apart from selected) for ScoreResponse as I have no scores
                let unscoredActions = this.props.actions
                    .filter(a => a.actionId != selectedAction.actionId)
                    .map(action => {
                        return new UnscoredAction({
                            actionId : action.actionId,
                            payload: action.payload,
                            isTerminal: action.isTerminal,
                            reason: ScoreReason.NotCalculated
                        })
                });

                scoreResponse = new ScoreResponse({
                    scoredActions: [scoredAction],
                    unscoredActions: unscoredActions
                })
            }
        }

        return (
            <div className="blis-dialog-admin ms-font-l">
                {this.props.selectedActivity ?
                    (<div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">Memory</div>
                        <div>
                            {filledEntities.length !== 0 && filledEntities.map(entity => <div key={entity.entityName}>{entity.entityName}</div>)}
                        </div>
                    </div>
                    ) : (
                        <div className="blis-dialog-admin__content">
                            <div className="blis-dialog-admin-title">Train Dialog</div>
                            <div>Click on User or Bot dialogs to the left to view steps in the Train Dialog.</div>
                            <div>You can then make changes to the Train Dialog.</div>
                        </div>
                    )
                }
                {this.state.senderType == SenderType.User &&
                    <div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">Entity Detection</div>
                        <div>
                            {round ?
                                <EntityExtractor
                                    appId={this.props.appId}
                                    extractType={DialogType.TRAINDIALOG}
                                    sessionId={this.props.trainDialog.trainDialogId}
                                    roundIndex={this.state.roundIndex}
                                    autoTeach={false}
                                    teachMode={TeachMode.Extractor}
                                    extractResponses={this.props.extractResponses}
                                    originalTextVariations={round.extractorStep.textVariations}
                                    onTextVariationsExtracted={this.onEntityExtractorSubmit}
                                />
                                : <span>Click on text from the dialog to the left.</span>
                            }
                        </div>
                    </div>
                }
                {selectedAction && this.state.senderType == SenderType.Bot &&
                    <div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">Action</div>
                        <div>
                                <ActionScorer
                                    appId={this.props.appId}
                                    dialogType={DialogType.TRAINDIALOG}
                                    sessionId={this.props.trainDialog.trainDialogId}
                                    autoTeach={false}
                                    teachMode={TeachMode.Scorer}
                                    scoreResponse={scoreResponse}
                                    scoreInput={scorerStep.input}
                                    memories={memories}
                                    onActionSelected={this.onActionScorerSubmit}
                                />
                        </div>
                    </div>
                }
                <div className="blis-dialog-admin__dialogs">
                    <OF.Dialog
                        hidden={this.state.saveTrainDialog === null}
                        isBlocking={true}
                        dialogContentProps={{
                            type: OF.DialogType.normal,
                            subText: 'Your changes will invalidate the subsequent steps in the Train Dialog', 
                            title: 'Do you want to proceed and truncate the Train Dialog at this step?'
                        }}
                        modalProps={{
                            isBlocking: true
                        }}
                    >
                        <OF.DialogFooter>
                            <OF.PrimaryButton onClick={() => this.onClickSaveCheckYes()} text='Yes' />
                            <OF.DefaultButton onClick={() => this.onClickSaveCheckNo()} text='No' />
                        </OF.DialogFooter>
                    </OF.Dialog>
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        editTrainDialogAsync,
        clearExtractResponses
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        appId: state.apps.current.appId,
        actions: state.actions,
        entities: state.entities,
        extractResponses: state.teachSessions.extractResponses
    }
}

interface ComponentState {
    saveTrainDialog: TrainDialog,
    saveSliceRound: number,
    senderType: SenderType,
    roundIndex: number,
    scoreIndex: number
};

export interface ReceivedProps {
    trainDialog: TrainDialog,
    selectedActivity: Activity
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(TrainDialogAdmin);