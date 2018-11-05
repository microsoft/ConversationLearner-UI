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
import actions from '../../actions'
import EntityExtractor from './EntityExtractor';
import ActionScorer from './ActionScorer';
import MemoryTable from './MemoryTable';
import { Activity } from 'botframework-directlinejs'
import * as OF from 'office-ui-fabric-react';
import * as CLM from '@conversationlearner/models' 
import { FM } from '../../react-intl-messages'
import * as DialogUtils from '../../dialogUtils'
import { EditDialogType, EditState } from '.'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import TrainingStatusContainer from '../TrainingStatusContainer'
import './EditDialogAdmin.css'

class EditDialogAdmin extends React.Component<Props, ComponentState> {
    constructor(p: Props) {
        super(p);
        this.state = {
            senderType: null,
            roundIndex: null,
            scoreIndex: null
        }
     }

    componentWillReceiveProps(newProps: Props) {

        if (newProps.selectedActivity && newProps.trainDialog) {
            let clData: CLM.CLChannelData = newProps.selectedActivity.channelData.clData
            // If rounds were trimmed, selectedActivity could have been in deleted rounds
            if (clData.roundIndex && clData.roundIndex > newProps.trainDialog.rounds.length - 1) {
                this.setState({
                    senderType: clData.senderType!,
                    roundIndex: newProps.trainDialog.rounds.length - 1,
                    scoreIndex: 0
                })
            }
            else if (clData.scoreIndex === 0) {
                this.setState({
                    senderType: clData.senderType!,
                    roundIndex: clData.roundIndex!,
                    scoreIndex: 0
                })
            }
            else if (clData.scoreIndex! > newProps.trainDialog.rounds[clData.roundIndex!].scorerSteps.length - 1) {
                this.setState({
                    senderType: clData.senderType!,
                    roundIndex: clData.roundIndex!,
                    scoreIndex: clData.scoreIndex! - 1
                })
            }
            else {
                this.setState({
                    senderType: clData.senderType!,
                    roundIndex: clData.roundIndex!,
                    scoreIndex: clData.scoreIndex!
                })
            }
        }
        else {
            this.setState({
                senderType: null,
                roundIndex: null,
                scoreIndex: null
            })
        }
    }

    async hasConflicts(textVariations: CLM.TextVariation[]): Promise<boolean> {

        // Generate list of textVariations that have changed
        const renderData = this.getRenderData()
        const originalTextVariations = renderData.textVariations
        let changedTextVariations: CLM.TextVariation[] = []
        textVariations.map(tv => {
            const found = originalTextVariations.find(otv => CLM.ModelUtils.areEqualTextVariations(tv, otv))
            if (!found) {
                changedTextVariations.push(tv)
            }
        })
    
        // Check the changed ones for conflicts

        // First check for internal conflics
        for (let changedTextVariation of changedTextVariations) {
            let extractConflict = DialogUtils.internalConflict(changedTextVariation, this.props.trainDialog, renderData.roundIndex)
            if (extractConflict) {
                this.props.setTextVariationConflict(extractConflict)
                return true
            }
        }

        let dialogId = this.props.editingLogDialogId || this.props.trainDialog.trainDialogId 
        // Next against other TrainDialogs
        for (let changedTextVariation of changedTextVariations) {
            let conflict = await this.props.fetchTextVariationConflictThunkAsync(
                this.props.app.appId, 
                dialogId,
                changedTextVariation, 
                // Exclude the originalTrain dialog from check
                this.props.originalTrainDialogId)
            if (conflict) {
                return true
            }
        }
        return false
    }
    
    @OF.autobind
    async onEntityExtractorSubmit(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]): Promise<void> {
        
        if (await this.hasConflicts(textVariations)) {
            return
        }
        
        this.props.clearExtractResponses() 

        // If no conflicts, submit the extractions
        this.props.onSubmitExtraction(extractResponse, textVariations)
    }

    getPrevMemories(): CLM.Memory[] {
        if (this.state.roundIndex === null) {
            throw new Error(`Cannot get previous memories because roundIndex is null. This is likely a problem with code. Please open an issue.`)
        }

        let memories: CLM.Memory[] = [];
        let prevIndex = this.state.roundIndex - 1;
        if (prevIndex >= 0) {
            let round = this.props.trainDialog.rounds[prevIndex];
            if (round.scorerSteps.length > 0) {
                let scorerStep = round.scorerSteps[round.scorerSteps.length - 1];
                memories = scorerStep.input.filledEntities.map<CLM.Memory>(fe => {
                    const entity = this.props.entities.find(e => e.entityId === fe.entityId)
                    if (!entity) {
                        throw new Error(`Could not find entity by id: ${fe.entityId} in list of entities`)
                    }
                    return {
                        entityName: entity.entityName,
                        entityValues: fe.values
                    }
                })
            }
        }
        return memories;
    }

    getMemories(): CLM.Memory[] {

        if (!this.state.roundIndex) {
            return []
        }

        // Find round with scorer step.  Usually part of current round, but 
        // when editing, not all rounds have scorer steps, so may need to 
        // look forward
        let curRound = this.state.roundIndex
        let filledEntities: CLM.FilledEntity[] | null = null

        while (!filledEntities) {
            if (this.props.trainDialog.rounds[curRound].scorerSteps.length > 0) {
                filledEntities = this.props.trainDialog.rounds[curRound].scorerSteps[0].input.filledEntities
            }
            else if (curRound < this.props.trainDialog.rounds.length) {
                curRound = curRound + 1
            }
            else {
                // No round with scorer step after this extraction step
                return []
            }
        }

        return filledEntities.map<CLM.Memory>((fe) => {
            let entity = this.props.entities.find(e => e.entityId === fe.entityId);
            let entityName = entity ? entity.entityName : 'UNKNOWN ENTITY';
            return {
                entityName: entityName,
                entityValues: fe.values
            }
        })
    }

    getRenderData(): DialogUtils.DialogRenderData {
        let scorerStep: CLM.TrainScorerStep | undefined
        let scoreResponse: CLM.ScoreResponse | undefined
        let round: CLM.TrainRound | undefined
        let memories: CLM.Memory[] = [];
        let prevMemories: CLM.Memory[] = [];

        if (this.state.roundIndex !== null && this.state.roundIndex < this.props.trainDialog.rounds.length) {
            round = this.props.trainDialog.rounds[this.state.roundIndex];
            if (round.scorerSteps.length > 0 && typeof this.state.scoreIndex === "number") {
                scorerStep = round.scorerSteps[this.state.scoreIndex];
                if (!scorerStep) {
                    throw new Error(`Cannot get score step at index: ${this.state.scoreIndex} from array of length: ${round.scorerSteps.length}`)
                }

                let selectedAction = this.props.actions.find(action => action.actionId === scorerStep!.labelAction);

                if (!selectedAction) {
                    // Action may have been deleted.  If so create dummy action to render
                    selectedAction = {
                        actionId: scorerStep.labelAction || 'MISSING ACTION',
                        createdDateTime: new Date().toJSON(),
                        payload: 'MISSING ACTION',
                        isTerminal: false,
                        actionType: CLM.ActionTypes.TEXT,
                        requiredEntitiesFromPayload: [],
                        requiredEntities: [],
                        negativeEntities: [],
                        suggestedEntity: null,
                        version: 0,
                        packageCreationId: 0,
                        packageDeletionId: 0
                    }
                }
                
                memories = scorerStep.input.filledEntities.map<CLM.Memory>((fe) => {
                    let entity = this.props.entities.find(e => e.entityId === fe.entityId);
                    let entityName = entity ? entity.entityName : 'UNKNOWN ENTITY';
                    return {
                        entityName: entityName,
                        entityValues: fe.values
                    }
                });
                
                // Get prevmemories
                prevMemories = this.getPrevMemories();

                let scoredAction: CLM.ScoredAction = {
                        actionId: selectedAction.actionId,
                        payload: selectedAction.payload,
                        isTerminal: selectedAction.isTerminal,
                        score: 1.0,
                        actionType: selectedAction.actionType
                    }

                // Generate list of all actions (apart from selected) for ScoreResponse as I have no scores
                let unscoredActions = this.props.actions
                    .filter(a => !selectedAction || a.actionId !== selectedAction.actionId)
                    .map<CLM.UnscoredAction>(action => 
                        ({
                            actionId: action.actionId,
                            payload: action.payload,
                            isTerminal: action.isTerminal,
                            reason: CLM.ScoreReason.NotCalculated,
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

        return {
            dialogMode: (this.state.senderType === CLM.SenderType.User) ? CLM.DialogMode.Extractor : CLM.DialogMode.Scorer,
            scoreInput: scorerStep ? scorerStep.input : undefined,
            scoreResponse: scoreResponse,
            roundIndex: this.state.roundIndex,
            textVariations: round ? round.extractorStep.textVariations : [],
            memories: DialogUtils.filterDummyEntities(memories),
            prevMemories: DialogUtils.filterDummyEntities(prevMemories)
        }
    }
    
    renderHelpText(isLogDialog: boolean) {
        if (isLogDialog) {
            return (
                <div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">
                            <FormattedMessage
                                data-testid="dialog-admin-title-traindialog"
                                id={FM.EDITDIALOGADMIN_HELPTEXT_TITLE_LOG}
                                defaultMessage="Log Dialog"
                            />
                        </div>
                        <div>
                            <FormattedMessage
                                id={FM.EDITDIALOGADMIN_HELPTEXT_DESCRIPTION_LOG}
                                defaultMessage="Click on User or Bot turns to the left to view steps in the Log Dialog."
                            />
                        </div>
                        <div>
                            <FormattedMessage
                                id={FM.EDITDIALOGADMIN_HELPTEXT_DESCRIPTION2_LOG}
                                defaultMessage="You can then make changes to the Log Dialog."
                            />
                        </div>
                    </div>
                )
        }
        else {
            return (
                <div className="cl-dialog-admin__content">
                    <div className="cl-dialog-admin-title">
                        <FormattedMessage
                            data-testid="dialog-admin-title-traindialog"
                            id={FM.EDITDIALOGADMIN_HELPTEXT_TITLE_TRAIN}
                            defaultMessage="Train Dialog"
                        />
                    </div>
                    <div>
                        <FormattedMessage
                            id={FM.EDITDIALOGADMIN_HELPTEXT_DESCRIPTION_TRAIN}
                            defaultMessage="Click on User or Bot turn to the left to view steps in the Train Dialog."
                        />
                    </div>
                    <div>
                        <FormattedMessage
                            id={FM.EDITDIALOGADMIN_HELPTEXT_DESCRIPTION2_TRAIN}
                            defaultMessage="You can then make changes to the Train Dialog."
                        />
                    </div>
                </div>
            )
        }
    }
    render() {

        if (!this.props.trainDialog) {
            return null;
        }
        const isLogDialog = (this.props.editType === EditDialogType.LOG_EDITED || this.props.editType === EditDialogType.LOG_ORIGINAL)
        const editTypeClass = isLogDialog ? 'log' : 'train'

        let renderData = this.getRenderData();
        return (
            <div className={`cl-dialog-admin ${OF.FontClassNames.small}`}>
                <div className="cl-ux-flexpanel">
                    <div className="cl-ux-flexpanel--primary">
                        <div className="cl-ux-flexpanel--left" style={{width:"80%"}}>
                            <div data-testid="traindialog-title" className={`cl-dialog-title cl-dialog-title--${editTypeClass} ${OF.FontClassNames.large}`}>
                                <OF.Icon 
                                    iconName={isLogDialog ? 'UserFollowed' : 'EditContact'}
                                />
                                {isLogDialog ? 'Log Dialog' : 'Train Dialog'}
                            </div>
                        </div>
                        <div className="cl-ux-flexpanel--right" style={{width:"20%"}}>
                            <TrainingStatusContainer
                                    app={this.props.app}
                            />
                        </div>
                    </div>
                </div>
                {this.props.selectedActivity && (this.state.senderType === CLM.SenderType.User
                    ? (
                        <div className="cl-dialog-admin__content">
                            <div 
                                className={`cl-wc-message cl-wc-message--user cl-wc-message--${isLogDialog ? 'log' : 'train'}`}
                            >
                                <FormattedMessage
                                    data-testid="modal-user-input"
                                    id={FM.EDITDIALOGADMIN_DIALOGMODE_USER}
                                    defaultMessage="User Input"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="cl-dialog-admin__content">
                            <div className="cl-wc-message cl-wc-message--bot">
                                <FormattedMessage
                                    data-testid="modal-bot-response"
                                    id={FM.EDITDIALOGADMIN_DIALOGMODE_TEXT}
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
                                data-testid="modal-memory-title"
                                id={FM.EDITDIALOGADMIN_MEMORY_TITLE}
                                defaultMessage="Memory"
                            />
                        </div>
                        <MemoryTable
                            data-testid="modal-memory-table"
                            memories={renderData.memories}
                            prevMemories={renderData.prevMemories}
                        />
                    </div>
                    ) : this.renderHelpText(isLogDialog)
                }
                {this.state.senderType === CLM.SenderType.User &&
                    <div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">
                            <FormattedMessage
                                data-testid="dialog-admin-entity-detection"
                                id={FM.EDITDIALOGADMIN_ENTITYDETECTION_TITLE}
                                defaultMessage="Entity Detection"
                            />
                        </div>
                        <div>
                            {renderData.roundIndex !== null ?
                                <EntityExtractor
                                    data-testid="dialog-admin-entity-extractor"
                                    app={this.props.app}
                                    editingPackageId={this.props.editingPackageId}
                                    originalTrainDialogId={this.props.originalTrainDialogId}
                                    canEdit={this.props.editState === EditState.CAN_EDIT} 
                                    extractType={isLogDialog
                                        ? CLM.DialogType.LOGDIALOG
                                        : CLM.DialogType.TRAINDIALOG}
                                    editType={this.props.editType}
                                    teachId={null}
                                    dialogId={this.props.editingLogDialogId
                                        ? this.props.editingLogDialogId
                                        : this.props.trainDialog.trainDialogId}
                                    roundIndex={this.state.roundIndex}
                                    autoTeach={false}
                                    dialogMode={renderData.dialogMode}
                                    extractResponses={this.props.teachSession ? this.props.teachSession.extractResponses : []}
                                    extractConflict={this.props.teachSession ? this.props.teachSession.extractConflict : null} 
                                    originalTextVariations={renderData.textVariations}
                                    onSubmitExtractions={this.onEntityExtractorSubmit}
                                    onPendingStatusChanged={this.props.onPendingStatusChanged}
                                />
                                : <span>
                                    <FormattedMessage
                                        id={FM.EDITDIALOGADMIN_ENTITYDETECTION_HELPTEXT}
                                        defaultMessage="Click on text from the dialog to the left."
                                    />
                                </span>
                            }
                        </div>
                    </div>
                }
                {renderData.scoreResponse && renderData.scoreInput
                && this.state.senderType === CLM.SenderType.Bot
                && <div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">
                            <FormattedMessage
                                data-testid="dialog-admin-action"
                                id={FM.EDITDIALOGADMIN_ACTION_TITLE}
                                defaultMessage="Action"
                            />
                        </div>
                        <div>
                            <ActionScorer
                                data-testid="dialog-admin-scorer"
                                app={this.props.app}
                                editingPackageId={this.props.editingPackageId}
                                canEdit={this.props.editState === EditState.CAN_EDIT}
                                hideScore={false}  // LARS
                                dialogType={CLM.DialogType.TRAINDIALOG}
                                autoTeach={false}
                                dialogMode={renderData.dialogMode}
                                scoreResponse={renderData.scoreResponse}
                                scoreInput={renderData.scoreInput}
                                memories={renderData.memories}
                                onActionSelected={this.props.onChangeAction}
                            />
                        </div>
                    </div>
                }
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        clearExtractResponses: actions.teach.clearExtractResponses,
        fetchTextVariationConflictThunkAsync: actions.train.fetchTextVariationConflictThunkAsync,
        setTextVariationConflict: actions.train.setTextVariationConflict
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        actions: state.actions,
        entities: state.entities,
        teachSession: state.teachSession
    }
}

interface ComponentState {
    // Did extraction change on edit
    senderType: CLM.SenderType | null,
    roundIndex: number | null,
    scoreIndex: number | null
}

export interface ReceivedProps {
    app: CLM. AppBase,
    editingPackageId: string,
    trainDialog: CLM.TrainDialog,
    // If editing a log dialog, this was the source
    editingLogDialogId: string | null
    // Train Dialog that this edit originally came from
    originalTrainDialogId: string | null,
    selectedActivity: Activity | null,
    editState: EditState,
    editType: EditDialogType,
    onChangeAction: (trainScorerStep: CLM.TrainScorerStep) => void,
    onSubmitExtraction: (extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) => void                            
    onPendingStatusChanged: (changed: boolean) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(EditDialogAdmin))