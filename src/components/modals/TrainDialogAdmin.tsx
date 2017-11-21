import * as React from 'react';
import "./TeachSessionWindow.css"
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { SenderType, DialogMode } from '../../types/const';
import { editTrainDialogAsync } from '../../actions/updateActions';
import { clearExtractResponses } from '../../actions/teachActions'
import EntityExtractor from './EntityExtractor';
import ActionScorer from './ActionScorer';
import MemoryTable from './MemoryTable';
import { Activity } from 'botframework-directlinejs'
import * as OF from 'office-ui-fabric-react';
import {
    ActionBase, BlisAppBase, TrainDialog, TrainRound, ScoreReason, ScoredAction,
    TrainScorerStep, Memory, UnscoredAction, ScoreResponse,
    TextVariation, ExtractResponse, DialogType
} from 'blis-models'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'

interface RenderData {
    dialogMode: DialogMode,
    selectedAction: ActionBase,
    scorerStep: TrainScorerStep,
    scoreResponse: ScoreResponse,
    round: TrainRound,
    memories: Memory[],
    prevMemories: Memory[],
};

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

        // If app has changed, clear extract responses
        if (newProps.trainDialog !== this.props.trainDialog) {
            this.props.clearExtractResponses();
        }
        if (newProps.selectedActivity && newProps.trainDialog) {
            let [senderType, roundIndex, scoreIndex] = newProps.selectedActivity.id.split(':').map(s => parseInt(s));
            // If rounds were trimmed, selectedActivity could have been in deleted rounds
            if (roundIndex > newProps.trainDialog.rounds.length - 1) {
                this.setState({
                    senderType: senderType,
                    roundIndex: newProps.trainDialog.rounds.length - 1,
                    scoreIndex: 0
                })
            } else {
                this.setState({
                    senderType: senderType,
                    roundIndex: roundIndex,
                    scoreIndex: scoreIndex
                })
            }
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
    onEntityExtractorSubmit(extractResponse: ExtractResponse, textVariations: TextVariation[], roundIndex: number): void {

        // Generate the new train dialog
        let round = this.props.trainDialog.rounds[roundIndex];
        let newExtractorStep = { ...round.extractorStep, textVariations: textVariations };
        let newRound = { ...round, extractorStep: newExtractorStep };
        let newRounds = [...this.props.trainDialog.rounds];
        newRounds[roundIndex] = newRound;
        let updatedTrainDialog = { ...this.props.trainDialog, rounds: newRounds };

        // Determine if extracted entities have changed.  If so, save and show prompt to user
        if (this.haveEntitiesChanged(extractResponse, roundIndex)) {

            // Delete at steps after the current round and clear scorer steps
            let rounds = updatedTrainDialog.rounds.slice(0, roundIndex + 1);
            newRounds[roundIndex].scorerSteps = [];
            updatedTrainDialog = { ...updatedTrainDialog, rounds: rounds };

            // Save prompt will be shown to user
            this.setState({
                saveTrainDialog: updatedTrainDialog,
                saveSliceRound: roundIndex
            });
            return;
        }
        // Otherwise just save with new text variations, remaining rounds are ok
        else {
            this.props.editTrainDialogAsync(this.props.user.key, updatedTrainDialog, this.props.app.appId);
            this.props.clearExtractResponses();
        }
    }

    // User changed the selected action for a round
    onActionScorerSubmit(trainScorerStep: TrainScorerStep): void {

        // Remove scoredAction, we only need labeledAction
        delete trainScorerStep.scoredAction;

        // Remove training rounds
        const rounds = this.props.trainDialog.rounds.slice(0, this.state.roundIndex + 1);
        let round = rounds[this.state.roundIndex];

        // Remove trailing scorer steps
        let newScorerSteps = round.scorerSteps.slice(0, this.state.scoreIndex + 1);
        newScorerSteps[this.state.scoreIndex] = trainScorerStep;

        // Create new train round
        let newRound = new TrainRound({
            extractorStep: round.extractorStep,
            scorerSteps: newScorerSteps
        })

        // New rounds list with new round
        let newRounds = [...rounds];
        newRounds[this.state.roundIndex] = newRound;
        let updatedTrainDialog = { ...this.props.trainDialog, rounds: newRounds };

        // Save prompt will be shown to user
        this.setState({
            saveTrainDialog: updatedTrainDialog,
            saveSliceRound: this.state.roundIndex
        });
    }

    onClickSaveCheckYes() {
        // Submit saved extractions
        this.props.editTrainDialogAsync(this.props.user.key, this.state.saveTrainDialog, this.props.app.appId);
        this.props.clearExtractResponses();

        this.setState({
            saveTrainDialog: null,
            saveSliceRound: 0,
            roundIndex: this.state.saveSliceRound
        });
    }
    onClickSaveCheckNo() {
        // Reset the entity extractor
        this.setState({ saveTrainDialog: null, saveSliceRound: 0 });
        this.props.clearExtractResponses();
    }
    getPrevMemories(): Memory[] {
        let memories: Memory[] = [];
        let prevIndex = this.state.roundIndex - 1;
        if (prevIndex >= 0) {
            let round = this.props.trainDialog.rounds[prevIndex];
            if (round.scorerSteps.length > 0) {
                let scorerStep = round.scorerSteps[0];
                memories = scorerStep.input.filledEntities.map((fe) => new Memory(
                    {
                        entityName: this.props.entities.find(e => e.entityId === fe.entityId).entityName,
                        entityValues: fe.values
                    }
                ));
            }
        }
        return memories;
    }
    getRenderData(): RenderData {
        let selectedAction: ActionBase = null;
        let scorerStep: TrainScorerStep = null;
        let scoreResponse: ScoreResponse = null;
        let round: TrainRound = null;
        let memories: Memory[] = [];
        let prevMemories: Memory[] = [];

        if (this.state.roundIndex !== null && this.state.roundIndex < this.props.trainDialog.rounds.length) {
            round = this.props.trainDialog.rounds[this.state.roundIndex];
            if (round.scorerSteps.length > 0) {
                scorerStep = round.scorerSteps[this.state.scoreIndex];

                selectedAction = this.props.actions.find(action => action.actionId === scorerStep.labelAction)
                memories = scorerStep.input.filledEntities.map((fe) => new Memory(
                    {
                        entityName: this.props.entities.find(e => e.entityId === fe.entityId).entityName,
                        entityValues: fe.values
                    }
                ));

                // Get prevmemories
                prevMemories = this.getPrevMemories();

                let scoredAction = new ScoredAction({
                    actionId: selectedAction.actionId,
                    payload: selectedAction.payload,
                    isTerminal: selectedAction.isTerminal,
                    score: 1.0
                })
                // Generate list of all actions (apart from selected) for ScoreResponse as I have no scores
                let unscoredActions = this.props.actions
                    .filter(a => a.actionId !== selectedAction.actionId)
                    .map(action => {
                        return new UnscoredAction({
                            actionId: action.actionId,
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

        let renderData: RenderData = {
            dialogMode: (this.state.senderType === SenderType.User) ? DialogMode.Extractor : DialogMode.Scorer,
            selectedAction: selectedAction,
            scorerStep: scorerStep,
            scoreResponse: scoreResponse,
            round: round,
            memories: memories,
            prevMemories: prevMemories
        };

        return renderData;
    }
    render() {
        const { intl } = this.props
        if (!this.props.trainDialog) {
            return null;
        }

        let renderData = this.getRenderData();
        return (
            <div className="blis-dialog-admin ms-font-l">
                {this.props.selectedActivity && (this.state.senderType === SenderType.User
                    ? (
                        <div className="blis-dialog-admin__content">
                            <div className="blis-wc-message blis-wc-message--user">
                                <FormattedMessage
                                    id={FM.TRAINDIALOGADMIN_DIALOGMODE_USER}
                                    defaultMessage="User Input"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="blis-dialog-admin__content">
                            <div className="blis-wc-message blis-wc-message--bot">
                                <FormattedMessage
                                    id={FM.TRAINDIALOGADMIN_DIALOGMODE_TEXT}
                                    defaultMessage="Bot Response"
                                />
                            </div>
                        </div>
                    ))
                }
                {this.props.selectedActivity ?
                    (<div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">
                            <FormattedMessage
                                id={FM.TRAINDIALOGADMIN_MEMORY_TITLE}
                                defaultMessage="Memory"
                            />
                        </div>
                        <MemoryTable
                            dialogMode={renderData.dialogMode}
                            memories={renderData.memories}
                            prevMemories={renderData.prevMemories}
                        />
                    </div>
                    ) : (
                        <div className="blis-dialog-admin__content">
                            <div className="blis-dialog-admin-title">
                                <FormattedMessage
                                    id={FM.TRAINDIALOGADMIN_HELPTEXT_TITLE}
                                    defaultMessage="Train Dialog"
                                />
                            </div>
                            <div>
                                <FormattedMessage
                                    id={FM.TRAINDIALOGADMIN_HELPTEXT_DESCRIPTION}
                                    defaultMessage="Click on User or Bot dialogs to the left to view steps in the Train Dialog."
                                />
                            </div>
                            <div>
                                <FormattedMessage
                                    id={FM.TRAINDIALOGADMIN_HELPTEXT_DESCRIPTION2}
                                    defaultMessage="You can then make changes to the Train Dialog."
                                />
                            </div>
                        </div>
                    )
                }
                {this.state.senderType === SenderType.User &&
                    <div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">
                            <FormattedMessage
                                id={FM.TRAINDIALOGADMIN_ENTITYDETECTION_TITLE}
                                defaultMessage="Entity Detection"
                            />
                        </div>
                        <div>
                            {renderData.round ?
                                <EntityExtractor
                                    app={this.props.app}
                                    extractType={DialogType.TRAINDIALOG}
                                    sessionId={this.props.trainDialog.trainDialogId}
                                    roundIndex={this.state.roundIndex}
                                    autoTeach={false}
                                    dialogMode={renderData.dialogMode}
                                    extractResponses={this.props.extractResponses}
                                    originalTextVariations={renderData.round.extractorStep.textVariations}
                                    onTextVariationsExtracted={this.onEntityExtractorSubmit}
                                />
                                : <span>
                                    <FormattedMessage
                                        id={FM.TRAINDIALOGADMIN_ENTITYDETECTION_HELPTEXT}
                                        defaultMessage="Click on text from the dialog to the left."
                                    />
                                </span>
                            }
                        </div>
                    </div>
                }
                {renderData.selectedAction && this.state.senderType === SenderType.Bot &&
                    <div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">
                            <FormattedMessage
                                id={FM.TRAINDIALOGADMIN_ACTION_TITLE}
                                defaultMessage="Action"
                            />
                        </div>
                        <div>
                            <ActionScorer
                                app={this.props.app}
                                dialogType={DialogType.TRAINDIALOG}
                                sessionId={this.props.trainDialog.trainDialogId}
                                autoTeach={false}
                                dialogMode={renderData.dialogMode}
                                scoreResponse={renderData.scoreResponse}
                                scoreInput={renderData.scorerStep.input}
                                memories={renderData.memories}
                                onActionSelected={this.onActionScorerSubmit}
                            />
                        </div>
                    </div>
                }
                <div className="blis-dialog-admin__dialogs">
                    <OF.Dialog
                        hidden={this.state.saveTrainDialog === null}
                        onDismiss={() => this.onClickSaveCheckNo()}
                        dialogContentProps={{
                            type: OF.DialogType.normal,
                            subText: intl.formatMessage({
                                id: FM.TRAINDIALOGADMIN_SAVECHANGES_TITLE,
                                defaultMessage: 'Your changes will invalidate the subsequent steps in the Train Dialog'
                            }),
                            title: intl.formatMessage({
                                id: FM.TRAINDIALOGADMIN_SAVECHANGES_DESCRIPTION,
                                defaultMessage: 'Do you want to proceed and truncate the Train Dialog at this step?'
                            })
                        }}
                        modalProps={{
                            isBlocking: true
                        }}
                    >
                        <OF.DialogFooter>
                            <OF.PrimaryButton
                                onClick={() => this.onClickSaveCheckYes()}
                                text={intl.formatMessage({
                                    id: FM.TRAINDIALOGADMIN_SAVECHANGES_PRIMARYBUTTON_TEXT,
                                    defaultMessage: 'Yes'
                                })}
                            />
                            <OF.DefaultButton
                                onClick={() => this.onClickSaveCheckNo()}
                                text={intl.formatMessage({
                                    id: FM.TRAINDIALOGADMIN_SAVECHANGES_DEFAULTBUTTON_TEXT,
                                    defaultMessage: 'No'
                                })}
                            />
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
    app: BlisAppBase
    selectedActivity: Activity
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TrainDialogAdmin))