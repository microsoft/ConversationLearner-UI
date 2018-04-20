/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import "./TeachSessionModal.css"
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { clearExtractResponses } from '../../actions/teachActions'
import EntityExtractor from './EntityExtractor';
import ActionScorer from './ActionScorer';
import MemoryTable from './MemoryTable';
import { Activity } from 'botframework-directlinejs'
import * as OF from 'office-ui-fabric-react';
import {
    ActionBase, AppBase, TrainDialog, TrainRound, ScoreReason, ScoredAction,
    TrainScorerStep, Memory, UnscoredAction, ScoreResponse, ActionTypes,
    TextVariation, ExtractResponse, DialogType, SenderType, DialogMode
} from 'conversationlearner-models'
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
            saveExtractChanged: false,
            senderType: null,
            roundIndex: null,
            scoreIndex: null
        }
        this.onEntityExtractorSubmit = this.onEntityExtractorSubmit.bind(this);
        this.onActionScorerSubmit = this.onActionScorerSubmit.bind(this);
    }

    componentWillReceiveProps(newProps: Props) {

        if (newProps.selectedActivity && newProps.trainDialog) {
            // If rounds were trimmed, selectedActivity could have been in deleted rounds
            if (newProps.selectedActivity.channelData.roundIndex > newProps.trainDialog.rounds.length - 1) {
                this.setState({
                    senderType: newProps.selectedActivity.channelData.senderType,
                    roundIndex: newProps.trainDialog.rounds.length - 1,
                    scoreIndex: 0
                })
            } else {
                this.setState({
                    senderType: newProps.selectedActivity.channelData.senderType,
                    roundIndex: newProps.selectedActivity.channelData.roundIndex,
                    scoreIndex: newProps.selectedActivity.channelData.scoreIndex
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

            // LARS??
            // Save prompt will be shown to user
            this.setState({
                saveTrainDialog: updatedTrainDialog,
                saveSliceRound: roundIndex,
                saveExtractChanged: true
            });
        }
        // Otherwise just save with new text variations, remaining rounds are ok
        else {  
            
            let trainDialog: TrainDialog = {
                version: undefined,
                packageCreationId: undefined,
                packageDeletionId: undefined,
                trainDialogId: this.props.trainDialog.trainDialogId,
                rounds: updatedTrainDialog.rounds,
                definitions: {
                    entities: this.props.entities,
                    actions: this.props.actions,
                    trainDialogs: []
                }
            }

            this.props.onReplace(trainDialog);         
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
        let newRound: TrainRound = {
            extractorStep: round.extractorStep,
            scorerSteps: newScorerSteps
        }

        // New rounds list with new round
        let newRounds = [...rounds];
        newRounds[this.state.roundIndex] = newRound;
        let updatedTrainDialog = { ...this.props.trainDialog, rounds: newRounds };

        if (this.props.trainDialog.rounds.length !== newRounds.length) {
            // Truncation prompt will be shown to user
            this.setState({
                saveTrainDialog: updatedTrainDialog,
                saveSliceRound: this.state.roundIndex,
                saveExtractChanged: false
            });
        } else {
            this.editTrainDialog(updatedTrainDialog, this.state.roundIndex, false);
        }
    }

    onClickSaveCheckYes() {
        this.editTrainDialog(this.state.saveTrainDialog, this.state.saveSliceRound, false);
    }

    editTrainDialog(sourceDialog: TrainDialog, sliceRound: number, extractChanged: boolean) {
        let trainDialog: TrainDialog = {
            trainDialogId: undefined,
            version: undefined,
            packageCreationId: undefined,
            packageDeletionId: undefined,
            rounds: sourceDialog.rounds,
            definitions: {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }
        }

        this.props.onEdit(sourceDialog.trainDialogId, trainDialog, extractChanged);
         
        this.props.clearExtractResponses();

        this.setState({
            saveTrainDialog: null,
            saveSliceRound: 0,
            saveExtractChanged: false,
            roundIndex: sliceRound
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
                memories = scorerStep.input.filledEntities.map<Memory>(fe =>
                    ({
                        entityName: this.props.entities.find(e => e.entityId === fe.entityId).entityName,
                        entityValues: fe.values
                    }));
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

                selectedAction = this.props.actions.find(action => action.actionId === scorerStep.labelAction);

                if (!selectedAction) {
                    // Action may have been deleted.  If so create dummy action to render
                    selectedAction = {
                        actionId: scorerStep.labelAction,
                        payload: 'MISSING ACTION',
                        isTerminal: false,
                        actionType: ActionTypes.TEXT,
                        requiredEntities: [],
                        negativeEntities: [],
                        suggestedEntity: null,
                        version: 0,
                        packageCreationId: 0,
                        packageDeletionId: 0
                    }
                }
                memories = scorerStep.input.filledEntities.map<Memory>((fe) => {
                    let entity = this.props.entities.find(e => e.entityId === fe.entityId);
                    let entityName = entity ? entity.entityName : 'UNKNOWN ENTITY';
                    return {
                        entityName: entityName,
                        entityValues: fe.values
                    }
                });

                // Get prevmemories
                prevMemories = this.getPrevMemories();

                let scoredAction: ScoredAction = {
                        actionId: selectedAction.actionId,
                        payload: selectedAction.payload,
                        isTerminal: selectedAction.isTerminal,
                        score: 1.0,
                        actionType: selectedAction.actionType
                    }

                // Generate list of all actions (apart from selected) for ScoreResponse as I have no scores
                let unscoredActions = this.props.actions
                    .filter(a => !selectedAction || a.actionId !== selectedAction.actionId)
                    .map<UnscoredAction>(action => 
                        ({
                            actionId: action.actionId,
                            payload: action.payload,
                            isTerminal: action.isTerminal,
                            reason: ScoreReason.NotCalculated,
                            actionType: action.actionType
                        }));

                scoreResponse = {
                    metrics: {
                        wallTime: 0
                    },
                    scoredActions: [scoredAction],
                    unscoredActions: unscoredActions
                }
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
            <div className={`cl-dialog-admin ${OF.FontClassNames.large}`}>
                <div className={`cl-dialog-title cl-dialog-title--train ${OF.FontClassNames.xxLarge}`}>
                    <OF.Icon iconName="EditContact" />Train Dialog
                </div>
                {this.props.selectedActivity && (this.state.senderType === SenderType.User
                    ? (
                        <div className="cl-dialog-admin__content">
                            <div className="cl-wc-message cl-wc-message--user">
                                <FormattedMessage
                                    id={FM.TRAINDIALOGADMIN_DIALOGMODE_USER}
                                    defaultMessage="User Input"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="cl-dialog-admin__content">
                            <div className="cl-wc-message cl-wc-message--bot">
                                <FormattedMessage
                                    id={FM.TRAINDIALOGADMIN_DIALOGMODE_TEXT}
                                    defaultMessage="Bot Response"
                                />
                            </div>
                        </div>
                    ))
                }
                {this.props.selectedActivity ?
                    (<div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">
                            <FormattedMessage
                                id={FM.TRAINDIALOGADMIN_MEMORY_TITLE}
                                defaultMessage="Memory"
                            />
                        </div>
                        <MemoryTable
                            memories={renderData.memories}
                            prevMemories={renderData.prevMemories}
                        />
                    </div>
                    ) : (
                        <div className="cl-dialog-admin__content">
                            <div className="cl-dialog-admin-title">
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
                    <div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">
                            <FormattedMessage
                                id={FM.TRAINDIALOGADMIN_ENTITYDETECTION_TITLE}
                                defaultMessage="Entity Detection"
                            />
                        </div>
                        <div>
                            {renderData.round ?
                                <EntityExtractor
                                    app={this.props.app}
                                    editingPackageId={this.props.editingPackageId}
                                    canEdit={this.props.canEdit} 
                                    extractType={DialogType.TRAINDIALOG}
                                    sessionId={this.props.trainDialog.trainDialogId}
                                    roundIndex={this.state.roundIndex}
                                    autoTeach={false}
                                    dialogMode={renderData.dialogMode}
                                    extractResponses={this.props.extractResponses}
                                    originalTextVariations={renderData.round.extractorStep.textVariations}
                                    onTextVariationsExtracted={this.onEntityExtractorSubmit}
                                    onExtractionsChanged={this.props.onExtractionsChanged}
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
                    <div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">
                            <FormattedMessage
                                id={FM.TRAINDIALOGADMIN_ACTION_TITLE}
                                defaultMessage="Action"
                            />
                        </div>
                        <div>
                            <ActionScorer
                                app={this.props.app}
                                editingPackageId={this.props.editingPackageId}
                                canEdit={this.props.canEdit}
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
                <div className="cl-dialog-admin__dialogs">
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
                                defaultMessage: 'Truncate the Train Dialog at this step?'
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
    saveExtractChanged: boolean,    // Did extraction change on edit
    senderType: SenderType,
    roundIndex: number,
    scoreIndex: number
};

export interface ReceivedProps {
    app: AppBase,
    editingPackageId: string,
    trainDialog: TrainDialog,
    selectedActivity: Activity,
    canEdit: boolean,
    onEdit: (sourceTrainDialogId: string, editedTrainDialog: TrainDialog, lastExtractChanged: boolean) => void
    onReplace: (editedTrainDialog: TrainDialog) => void
    onExtractionsChanged: (changed: boolean) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TrainDialogAdmin))