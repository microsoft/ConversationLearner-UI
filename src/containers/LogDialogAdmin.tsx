import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import ExtractorResponseEditor from './ExtractorResponseEditor';
import { Dialog, DialogType, DialogFooter, List, DetailsList, IColumn, CheckboxVisibility, PrimaryButton, DefaultButton } from 'office-ui-fabric-react'
import { Activity } from 'botframework-directlinejs'
import { TrainExtractorStep, TrainScorerStep, TextVariation, LogExtractorStep, TrainDialog, TrainRound, LogDialog, LogRound, LogScorerStep, ActionBase, EntityBase, ExtractResponse, ScoreReason, ScoredAction, UnscoredAction, ModelUtils } from 'blis-models'

// TODO: Convert to discriminated union to resolve scored or unscored actions via mutually exclusive type
interface ITypedAction {
    type: "scored" | "unscored"
    action: UnscoredAction | ScoredAction
}

interface IRenderableEntity {
    name: string,
    isInMemory: boolean,
    isNegative: boolean
}

interface IRenderableAction extends ITypedAction {
    renderableEntities: IRenderableEntity[]
    computedReason: ScoreReason
    payload: string
    arguments: string[]
}

interface IRenderableColumn extends IColumn {
    render: (score: IRenderableAction, component: LogDialogAdmin) => JSX.Element
}

let columns: IRenderableColumn[] = [
    {
        key: 'select',
        name: '',
        fieldName: 'actionId',
        minWidth: 80,
        maxWidth: 80,
        isResizable: false,
        render: (renderableAction, component) =>
            <PrimaryButton
                disabled={renderableAction.computedReason === ScoreReason.NotAvailable}
                onClick={() => component.onClickAvailableAction(renderableAction)}
                ariaDescription='Select'
                text='Select'
            />
    },
    {
        key: 'payload',
        name: 'Payload',
        fieldName: 'payload',
        minWidth: 100,
        maxWidth: 500,
        isMultiline: true,
        isResizable: true,
        render: renderableAction => <span className='ms-font-m-plus'>{renderableAction.payload}</span>
    },
    {
        key: 'arguments',
        name: 'Arguments',
        fieldName: 'arguments',
        minWidth: 80,
        maxWidth: 300,
        isResizable: true,
        render: renderableAction => renderableAction.arguments
            ? <List items={renderableAction.arguments} onRenderCell={item => <span className='ms-ListItem-primaryText'>{item}</span>} />
            : <span className="ms-Icon ms-Icon--Remove blis-action-icon"></span>
    },
    {
        key: 'score',
        name: 'Score',
        fieldName: 'score',
        minWidth: 80,
        maxWidth: 80,
        isResizable: true,
        isSorted: true,
        render: renderableAction => renderableAction.type === "scored"
            ? <span>{((renderableAction.action as ScoredAction).score * 100).toFixed(1) + "%"}</span>
            : <span>{(renderableAction.action as UnscoredAction).reason == "notAvailable" ? "Disqualified" : "Training..."}</span>
    },
    {
        key: 'entities',
        name: 'Entities',
        fieldName: 'entities',
        minWidth: 100,
        maxWidth: 300,
        isResizable: true,
        render: renderableAction => renderableAction.renderableEntities
            ? <List items={renderableAction.renderableEntities} onRenderCell={(entity: IRenderableEntity) => <span className={"blis-entity" && (entity.isInMemory ? "blis-entity--match" : "blis-entity--mismatch")}>{entity.isNegative ? (<del>{entity.name}</del>) : entity.name}</span>} />
            : <div>ERROR: Missing Action</div>
    },
    {
        key: 'wait',
        name: 'Wait',
        fieldName: 'isTerminal',
        minWidth: 50,
        maxWidth: 50,
        isResizable: true,
        render: renderableAction => renderableAction.action.isTerminal
            ? <span className="ms-Icon ms-Icon--CheckMark"></span>
            : <span className="ms-Icon ms-Icon--Remove"></span>
    },
    {
        key: 'type',
        name: 'Type',
        fieldName: 'type',
        minWidth: 80,
        maxWidth: 80,
        isResizable: true,
        render: renderableAction => <span>{renderableAction.action.metadata.actionType}</span>
    }
]

interface ComponentState {
    isSaveConfirmationDialogHidden: boolean
    entityChangesPending: boolean
    originalExtractResponse: ExtractResponse
    newExtractResponse: ExtractResponse
    newAction: ITypedAction
}

class LogDialogAdmin extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        isSaveConfirmationDialogHidden: true,
        entityChangesPending: false,
        originalExtractResponse: null,
        newExtractResponse: null,
        newAction: null
    }

    /**
     * Create train dialog from subset of a log dialog.
     * 
     * Given a log dialog and selected activity with modified extract response or modified action
     * Convert rounds before the modification directly and for the modified activity/round construct new round merging the modifications with exiting data
     */
    static createTrainDialog(logDialog: LogDialog, selectedActivity: Activity, newExtractResponse: ExtractResponse, newAction: ITypedAction): TrainDialog {
        if (newExtractResponse && newAction) {
            throw new Error(`You attempted to edit both the extract reponse and selected action of a log dialog.  Only one of these changes is allowed.`)
        }

        const [roundIndex, scoreIndex] = selectedActivity.id.split(":").map(s => parseInt(s))

        if (roundIndex >= logDialog.rounds.length) {
            throw new Error(`Index out of range: You are attempting to access round by index: ${roundIndex} but there are only: ${logDialog.rounds.length} rounds.`)
        }

        const roundsBeforeModification = logDialog.rounds.slice(0, roundIndex).map(this.convertLogRoundToTrainRound)
        const modifiedRound = this.mergeLogRoundWithChanges(logDialog.rounds[roundIndex], scoreIndex, newExtractResponse, newAction)

        return new TrainDialog({
            rounds: [
                ...roundsBeforeModification,
                modifiedRound
            ]
        })
    }

    static convertLogRoundToTrainRound(logRound: LogRound): TrainRound {
        return new TrainRound({
            extractorStep: new TrainExtractorStep({
                textVariations: [new TextVariation({
                    // TODO: Might need to strictly convert to label entity
                    labelEntities: logRound.extractorStep.predictedEntities,
                    text: logRound.extractorStep.text
                })],
            }),
            scorerSteps: logRound.scorerSteps.map(scorerStep => new TrainScorerStep({
                input: scorerStep.input,
                labelAction: scorerStep.predictedAction,
                // TODO: What is the correct scoredAction to take?
                // Perhaps find the scoredAction using id from predictedAction?
                scoredAction: scorerStep.predictionDetails.scoredActions[0]
            }))
        })
    }

    static convertLogScorerStepToTrainScorerStep(logScorerStep: LogScorerStep): TrainScorerStep {
        return new TrainScorerStep({
            input: logScorerStep.input,
            labelAction: logScorerStep.predictedAction,
            // TODO: Check if this is correct?
            scoredAction: logScorerStep.predictionDetails.scoredActions[0]
        })
    }

    static mergeLogRoundWithChanges(logRound: LogRound, scorerIndex: number, newExtractResponse: ExtractResponse, newAction: ITypedAction): TrainRound {
        /** If there is a new extract response, all scorer rounds are invalidated, just return a new round with the proper entity extraction */
        if (newExtractResponse !== null) {
            return new TrainRound({
                extractorStep: new TrainExtractorStep({
                    textVariations: [new TextVariation({
                        text: newExtractResponse.text,
                        labelEntities: newExtractResponse.predictedEntities
                    })]
                }),
                scorerSteps: []
            })
        }

        /** If there is new action selected, preserve previous scorer rounds, and add new scorer round containing the new action */
        if (scorerIndex >= logRound.scorerSteps.length) {
            throw new Error(`Index out of range: You are attempting to access scorer step by index: ${scorerIndex} but there are only: ${logRound.scorerSteps.length} scorer steps.`)
        }

        const scorerStepsBeforeModification = logRound.scorerSteps.slice(0, scorerIndex).map(this.convertLogScorerStepToTrainScorerStep)
        const originalScorerStep = logRound.scorerSteps[scorerIndex]
        const modifiedScorerStep = new TrainScorerStep({
            input: originalScorerStep.input,
            labelAction: newAction.action.actionId,
            scoredAction: (newAction.action as ScoredAction)
        })

        return new TrainRound({
            extractorStep: new TrainExtractorStep({
                textVariations: [new TextVariation({
                    text: logRound.extractorStep.text,
                    labelEntities: logRound.extractorStep.predictedEntities
                })]
            }),
            scorerSteps: [
                ...scorerStepsBeforeModification,
                modifiedScorerStep
            ]
        })
    }

    /**
     * For scored actions return null
     * For unscored actions with reason NotCalculated resolve reason to NotAvailable or NotScorable
     * Otherwise return reason
     */
    computeUnscoreReason(typedAction: ITypedAction): ScoreReason {
        // TODO: null is indicating there is no reason since reason is only for unscored actions.
        if (typedAction.type === "scored") {
            return null
        }

        const unscoredAction = typedAction.action as UnscoredAction
        // if (unscoredAction.reason === ScoreReason.NotCalculated) {
        //     return 
        // }

        return unscoredAction.reason as ScoreReason
    }

    /**
     * If action id does not match existing actions return null
     * Otherwise, return list of entities with additional properties for rendering based on matching current state of memory
     */
    computeRenderableEntities(typedAction: ITypedAction, actions: ActionBase[], entities: EntityBase[], filledEntities: EntityBase[]): IRenderableEntity[] {
        const action = actions.find(action => action.actionId == typedAction.action.actionId)

        if (action === null) {
            return null
        }

        const convertToRenderableEntity = (entity: EntityBase | null, filledEntities: EntityBase[], isNegative: boolean): IRenderableEntity => {
            if (entity === null) {
                return {
                    name: "ERROR",
                    isInMemory: false,
                    isNegative
                }
            }

            return {
                name: entity.entityName,
                isInMemory: filledEntities.find(e => e.entityName === entity.entityName) !== null,
                isNegative
            }
        }

        const renderableRequiredEntities: IRenderableEntity[] = action.requiredEntities
            .map(entityId => entities.find(entity => entity.entityId === entityId))
            .map(entity => convertToRenderableEntity(entity, [], false))

        const renderableNegativeEntities: IRenderableEntity[] = action.requiredEntities
            .map(entityId => entities.find(entity => entity.entityId === entityId))
            .map(entity => convertToRenderableEntity(entity, [], true))

        return [
            ...renderableRequiredEntities,
            ...renderableNegativeEntities
        ]
    }

    /**
     * Find avilable actions to choose.
     * Performs data manipulation so that all fields required for rendering are available
     */
    findAvailableActions(action: ActionBase, scorerStep: LogScorerStep, props: Props, filledEntities: EntityBase[]): IRenderableAction[] {
        // Merge the scored and unscored actions into single list
        return [
            ...scorerStep.predictionDetails.scoredActions.map<ITypedAction>(action => ({ type: "scored", action })),
            ...scorerStep.predictionDetails.unscoredActions.map<ITypedAction>(action => ({ type: "unscored", action }))
        ]
            // Exclude the predicted/chosen action
            .filter(typedAction => typedAction.action.actionId !== action.actionId)
            .map(typedAction => {
                typedAction.action = { ...typedAction.action, ...props.actions.find(action => action.actionId === typedAction.action.actionId) }
                return typedAction
            })
            // Convert raw actions to renderable actions
            .map(typedAction => ({
                ...typedAction,
                renderableEntities: this.computeRenderableEntities(typedAction, props.actions, props.entities, filledEntities),
                computedReason: this.computeUnscoreReason(typedAction),
                payload: ModelUtils.GetPrimaryPayload(typedAction.action as ScoredAction),
                arguments: ModelUtils.GetArguments(typedAction.action as ScoredAction)
            }))
    }

    onClickAvailableAction(typedAction: ITypedAction) {
        console.log(`Action Clicked`, typedAction.type)
        this.setState({
            isSaveConfirmationDialogHidden: false,
            newAction: typedAction
        })
    }

    onUpdateExtractResponse(extractResponse: ExtractResponse) {
        console.log(`onUpdateExtractResponse: ${extractResponse}`)
        this.setState({
            entityChangesPending: true,
            newExtractResponse: extractResponse
        })
    }

    // TODO: I don't think it's possible for this to be invoked from log dialog context becuase there are not text variations
    // and you are not allowed to add more. That is only when you are training the bot.
    onRemoveExtractResponse(extractResponse: ExtractResponse) {
        console.log(`onRemoveExtractResponse: ${extractResponse}`)
        // TODO: Need to have access to entire state of ExtractorResponseEditor in order to remove from the available updated responses
        // this.setState({
        //     entityChangesPending: true
        // })
    }

    onClickSavePendingEntityChanges() {
        console.log(`onClickSavePendingEntityChanges: `)
        this.setState({
            isSaveConfirmationDialogHidden: false
        })
    }

    onClickResetPendingEntityChanges() {
        console.log(`onClickResetPendingEntityChanges: `)
        // TODO: How to reset entity state back to actual activity state?
        // Need to force ExtractorResponseEditor to change, perhaps update it's props to force re-calcution?
    }

    onDismisSaveConfirmation() {
        this.setState({
            isSaveConfirmationDialogHidden: true
        })
    }

    onClickSaveConfirmation() {
        this.setState({
            isSaveConfirmationDialogHidden: true
        }, () => {
            const trainDialog = LogDialogAdmin.createTrainDialog(this.props.logDialog, this.props.selectedActivity, this.state.newExtractResponse, this.state.newAction)
            this.props.onSaveChanges(trainDialog)
        })
    }

    onClickCancelSaveConfirmation() {
        this.setState({
            isSaveConfirmationDialogHidden: true
        })
    }

    onClickTestDialog() {
        this.setState({
            isSaveConfirmationDialogHidden: false
        })
    }

    updateOriginalEntityState(logExtractorStep: LogExtractorStep) {
        this.setState({
            entityChangesPending: false,
            originalExtractResponse: logExtractorStep
        })
    }

    render() {
        let round: LogRound = null
        let action: ActionBase = null
        let filledEntities: EntityBase[] = []
        let availableActions: IRenderableAction[] = []

        const { logDialog, selectedActivity } = this.props
        if (logDialog && selectedActivity) {
            // TODO: Add roundIndex and scoreIndex to activity instead of hiding within id if these are needed as first class properties.
            const [roundIndex, scoreIndex] = selectedActivity.id.split(":").map(s => parseInt(s))

            if (roundIndex >= logDialog.rounds.length) {
                throw new Error(`Index out of range: You are attempting to access round by index: ${roundIndex} but there are only: ${logDialog.rounds.length} rounds.`)
            }

            round = logDialog.rounds[roundIndex]
            // this.updateOriginalEntityState(round.extractorStep)

            if (scoreIndex < round.scorerSteps.length) {
                const scorerStep = round.scorerSteps[scoreIndex]
                if (scorerStep && scorerStep.predictedAction) {
                    action = this.props.actions.find(action => action.actionId === scorerStep.predictedAction)
                    filledEntities = this.props.entities.filter(entity => scorerStep.input.filledEntities.includes(entity.entityId))
                    availableActions = this.findAvailableActions(action, scorerStep, this.props, filledEntities)
                }
            }
        }

        return (
            <div className="blis-log-dialog-admin ms-font-l">
                <div className="blis-log-dialog-admin__title">Entity Detection</div>
                <div className="blis-log-dialog-admin__content">
                    {round
                        ? <div>
                            <ExtractorResponseEditor
                                canEdit={true}
                                isPrimary={true}
                                isValid={true}
                                extractResponse={round.extractorStep}
                                updateExtractResponse={extractResponse => this.onUpdateExtractResponse(extractResponse)}
                                removeExtractResponse={extractResponse => this.onRemoveExtractResponse(extractResponse)}
                            />
                            {this.state.entityChangesPending && <div>
                                <PrimaryButton onClick={() => this.onClickSavePendingEntityChanges()}>Save</PrimaryButton>
                                <DefaultButton onClick={() => this.onClickResetPendingEntityChanges()}>Reset</DefaultButton>
                            </div>}
                        </div>
                        : <span>Click on text from the dialog to the left to view how the bot interpretted the conversation.  You can then make corrections to the bots behavior.</span>
                    }
                </div>
                <div className="blis-log-dialog-admin__title">Memory</div>
                <div className="blis-log-dialog-admin__content">
                    {filledEntities.length !== 0 && filledEntities.map(entity => <div key={entity.entityName}>{entity.entityName}</div>)}
                </div>
                <div className="blis-log-dialog-admin__title">Action</div>
                <div className="blis-log-dialog-admin__content">
                    {action && <div>
                        <div>Action the bot chose:</div>
                        <div className="blis-log-dialog-admin__chosen-action">
                            {action.payload}
                        </div>
                        <div>Alternate actions available to choose:</div>
                        <DetailsList
                            items={availableActions}
                            columns={columns}
                            checkboxVisibility={CheckboxVisibility.hidden}
                            onRenderItemColumn={(action: IRenderableAction, i, column: IRenderableColumn) => column.render(action, this)}
                        />
                    </div>}
                </div>
                <div className="blis-log-dialog-admin__dialogs">
                    <Dialog
                        hidden={this.state.isSaveConfirmationDialogHidden}
                        onDismiss={() => this.onDismisSaveConfirmation()}
                        dialogContentProps={{
                            type: DialogType.normal,
                            title: 'Are you sure you want to save changes?',
                            subText: 'This will create a new training dialog based on your changes'
                        }}
                        modalProps={{
                            isBlocking: true
                        }}
                    >
                        <DialogFooter>
                            <PrimaryButton onClick={() => this.onClickSaveConfirmation()} text='Save' />
                            <DefaultButton onClick={() => this.onClickCancelSaveConfirmation()} text='Cancel' />
                        </DialogFooter>
                    </Dialog>
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
        entities: state.entities
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