/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import actions from '../../actions'
import * as CLM from '@conversationlearner/models'
import { EditDialogType } from '../../components/modals'
import ActionScorer from './ActionScorer';
import EntityExtractor from './EntityExtractor';
import MemoryTable from './MemoryTable';
import { FM } from '../../react-intl-messages'
import * as DialogUtils from '../../Utils/dialogUtils'
import { TeachSessionState } from '../../types/StateTypes'
import TrainingStatusContainer from '../TrainingStatusContainer'
import * as OF from 'office-ui-fabric-react'
import FormattedMessageId from '../FormattedMessageId'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './TeachSessionAdmin.css'

interface RoundLookup {
    textVariations?: CLM.TextVariation[] | null
    uiScoreResponse?: CLM.UIScoreResponse | null
    memories?: CLM.Memory[]
}
interface ComponentState {
    isScoresRefreshVisible: boolean
    turnLookup: RoundLookup[]
    turnLookupOffset: number
}

class TeachSessionAdmin extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        isScoresRefreshVisible: false,
        turnLookup: [],
        turnLookupOffset: 0
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
        if (this.props.sourceTrainDialog) {
            for (let changedTextVariation of changedTextVariations) {
                let extractConflict = DialogUtils.internalConflict(changedTextVariation, this.props.sourceTrainDialog, renderData.roundIndex)
                if (extractConflict) {
                    this.props.setTextVariationConflict(extractConflict)
                    return true
                }
            }
        }

        // Next against other TrainDialogs
        for (let changedTextVariation of changedTextVariations) {
            let conflict = await this.props.fetchTextVariationConflictThunkAsync(
                this.props.app.appId,
                this.props.teachSession.teach!.trainDialogId,
                changedTextVariation,
                this.props.originalTrainDialogId)
            if (conflict) {
                return true
            }
        }
        return false
    }

    @OF.autobind
    async onEntityExtractorSubmit(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]): Promise<void> {

        // If I'm editing an existing round
        if (this.props.selectedActivityIndex !== null) {

            if (await this.hasConflicts(textVariations)) {
                return
            }
            // Check for conflicts
            this.props.onEditExtraction(extractResponse, textVariations)
            return
        }

        // Otherwise update teach session
        if (!this.props.teachSession.teach) {
            throw new Error(`teachSession.current must be defined but it is not. This is likely a problem with higher components. Please open an issue.`)
        }

        const uiScoreInput: CLM.UIScoreInput = {
            trainExtractorStep: {
                textVariations
            },
            extractResponse
        }

        const appId = this.props.app.appId
        const teachId = this.props.teachSession.teach.teachId
        const uiScoreResponse: CLM.UIScoreResponse = await ((this.props.runScorerThunkAsync(this.props.user.id, appId, teachId, uiScoreInput) as any) as Promise<CLM.UIScoreResponse>)

        if (!uiScoreResponse.extractConflict && !uiScoreResponse.botAPIError) {
            let turnLookup = [...this.state.turnLookup]
            // If first turn, set offset based on existing activities
            let turnLookupOffset = this.state.turnLookup.length === 0 ? this.props.nextActivityIndex - 1 : this.state.turnLookupOffset

            turnLookup.push({ textVariations, memories: [...this.props.teachSession.memories] })
            turnLookup.push({ uiScoreResponse, memories: [...this.props.teachSession.memories]  })
            this.setState({
                isScoresRefreshVisible: true,
                turnLookup,
                turnLookupOffset
            })

            let userText = CLM.ModelUtils.textVariationToMarkdown(textVariations[0])
            this.props.onReplaceActivityText(userText, this.props.nextActivityIndex - 1 /*LARSturnLookupOffset + turnLookup.length - 2*/)

            this.props.clearExtractResponses()
        }
    }

    @OF.autobind
    async onActionScorerSubmit(trainScorerStep: CLM.TrainScorerStep): Promise<void> {

        // If I'm editing an existing round
        if (this.props.selectedActivityIndex) {
            this.props.onEditAction(trainScorerStep)
            return
        }

        const scoredAction = trainScorerStep.scoredAction
        if (!scoredAction) {
            throw new Error(`The provided train scorer step must have scoredAction field, but it was not provided. This should not be possible. Contact Support`)
        }

        if (!this.props.teachSession.teach) {
            throw new Error(`teachSession.current must be defined but it is not. This is likely a problem with higher components. Please open an issue.`)
        }

        // Send channel data to add to activity so can process when clicked on later
        const clData: CLM.CLChannelData = {
            senderType: CLM.SenderType.Bot,
            roundIndex: null,
            scoreIndex: null,
            activityIndex: this.props.nextActivityIndex,
            validWaitAction: !scoredAction.isTerminal || undefined  // Draws carrot under card if a wait action
        }

        const uiTrainScorerStep: CLM.UITrainScorerStep = {
            trainScorerStep,
            clData,
            entities: this.props.entities
        }

        const appId = this.props.app.appId;
        const teachId = this.props.teachSession.teach.teachId;
        const waitForUser = scoredAction.isTerminal;

        // Pass score input (minus extractor step) for subsequent actions when this one is non-terminal
        const uiScoreInput = {
            ...this.props.teachSession.uiScoreInput,
            trainExtractorStep: null
        } as CLM.UIScoreInput

        await this.props.postScorerFeedbackThunkAsync(this.props.user.id, appId, teachId, uiTrainScorerStep, waitForUser, uiScoreInput)

        this.props.onScoredAction(scoredAction)

        if (!waitForUser) {
            const uiScoreResponse = await ((this.props.runScorerThunkAsync(this.props.user.id, appId, teachId, uiScoreInput) as any) as Promise<CLM.UIScoreResponse>)
            let turnLookup = [...this.state.turnLookup]

            // Update memory on previous turn as may have been an API call
            let lastLookup = turnLookup[turnLookup.length - 1]
            lastLookup.memories = [...this.props.teachSession.memories]

            turnLookup.push({ uiScoreResponse, memories: [...this.props.teachSession.memories] })

            // Update memory on previous turn as may have been an API call
            this.setState({
                isScoresRefreshVisible: true,
                turnLookup
            })
        }
    }

    onClickRefreshScores = (event: React.MouseEvent<HTMLButtonElement>) => {
        // TODO: This is coupling knowledge about reducers populating this field after runScorer fulfilled
        if (!this.props.teachSession.scoreInput) {
            throw new Error(`You attempted to refresh scores but there was no previous score input to re-use.  This is likely a problem with the code. Please open an issue.`)
        }

        if (!this.props.teachSession.teach) {
            throw new Error(`teachSession.current must be defined but it is not. This is likely a problem with higher components. Please open an issue.`)
        }

        this.props.getScoresThunkAsync(
            this.props.user.id,
            this.props.app.appId,
            this.props.teachSession.teach.teachId,
            this.props.teachSession.scoreInput)

        this.setState({
            isScoresRefreshVisible: false
        })
    }

    // Calculate round index from selectedActivityIndex
    roundIndex(activityIndex: number): number {
        let roundIndex = -1
        let activityLeft = activityIndex
        while (activityLeft >= 0) {
            if (this.state.turnLookup[activityLeft].textVariations) {
                roundIndex = roundIndex + 1
            }
            activityLeft = activityLeft - 1
        }
        return roundIndex
    }

    getRenderData(): DialogUtils.DialogRenderData {

        // If user click on and activity
        if (this.props.selectedActivityIndex != null) {

            // Offset lookup index based on pre-existing activities
            let lookupIndex = this.props.selectedActivityIndex - this.state.turnLookupOffset

            if (lookupIndex >= 0) {

                let turnData = this.state.turnLookup[lookupIndex]

                const prevTurn = this.state.turnLookup[lookupIndex - 1]
                const prevMemories = (prevTurn && prevTurn.uiScoreResponse) ? prevTurn.uiScoreResponse.memories! : []
                if (turnData.uiScoreResponse) {
                    return {
                        dialogMode: CLM.DialogMode.Scorer,
                        scoreInput: turnData.uiScoreResponse.scoreInput,
                        scoreResponse: turnData.uiScoreResponse.scoreResponse,
                        memories: turnData.memories ? DialogUtils.filterDummyEntities(turnData.memories) : [],
                        prevMemories: DialogUtils.filterDummyEntities(prevMemories),
                        extractResponses: this.props.teachSession.extractResponses,
                        textVariations: [],
                        roundIndex: this.roundIndex(lookupIndex) + this.state.turnLookupOffset
                    }
                }
                else if (turnData.textVariations) {
                    return {
                        dialogMode: CLM.DialogMode.Extractor,
                        extractResponses: this.props.teachSession.extractResponses,
                        textVariations: turnData.textVariations,
                        memories: turnData.memories ? DialogUtils.filterDummyEntities(turnData.memories) : [],
                        prevMemories: DialogUtils.filterDummyEntities(prevMemories),
                        roundIndex: this.roundIndex(lookupIndex) + this.state.turnLookupOffset
                    }
                }
            }
            // Handle rendering of pre-existing activity    
            else if (this.props.historyRenderData) {
                return this.props.historyRenderData()
            }
            throw new Error("Bad TurnData")
        }
        else {
            const memories = this.props.initialEntities
                ? this.props.initialEntities.ToMemory()
                : this.props.teachSession.memories

            return {
                dialogMode: this.props.teachSession.dialogMode,
                scoreInput: this.props.teachSession.scoreInput!,
                scoreResponse: this.props.teachSession.scoreResponse!,
                memories: DialogUtils.filterDummyEntities(memories),
                prevMemories: DialogUtils.filterDummyEntities(this.props.teachSession.prevMemories),
                extractResponses: this.props.teachSession.extractResponses,
                textVariations: [],
                roundIndex: null
            }
        }
    }

    render() {
        // Don't render if not in a teach session
        if (!this.props.teachSession.teach) {
            return null;
        }

        const renderData = this.getRenderData()
        const autoTeachWithRound = this.props.teachSession.autoTeach
        const isLogDialog = (this.props.editType === EditDialogType.LOG_EDITED || this.props.editType === EditDialogType.LOG_ORIGINAL)
        const editTypeClass = isLogDialog ? 'log' : 'train'

        return (
            <div className={`cl-dialog-admin ${OF.FontClassNames.small}`}>
                <div className="cl-ux-flexpanel">
                    <div className="cl-ux-flexpanel--primary">
                        <div className="cl-ux-flexpanel--left" style={{ width: '65%' }}>
                            <div className={`cl-dialog-title cl-dialog-title--${editTypeClass} ${OF.FontClassNames.large}`}>
                                <OF.Icon
                                    iconName={isLogDialog ? 'UserFollowed' : 'EditContact'}
                                />
                                {isLogDialog ? 'Log Dialog' : 'Train Dialog'}
                            </div>
                        </div>
                        <div className="cl-ux-flexpanel--right" style={{ width: '35%', marginRight: '3em' }}>
                            <TrainingStatusContainer
                                app={this.props.app}
                            />
                        </div>
                    </div>
                </div>
                {(renderData.dialogMode === CLM.DialogMode.Extractor || renderData.dialogMode === CLM.DialogMode.Wait) &&
                    (
                        <div className="cl-dialog-admin__content">
                            <div
                                className={`cl-wc-message cl-wc-message--user cl-wc-message--${isLogDialog ? 'log' : 'train'}`}
                            >
                                <FormattedMessageId
                                    data-testid="teach-session-admin-userinput"
                                    id={FM.TEACHSESSIONADMIN_DIALOGMODE_USER}
                                />
                            </div>
                        </div>
                    )
                }
                {renderData.dialogMode === CLM.DialogMode.Scorer && (
                    <div className="cl-dialog-admin__content">
                        <div className="cl-wc-message cl-wc-message--bot">
                            <FormattedMessageId
                                data-testid="teach-session-admin-botresponse"
                                id={FM.TEACHSESSIONADMIN_DIALOGMODE_BOT}
                            />
                        </div>
                    </div>)
                }
                {renderData.dialogMode === CLM.DialogMode.EndSession && (
                    <div className="cl-dialog-admin__content">
                        <div className="cl-wc-message cl-wc-message--done">
                            <FormattedMessageId id={FM.TEACHSESSIONADMIN_DIALOGMODE_END_SESSION} />
                        </div>
                    </div>)
                }
                <div className="cl-dialog-admin__content">
                    <div className="cl-dialog-admin-title">
                        <FormattedMessageId
                            data-testid="teach-session-admin-entitymemory"
                            id={FM.TEACHSESSIONADMIN_MEMORY_TITLE}
                        />
                    </div>
                    <div>
                        <MemoryTable
                            data-testid="teach-session-admin-memory-table"
                            memories={renderData.memories}
                            prevMemories={renderData.prevMemories}
                        />
                    </div>
                </div>
                {renderData.dialogMode === CLM.DialogMode.Extractor &&
                    <div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">
                            <FormattedMessageId
                                data-testid="teach-session-admin-entitydetection"
                                id={FM.TEACHSESSIONADMIN_ENTITYDETECTION_TITLE}
                            />
                        </div>
                        <div>
                            {(renderData.dialogMode === CLM.DialogMode.Extractor || autoTeachWithRound) &&
                                <EntityExtractor
                                    data-testid="teach-session-admin-entityextractor"
                                    app={this.props.app}
                                    editingPackageId={this.props.editingPackageId}
                                    canEdit={true}
                                    extractType={CLM.DialogType.TEACH}
                                    editType={this.props.editType}
                                    teachId={this.props.teachSession.teach.teachId}
                                    originalTrainDialogId={this.props.originalTrainDialogId}
                                    dialogId={this.props.teachSession.teach.trainDialogId}
                                    roundIndex={renderData.roundIndex}
                                    autoTeach={this.props.teachSession.autoTeach}
                                    dialogMode={renderData.dialogMode}
                                    extractResponses={renderData.extractResponses || []}
                                    extractConflict={this.props.teachSession.extractConflict}
                                    originalTextVariations={renderData.textVariations}
                                    onSubmitExtractions={this.onEntityExtractorSubmit}
                                />}
                        </div>
                    </div>
                }
                {renderData.dialogMode === CLM.DialogMode.Scorer &&
                    <div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">
                            <FormattedMessageId
                                data-testid="teach-session-admin-action"
                                id={FM.TEACHSESSIONADMIN_ACTION_TITLE}
                            />
                            {/* Consider making this a component although it's display is very custom to the location it's used in the header */}
                            <span className="cl-training-status-inline">
                                {this.props.app.trainingStatus === CLM.TrainingStatusCode.Completed
                                    ? <span data-testid="teach-session-admin-train-status">
                                        <FormattedMessageId id={FM.TEACHSESSIONADMIN_TRAINSTATUS_COMPLETED} /> &nbsp;
                                        {this.state.isScoresRefreshVisible
                                            && <span data-testid="teach-session-admin-train-status-new-scores">
                                                <FormattedMessageId id={FM.TEACHSESSIONADMIN_TRAINSTATUS_NEWSCORES} /> (
                                                <button
                                                    type="button"
                                                    data-testid="teach-session-admin-refresh-score-button"
                                                    className={`cl-training-status-inline__button ${OF.FontClassNames.large}`}
                                                    onClick={this.onClickRefreshScores}
                                                >
                                                    <FormattedMessageId id={FM.TEACHSESSIONADMIN_TRAINSTATUS_REFRESH} />
                                                </button>
                                                )
                                            </span>}
                                    </span>
                                    : (this.props.app.trainingStatus === CLM.TrainingStatusCode.Failed
                                        ? <span data-testid="teach-session-admin-train-status">
                                            <FormattedMessageId id={FM.TEACHSESSIONADMIN_TRAINSTATUS_FAILED} />
                                        </span>
                                        : <span data-testid="teach-session-admin-train-status">
                                            <FormattedMessageId id={FM.TEACHSESSIONADMIN_TRAINSTATUS_RUNNING} />
                                        </span>
                                    )}
                            </span>
                        </div>

                        {renderData.scoreResponse && renderData.scoreInput && (renderData.dialogMode === CLM.DialogMode.Scorer || autoTeachWithRound)
                            && <ActionScorer
                                app={this.props.app}
                                editingPackageId={this.props.editingPackageId}
                                historyItemSelected={this.props.selectedActivityIndex !== null}
                                canEdit={true}
                                hideScore={false}
                                dialogType={CLM.DialogType.TEACH}
                                autoTeach={this.props.teachSession.autoTeach}
                                dialogMode={renderData.dialogMode}
                                scoreResponse={renderData.scoreResponse}
                                scoreInput={renderData.scoreInput}
                                memories={renderData.memories}
                                onActionSelected={this.onActionScorerSubmit}
                            />
                        }
                    </div>
                }
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchApplicationTrainingStatusThunkAsync: actions.app.fetchApplicationTrainingStatusThunkAsync,
        fetchTextVariationConflictThunkAsync: actions.train.fetchTextVariationConflictThunkAsync,
        getScoresThunkAsync: actions.teach.getScoresThunkAsync,
        runScorerThunkAsync: actions.teach.runScorerThunkAsync,
        setTextVariationConflict: actions.train.setTextVariationConflict,
        postScorerFeedbackThunkAsync: actions.teach.postScorerFeedbackThunkAsync,
        clearExtractResponses: actions.teach.clearExtractResponses
    }, dispatch)
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render TeachSessionAdmin but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        user: state.user.user,
        entities: state.entities
    }
}

export interface ReceivedProps {
    onScoredAction: (scoredAction: CLM.ScoredAction) => void;
    onEditExtraction: (extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) => any
    onEditAction: (trainScorerStep: CLM.TrainScorerStep) => any
    onReplaceActivityText: (userText: string, index: number) => void
    app: CLM.AppBase
    teachSession: TeachSessionState
    editingPackageId: string
    // When editing and existing log or train dialog
    sourceTrainDialog: CLM.TrainDialog | null
    // Train Dialog that this edit originally came from (not same as sourceTrainDialog)
    originalTrainDialogId: string | null,
    editType: EditDialogType,
    initialEntities: CLM.FilledEntityMap | null,
    // Index to attach to channel data
    nextActivityIndex: number
    // If user clicked on an Activity
    selectedActivityIndex: number | null
    historyRenderData: (() => DialogUtils.DialogRenderData) | null
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachSessionAdmin))