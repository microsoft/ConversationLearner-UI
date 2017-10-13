import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { TeachMode } from '../../types/const';
import EntityExtractor from './EntityExtractor';
import ActionScorer from './ActionScorer';
import * as OF from 'office-ui-fabric-react'
import { Activity } from 'botframework-directlinejs'
import { TrainExtractorStep, TrainScorerStep, TextVariation, Memory, TrainDialog, TrainRound, LogDialog, LogRound, LogScorerStep, ActionBase, EntityBase, ExtractResponse, DialogType, ScoredAction, ModelUtils } from 'blis-models'

interface ComponentState {
    roundIndex: number,
    scoreIndex: number,
    newTrainDialog: TrainDialog
}

class LogDialogAdmin extends React.Component<Props, ComponentState> {

    constructor(p: Props) {
        super(p);
        this.state = {
            roundIndex: null,
            scoreIndex: null,
            newTrainDialog: null,
        }
        this.onEntityExtractorSubmit = this.onEntityExtractorSubmit.bind(this);
        this.onActionScorerSubmit = this.onActionScorerSubmit.bind(this);
    }

    componentWillReceiveProps(newProps: Props) {
        
        if (newProps.selectedActivity && newProps.logDialog) {
            let [roundIndex, scoreIndex] = newProps.selectedActivity.id.split(":").map(s => parseInt(s));
            this.setState({
                roundIndex: roundIndex,
                scoreIndex: scoreIndex
            })
        }
    }

    onClickSaveConfirmation() {
        this.props.onSaveChanges(this.state.newTrainDialog);
        this.setState({newTrainDialog: null});
    }

    onClickCancelSaveConfirmation() {
        this.setState({newTrainDialog: null});
    }

    // User has submitted new entity extractions / text variations for a round
    onEntityExtractorSubmit(extractResponse: ExtractResponse, textVariations: TextVariation[], roundIndex: number) : void {

        // Generate the new train dialog
        const roundsBeforeModification = this.props.logDialog.rounds.slice(0, roundIndex).map(ModelUtils.ToTrainRound);
        const modifiedRound = new TrainRound({
            extractorStep: new TrainExtractorStep({
                textVariations: textVariations
            }),
            scorerSteps: []
        });

        const trainDialog = new TrainDialog({
            rounds: [
                ...roundsBeforeModification,
                modifiedRound
            ]
        })

        this.setState({newTrainDialog: trainDialog});
    } 

    // User has submitted new entity extractions / text variations for a round
    onActionScorerSubmit(trainScorerStep: TrainScorerStep) : void {

        const roundsBeforeModification = this.props.logDialog.rounds.slice(0, this.state.roundIndex).map(ModelUtils.ToTrainRound)

        const logRound = this.props.logDialog.rounds[this.state.roundIndex];
        const scorerStepsBeforeModification = logRound.scorerSteps.slice(0, this.state.scoreIndex).map(ModelUtils.ToTrainScorerStep)
        const originalScorerStep = logRound.scorerSteps[this.state.scoreIndex]
        const modifiedScorerStep = new TrainScorerStep({
            input: originalScorerStep.input,
            labelAction: trainScorerStep.scoredAction.actionId,
            scoredAction: (trainScorerStep.scoredAction as ScoredAction)
        })

        let modifiedRound = new TrainRound({
            extractorStep: new TrainExtractorStep({
                textVariations: [new TextVariation({
                    text: logRound.extractorStep.text,
                    labelEntities: logRound.extractorStep.predictedEntities
                })]
            }),
            scorerSteps: [...scorerStepsBeforeModification, modifiedScorerStep]
        })

        let trainDialog = new TrainDialog({
            rounds: [...roundsBeforeModification, modifiedRound]
        })

        this.setState({newTrainDialog: trainDialog});
    } 

    render() {
        let round: LogRound = null
        let action: ActionBase = null
        let filledEntities: EntityBase[] = []
        let memories: Memory[] = []
        let scorerStep: LogScorerStep = null;

        const { logDialog, selectedActivity } = this.props
        if (logDialog && selectedActivity) {

            const [roundIndex, scoreIndex] = selectedActivity.id.split(":").map(s => parseInt(s))

            if (roundIndex >= logDialog.rounds.length) {
                throw new Error(`Index out of range: You are attempting to access round by index: ${roundIndex} but there are only: ${logDialog.rounds.length} rounds.`)
            }

            round = logDialog.rounds[roundIndex]


            if (scoreIndex < round.scorerSteps.length) {
                scorerStep = round.scorerSteps[scoreIndex]
                if (scorerStep && scorerStep.predictedAction) {
                    action = this.props.actions.find(action => action.actionId === scorerStep.predictedAction);
                    filledEntities = this.props.entities.filter(entity => scorerStep.input.filledEntities.includes(entity.entityId));
                    memories = filledEntities.map((e) => new Memory({entityName: e.entityName, entityValues: []}));
                }
            }
        }

        return (
            <div className="blis-log-dialog-admin ms-font-l">
                <div className="blis-log-dialog-admin__title">Entity Detection</div>
                <div className="blis-log-dialog-admin__content">
                    {round ?
                        <EntityExtractor
                            appId = {this.props.appId}
                            extractType = {DialogType.LOGDIALOG}
                            sessionId = {this.props.logDialog.logDialogId}
                            roundIndex = {this.state.roundIndex}  
                            autoTeach = {false}
                            teachMode = {TeachMode.Extractor}
                            extractResponses = {this.props.extractResponses}
                            originalTextVariations = {[ModelUtils.ToTextVariation(round.extractorStep)]}
                            onTextVariationsExtracted = {this.onEntityExtractorSubmit}
                        />
                        : <span>Click on text from the dialog to the left to view how the bot interpretted the conversation.  You can then make corrections to the bots behavior.</span>
                    }
                </div>
                <div className="blis-log-dialog-admin__title">Memory</div>
                <div className="blis-log-dialog-admin__content">
                    {filledEntities.length !== 0 && filledEntities.map(entity => <div key={entity.entityName}>{entity.entityName}</div>)}
                </div>
                <div className="blis-log-dialog-admin__content">
                    {action && 
                        <ActionScorer 
                            appId = {this.props.appId}
                            dialogType = {DialogType.LOGDIALOG}
                            sessionId = {this.props.logDialog.logDialogId}
                            autoTeach = {false}
                            teachMode = {TeachMode.Scorer}
                            scoreResponse = {scorerStep.predictionDetails}
                            scoreInput = {scorerStep.input}
                            memories = {memories}
                            onActionSelected = {this.onActionScorerSubmit}
                        />
                    }
                </div>
                <div className="blis-log-dialog-admin__dialogs">
                    <OF.Dialog
                        hidden={!this.state.newTrainDialog}
                        dialogContentProps={{
                            type: OF.DialogType.normal,
                            title: 'Are you sure you want to save changes?',
                            subText: 'This will create a new training dialog based on your changes'
                        }}
                        modalProps={{
                            isBlocking: true
                        }}
                    >
                        <OF.DialogFooter>
                            <OF.PrimaryButton onClick={() => this.onClickSaveConfirmation()} text='Save' />
                            <OF.DefaultButton onClick={() => this.onClickCancelSaveConfirmation()} text='Cancel' />
                        </OF.DialogFooter>
                    </OF.Dialog>
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        appId: state.apps.current.appId,
        actions: state.actions,
        entities: state.entities,
        extractResponses: state.teachSessions.extractResponses,
    }
}

export interface ReceivedProps {
    logDialog: LogDialog
    selectedActivity: Activity
    onSaveChanges: (trainDialog: TrainDialog) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(LogDialogAdmin);