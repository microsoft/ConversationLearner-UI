/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import EntityExtractor from './EntityExtractor';
import ActionScorer from './ActionScorer';
import MemoryTable from './MemoryTable';
import * as OF from 'office-ui-fabric-react'
import { Activity } from 'botframework-directlinejs'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import {
    AppBase, TrainScorerStep, TextVariation,
    Memory, TrainDialog, TrainRound, UIScoreInput,
    LogDialog, LogRound, LogScorerStep,
    ActionBase, ExtractResponse, DialogMode,
    DialogType, ModelUtils, SenderType, FilledEntity
} from '@conversationlearner/models'

interface ComponentState {
    senderType: SenderType | null
    roundIndex: number | null
    scoreIndex: number | null
    newTrainDialog: TrainDialog | null
    // Set if extraction changed on edit
    newScoreInput: UIScoreInput | null
}

class LogDialogAdmin extends React.Component<Props, ComponentState> {

    constructor(p: Props) {
        super(p);
        this.state = {
            senderType: null,
            roundIndex: null,
            scoreIndex: null,
            newTrainDialog: null,
            newScoreInput: null
        }
        this.onEntityExtractorSubmit = this.onEntityExtractorSubmit.bind(this);
        this.onActionScorerSubmit = this.onActionScorerSubmit.bind(this);
    }

    componentWillReceiveProps(newProps: Props) {
        if (newProps.selectedActivity && newProps.logDialog) {
            this.setState({
                senderType: newProps.selectedActivity.channelData.senderType,
                roundIndex: newProps.selectedActivity.channelData.roundIndex,
                scoreIndex: newProps.selectedActivity.channelData.scoreIndex
            })
        }
    }

    // Wipe out any missing entities resulting from change in model since log dialog was created
    purgeMissingEntities(rounds: TrainRound[]) : TrainRound[] {
        for (let round of rounds) {
            for (let textVariation of round.extractorStep.textVariations) {
                textVariation.labelEntities = textVariation.labelEntities.filter(
                    le => this.props.entities.find(e => e.entityId === le.entityId)
                )
            } 
            for (let scorerStep of round.scorerSteps) {
                scorerStep.input.filledEntities = scorerStep.input.filledEntities.filter(
                    fe => this.props.entities.find(e => e.entityId === fe.entityId)
                )
            }
        }
        return rounds;
    }

    onClickSaveCheckYes() {
        const stateTrainDialog = this.state.newTrainDialog
        if (!stateTrainDialog) {
            throw new Error(`You confirmed conversion of log dialog to train dialog, but there was no log dialog to convert. This should not be possible. Contact Support`)
        }

        // TODO: Update @models to allow defining TrainDialogInput without undefined properties
        const newTrainDialog: TrainDialog = {
            createdDateTime: new Date().toJSON(),
            trainDialogId: undefined!,
            sourceLogDialogId: stateTrainDialog.sourceLogDialogId,
            version: undefined!,
            packageCreationId: undefined!,
            packageDeletionId: undefined!,
            rounds: this.purgeMissingEntities(stateTrainDialog.rounds),
            definitions: {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }
        }

        const extractChanged = this.state.newScoreInput !== null
        this.props.onEdit(this.props.logDialog.logDialogId, newTrainDialog, extractChanged)
        this.setState({ 
            newTrainDialog: null,
            newScoreInput: null
         });
    }

    onClickSaveCheckNo() {
        this.setState({ newTrainDialog: null });
    }

    // User has submitted new entity extractions / text variations for a round
    onEntityExtractorSubmit(extractResponse: ExtractResponse, textVariations: TextVariation[], roundIndex: number): void {

        // Generate the new train dialog
        const roundsBeforeModification = this.props.logDialog.rounds.slice(0, roundIndex).map(ModelUtils.ToTrainRound);
        const modifiedRound: TrainRound = {
            extractorStep: {
                textVariations: textVariations
            },
            scorerSteps: []
        };

        const newTrainDialog: TrainDialog = {
            createdDateTime: new Date().toJSON(),
            trainDialogId: undefined!,
            sourceLogDialogId: this.props.logDialog.logDialogId,
            version: undefined!,
            packageCreationId: undefined!,
            packageDeletionId: undefined!,
            rounds: [
                ...roundsBeforeModification,
                modifiedRound
            ]
        }

        const uiScoreInput: UIScoreInput = {
            trainExtractorStep: {
                textVariations
            },
            extractResponse
        }

        this.setState({ 
            newTrainDialog: newTrainDialog,
            newScoreInput: uiScoreInput
         });
    }

    // User has submitted new entity extractions / text variations for a round
    onActionScorerSubmit(trainScorerStep: TrainScorerStep): void {
        // Remove scoredAction, we only need labeledAction
        delete trainScorerStep.scoredAction;

        const roundIndex = this.state.roundIndex
        if (roundIndex === null) {
            throw new Error(`You selected an action, but roundIndex is not known. This should not be possible. Contact Support`)
        }

        const scoreIndex = this.state.scoreIndex
        if (scoreIndex === null) {
            throw new Error(`You selected an action, but scoreIndex is not known. This should not be possible. Contact Support`)
        }

        // Convert
        const roundsBeforeModification = this.props.logDialog.rounds.slice(0, roundIndex).map(ModelUtils.ToTrainRound)

        const logRound = this.props.logDialog.rounds[roundIndex]
        const scorerStepsBeforeModification = logRound.scorerSteps.slice(0, scoreIndex).map(ModelUtils.ToTrainScorerStep)
        const originalScorerStep = logRound.scorerSteps[scoreIndex]
        const modifiedScorerStep: TrainScorerStep = {
            scoredAction: undefined,
            input: originalScorerStep.input,
            labelAction: trainScorerStep.labelAction,
            logicResult: trainScorerStep.logicResult
        }

        const modifiedRound: TrainRound = {
            extractorStep: {
                textVariations: [
                    {
                    text: logRound.extractorStep.text,
                    labelEntities: ModelUtils.ToLabeledEntities(logRound.extractorStep.predictedEntities)
                }]
            },
            scorerSteps: [...scorerStepsBeforeModification, modifiedScorerStep]
        }

        const newTrainDialog: TrainDialog = {
            createdDateTime: new Date().toJSON(),
            trainDialogId: undefined!,
            sourceLogDialogId: this.props.logDialog.logDialogId,
            version: undefined!,
            packageCreationId: undefined!,
            packageDeletionId: undefined!,
            definitions: undefined,
            rounds: [...roundsBeforeModification, modifiedRound]
        }

        this.setState({ 
            newTrainDialog: newTrainDialog,
            newScoreInput: null
        });
    }

    getPrevMemories(): Memory[] {
        const roundIndex = this.state.roundIndex
        if (roundIndex === null) {
            throw new Error(`You attempted to get previous memories, but roundIndex is not known. This should not be possible. Contact Support`)
        }

        let memories: Memory[] = [];
        let prevIndex = roundIndex - 1;
        if (prevIndex >= 0) {
            let round = this.props.logDialog.rounds[prevIndex];
            if (round.scorerSteps.length > 0) {
                let scorerStep = round.scorerSteps[0];
                memories = this.filledEntities2Memory(scorerStep.input.filledEntities);
            }
        }
        return memories;
    }

    filledEntities2Memory(filledEntities: FilledEntity[]): Memory[] {
        return  filledEntities.map<Memory>((fe) => {
            let entity = this.props.entities.find(e => e.entityId === fe.entityId);
            return ({
                entityName: entity ? entity.entityName : `MISSING ENTITY`,
                entityValues: fe.values
            })
        });
    }

    render() {
        let round: LogRound | null = null;
        let action: ActionBase | undefined = undefined;
        let memories: Memory[] = [];
        let prevMemories: Memory[] = [];
        let scorerStep: LogScorerStep | null = null;
        let dialogMode = (this.state.senderType === SenderType.User) ? DialogMode.Extractor : DialogMode.Scorer;

        const { logDialog, selectedActivity } = this.props
        if (logDialog && selectedActivity) {
            const roundIndex = this.state.roundIndex
            if (roundIndex === null) {
                throw new Error(`Activity is selected during rendering, but roundIndex is not known. This should not be possible. Contact Support`)
            }

            const scoreIndex = this.state.scoreIndex
            if (scoreIndex === null) {
                throw new Error(`Activity is selected during rendering, but scoreIndex is not known. This should not be possible. Contact Support`)
            }

            if (roundIndex >= logDialog.rounds.length) {
                throw new Error(`Index out of range: You are attempting to access round by index: ${roundIndex} but there are only: ${logDialog.rounds.length} rounds.`)
            }

            round = logDialog.rounds[roundIndex]

            if (scoreIndex < round.scorerSteps.length) {
                scorerStep = round.scorerSteps[scoreIndex]
                if (scorerStep && scorerStep.predictedAction) {
                    action = this.props.actions.find(a => a.actionId === scorerStep!.predictedAction)
                    if (!action) {
                        throw new Error(`Did not find action by id: ${scorerStep.predictedAction} within list of actions. Contact Support`)
                    }
                    memories = this.filledEntities2Memory(scorerStep.input.filledEntities);
                }
            }
            prevMemories = this.getPrevMemories();
        }

        return (
            <div className={`cl-dialog-admin ${OF.FontClassNames.large}`}>
                <div className={`cl-dialog-title cl-dialog-title--log ${OF.FontClassNames.xxLarge}`}>
                    <OF.Icon iconName="UserFollowed" />Log Dialog
                </div>
                {this.props.selectedActivity && (this.state.senderType === SenderType.User ? (
                    <div className="cl-dialog-admin__content">
                        <div className="cl-wc-message cl-wc-message--user">User Input</div>
                    </div>
                ) : (
                        <div className="cl-dialog-admin__content">
                            <div className="cl-wc-message cl-wc-message--bot">Bot Response</div>
                        </div>
                    ))
                }
                {logDialog && selectedActivity ?
                    (<div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">Memory</div>
                        <MemoryTable
                            memories={memories}
                            prevMemories={prevMemories}
                        />
                    </div>
                    ) : (
                        <div className="cl-dialog-admin__content">
                            <div>Click on User or Bot dialogs to the left to view how the Bot handled the User's conversation.</div>
                            <div>You can then make corrections to the Bot's behavior.</div>
                        </div>
                    )
                }
                {this.state.senderType === SenderType.User &&
                    <div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">Entity Detection</div>
                        <div>
                            {this.state.roundIndex !== null && round &&
                                <EntityExtractor
                                    app={this.props.app}
                                    editingPackageId={this.props.editingPackageId}
                                    canEdit={this.props.canEdit}
                                    extractType={DialogType.LOGDIALOG}
                                    sessionId={this.props.logDialog.logDialogId}
                                    roundIndex={this.state.roundIndex}
                                    autoTeach={false}
                                    dialogMode={dialogMode}
                                    extractResponses={this.props.extractResponses}
                                    originalTextVariations={[ModelUtils.ToTextVariation(round.extractorStep)]}
                                    onTextVariationsExtracted={this.onEntityExtractorSubmit}
                                    onExtractionsChanged={this.props.onExtractionsChanged}
                                />
                            }
                        </div>
                    </div>
                }
                {this.state.senderType === SenderType.Bot && this.props.logDialog && scorerStep &&
                    <div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">Action</div>
                        <div>
                            <ActionScorer
                                app={this.props.app}
                                editingPackageId={this.props.editingPackageId}
                                canEdit={this.props.canEdit}
                                hideScore={false}
                                dialogType={DialogType.LOGDIALOG}
                                sessionId={this.props.logDialog.logDialogId}
                                autoTeach={false}
                                dialogMode={dialogMode}
                                scoreResponse={scorerStep.predictionDetails}
                                scoreInput={scorerStep.input}
                                memories={memories}
                                onActionSelected={this.onActionScorerSubmit}
                            />
                        </div>
                    </div>
                }
                <div className="cl-dialog-admin__dialogs">
                    <OF.Dialog
                        hidden={!this.state.newTrainDialog}
                        onDismiss={() => this.onClickSaveCheckNo()}
                        dialogContentProps={{
                            type: OF.DialogType.normal}}
                        modalProps={{
                            isBlocking: true
                        }}
                    >
                        <div className="cl-modal_header">
                            <span className={OF.FontClassNames.medium}>
                                <FormattedMessage
                                    id={FM.LOGDIALOGADMIN_CONFIRMTITLE}
                                    defaultMessage={FM.LOGDIALOGADMIN_CONFIRMTITLE}
                                />
                            </span>
                        </div>
                        <OF.DialogFooter>
                            <OF.PrimaryButton onClick={() => this.onClickSaveCheckYes()} text='OK' />
                            <OF.DefaultButton onClick={() => this.onClickSaveCheckNo()} text='Cancel' />
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
    app: AppBase
    editingPackageId: string
    logDialog: LogDialog
    selectedActivity: Activity | null,
    canEdit: boolean,
    onEdit: (logDialogId: string, newTrainDialog: TrainDialog, extractChanged: boolean) => void
    onExtractionsChanged: (changed: boolean) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(LogDialogAdmin));