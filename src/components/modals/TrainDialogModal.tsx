/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import ReactHtmlParser from 'react-html-parser'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as OF from 'office-ui-fabric-react';
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { State } from '../../types'
import actions from '../../actions'
import Webchat from '../Webchat'
import TrainDialogAdmin from './TrainDialogAdmin'
import * as CLM from '@conversationlearner/models'
import { Activity } from 'botframework-directlinejs'
import ConfirmCancelModal from './ConfirmCancelModal'
import UserInputModal from './UserInputModal'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { autobind } from 'office-ui-fabric-react/lib/Utilities'

interface ComponentState {
    isConfirmCancelModalOpen: boolean
    isUserInputModalOpen: boolean
    selectedActivity: Activity | null
    webchatKey: number
    currentTrainDialog: CLM.TrainDialog | null
    pendingExtractionChanges: boolean,
    // Save activity render when overwriting webchat render
    lastActivityJSX: JSX.Element | null,
    hasBeenEdited: boolean
}

const initialState: ComponentState = {
    isConfirmCancelModalOpen: false,
    isUserInputModalOpen: false,
    selectedActivity: null,
    webchatKey: 0,
    currentTrainDialog: null,
    pendingExtractionChanges: false,
    lastActivityJSX: null,
    hasBeenEdited: false
}

class TrainDialogModal extends React.Component<Props, ComponentState> {
    state = initialState

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.open === false && nextProps.open === true) {
            this.setState(initialState);
        }
        if (this.state.currentTrainDialog !== nextProps.trainDialog) {
            // Force webchat to re-mount as history prop can't be updated
            this.setState({
                currentTrainDialog: nextProps.trainDialog,
                webchatKey: this.state.webchatKey + 1
            });
        }
    }

    @autobind
    onClickBranch() {
        if (this.state.selectedActivity) {
            let branchRound = this.state.selectedActivity.channelData.roundIndex;
            if (branchRound > 0) {
                this.props.onBranch(branchRound);
            }
        }
    }

    @autobind
    onClickDone() {
        this.props.onClose()
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
        this.onInsertInput(userInput)
    }

    @autobind
    onClickDelete() {
        this.setState({
            isConfirmCancelModalOpen: true
        })
    }

    @autobind
    onClickCancelDelete() {
        this.setState({
            isConfirmCancelModalOpen: false
        })
    }

    @autobind
    onClickConfirmDelete() {
        this.props.onDelete();
        this.setState(
            { isConfirmCancelModalOpen: false }
        );
    }

    // Return best action from ScoreResponse 
    getBestAction(scoreResponse: CLM.ScoreResponse): CLM.ScoredAction | undefined {

        let scoredActions  = scoreResponse.scoredActions

        // Get highest scoring Action 
        let best
        for (let test of scoredActions) {
            if (!best || test.score > best.score) {
                best = test
            }
        }
        return best
    }

    @autobind
    async onInsertInput(inputText: string) {

        if (!this.props.user) {
            throw new Error("No Active User");
        }
        if (!this.state.selectedActivity) {
            throw new Error("No selected activity")
        }
  
        try {
            const roundIndex = this.state.selectedActivity.channelData.roundIndex
            const scoreIndex = this.state.selectedActivity.channelData.scoreIndex
            const senderType = this.state.selectedActivity.channelData.senderType

            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            // Copy, Remove rounds / scorer steps below insert
            let history = JSON.parse(JSON.stringify(this.props.trainDialog))
            history.definitions = definitions
            history.rounds = history.rounds.slice(0, roundIndex + 1)

            const userInput: CLM.UserInput = { text: inputText }

            // Get a score for this step
            const extractResponse = await ((this.props.extractFromHistoryThunkAsync(this.props.app.appId, history, userInput) as any) as Promise<CLM.ExtractResponse>)

            if (!extractResponse) {
                throw new Error("No extract response")  // LARS todo - handle this better
            }

            let textVariations = CLM.ModelUtils.ToTextVariations([extractResponse])
            let extractorStep: CLM.TrainExtractorStep = {textVariations}

            // Copy original and insert new round for the text
            let newTrainDialog = JSON.parse(JSON.stringify(this.props.trainDialog))
            newTrainDialog.definitions = definitions

            let scorerSteps: CLM.TrainScorerStep[]

            if (senderType === CLM.SenderType.User) {
                // Copy scorer steps below the injected input for new Round
                scorerSteps = this.props.trainDialog.rounds[roundIndex].scorerSteps

                // Remove scorer steps above injected input from round 
                newTrainDialog.rounds[roundIndex].scorerSteps = []
            }
            else {
                // Copy scorer steps below the injected input for new Round
                scorerSteps = this.props.trainDialog.rounds[roundIndex].scorerSteps.slice(scoreIndex + 1)

                // Remove scorer steps above injected input from round 
                newTrainDialog.rounds[roundIndex].scorerSteps.splice(scoreIndex + 1, Infinity)
            }

            // Create new round
            let newRound = {
                extractorStep,
                scorerSteps
            }
        
            // Inject new Round
            newTrainDialog.rounds.splice(roundIndex + 1, 0, newRound)
            
            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            this.props.onUpdate(newTrainDialog)
        }
        catch (error) {
            console.warn(`Error when attempting to create teach session from history: `, error)
        }
    }

    @autobind
    async onChangeExtraction(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) {
 
        if (!this.state.selectedActivity) {
            throw new Error("No selected activity")
        }
        if (!this.props.user) {
            throw new Error("No Active User");
        }

        try {
            const roundIndex = this.state.selectedActivity.channelData.roundIndex
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            let newTrainDialog = JSON.parse(JSON.stringify(this.props.trainDialog)) as CLM.TrainDialog
            newTrainDialog.definitions = definitions;
            newTrainDialog.rounds[roundIndex].extractorStep.textVariations = textVariations;

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            this.props.onUpdate(newTrainDialog)
        }
        catch (error) {
                console.warn(`Error when attempting to change extraction: `, error)
        }
    }

    @autobind
    async onChangeAction(trainScorerStep: CLM.TrainScorerStep) {
        if (!this.state.selectedActivity) {
            throw new Error("No selected activity")
        }
        if (!this.props.user) {
            throw new Error("No Active User");
        }

        try {
            const roundIndex = this.state.selectedActivity.channelData.roundIndex
            const scoreIndex = this.state.selectedActivity.channelData.scoreIndex
            const definitions = {
                entities: this.props.entities,
                actions: this.props.actions,
                trainDialogs: []
            }

            let newTrainDialog = JSON.parse(JSON.stringify(this.props.trainDialog)) as CLM.TrainDialog
            newTrainDialog.rounds[roundIndex].scorerSteps[scoreIndex] = trainScorerStep
            newTrainDialog.definitions = definitions;

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            this.props.onUpdate(newTrainDialog)
        }
        catch (error) {
            console.warn(`Error when attempting to change an Action: `, error)
        }
    }

    @autobind
    onInsertAction() {

        if (!this.props.user) {
            throw new Error("No Active User");
        }
        if (!this.state.selectedActivity) {
            throw new Error("No selected activity")
        }

        const roundIndex = this.state.selectedActivity.channelData.roundIndex
        const scoreIndex = this.state.selectedActivity.channelData.scoreIndex
        const definitions = {
            entities: this.props.entities,
            actions: this.props.actions,
            trainDialogs: []
        }

        // Copy, Remove rounds / scorer steps below insert
        let history = JSON.parse(JSON.stringify(this.props.trainDialog))
        history.definitions = definitions
        history.rounds = history.rounds.slice(0, roundIndex + 1)
        history.rounds[roundIndex].scorerSteps = history.rounds[roundIndex].scorerSteps.slice(0, scoreIndex);

        // Get a score for this step
        ((this.props.scoreFromHistoryThunkAsync(this.props.app.appId, history) as any) as Promise<CLM.UIScoreResponse>)
        .then((uiScoreResponse: CLM.UIScoreResponse) => {

            // Find top scoring Action
            let insertedAction = this.getBestAction(uiScoreResponse.scoreResponse)

            if (!insertedAction) {
                throw new Error("No actions available")  // LARS todo - handle this better
            }

            let scorerStep = {
                input: uiScoreResponse.scoreInput,
                labelAction: insertedAction.actionId,
                scoredAction: insertedAction
            }

            // Insert new Action into TrainDialog
            let newTrainDialog = JSON.parse(JSON.stringify(this.props.trainDialog))
            newTrainDialog.definitions = definitions
            let curRound = newTrainDialog.rounds[roundIndex]
            curRound.scorerSteps.splice(scoreIndex + 1, 0, scorerStep)
            this.props.onUpdate(newTrainDialog)
        })
        .catch((error: Error) => {
            console.warn(`Error when attempting to create teach session from history: `, error)
        })
    }

    @autobind
    async onDeleteTurn() {

        if (!this.state.selectedActivity) {
            throw new Error("No selected activity")
        }

        const senderType = this.state.selectedActivity.channelData.senderType
        const roundIndex = this.state.selectedActivity.channelData.roundIndex
        const scoreIndex = this.state.selectedActivity.channelData.scoreIndex

        let newTrainDialog: CLM.TrainDialog = {...this.props.trainDialog}
        newTrainDialog.definitions = {
            entities: this.props.entities,
            actions: this.props.actions,
            trainDialogs: []
        }

        let curRound = newTrainDialog.rounds[roundIndex]

        if (senderType === CLM.SenderType.User) {
            // If user input deleted, append scores to previous round
            if (roundIndex > 0) {
                let previousRound = newTrainDialog.rounds[roundIndex - 1]
                previousRound.scorerSteps = [...previousRound.scorerSteps, ...curRound.scorerSteps]

                // Remove actionless dummy step if it exits
                previousRound.scorerSteps = previousRound.scorerSteps.filter(ss => ss.labelAction !== undefined)
            }

            // Delete round 
            newTrainDialog.rounds.splice(roundIndex, 1)

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            this.props.onUpdate(newTrainDialog)
        }
        else if (senderType === CLM.SenderType.Bot) {
            // If Action deleted remove it
            curRound.scorerSteps.splice(scoreIndex, 1)

            // Replay logic functions on train dialog
            newTrainDialog = await ((this.props.trainDialogReplayThunkAsync(this.props.app.appId, newTrainDialog) as any) as Promise<CLM.TrainDialog>)

            this.props.onUpdate(newTrainDialog)
        }

        this.setState({
            hasBeenEdited: true
        })
    }
    
    onWebChatSelectActivity(activity: Activity) {
        let lastActivityJSX: JSX.Element | null = this.state.lastActivityJSX;

        // If I've change the selected activity
        if (this.state.selectedActivity !== activity) {

            // Restore original webchat render of the previous activity
            if (this.state.selectedActivity && this.state.lastActivityJSX) {
                // Find the turn render by Id
                let lastElement = document.querySelector(`[data-activity-id='${this.state.selectedActivity.id}']`)
                if (lastElement) {
                    ReactDOM.render(this.state.lastActivityJSX, lastElement)
                }
            }
            // Find the webchat render for this activity
            let element = document.querySelector(`[data-activity-id='${activity.id}']`)
            if (element && activity.id) {

                // Convert inner html to a JSX element
                lastActivityJSX = ReactHtmlParser(element.innerHTML)

                let canBranch = this.state.selectedActivity && this.state.selectedActivity.channelData.senderType === CLM.SenderType.User;
        
                const roundIndex = activity.channelData.roundIndex
                const senderType = activity.channelData.senderType
            
                // Generate new JSX with buttons
                const text = <div className="cl-wc-highlight">
                            {lastActivityJSX}
                            <OF.IconButton
                                className={`cl-wc-addinput ${activity.channelData.senderType === CLM.SenderType.User ? `cl-wc-addinput--user` : `cl-wc-addinput--bot`}`}
                                onClick={this.onClickAddUserInput}
                                ariaDescription="Insert Input Turn"
                                iconProps={{ iconName: 'CommentAdd' }}
                            />
                            <OF.IconButton
                                className={`cl-wc-addscore ${activity.channelData.senderType === CLM.SenderType.User ? `cl-wc-addscore--user` : `cl-wc-addscore--bot`}`}
                                onClick={this.onInsertAction}
                                ariaDescription="Insert Score Turn"
                                iconProps={{ iconName: 'CommentAdd' }}
                            />
                            {!(roundIndex === 0 && senderType === CLM.SenderType.User) &&
                                <OF.IconButton
                                    className={`cl-wc-deleteturn ${activity.channelData.senderType === CLM.SenderType.User ? `cl-wc-deleteturn--user` : `cl-wc-deleteturn--bot`}`}
                                    iconProps={{ iconName: 'Delete' }}
                                    onClick={this.onDeleteTurn}
                                    ariaDescription="Delete Turn"
                                />
                            }
                            <OF.IconButton
                                disabled={!canBranch ||
                                    this.state.pendingExtractionChanges ||
                                    !this.props.canEdit ||
                                    (this.props.trainDialog && this.props.trainDialog.invalid === true)}
                                
                                className={`cl-wc-branchturn ${activity.channelData.senderType === CLM.SenderType.User ? `cl-wc-branchturn--user` : `cl-wc-branchturn--bot`}`}
                                iconProps={{ iconName: 'BranchMerge' }}
                                onClick={this.onClickBranch}
                                ariaDescription={this.props.intl.formatMessage({
                                    id: FM.TRAINDIALOGMODAL_BRANCH_ARIADESCRIPTION,
                                    defaultMessage: 'Branch'
                                })}
                            />
                            </div>

                // Rerender back into element
                ReactDOM.render(text, element)
            }
        }

        this.setState({
            lastActivityJSX: lastActivityJSX,
            selectedActivity: activity
        })
    }

    onExtractionsChanged(changed: boolean) {
        // Put mask on webchat if changing extractions
        this.setState({
            pendingExtractionChanges: changed
        })
    }

    renderAbandonText(intl: ReactIntl.InjectedIntl) {
        if (this.state.hasBeenEdited) {
            return intl.formatMessage({
                id: FM.TRAINDIALOGMODAL_ABANDONEDITBUTTON_TEXT,
                defaultMessage: 'Abandon Edit'
            })
        }
        else {
            return intl.formatMessage({
                id: FM.TRAINDIALOGMODAL_DELETEBUTTON_TEXT,
                defaultMessage: 'Delete'
            })
        }
    }

    renderDoneText(intl: ReactIntl.InjectedIntl) {
        if (this.state.hasBeenEdited) {
            return intl.formatMessage({
                id: FM.TRAINDIALOGMODAL_SAVEEDITBUTTON_TEXT,
                defaultMessage: 'Save Edit'
            })
        }
        else {
            return intl.formatMessage({
                id: FM.TRAINDIALOGMODAL_DONEBUTTON_TEXT,
                defaultMessage: 'Done'
            })
        }
    }

    renderReplayError(replayError: CLM.ReplayError): JSX.Element {
        switch (replayError.type) {
            case CLM.ReplayErrorType.MissingAction:
                return (
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_MISSING_ACTION}
                            defaultMessage={FM.REPLAYERROR_DESC_MISSING_ACTION}
                        />
                        {` "${(replayError as CLM.ReplayErrorMissingAction).lastUserInput}"`}
                    </div>
                )
            case CLM.ReplayErrorType.MissingEntity:
                return (
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_MISSING_ENTITY}
                            defaultMessage={FM.REPLAYERROR_DESC_MISSING_ENTITY}
                        />
                        {` "${(replayError as CLM.ReplayErrorMissingEntity).value}"`}
                    </div>
                )
            case CLM.ReplayErrorType.ActionUnavailable:
                return (
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_UNAVAILABLE_ACTION}
                            defaultMessage={FM.REPLAYERROR_DESC_UNAVAILABLE_ACTION}
                        />
                        {` "${(replayError as CLM.ReplayErrorActionUnavailable).lastUserInput}"`}
                    </div>
                )
            case CLM.ReplayErrorType.ActionAfterWait:
                return (
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_ACTION_AFTER_WAIT}
                            defaultMessage={FM.REPLAYERROR_DESC_ACTION_AFTER_WAIT}
                        />
                    </div>
                )
            case CLM.ReplayErrorType.TwoUserInputs:
                return (
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_TWO_USER_INPUTS}
                            defaultMessage={FM.REPLAYERROR_DESC_TWO_USER_INPUTS}
                        />
                    </div>
                )
            case CLM.ReplayErrorType.InputAfterNonWait:
                return (
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_INPUT_AFTER_NONWAIT}
                            defaultMessage={FM.REPLAYERROR_DESC_INPUT_AFTER_NONWAIT}
                        />
                    </div>
                )
                //LARS - think this can go away?  check
            case CLM.ReplayErrorType.EntityDiscrepancy:
                let entityDiscrepancy = replayError as CLM.ReplayErrorEntityDiscrepancy;
                return (
                        <OF.TooltipHost  
                            id='myID' 
                            delay={ OF.TooltipDelay.zero }
                            calloutProps={ { gapSpace: 0 } }
                            tooltipProps={ {
                                onRenderContent: () => {
                                    return (
                                        <div className={OF.FontClassNames.mediumPlus}>
                                            <div className="cl-font--emphasis">Original Entities:</div>
                                            {entityDiscrepancy.originalEntities.length > 0 ?
                                                entityDiscrepancy.originalEntities.map((e: any) => (<div className={OF.FontClassNames.mediumPlus}>{e}</div>))
                                                : <div className={OF.FontClassNames.mediumPlus}>-none-</div>
                                            }
                                            <div className="cl-font--emphasis">New Entities:</div>
                                            {entityDiscrepancy.newEntities.length > 0 ?
                                                entityDiscrepancy.newEntities.map((e: any) => (<div className={OF.FontClassNames.mediumPlus}>{e}</div>))
                                                : <div className={OF.FontClassNames.mediumPlus}>-none-</div>
                                            }
                                        </div>
                                    );
                                    }
                              } }
                            >
                            <div className={OF.FontClassNames.mediumPlus}>
                                <FormattedMessage
                                    id={FM.REPLAYERROR_DESC_CHANGED_ENTITIES}
                                    defaultMessage={FM.REPLAYERROR_DESC_CHANGED_ENTITIES}
                                />
                                {` "${entityDiscrepancy.lastUserInput}"`}
                                <OF.Icon iconName="Info" className="cl-icon" />
                            </div>
                        </OF.TooltipHost>
                )
            default:
                throw new Error('Unhandled ReplayErrorType case');
        }
    }

    render() {
        const { intl } = this.props
        let chatDisable = this.state.pendingExtractionChanges ? <div className="cl-overlay"/> : null;
  
        return (
            <Modal
                isOpen={this.props.open}
                isBlocking={true}
                containerClassName="cl-modal cl-modal--large cl-modal--teach"
            >
                <div className="cl-modal_body">  
                    <div className="cl-chatmodal">
                        <div className="cl-chatmodal_webchat">
                            <Webchat
                                data-testid="chatmodal-webchat"
                                isOpen={this.props.open}
                                key={this.state.webchatKey}
                                app={this.props.app}
                                history={this.props.history}
                                onPostActivity={() => {}}
                                onSelectActivity={activity => this.onWebChatSelectActivity(activity)}
                                hideInput={true}
                                focusInput={false}
                            />
                            {chatDisable}
                        </div>
                        <div className="cl-chatmodal_controls"> 
                            <div className="cl-chatmodal_admin-controls">
                                <TrainDialogAdmin
                                    data-testid="chatmodal-traindialogadmin"
                                    app={this.props.app}
                                    editingPackageId={this.props.editingPackageId}
                                    canEdit={this.props.canEdit}
                                    trainDialog={this.props.trainDialog}
                                    selectedActivity={this.state.selectedActivity}
                                    onChangeAction={(trainScorerStep: CLM.TrainScorerStep) => this.onChangeAction(trainScorerStep)}
                                    onChangeExtraction={(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) => this.onChangeExtraction(extractResponse, textVariations)}
                                    onReplace={(editedTrainDialog: CLM.TrainDialog) => this.props.onReplace(editedTrainDialog)}
                                    onExtractionsChanged={(changed: boolean) => this.onExtractionsChanged(changed)}
                                />
                            </div>
                            {!this.props.canEdit && <div className="cl-overlay"/>} 
                        </div>
                    </div>
                </div>
                <div className="cl-modal_footer cl-modal_footer--border">
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary">
                            {this.state.selectedActivity && this.state.selectedActivity.channelData.replayError && 
                                <div className="cl-dialogwarning">
                                    {this.renderReplayError(this.state.selectedActivity.channelData.replayError)}
                                </div>
                            }
                        </div>
                        <div className="cl-modal-buttons_primary">
                            <OF.PrimaryButton
                                data-testid="footer-button-done"
                                disabled={this.state.pendingExtractionChanges}
                                onClick={this.onClickDone}
                                ariaDescription={this.renderDoneText(intl)}
                                text={this.renderDoneText(intl)}
                            />
                            <OF.DefaultButton
                                data-testid="footer-button-delete"
                                className="cl-button-delete"
                                disabled={this.state.pendingExtractionChanges || !this.props.canEdit}
                                onClick={this.onClickDelete}
                                ariaDescription={this.renderAbandonText(intl)}
                                text={this.renderAbandonText(intl)}
                            />

                        </div>
                    </div>
                </div>
                <ConfirmCancelModal
                    data-testid="confirm-delete-trainingdialog"
                    open={this.state.isConfirmCancelModalOpen}
                    onCancel={this.onClickCancelDelete}
                    onConfirm={this.onClickConfirmDelete}
                    title={intl.formatMessage({
                        id: FM.TRAINDIALOGMODAL_CONFIRMDELETE_TITLE,
                        defaultMessage: `Are you sure you want to delete this Training Dialog?`
                    })}
                />
                <UserInputModal
                    open={this.state.isUserInputModalOpen}
                    onCancel={this.onCancelAddUserInput}
                    onSubmit={this.onSubmitAddUserInput}
                />
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        scoreFromHistoryThunkAsync: actions.train.scoreFromHistoryThunkAsync,
        extractFromHistoryThunkAsync: actions.train.extractFromHistoryThunkAsync,
        trainDialogReplayThunkAsync: actions.train.trainDialogReplayThunkAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user.user,
        actions: state.actions,
        entities: state.entities
    }
}

export interface ReceivedProps {
    app: CLM.AppBase,
    editingPackageId: string,
    canEdit: boolean,
    onClose: () => void,
    onBranch: (turnIndex: number) => void,
    onEdit: (newTrainDialog: CLM.TrainDialog, extractChanged: boolean) => void,
    onReplace: (newTrainDialog: CLM.TrainDialog) => void,
    onUpdate: (newTrainDialog: CLM.TrainDialog) => void,
    onDelete: () => void
    open: boolean
    trainDialog: CLM.TrainDialog
    history: Activity[]
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TrainDialogModal))
