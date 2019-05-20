/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as DialogUtils from '../../Utils/dialogUtils'
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import actions from '../../actions'
import DialogMetadata from './DialogMetadata'
import ActionScorer from './ActionScorer'
import EntityExtractor from './EntityExtractor'
import MemoryTable from './MemoryTable'
import TrainingStatusContainer from '../TrainingStatusContainer'
import FormattedMessageId from '../FormattedMessageId'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { EditDialogType } from '../../components/modals'
import { FM } from '../../react-intl-messages'
import { TeachSessionState } from '../../types/StateTypes'
import { injectIntl, InjectedIntlProps } from 'react-intl'

interface RoundLookup {
    textVariations?: CLM.TextVariation[] | null
    uiScoreResponse?: CLM.UIScoreResponse | null
    selectedActionId?: string
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
        const changedTextVariations: CLM.TextVariation[] = []
        textVariations.map(tv => {
            const found = originalTextVariations.find(otv => CLM.ModelUtils.areEqualTextVariations(tv, otv))
            if (!found) {
                changedTextVariations.push(tv)
            }
        })

        // Check the changed ones for conflicts

        // First check for internal conflicts
        if (this.props.sourceTrainDialog) {
            for (const changedTextVariation of changedTextVariations) {
                const extractConflict = DialogUtils.internalConflict(changedTextVariation, this.props.sourceTrainDialog, renderData.roundIndex)
                if (extractConflict) {
                    this.props.setTextVariationConflict(extractConflict)
                    return true
                }
            }
        }

        // Don't look for conflict on the dialog that I'm editing (as checked above)
        const ignoreDialogId = this.props.originalTrainDialogId
            ? this.props.originalTrainDialogId
            : this.props.sourceTrainDialog
            ? this.props.sourceTrainDialog.trainDialogId
            : null

        // Next against other TrainDialogs
        for (const changedTextVariation of changedTextVariations) {
            const conflict = await this.props.fetchTextVariationConflictThunkAsync(
                this.props.app.appId,
                this.props.teachSession.teach!.trainDialogId,
                changedTextVariation,
                ignoreDialogId)
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
            const turnLookup = [...this.state.turnLookup]
            // If first turn, set offset based on existing activities
            const turnLookupOffset = this.state.turnLookup.length === 0 ? this.props.nextActivityIndex - 1 : this.state.turnLookupOffset

            turnLookup.push({ textVariations, memories: [...this.props.teachSession.memories] })
            turnLookup.push({ uiScoreResponse, memories: [...this.props.teachSession.memories] })
            this.setState({
                isScoresRefreshVisible: true,
                turnLookup,
                turnLookupOffset
            })

            // Replace webchat text with markdown version where labelled entities are bold
            const excludedEntities = this.props.entities.filter(e => e.doNotMemorize).map(e => e.entityId)
            const userText = CLM.ModelUtils.textVariationToMarkdown(textVariations[0], excludedEntities)
            this.props.onReplaceActivityText(userText, this.props.nextActivityIndex - 1)

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

        // Store selected action in "turn lookup"
        if (this.state.turnLookup.length > 0) {
            const turnLookup = [...this.state.turnLookup]
            turnLookup[this.state.turnLookup.length - 1].selectedActionId = scoredAction.actionId
            this.setState({
                turnLookup
            })
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

        await (this.props.postScorerFeedbackThunkAsync(this.props.user.id, appId, teachId, uiTrainScorerStep, waitForUser, uiScoreInput) as any as Promise<void>)

        this.props.onScoredAction(scoredAction)

        if (CLM.ActionBase.isStubbedAPI(scoredAction)) {
            this.props.onEditAPIStub()
        }
        else if (!waitForUser) {
            const uiScoreResponse = await ((this.props.runScorerThunkAsync(this.props.user.id, appId, teachId, uiScoreInput) as any) as Promise<CLM.UIScoreResponse>)
            const turnLookup = [...this.state.turnLookup]

            // Update memory on previous turn as may have been an API call
            const lastLookup = turnLookup[turnLookup.length - 1]
            lastLookup.memories = [...this.props.teachSession.memories]

            turnLookup.push({ uiScoreResponse, memories: [...this.props.teachSession.memories] })

            // Update memory on previous turn as may have been an API call
            this.setState({
                isScoresRefreshVisible: true,
                turnLookup
            })
        }
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

        // If user clicked on an activity
        if (this.props.selectedActivityIndex != null) {

            // Offset lookup index based on pre-existing activities
            const lookupIndex = this.props.selectedActivityIndex - this.state.turnLookupOffset

            if (lookupIndex >= 0) {

                const turnData = this.state.turnLookup[lookupIndex]
                const memories = (turnData && turnData.uiScoreResponse && turnData.uiScoreResponse.memories) 
                    ? turnData.uiScoreResponse.memories 
                    : []
            
                // If prev action was user, use prevTurn.memory.  If following a wait action use uiScoreResponse.memories
                const prevTurn = this.state.turnLookup[lookupIndex - 1] 
                const prevMemories = (prevTurn && prevTurn.uiScoreResponse && prevTurn.uiScoreResponse.memories) 
                    ? prevTurn.uiScoreResponse.memories 
                    : (prevTurn && prevTurn.memories) 
                    ? prevTurn.memories 
                    : []

                if (turnData.uiScoreResponse) {
                    return {
                        dialogMode: CLM.DialogMode.Scorer,
                        scoreInput: turnData.uiScoreResponse.scoreInput,
                        scoreResponse: turnData.uiScoreResponse.scoreResponse,
                        selectedActionId: turnData.selectedActionId,
                        memories: turnData.memories ? DialogUtils.filterDummyEntities(memories) : [],
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
        const editTypeClass = this.props.editType === EditDialogType.IMPORT ? "import" : isLogDialog ? 'log' : 'train'
        const isEndSessionAvailable = !this.props.selectedActivityIndex || this.props.isLastActivitySelected

        return (
            <div className={`cl-dialog-admin`}>
                <div className="cl-dialog-admin__header">
                    <div className={`cl-dialog-title cl-dialog-title--${editTypeClass} ${OF.FontClassNames.xxLarge}`}>
                        <OF.Icon
                            iconName={this.props.editType === EditDialogType.IMPORT
                                ? 'DownloadDocument'
                                :  isLogDialog 
                                ? 'UserFollowed' 
                                : 'EditContact'}
                        />
                        {this.props.editType === EditDialogType.IMPORT
                            ? "Import"
                            : isLogDialog 
                            ? 'Log Dialog' 
                            : 'Train Dialog'}
                        {this.props.editType === EditDialogType.IMPORT &&
                            <div className="cl-dialog-importcount">
                                {`${this.props.importIndex} of ${this.props.importCount}`}
                            </div>
                        }
                    </div>
                    <DialogMetadata
                        description={this.props.description}
                        tags={this.props.tags}
                        allUniqueTags={this.props.allUniqueTags}
                        onChangeDescription={this.props.onChangeDescription}
                        onAddTag={this.props.onAddTag}
                        onRemoveTag={this.props.onRemoveTag}
                    />
                    <TrainingStatusContainer
                        app={this.props.app}
                    />
                </div>
                {(renderData.dialogMode === CLM.DialogMode.Extractor || renderData.dialogMode === CLM.DialogMode.Wait) &&
                    (
                        <div className="cl-dialog-admin__content">
                            <div
                                className={`cl-wc-message cl-wc-message--user cl-wc-message--${editTypeClass}`}
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
                        </div>

                        {renderData.scoreResponse && renderData.scoreInput && (renderData.dialogMode === CLM.DialogMode.Scorer || autoTeachWithRound)
                            && <ActionScorer
                                app={this.props.app}
                                editingPackageId={this.props.editingPackageId}
                                historyItemSelected={this.props.selectedActivityIndex !== null}
                                canEdit={true}
                                isEndSessionAvailable={isEndSessionAvailable}
                                dialogType={CLM.DialogType.TEACH}
                                autoTeach={this.props.teachSession.autoTeach}
                                dialogMode={renderData.dialogMode}
                                scoreResponse={renderData.scoreResponse}
                                scoreInput={renderData.scoreInput}
                                selectedActionId={renderData.selectedActionId}
                                memories={renderData.memories}
                                onActionSelected={this.onActionScorerSubmit}
                                onActionCreatorClosed={() => {}}
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
    isLastActivitySelected: boolean,
    historyRenderData: (() => DialogUtils.DialogRenderData) | null
    onScoredAction: (scoredAction: CLM.ScoredAction) => void;
    onEditExtraction: (extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]) => any
    onEditAction: (trainScorerStep: CLM.TrainScorerStep) => any
    onReplaceActivityText: (userText: string, index: number) => void
    onEditAPIStub: () => void
    importIndex?: number
    importCount?: number
    allUniqueTags: string[]
    tags: string[]
    onAddTag: (tag: string) => void
    onRemoveTag: (tag: string) => void

    description: string
    onChangeDescription: (description: string) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachSessionAdmin))