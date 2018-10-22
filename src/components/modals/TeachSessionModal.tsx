/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import './TeachSessionModal.css';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ErrorHandler } from '../../ErrorHandler'
import { AT } from '../../types/ActionTypes'
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as BotChat from '@conversationlearner/webchat'
import * as OF from 'office-ui-fabric-react';
import { State } from '../../types';
import Webchat, { renderActivity } from '../Webchat'
import TeachSessionAdmin, { RenderData } from './TeachSessionAdmin'
import TeachSessionInitState from './TeachSessionInitState'
import * as CLM from '@conversationlearner/models'
import { Activity } from 'botframework-directlinejs'
import AddButtonInput from './AddButtonInput'
import AddScoreButton from './AddButtonScore'
import actions from '../../actions'
import ConfirmCancelModal from './ConfirmCancelModal'
import UserInputModal from './UserInputModal'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { EditDialogType } from '.';
import { EditHandlerArgs } from '../../routes/Apps/App/TrainDialogs';

interface ComponentState {
    isConfirmDeleteOpen: boolean,
    isUserInputModalOpen: boolean,
    isInitStateOpen: boolean,
    isInitAvailable: boolean,
    initialEntities: CLM.FilledEntityMap | null,
    webchatKey: number,
    editing: boolean,
    hasTerminalAction: boolean,
    nextActivityIndex: number,
    // If activity selected its index
    selectedActivityIndex: number | null,
    // If activity was part of existing history, the actual item
    selectedHistoryActivity: Activity | null
}

class TeachModal extends React.Component<Props, ComponentState> {

    state: ComponentState = {
        isConfirmDeleteOpen: false,
        isUserInputModalOpen: false,
        isInitStateOpen: false,
        isInitAvailable: true,
        initialEntities: null,
        webchatKey: 0,
        editing: false,
        hasTerminalAction: false,
        nextActivityIndex: 0,
        selectedActivityIndex: null,
        selectedHistoryActivity: null
    }

    private callbacksId: string | null = null;

    componentDidMount() {
        this.callbacksId = ErrorHandler.registerCallbacks(
            [
                {actionType: AT.POST_SCORE_FEEDBACK_ASYNC, callback: this.onDismissError},
                {actionType: AT.RUN_SCORER_ASYNC, callback: this.onDismissError},
            ]
        );
    };

    componentWillUnmount() {
        if (this.callbacksId) {
            ErrorHandler.deleteCallbacks(this.callbacksId)
        }
    }
 
    @autobind
    onDismissError(errorType: AT): void {
        if (this.props.teachSession.teach) {
            this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession.teach, this.props.app, this.props.editingPackageId, false, null, null); // False = abandon
        }
        this.props.onClose();
    }

    componentWillReceiveProps(newProps: Props) {

        let webchatKey = this.state.webchatKey
        let hasTerminalAction = this.state.hasTerminalAction
        let isInitAvailable = this.state.isInitAvailable
        let nextActivityIndex = this.state.nextActivityIndex
        let selectedActivityIndex = this.state.selectedActivityIndex
        let selectedHistoryActivity = this.state.selectedHistoryActivity
        let initialEntities = this.state.initialEntities

        if (!newProps.isOpen) {
            selectedActivityIndex = null
            selectedHistoryActivity = null
            initialEntities = null
        }

        if (this.props.initialHistory !== newProps.initialHistory) {
            webchatKey = this.state.webchatKey + 1
            isInitAvailable = !newProps.initialHistory || newProps.initialHistory.length === 0
            nextActivityIndex = newProps.initialHistory.length
        }

        // If new session
        if (this.props.teachSession.teach !== newProps.teachSession.teach) {
            isInitAvailable = true
            hasTerminalAction = false
            initialEntities = null
        }
        // Set terminal action from History but only if I just loaded it
        if (this.props.initialHistory !== newProps.initialHistory && newProps.initialHistory && newProps.initialHistory.length > 0) {
            hasTerminalAction = newProps.lastAction
                ? newProps.lastAction.isTerminal
                : false
        }

        if (webchatKey !== this.state.webchatKey || 
            hasTerminalAction !== this.state.hasTerminalAction ||
            isInitAvailable !== this.state.isInitAvailable) {
            this.setState({
                webchatKey,
                hasTerminalAction,
                isInitAvailable,
                initialEntities,
                nextActivityIndex,
                selectedActivityIndex,
                selectedHistoryActivity
            })
        }   
    }

    @autobind
    onInitStateClicked() {
        this.setState({
            isInitStateOpen: true
        })
    }

    @autobind
    async onCloseInitState(filledEntityMap?: CLM.FilledEntityMap) {
        if (filledEntityMap && this.props.onSetInitialEntities) {
            await this.props.onSetInitialEntities(filledEntityMap.FilledEntities())              
        }
        this.setState({
            isInitStateOpen: false,
            initialEntities: filledEntityMap || null
        })
    }

    @autobind
    onClickAbandonTeach() {
        this.setState({
            isConfirmDeleteOpen: true
        })
    }

    @autobind
    onClickSave() {
        // If source was a trainDialog, delete the original
        let sourceTrainDialogId = this.props.sourceTrainDialog ? this.props.sourceTrainDialog.trainDialogId : null;
        let sourceLogDialogId = this.props.sourceLogDialog ? this.props.sourceLogDialog.logDialogId : null;

        if (this.props.teachSession.teach) {
            this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession.teach, this.props.app, this.props.editingPackageId, true, sourceTrainDialogId, sourceLogDialogId)
        }
        this.props.onClose()
    }

    @autobind
    onClickConfirmDelete() {
        this.setState(
            {
                isConfirmDeleteOpen: false
            },
            () => {
                if (this.props.teachSession.teach) {
                    this.props.deleteTeachSessionThunkAsync(this.props.user.id, this.props.teachSession.teach, this.props.app, this.props.editingPackageId, false, null, null); // False = abandon
                }
                this.props.onClose()
            })
    }

    @autobind
    onClickCancelDelete() {
        this.setState({
            isConfirmDeleteOpen: false
        })
    }

    autoTeachChanged(ev: React.FormEvent<HTMLElement>, isChecked: boolean) {
        this.props.toggleAutoTeach(isChecked);
    }

    async onWebChatSelectActivity(activity: Activity) {

        // Activities from history can be looked up
        if (this.props.initialHistory.length > 0) {
            const selectedActivityIndex = this.props.initialHistory.findIndex(a => a.id === activity.id)
            if (selectedActivityIndex > -1) {
                this.setState({
                    selectedActivityIndex,
                    selectedHistoryActivity: activity})
                return
            }
        }
        // Otherwise newly create activities with have index in channelData
        this.setState({
            selectedActivityIndex: activity.channelData.activityIndex,
            selectedHistoryActivity: null
        })        
    }

    onWebChatPostActivity(activity: Activity) {
        if (activity.type === 'message') {

            let userInput: CLM.UserInput

            // Check if button submit info
            if (!activity.text && activity.value && activity.value['submit']) {
                userInput = { text: activity.value['submit'] }
            } 
            // Otherwise use text
            else {
                userInput = { text: activity.text! }
            }

            if (!this.props.teachSession.teach) {
                throw new Error(`Current teach session is not defined. This may be due to race condition where you attempted to chat with the bot before the teach session has been created.`)
            }

            // Add channel data to activity so can process when clicked on later
            activity.channelData = { 
                activityIndex: this.state.nextActivityIndex,
            }
              
            this.setState({ 
                 // No initialization allowed after first input
                isInitAvailable: false, 
                initialEntities: null,
                nextActivityIndex: this.state.nextActivityIndex + 1,
                selectedActivityIndex: null,
                selectedHistoryActivity: null
            })

            this.props.runExtractorThunkAsync(this.props.app.appId, CLM.DialogType.TEACH, this.props.teachSession.teach.teachId, null, userInput);
        }
    }

    // TODO: this is redundant with EditDialogAdmin
    @OF.autobind
    getPrevMemories(): CLM.Memory[] {

        let sourceDialog = this.props.sourceTrainDialog || this.props.sourceLogDialog

        if (!this.state.selectedHistoryActivity || !sourceDialog) {
            throw new Error("historyRender missing data")
        }

        let roundIndex = this.state.selectedHistoryActivity.channelData.roundIndex

        if (roundIndex === null) {
            throw new Error(`Cannot get previous memories because roundIndex is null. This is likely a problem with code. Please open an issue.`)
        }

        let memories: CLM.Memory[] = [];
        let prevIndex = roundIndex - 1;
        if (prevIndex >= 0) {
            let round = sourceDialog.rounds[prevIndex];
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

    // TODO: this is redundant with EditDialogAdmin
    @OF.autobind
    historyRender(): RenderData {
        let selectedAction: CLM.ActionBase | undefined
        let scorerStep: CLM.TrainScorerStep | CLM.LogScorerStep | undefined
        let scoreResponse: CLM.ScoreResponse | undefined
        let round: CLM.TrainRound | CLM.LogRound | undefined
        let memories: CLM.Memory[] = [];
        let prevMemories: CLM.Memory[] = [];

        let sourceDialog = this.props.sourceTrainDialog || this.props.sourceLogDialog
        if (!this.state.selectedHistoryActivity || !sourceDialog) {
            throw new Error("historyRender missing data")
        }

        let roundIndex = this.state.selectedHistoryActivity.channelData.roundIndex
        let scoreIndex = this.state.selectedHistoryActivity.channelData.scoreIndex
        let senderType = this.state.selectedHistoryActivity.channelData.senderType

        if (roundIndex !== null && roundIndex < sourceDialog.rounds.length) {
            round = sourceDialog.rounds[roundIndex];
            if (round.scorerSteps.length > 0 && typeof scoreIndex === "number") {
                scorerStep = round.scorerSteps[scoreIndex];
                if (!scorerStep) {
                    throw new Error(`Cannot get score step at index: ${scoreIndex} from array of length: ${round.scorerSteps.length}`)
                }

                let actionId = this.props.sourceTrainDialog 
                    ? (scorerStep as CLM.TrainScorerStep)!.labelAction 
                    : (scorerStep as CLM.LogScorerStep)!.predictedAction
                selectedAction = this.props.actions.find(action => action.actionId === actionId);

                if (!selectedAction) {
                    // Action may have been deleted.  If so create dummy action to render
                    selectedAction = {
                        actionId: actionId || 'MISSING ACTION',
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

            let textVariations = this.props.sourceTrainDialog 
                ? (round as CLM.TrainRound).extractorStep.textVariations
                : CLM.ModelUtils.ToTextVariations([(round as CLM.LogRound).extractorStep])

            return {
                dialogMode: (senderType === CLM.SenderType.User) ? CLM.DialogMode.Extractor : CLM.DialogMode.Scorer,
                scoreInput: scorerStep ? scorerStep.input : undefined,
                scoreResponse: scoreResponse,
                roundIndex,
                memories: memories,
                prevMemories: prevMemories,
                extractResponses: [],
                textVariations: textVariations
            }       
        }
        throw new Error("Fail to render")
    }

    @autobind
    onClickAddUserInput() {
        this.setState({
            isUserInputModalOpen: true
        })
    }

    @autobind
    onCancelAddUserInput() {
        this.setState({
            isUserInputModalOpen: false
        })
    }

    @autobind
    onSubmitAddUserInput(userInput: string) {
        this.setState({
            isUserInputModalOpen: false
        })
        if (this.state.selectedActivityIndex != null) { 
            this.props.onEditTeach(this.state.selectedActivityIndex, {userInput}, this.props.onInsertInput) 
        }
    }

    @autobind
    onInsertAction() {
        if (this.state.selectedActivityIndex != null) { 
            this.props.onEditTeach(this.state.selectedActivityIndex, null, this.props.onInsertAction) 
        }
    }

    @autobind
    onDeleteTurn() {
        if (this.state.selectedActivityIndex != null) { 
            this.props.onEditTeach(this.state.selectedActivityIndex, null, this.props.onDeleteTurn) 
        }
    }

    @autobind
    onEditExtraction(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) {
        if (this.state.selectedActivityIndex != null) { 
            this.props.onEditTeach(this.state.selectedActivityIndex, {extractResponse, textVariations}, this.props.onChangeExtraction) 
        }
    }

    @autobind
    onEditScore(trainScorerStep: CLM.TrainScorerStep) {
        if (this.state.selectedActivityIndex != null) { 
            this.props.onEditTeach(this.state.selectedActivityIndex, {trainScorerStep}, this.props.onChangeAction) 
        }
    }

    renderActivity(activityProps: BotChat.WrappedActivityProps, children: React.ReactNode, setRef: (div: HTMLDivElement | null) => void): JSX.Element {
       return renderActivity(activityProps, children, setRef, this.renderSelectedActivity, this.props.editType)
    }

    @autobind
    renderSelectedActivity(activity: Activity): (JSX.Element | null) {

        if (this.state.selectedActivityIndex === null) {
            return null
        }
        
        const isUser = activity.from.name === 'ConversationLearnerDeveloper'

        // Can't delete first user input
        const canDeleteRound = this.state.selectedActivityIndex !== 0

        return (
            <div className="cl-wc-buttonbar">
                <AddButtonInput 
                    onClick={this.onClickAddUserInput}
                    editType={this.props.editType}
                />
                <AddScoreButton 
                    onClick={this.onInsertAction}
                />
                {canDeleteRound &&
                    <OF.IconButton
                        className={`cl-wc-deleteturn ${isUser ? `cl-wc-deleteturn--user` : `cl-wc-deleteturn--bot`}`}
                        iconProps={{ iconName: 'Delete' }}
                        onClick={this.onDeleteTurn}
                        ariaDescription="Delete Turn"
                    />
                }
                </div>
        )
    }

    renderAbandonText(intl: ReactIntl.InjectedIntl) {
        switch (this.props.editType) {
            case EditDialogType.NEW:
                return intl.formatMessage({
                    id: FM.BUTTON_ABANDON,
                    defaultMessage: 'Abandon'
                }) 
            case EditDialogType.LOG_EDITED:
                return intl.formatMessage({
                    id: FM.BUTTON_ABANDON_EDIT,
                    defaultMessage: 'Abandon Edit'
                })
            case EditDialogType.LOG_ORIGINAL:
                return intl.formatMessage({
                    id: FM.BUTTON_ABANDON,
                    defaultMessage: 'Abandon'
                }) 
            case EditDialogType.TRAIN_EDITED:
                return intl.formatMessage({
                    id: FM.BUTTON_ABANDON_EDIT,
                    defaultMessage: 'Abandon Edit'
                })
            case EditDialogType.TRAIN_ORIGINAL:
                return intl.formatMessage({
                    id: FM.BUTTON_ABANDON,
                    defaultMessage: 'Abandon'
                })
            default:
                return ""
        }
    }

    renderSaveText(intl: ReactIntl.InjectedIntl) {
        switch (this.props.editType) {
            case EditDialogType.NEW:
                return intl.formatMessage({
                    id: FM.BUTTON_SAVE,
                    defaultMessage: 'Save'
                })
            case EditDialogType.LOG_EDITED:
                return intl.formatMessage({
                    id: FM.BUTTON_SAVE_AS_TRAIN_DIALOG,
                    defaultMessage: 'Save as Train Dialog'
                })
            case EditDialogType.LOG_ORIGINAL:
                return intl.formatMessage({
                    id: FM.BUTTON_SAVE_AS_TRAIN_DIALOG,
                    defaultMessage: 'Save as Train Dialog'
                })
            case EditDialogType.TRAIN_EDITED:
                return intl.formatMessage({
                    id: FM.BUTTON_SAVE_EDIT,
                    defaultMessage: 'Save Edit'
                })
            case EditDialogType.TRAIN_ORIGINAL:
                return intl.formatMessage({
                    id: FM.BUTTON_SAVE,
                    defaultMessage: 'Save'
                })
            default:
                return ""
        }
    }

    renderConfirmText(intl: ReactIntl.InjectedIntl) {
        switch (this.props.editType) {
            case EditDialogType.NEW:
                return intl.formatMessage({
                    id: FM.TEACHSESSIONMODAL_TEACH_CONFIRMDELETE_TITLE,
                    defaultMessage: 'Are you sure you want to abandon this teach session?'
                }) 
            case EditDialogType.LOG_EDITED:
                return intl.formatMessage({
                    id: FM.TEACHSESSIONMODAL_EDIT_CONFIRMDELETE_TITLE,
                    defaultMessage: 'Are you sure you want to abondon your edits?'
                })
            case EditDialogType.LOG_ORIGINAL:
                return intl.formatMessage({
                    id: FM.TEACHSESSIONMODAL_EDIT_CONFIRMDELETE_TITLE,
                    defaultMessage: 'Are you sure you want to abondon your edits?'
                })
            case EditDialogType.TRAIN_EDITED:
                return intl.formatMessage({
                    id: FM.TEACHSESSIONMODAL_EDIT_CONFIRMDELETE_TITLE,
                    defaultMessage: 'Are you sure you want to abondon your edits?'
                })
            case EditDialogType.TRAIN_ORIGINAL:
                return intl.formatMessage({
                    id: FM.TEACHSESSIONMODAL_TEACH_CONFIRMDELETE_TITLE,
                    defaultMessage: 'Are you sure you want to abandon this teach session?'
                })
            default:
                return ""
        }
    }

    onScrollChange(position: number) {
        this.props.setWebchatScrollPosition(position)
    }

    render() {
        const { intl } = this.props

        // Put mask of webchat if waiting for extraction labelling
        let chatDisable = this.props.teachSession.dialogMode === CLM.DialogMode.Extractor ? <div className="cl-overlay"/> : null;
        return (
            <div>
                <Modal
                    isOpen={this.props.isOpen}
                    isBlocking={true}
                    containerClassName="cl-modal cl-modal--large cl-modal--teach"
                >
                    <div className="cl-modal_body">
                        <div className="cl-chatmodal">
                            <div className="cl-chatmodal_webchat">
                                <Webchat
                                    data-testid="teach-session-modal-webchat"
                                    isOpen={this.props.isOpen}
                                    key={this.state.webchatKey}
                                    app={this.props.app}
                                    history={this.props.initialHistory}
                                    onPostActivity={activity => this.onWebChatPostActivity(activity)}
                                    onSelectActivity={activity => this.onWebChatSelectActivity(activity)} 
                                    onScrollChange={position => this.onScrollChange(position)}                      
                                    hideInput={this.props.teachSession.dialogMode !== CLM.DialogMode.Wait}
                                    focusInput={this.props.teachSession.dialogMode === CLM.DialogMode.Wait}
                                    highlightClassName={'wc-message-selected'}
                                    renderActivity={(props, children, setRef) => this.renderActivity(props, children, setRef)}
                                    selectedActivityIndex={this.state.selectedActivityIndex}
                                />
                                {chatDisable}
                            </div>
                            <div className="cl-chatmodal_controls">
                                <div className="cl-chatmodal_admin-controls">
                                    <TeachSessionAdmin
                                        data-testid="teach-session-admin"
                                        app={this.props.app}
                                        editingPackageId={this.props.editingPackageId}
                                        editType={this.props.editType}
                                        initialEntities={this.state.initialEntities}
                                        activityIndex={this.state.nextActivityIndex}
                                        selectedActivityIndex={this.state.selectedActivityIndex}
                                        historyRenderData={this.state.selectedHistoryActivity ? this.historyRender : null}
                                        onScoredAction={(scoredAction) => {
                                                this.setState({
                                                    hasTerminalAction: scoredAction.isTerminal,
                                                    nextActivityIndex: this.state.nextActivityIndex + 1
                                                })
                                            }
                                        }
                                        onEditExtraction={this.onEditExtraction} 
                                        onEditAction={this.onEditScore}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="cl-modal_footer cl-modal_footer--border">
                        <div className="cl-modal-buttons">
                            <div className="cl-modal-buttons_secondary">
                                {this.state.isInitAvailable && 
                                    <OF.DefaultButton
                                            data-testid="teach-session-set-initial-state"
                                            disabled={false}
                                            onClick={this.onInitStateClicked}
                                            ariaDescription={intl.formatMessage({
                                                id: FM.TEACHSESSIONMODAL_INITSTATE_ARIADESCRIPTION,
                                                defaultMessage: "Set Initial State"
                                            })}
                                            text={intl.formatMessage({
                                                id: FM.TEACHSESSIONMODAL_INITSTATE_TEXT,
                                                defaultMessage: "Set Initial State"
                                            })}
                                    />
                                    }
                                </div>

                            <div className="cl-modal-buttons_primary">
                                <OF.PrimaryButton
                                    data-testid="teach-session-footer-button-save"
                                    disabled={!this.state.hasTerminalAction || this.props.teachSession.dialogMode === CLM.DialogMode.Extractor}
                                    onClick={this.onClickSave}
                                    ariaDescription={this.renderSaveText(intl)}
                                    text={this.renderSaveText(intl)}
                                />
                                <OF.DefaultButton
                                    data-testid="teach-session-footer-button-abandon"
                                    disabled={false}
                                    className="cl-button-delete"
                                    onClick={this.onClickAbandonTeach}
                                    ariaDescription={this.renderAbandonText(intl)}
                                    text={this.renderAbandonText(intl)}
                                />
                                
                            </div>
                        </div>
                    </div>
                    <ConfirmCancelModal
                        data-testid="teach-session-confirm-cancel"
                        open={this.state.isConfirmDeleteOpen}
                        onCancel={this.onClickCancelDelete}
                        onConfirm={this.onClickConfirmDelete}
                        title={this.renderConfirmText(intl)}
                    />
                    <UserInputModal
                        titleFM={FM.USERINPUT_ADD_TITLE}
                        open={this.state.isUserInputModalOpen}
                        onCancel={() => {this.onCancelAddUserInput()}}
                        onSubmit={this.onSubmitAddUserInput}
                    />
                </Modal>
                <TeachSessionInitState
                    isOpen={this.state.isInitStateOpen}
                    handleClose={this.onCloseInitState}
                />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        deleteTeachSessionThunkAsync: actions.teach.deleteTeachSessionThunkAsync,
        fetchApplicationTrainingStatusThunkAsync: actions.app.fetchApplicationTrainingStatusThunkAsync,
        fetchTrainDialogThunkAsync: actions.train.fetchTrainDialogThunkAsync,
        runExtractorThunkAsync: actions.teach.runExtractorThunkAsync,
        toggleAutoTeach: actions.teach.toggleAutoTeach,
        setWebchatScrollPosition: actions.display.setWebchatScrollPosition
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render TeachSessionAdmin but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        user: state.user.user,
        entities: state.entities,
        actions: state.actions,
        teachSession: state.teachSession
    }
}

export interface ReceivedProps {
    isOpen: boolean
    onClose: Function
    onEditTeach: (historyIndex: number, args: EditHandlerArgs|null, editHandler: (trainDialog: CLM.TrainDialog, activity: Activity, args: EditHandlerArgs) => any) => void
    onInsertAction: (trainDialog: CLM.TrainDialog, activity: Activity) => any
    onInsertInput: (trainDialog: CLM.TrainDialog, activity: Activity, args: EditHandlerArgs) => any
    onChangeExtraction: (trainDialog: CLM.TrainDialog, activity: Activity, args: EditHandlerArgs) => any
    onChangeAction: (trainDialog: CLM.TrainDialog, activity: Activity, args: EditHandlerArgs) => any
    onDeleteTurn: (trainDialog: CLM.TrainDialog, activity: Activity) => any
    onSetInitialEntities: ((initialFilledEntities: CLM.FilledEntity[]) => void) | null
    app: CLM.AppBase
    editingPackageId: string
    // Is it new, from a TrainDialog or LogDialog
    editType: EditDialogType,
    // When editing and existing log or train dialog
    sourceTrainDialog: CLM.TrainDialog | null
    sourceLogDialog: CLM.LogDialog | null
    // When editing, the intial history before teach starts
    initialHistory: Activity[]
    lastAction: CLM.ActionBase | null
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachModal))
