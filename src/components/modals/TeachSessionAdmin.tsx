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
import { Icon, FontClassNames } from 'office-ui-fabric-react'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import './TeachSessionAdmin.css'

interface RenderData {
    dialogMode: CLM.DialogMode
    scoreInput?: CLM.ScoreInput 
    scoreResponse?: CLM.ScoreResponse 
    memories: CLM.Memory[]
    prevMemories: CLM.Memory[]
    extractResponses: CLM.ExtractResponse[]
}

interface RoundLookup {
    extractResponse?: CLM.ExtractResponse | null
    uiScoreResponse?: CLM.UIScoreResponse | null
}
interface ComponentState {
    isScoresRefreshVisible: boolean
    turnLookup: RoundLookup[]
}

class TeachSessionAdmin extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        isScoresRefreshVisible: false,
        turnLookup: []
    }

    constructor(p: Props) {
        super(p);
        this.onEntityExtractorSubmit = this.onEntityExtractorSubmit.bind(this);
        this.onActionScorerSubmit = this.onActionScorerSubmit.bind(this);
    }

    async onEntityExtractorSubmit(extractResponse: CLM.ExtractResponse, textVariations: CLM.TextVariation[]): Promise<void> {
        if (!this.props.teachSession.current) {
            throw new Error(`teachSession.current must be defined but it is not. This is likely a problem with higher components. Please open an issue.`)
        }

        const uiScoreInput: CLM.UIScoreInput = {
            trainExtractorStep: {
                textVariations
            },
            extractResponse
        }

        const appId = this.props.app.appId
        const teachId = this.props.teachSession.current.teachId
        const uiScoreResponse = await ((this.props.runScorerThunkAsync(this.props.user.id, appId, teachId, uiScoreInput) as any) as Promise<CLM.UIScoreResponse>)
        let turnLookup = [...this.state.turnLookup]
        turnLookup.push({extractResponse})
        turnLookup.push({uiScoreResponse})
        this.setState({
            isScoresRefreshVisible: true,
            turnLookup
        })
    }

    async onActionScorerSubmit(trainScorerStep: CLM.TrainScorerStep): Promise<void> {
        const scoredAction = trainScorerStep.scoredAction
        if (!scoredAction) {
            throw new Error(`The provided train scorer step must have scoredAction field, but it was not provided. This should not be possible. Contact Support`)
        }

        if (!this.props.teachSession.current) {
            throw new Error(`teachSession.current must be defined but it is not. This is likely a problem with higher components. Please open an issue.`)
        }

        // Send channel data to add to activity so can process when clicked on later
        const channelData = { 
            activityIndex: this.props.activityIndex,
            validWaitAction: !scoredAction.isTerminal || undefined  // Draws carrot under card if a wait action
        }

        const uiTrainScorerStep: CLM.UITrainScorerStep = {
            trainScorerStep,
            channelData,
            entities: this.props.entities
        } 

        const appId = this.props.app.appId;
        const teachId = this.props.teachSession.current.teachId;
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
            turnLookup.push({uiScoreResponse})// lars
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
        
        if (!this.props.teachSession.current) {
            throw new Error(`teachSession.current must be defined but it is not. This is likely a problem with higher components. Please open an issue.`)
        }

        this.props.getScoresThunkAsync(
            this.props.user.id,
            this.props.app.appId,
            this.props.teachSession.current.teachId,
            this.props.teachSession.scoreInput)

        this.setState({
            isScoresRefreshVisible: false
        })
    }

    getRenderData(): RenderData {
        if (this.props.selectedActivityIndex) {
            let turnData = this.state.turnLookup[this.props.selectedActivityIndex]
 
            const prevTurn = this.state.turnLookup[this.props.selectedActivityIndex-1]
            const prevMemories = (prevTurn && prevTurn.uiScoreResponse) ? prevTurn.uiScoreResponse.memories : []
            if (turnData.uiScoreResponse) {
                return {
                        dialogMode: CLM.DialogMode.Scorer,
                        scoreInput: turnData.uiScoreResponse.scoreInput,
                        scoreResponse: turnData.uiScoreResponse.scoreResponse,
                        memories: turnData.uiScoreResponse.memories,
                        prevMemories,
                        extractResponses: []
                    }
                }
            else if (turnData.extractResponse) {
                const prevTurn = this.state.turnLookup[this.props.selectedActivityIndex-1]
                const memories = (prevTurn && prevTurn.uiScoreResponse) ? prevTurn.uiScoreResponse.memories : []
                return {
                    dialogMode: CLM.DialogMode.Extractor,
                    // LARS check - can be array
                    extractResponses: [turnData.extractResponse],  
                    memories,
                    prevMemories
                }
            }
            else {
                throw new Error("Bad TurnData")
            }
        }
        else {
            return {
                dialogMode: this.props.teachSession.mode,
                scoreInput: this.props.teachSession.scoreInput!,
                scoreResponse: this.props.teachSession.scoreResponse!,
                memories: this.props.teachSession.memories,
                prevMemories: this.props.teachSession.prevMemories,
                extractResponses: this.props.teachSession.extractResponses
            }
        }
    }

    render() {
        // Don't render if not in a teach session
        if (!this.props.teachSession.current) {
            return null;
        }

        const renderData = this.getRenderData()
        const autoTeachWithRound = this.props.teachSession.autoTeach
        const isLogDialog = (this.props.editType === EditDialogType.LOG_EDITED || this.props.editType === EditDialogType.LOG_ORIGINAL) 
        const editTypeClass = isLogDialog ? 'log' : 'train'
        
        return (
            <div className={`cl-dialog-admin ${FontClassNames.large}`}>
                <div className={`cl-dialog-title cl-dialog-title--${editTypeClass} ${FontClassNames.xxLarge}`}>
                    <Icon 
                        iconName={isLogDialog ? 'UserFollowed' : 'EditContact'}
                    />
                    {isLogDialog ? 'Log Dialog' : 'Train Dialog'}
                </div>
                {renderData.dialogMode === CLM.DialogMode.Extractor && (
                    <div className="cl-dialog-admin__content">
                        <div className="cl-wc-message cl-wc-message--user">
                            <FormattedMessage
                                data-testid="teachsessionadmin-userinput"
                                id={FM.TEACHSESSIONADMIN_DIALOGMODE_USER}
                                defaultMessage="User Input"
                            />
                        </div>
                    </div>)
                }
                {renderData.dialogMode === CLM.DialogMode.Scorer && (
                    <div className="cl-dialog-admin__content">
                        <div className="cl-wc-message cl-wc-message--bot">
                            <FormattedMessage
                                data-testid="teachsessionadmin-botresponse"
                                id={FM.TEACHSESSIONADMIN_DIALOGMODE_BOT}
                                defaultMessage="Bot Response"
                            />
                        </div>
                    </div>)
                }
                {renderData.dialogMode === CLM.DialogMode.EndSession && (
                    <div className="cl-dialog-admin__content">
                        <div className="cl-wc-message cl-wc-message--done">
                            <FormattedMessage
                                id={FM.TEACHSESSIONADMIN_DIALOGMODE_END_SESSION}
                                defaultMessage="Session Has Ended"
                            />
                        </div>
                    </div>)
                }
                <div className="cl-dialog-admin__content">
                    <div className="cl-dialog-admin-title">
                        <FormattedMessage
                            data-testid="teachsessionadmin-entitymemory"
                            id={FM.TEACHSESSIONADMIN_MEMORY_TITLE}
                            defaultMessage="Entity Memory"
                        />
                    </div>
                    <div>
                        <MemoryTable
                            data-testid="teachsessionadmin-memorytable"
                            memories={renderData.memories}
                            prevMemories={renderData.prevMemories}
                        />
                    </div>
                </div>
                {renderData.dialogMode === CLM.DialogMode.Extractor &&
                    <div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">
                            <FormattedMessage
                                data-testid="teachsessionadmin-entitydetection"
                                id={FM.TEACHSESSIONADMIN_ENTITYDETECTION_TITLE}
                                defaultMessage="Entity Detection"
                            />
                        </div>
                        <div>
                            {(renderData.dialogMode === CLM.DialogMode.Extractor || autoTeachWithRound) &&
                                <EntityExtractor
                                    data-testid="teachsessionadmin-entityextractor"
                                    app={this.props.app}
                                    editingPackageId={this.props.editingPackageId}
                                    canEdit={true}
                                    extractType={CLM.DialogType.TEACH}
                                    sessionId={this.props.teachSession.current.teachId}
                                    roundIndex={null}
                                    autoTeach={this.props.teachSession.autoTeach}
                                    dialogMode={renderData.dialogMode}
                                    extractResponses={renderData.extractResponses}
                                    originalTextVariations={[]}
                                    onTextVariationsExtracted={this.onEntityExtractorSubmit}
                                />}
                        </div>
                    </div>
                }
                {renderData.dialogMode === CLM.DialogMode.Scorer &&
                    <div className="cl-dialog-admin__content">
                        <div className="cl-dialog-admin-title">
                            <FormattedMessage
                                data-testid="teachsessionadmin-action"
                                id={FM.TEACHSESSIONADMIN_ACTION_TITLE}
                                defaultMessage="Action"
                            />
                            {/* Consider making this a component although it's display is very custom to the location it's used in the header */}
                            <span className="cl-training-status-inline">
                                {this.props.app.trainingStatus === CLM.TrainingStatusCode.Completed
                                    ? <span>
                                        <FormattedMessage
                                            data-testid="teachsessionadmin-trainstatus-completed"
                                            id={FM.TEACHSESSIONADMIN_TRAINSTATUS_COMPLETED}
                                            defaultMessage="Train Status: Completed"
                                        /> &nbsp;
                                        {this.state.isScoresRefreshVisible
                                            && <span>
                                                <FormattedMessage
                                                    data-testid="teachsessionadmin-trainstatus-newscores"
                                                    id={FM.TEACHSESSIONADMIN_TRAINSTATUS_NEWSCORES}
                                                    defaultMessage="New Scores Available"
                                                /> (
                                                <button
                                                    type="button"
                                                    className={`cl-training-status-inline__button ${FontClassNames.large}`}
                                                    onClick={this.onClickRefreshScores}
                                                >
                                                    <FormattedMessage
                                                        id={FM.TEACHSESSIONADMIN_TRAINSTATUS_REFRESH}
                                                        defaultMessage="Refresh"
                                                    />
                                                </button>
                                                )
                                            </span>}
                                    </span>
                                    : (this.props.app.trainingStatus === CLM.TrainingStatusCode.Failed
                                        ? <FormattedMessage
                                            data-testid="trainingstatus-failed"
                                            id={FM.TEACHSESSIONADMIN_TRAINSTATUS_FAILED}
                                            defaultMessage="Train Status: Failed"
                                        />
                                        : <FormattedMessage
                                            data-testid="trainingstatus-running"
                                            id={FM.TEACHSESSIONADMIN_TRAINSTATUS_RUNNING}
                                            defaultMessage="Train Status: Runnning..."
                                        />
                                    )}
                            </span>
                        </div>

                        {renderData.scoreResponse && renderData.scoreInput && (renderData.dialogMode === CLM.DialogMode.Scorer || autoTeachWithRound)
                            && <ActionScorer
                                app={this.props.app}
                                editingPackageId={this.props.editingPackageId}
                                canEdit={true}
                                hideScore={false}
                                dialogType={CLM.DialogType.TEACH}
                                sessionId={this.props.teachSession.current.teachId}
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
        getScoresThunkAsync: actions.teach.getScoresThunkAsync,
        runScorerThunkAsync: actions.teach.runScorerThunkAsync,
        postScorerFeedbackThunkAsync: actions.teach.postScorerFeedbackThunkAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render TeachSessionAdmin but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        user: state.user.user,
        teachSession: state.teachSessions,
        entities: state.entities,
    }
}

export interface ReceivedProps {
    onScoredAction: (scoredAction: CLM.ScoredAction) => void;
    app: CLM.AppBase
    editingPackageId: string
    editType: EditDialogType,
    // Index to attach to channel data
    activityIndex: number
    // If user clicked on an Activity
    selectedActivityIndex: number | null
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachSessionAdmin))