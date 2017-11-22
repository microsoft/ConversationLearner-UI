import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { SenderType, DialogMode } from '../../types/const';
import EntityExtractor from './EntityExtractor';
import ActionScorer from './ActionScorer';
import MemoryTable from './MemoryTable';
import * as OF from 'office-ui-fabric-react'
import { Activity } from 'botframework-directlinejs'
import {
    BlisAppBase, TrainExtractorStep, TrainScorerStep, TextVariation,
    Memory, TrainDialog, TrainRound,
    LogDialog, LogRound, LogScorerStep,
    ActionBase, ExtractResponse,
    DialogType, ModelUtils
} from 'blis-models'

interface ComponentState {
    senderType: SenderType,
    roundIndex: number,
    scoreIndex: number,
    newTrainDialog: TrainDialog
}

class LogDialogAdmin extends React.Component<Props, ComponentState> {

    constructor(p: Props) {
        super(p);
        this.state = {
            senderType: null,
            roundIndex: null,
            scoreIndex: null,
            newTrainDialog: null,
        }
        this.onEntityExtractorSubmit = this.onEntityExtractorSubmit.bind(this);
        this.onActionScorerSubmit = this.onActionScorerSubmit.bind(this);
    }

    componentWillReceiveProps(newProps: Props) {

        if (newProps.selectedActivity && newProps.logDialog) {
            let [senderType, roundIndex, scoreIndex] = newProps.selectedActivity.id.split(':').map(s => parseInt(s));
            this.setState({
                senderType: senderType,
                roundIndex: roundIndex,
                scoreIndex: scoreIndex
            })
        }
    }

    onClickSaveConfirmation() {
        this.props.onSaveChanges(this.state.newTrainDialog);
        this.setState({ newTrainDialog: null });
    }

    onClickCancelSaveConfirmation() {
        this.setState({ newTrainDialog: null });
    }

    // User has submitted new entity extractions / text variations for a round
    onEntityExtractorSubmit(extractResponse: ExtractResponse, textVariations: TextVariation[], roundIndex: number): void {

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

        this.setState({ newTrainDialog: trainDialog });
    }

    // User has submitted new entity extractions / text variations for a round
    onActionScorerSubmit(trainScorerStep: TrainScorerStep): void {

        // Remove scoredAction, we only need labeledAction
        delete trainScorerStep.scoredAction;

        // Convert
        const roundsBeforeModification = this.props.logDialog.rounds.slice(0, this.state.roundIndex).map(ModelUtils.ToTrainRound);

        const logRound = this.props.logDialog.rounds[this.state.roundIndex];
        const scorerStepsBeforeModification = logRound.scorerSteps.slice(0, this.state.scoreIndex).map(ModelUtils.ToTrainScorerStep);
        const originalScorerStep = logRound.scorerSteps[this.state.scoreIndex];
        const modifiedScorerStep = new TrainScorerStep({
            input: originalScorerStep.input,
            labelAction: trainScorerStep.labelAction
        })

        let modifiedRound = new TrainRound({
            extractorStep: new TrainExtractorStep({
                textVariations: [new TextVariation({
                    text: logRound.extractorStep.text,
                    labelEntities: ModelUtils.ToLabeledEntities(logRound.extractorStep.predictedEntities)
                })]
            }),
            scorerSteps: [...scorerStepsBeforeModification, modifiedScorerStep]
        })

        let trainDialog = new TrainDialog({
            rounds: [...roundsBeforeModification, modifiedRound]
        })

        this.setState({ newTrainDialog: trainDialog });
    }

    getPrevMemories(): Memory[] {
        let memories: Memory[] = [];
        let prevIndex = this.state.roundIndex - 1;
        if (prevIndex >= 0) {
            let round = this.props.logDialog.rounds[prevIndex];
            if (round.scorerSteps.length > 0) {
                let scorerStep = round.scorerSteps[0];
                memories = scorerStep.input.filledEntities.map((fe) => new Memory(
                    {
                        entityName: this.props.entities.find(e => e.entityId === fe.entityId).entityName,
                        entityValues: fe.values
                    }));
            }
        }
        return memories;
    }

    render() {
        let round: LogRound = null;
        let action: ActionBase = null;
        let memories: Memory[] = [];
        let prevMemories: Memory[] = [];
        let scorerStep: LogScorerStep = null;
        let dialogMode = (this.state.senderType === SenderType.User) ? DialogMode.Extractor : DialogMode.Scorer;

        const { logDialog, selectedActivity } = this.props
        if (logDialog && selectedActivity) {

            if (this.state.roundIndex >= logDialog.rounds.length) {
                throw new Error(`Index out of range: You are attempting to access round by index: ${this.state.roundIndex} but there are only: ${logDialog.rounds.length} rounds.`)
            }
            round = logDialog.rounds[this.state.roundIndex]

            if (this.state.scoreIndex < round.scorerSteps.length) {
                scorerStep = round.scorerSteps[this.state.scoreIndex]
                if (scorerStep && scorerStep.predictedAction) {
                    action = this.props.actions.find(a => a.actionId === scorerStep.predictedAction);
                    memories = scorerStep.input.filledEntities.map((fe) => new Memory(
                        {
                            entityName: this.props.entities.find(e => e.entityId === fe.entityId).entityName,
                            entityValues: fe.values
                        }));
                }
            }
            prevMemories = this.getPrevMemories();
        }

        return (
            <div className="blis-dialog-admin ms-font-l">
                {this.props.selectedActivity && (this.state.senderType === SenderType.User ? (
                    <div className="blis-dialog-admin__content">
                        <div className="blis-wc-message blis-wc-message--user">User Input</div>
                    </div>
                ) : (
                        <div className="blis-dialog-admin__content">
                            <div className="blis-wc-message blis-wc-message--bot">Bot Response</div>
                        </div>
                    ))
                }
                {logDialog && selectedActivity ?
                    (<div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">Memory</div>
                        <MemoryTable
                            dialogMode={dialogMode}
                            memories={memories}
                            prevMemories={prevMemories}
                        />
                    </div>
                    ) : (
                        <div className="blis-dialog-admin__content">
                            <div className="blis-dialog-admin-title">Log Dialog</div>
                            <div>Click on User or Bot dialogs to the left to view how the Bot handled the User's conversation.</div>
                            <div>You can then make corrections to the Bot's behavior.</div>
                        </div>
                    )
                }
                {this.state.senderType === SenderType.User &&
                    <div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">Entity Detection</div>
                        <div>
                            {round &&
                                <EntityExtractor
                                    app={this.props.app}
                                    extractType={DialogType.LOGDIALOG}
                                    sessionId={this.props.logDialog.logDialogId}
                                    roundIndex={this.state.roundIndex}
                                    autoTeach={false}
                                    dialogMode={dialogMode}
                                    extractResponses={this.props.extractResponses}
                                    originalTextVariations={[ModelUtils.ToTextVariation(round.extractorStep)]}
                                    onTextVariationsExtracted={this.onEntityExtractorSubmit}
                                />
                            }
                        </div>
                    </div>
                }
                {this.state.senderType === SenderType.Bot &&
                    <div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">Action</div>
                        <div>
                            {action &&
                                <ActionScorer
                                    app={this.props.app}
                                    dialogType={DialogType.LOGDIALOG}
                                    sessionId={this.props.logDialog.logDialogId}
                                    autoTeach={false}
                                    dialogMode={dialogMode}
                                    scoreResponse={scorerStep.predictionDetails}
                                    scoreInput={scorerStep.input}
                                    memories={memories}
                                    onActionSelected={this.onActionScorerSubmit}
                                />
                            }
                        </div>
                    </div>
                }
                <div className="blis-dialog-admin__dialogs">
                    <OF.Dialog
                        hidden={!this.state.newTrainDialog}
                        onDismiss={() => this.onClickCancelSaveConfirmation()}
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
        actions: state.actions,
        entities: state.entities,
        extractResponses: state.teachSessions.extractResponses,
    }
}

export interface ReceivedProps {
    app: BlisAppBase
    logDialog: LogDialog
    selectedActivity: Activity
    onSaveChanges: (trainDialog: TrainDialog) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(LogDialogAdmin);