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
import * as CLM from '@conversationlearner/models' 
import { FM } from '../../react-intl-messages'
import { EditDialogType } from '.'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'

interface RenderData {
    dialogMode: CLM.DialogMode
    selectedAction: CLM.ActionBase | undefined
    scorerStep: CLM.TrainScorerStep | undefined
    scoreResponse: CLM.ScoreResponse | undefined
    round: CLM.TrainRound | undefined
    memories: CLM.Memory[]
    prevMemories: CLM.Memory[]
}

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
            // If rounds were trimmed, selectedActivity could have been in deleted rounds
            if (newProps.selectedActivity.channelData.roundIndex > newProps.trainDialog.rounds.length - 1) {
                this.setState({
                    senderType: newProps.selectedActivity.channelData.senderType,
                    roundIndex: newProps.trainDialog.rounds.length - 1,
                    scoreIndex: 0
                })
            }
            else if (newProps.selectedActivity.channelData.scoreIndex === 0) {
                this.setState({
                    senderType: newProps.selectedActivity.channelData.senderType,
                    roundIndex: newProps.selectedActivity.channelData.roundIndex,
                    scoreIndex: 0
                })
            }
            else if (newProps.selectedActivity.channelData.scoreIndex > newProps.trainDialog.rounds[newProps.selectedActivity.channelData.roundIndex].scorerSteps.length - 1) {
                this.setState({
                    senderType: newProps.selectedActivity.channelData.senderType,
                    roundIndex: newProps.selectedActivity.channelData.roundIndex,
                    scoreIndex: newProps.selectedActivity.channelData.scoreIndex - 1
                })
            }
            else {
                this.setState({
                    senderType: newProps.selectedActivity.channelData.senderType,
                    roundIndex: newProps.selectedActivity.channelData.roundIndex,
                    scoreIndex: newProps.selectedActivity.channelData.scoreIndex
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
                curRound = curRound +1
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

    getRenderData(): RenderData {
        let selectedAction: CLM.ActionBase | undefined
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

                selectedAction = this.props.actions.find(action => action.actionId === scorerStep!.labelAction);

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
            selectedAction: selectedAction,
            scorerStep: scorerStep,
            scoreResponse: scoreResponse,
            round: round,
            memories: memories,
            prevMemories: prevMemories
        }
    }
    
    render() {

        if (!this.props.trainDialog) {
            return null;
        }

        const editTypeClass = this.props.editType === EditDialogType.LOG ? 'log' : 'train'
        let renderData = this.getRenderData();
        return (
            <div className={`cl-dialog-admin ${OF.FontClassNames.large}`}>
                <div data-testid="traindialog-title" className={`cl-dialog-title cl-dialog-title--${editTypeClass} ${OF.FontClassNames.xxLarge}`}>
                    <OF.Icon 
                        iconName={this.props.editType === EditDialogType.LOG ? 'UserFollowed' : 'EditContact'}
                    />
                    {this.props.editType === EditDialogType.LOG ? 'Log Dialog' : 'Train Dialog'}
                </div>
                {this.props.selectedActivity && (this.state.senderType === CLM.SenderType.User
                    ? (
                        <div className="cl-dialog-admin__content">
                            <div className="cl-wc-message cl-wc-message--user">
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
                    ) : (
                        <div className="cl-dialog-admin__content">
                            <div className="cl-dialog-admin-title">
                                <FormattedMessage
                                    data-testid="dialog-admin-title-traindialog"
                                    id={FM.EDITDIALOGADMIN_HELPTEXT_TITLE}
                                    defaultMessage="Train Dialog"
                                />
                            </div>
                            <div>
                                <FormattedMessage
                                    id={FM.EDITDIALOGADMIN_HELPTEXT_DESCRIPTION}
                                    defaultMessage="Click on User or Bot dialogs to the left to view steps in the Train Dialog."
                                />
                            </div>
                            <div>
                                <FormattedMessage
                                    id={FM.EDITDIALOGADMIN_HELPTEXT_DESCRIPTION2}
                                    defaultMessage="You can then make changes to the Train Dialog."
                                />
                            </div>
                        </div>
                    )
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
                            {renderData.round ?
                                <EntityExtractor
                                    data-testid="dialog-admin-entity-extractor"
                                    app={this.props.app}
                                    editingPackageId={this.props.editingPackageId}
                                    canEdit={this.props.canEdit} 
                                    extractType={CLM.DialogType.TRAINDIALOG}
                                    sessionId={this.props.trainDialog.trainDialogId}
                                    roundIndex={this.state.roundIndex}
                                    autoTeach={false}
                                    dialogMode={renderData.dialogMode}
                                    extractResponses={this.props.extractResponses}
                                    originalTextVariations={renderData.round.extractorStep.textVariations}
                                    onTextVariationsExtracted={this.props.onChangeExtraction}
                                    onExtractionsChanged={this.props.onExtractionsChanged}
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
                {renderData.selectedAction
                && renderData.scoreResponse
                && renderData.scorerStep
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
                                canEdit={this.props.canEdit}
                                hideScore={true}
                                dialogType={CLM.DialogType.TRAINDIALOG}
                                sessionId={this.props.trainDialog.trainDialogId}
                                autoTeach={false}
                                dialogMode={renderData.dialogMode}
                                scoreResponse={renderData.scoreResponse}
                                scoreInput={renderData.scorerStep.input}
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
        clearExtractResponses
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        actions: state.actions,
        entities: state.entities,
        extractResponses: state.teachSessions.extractResponses
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
    selectedActivity: Activity | null,
    canEdit: boolean,
    editType: EditDialogType,
    onChangeAction: (trainScorerStep: CLM.TrainScorerStep) => void,
    onChangeExtraction: (extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) => void                              
    onExtractionsChanged: (changed: boolean) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(EditDialogAdmin))