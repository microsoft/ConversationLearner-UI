import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { fetchApplicationTrainingStatusThunkAsync } from '../../actions/fetchActions'
import { getScoresAsync, runScorerAsync, postScorerFeedbackAsync } from '../../actions/teachActions'
import {
    BlisAppBase, TextVariation, ExtractResponse,
    DialogType, TrainScorerStep, TrainingStatusCode,
    UITrainScorerStep, UIScoreInput, DialogMode
} from 'blis-models'
import ActionScorer from './ActionScorer';
import EntityExtractor from './EntityExtractor';
import MemoryTable from './MemoryTable';
import { FM } from '../../react-intl-messages'
import { FontClassNames } from 'office-ui-fabric-react'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import './TeachSessionAdmin.css'

interface ComponentState {
    isScoresRefreshVisible: boolean
}

class TeachSessionAdmin extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        isScoresRefreshVisible: false
    }

    constructor(p: Props) {
        super(p);
        this.onEntityExtractorSubmit = this.onEntityExtractorSubmit.bind(this);
        this.onActionScorerSubmit = this.onActionScorerSubmit.bind(this);
    }

    async onEntityExtractorSubmit(extractResponse: ExtractResponse, textVariations: TextVariation[], roundIndex: number): Promise<void> {
        const uiScoreInput: UIScoreInput = {
            trainExtractorStep: {
                textVariations
            },
            extractResponse
        }

        const appId = this.props.app.appId
        const teachId = this.props.teachSession.current.teachId
        this.props.runScorerAsync(this.props.user.id, appId, teachId, uiScoreInput)
        await this.props.fetchApplicationTrainingStatusThunkAsync(appId)
        this.setState({
            isScoresRefreshVisible: true
        })
    }

    onActionScorerSubmit(trainScorerStep: TrainScorerStep): void {
        let uiTrainScorerStep: UITrainScorerStep = {
            trainScorerStep,
            entities: this.props.entities
        };

        let appId: string = this.props.app.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        let waitForUser = trainScorerStep.scoredAction.isTerminal;

        // Pass score input (minus extractor step) for subsequent actions when this one is non-terminal
        let uiScoreInput: UIScoreInput = { ...this.props.teachSession.uiScoreInput, trainExtractorStep: null }

        this.props.postScorerFeedbackAsync(this.props.user.id, appId, teachId, uiTrainScorerStep, waitForUser, uiScoreInput);

        this.props.onScoredAction();
    }

    onClickRefreshScores = (event: React.MouseEvent<HTMLButtonElement>) => {
        // TODO: This is coupling knowledge about reducers populating this field after runScorer fullfilled
        if (this.props.teachSession.scoreInput === null) {
            throw new Error(`You attempted to refresh scores but there was no previous score input to re-use.  This is likely a problem with the code. Please open an issue.`)
        }

        this.props.getScoresAsync(
            this.props.user.id,
            this.props.app.appId,
            this.props.teachSession.current.teachId,
            this.props.teachSession.scoreInput)

        this.setState({
            isScoresRefreshVisible: false
        })
    }

    render() {
        // Don't render if not in a teach session
        if (!this.props.teachSession.current) {
            return null;
        }

        const mode = this.props.teachSession.mode
        const autoTeachWithRound = this.props.teachSession.autoTeach 

        return (
            <div className={`blis-dialog-admin ${FontClassNames.large}`}>
                {this.props.teachSession.mode === DialogMode.Extractor ? (
                    <div className="blis-dialog-admin__content">
                        <div className="blis-wc-message blis-wc-message--user">
                            <FormattedMessage
                                id={FM.TEACHSESSIONADMIN_DIALOGMODE_USER}
                                defaultMessage="User Input"
                            />
                        </div>
                    </div>
                ) : (this.props.teachSession.mode === DialogMode.Scorer ? (
                    <div className="blis-dialog-admin__content">
                        <div className="blis-wc-message blis-wc-message--bot">
                            <FormattedMessage
                                id={FM.TEACHSESSIONADMIN_DIALOGMODE_BOT}
                                defaultMessage="Bot Response"
                            />
                        </div>
                    </div>) : null
                    )
                }
                <div className="blis-dialog-admin__content">
                    <div className="blis-dialog-admin-title">
                        <FormattedMessage
                            id={FM.TEACHSESSIONADMIN_MEMORY_TITLE}
                            defaultMessage="Entity Memory"
                        />
                    </div>
                    <div>
                        <MemoryTable
                            memories={this.props.teachSession.memories}
                            prevMemories={this.props.teachSession.prevMemories}
                        />
                    </div>
                </div>
                {this.props.teachSession.mode === DialogMode.Extractor &&
                    <div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">
                            <FormattedMessage
                                id={FM.TEACHSESSIONADMIN_ENTITYDETECTION_TITLE}
                                defaultMessage="Entity Detection"
                            />
                        </div>
                        <div>
                            {(mode === DialogMode.Extractor || autoTeachWithRound) &&
                                <EntityExtractor
                                    app={this.props.app}
                                    extractType={DialogType.TEACH}
                                    sessionId={this.props.teachSession.current.teachId}
                                    roundIndex={null}
                                    autoTeach={this.props.teachSession.autoTeach}
                                    dialogMode={this.props.teachSession.mode}
                                    extractResponses={this.props.teachSession.extractResponses}
                                    originalTextVariations={[]}
                                    onTextVariationsExtracted={this.onEntityExtractorSubmit}
                                />}
                        </div>
                    </div>
                }
                {this.props.teachSession.mode === DialogMode.Scorer &&
                    <div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">
                            <FormattedMessage
                                id={FM.TEACHSESSIONADMIN_ACTION_TITLE}
                                defaultMessage="Action"
                            />
                            {/* Consider making this a component although it's display is very custom to the location it's used in the header */}
                            <span className="blis-training-status-inline">
                                {this.props.app.trainingStatus === TrainingStatusCode.Completed
                                    ? <span>
                                        <FormattedMessage
                                            id={FM.TEACHSESSIONADMIN_TRAINSTATUS_COMPLETED}
                                            defaultMessage="Train Status: Completed"
                                        /> &nbsp;
                                        {this.state.isScoresRefreshVisible
                                            && <span>
                                                <FormattedMessage
                                                    id={FM.TEACHSESSIONADMIN_TRAINSTATUS_NEWSCORES}
                                                    defaultMessage="New Scores Available"
                                                /> (
                                                <button
                                                    type="button"
                                                    className={`blis-training-status-inline__button ${FontClassNames.large}`}
                                                    onClick={this.onClickRefreshScores}>
                                                    <FormattedMessage
                                                        id={FM.TEACHSESSIONADMIN_TRAINSTATUS_REFRESH}
                                                        defaultMessage="Refresh"
                                                    />
                                                </button>
                                                )
                                            </span>}
                                    </span>
                                    : (this.props.app.trainingStatus === TrainingStatusCode.Failed
                                        ? <FormattedMessage
                                            id={FM.TEACHSESSIONADMIN_TRAINSTATUS_FAILED}
                                            defaultMessage="Train Status: Failed"
                                        />
                                        : <FormattedMessage
                                            id={FM.TEACHSESSIONADMIN_TRAINSTATUS_RUNNING}
                                            defaultMessage="Train Status: Runnning..."
                                        />
                                    )}
                            </span>
                        </div>

                        {(mode === DialogMode.Scorer || autoTeachWithRound)
                            && <ActionScorer
                                app={this.props.app}
                                dialogType={DialogType.TEACH}
                                sessionId={this.props.teachSession.current.teachId}
                                autoTeach={this.props.teachSession.autoTeach}
                                dialogMode={this.props.teachSession.mode}
                                scoreResponse={this.props.teachSession.scoreResponse}
                                scoreInput={this.props.teachSession.scoreInput}
                                memories={this.props.teachSession.memories}
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
        fetchApplicationTrainingStatusThunkAsync: fetchApplicationTrainingStatusThunkAsync,
        getScoresAsync,
        runScorerAsync,
        postScorerFeedbackAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        teachSession: state.teachSessions,
        entities: state.entities,
    }
}

export interface ReceivedProps {
    onScoredAction: () => void;
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachSessionAdmin))