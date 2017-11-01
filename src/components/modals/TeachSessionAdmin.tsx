import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { DialogMode } from '../../types/const';
import { runScorerAsync, postScorerFeedbackAsync } from '../../actions/teachActions';
import {
    BlisAppBase, TextVariation, ExtractResponse,
    DialogType, TrainExtractorStep, TrainScorerStep,
    UITrainScorerStep, UIScoreInput
} from 'blis-models'
import ActionScorer from './ActionScorer';
import EntityExtractor from './EntityExtractor';
import MemoryTable from './MemoryTable';
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'

class TeachSessionAdmin extends React.Component<Props, {}> {
    constructor(p: Props) {
        super(p);
        this.onEntityExtractorSubmit = this.onEntityExtractorSubmit.bind(this);
        this.onActionScorerSubmit = this.onActionScorerSubmit.bind(this);
    }

    onEntityExtractorSubmit(extractResponse: ExtractResponse, textVariations: TextVariation[], roundIndex: number): void {
        let trainExtractorStep = new TrainExtractorStep({
            textVariations: textVariations
        });

        let uiScoreInput = new UIScoreInput({ trainExtractorStep: trainExtractorStep, extractResponse: extractResponse });

        let appId = this.props.app.appId;
        let teachId = this.props.teachSession.current.teachId;
        this.props.runScorerAsync(this.props.user.key, appId, teachId, uiScoreInput);
    }
    onActionScorerSubmit(trainScorerStep: TrainScorerStep): void {
        let uiTrainScorerStep = new UITrainScorerStep(
            {
                trainScorerStep,
                entities: this.props.entities
            });

        let appId: string = this.props.app.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        let waitForUser = trainScorerStep.scoredAction.isTerminal;

        // Pass score input (minus extractor step) for subsequent actions when this one is non-terminal
        let uiScoreInput: UIScoreInput = { ...this.props.teachSession.uiScoreInput, trainExtractorStep: null };

        this.props.postScorerFeedbackAsync(this.props.user.key, appId, teachId, uiTrainScorerStep, waitForUser, uiScoreInput);
    }

    render() {
        // Don't render if not in a teach session
        if (!this.props.teachSession.current) {
            return null;
        }

        const mode = this.props.teachSession.mode
        const autoTeachWithRound = this.props.teachSession.autoTeach && this.props.teachSession.currentConversationStack.length > 0

        return (
            <div className="blis-dialog-admin ms-font-l">
                {this.props.teachSession.mode == DialogMode.Extractor ? (
                    <div className="blis-dialog-admin__content">
                        <div className="blis-wc-message blis-wc-message--user">
                            <FormattedMessage
                                id={FM.TEACHSESSIONADMIN_DIALOGMODE_USER}
                                defaultMessage="User Input"
                            />
                        </div>
                    </div>
                ) : (this.props.teachSession.mode == DialogMode.Scorer ? (
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
                            defaultMessage="Memory"
                        />
                    </div>
                    <div>
                        <MemoryTable
                            dialogMode={this.props.teachSession.mode}
                            memories={this.props.teachSession.memories}
                            prevMemories={this.props.teachSession.prevMemories}
                        />
                    </div>
                </div>
                {this.props.teachSession.mode == DialogMode.Extractor &&
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
                {this.props.teachSession.mode == DialogMode.Scorer &&
                    <div className="blis-dialog-admin__content">
                        <div className="blis-dialog-admin-title">
                            <FormattedMessage
                                id={FM.TEACHSESSIONADMIN_ACTION_TITLE}
                                defaultMessage="Action"
                            />
                        </div>
                        <div>
                            {(mode === DialogMode.Scorer || autoTeachWithRound) &&
                                <ActionScorer
                                    app={this.props.app}
                                    dialogType={DialogType.TEACH}
                                    sessionId={this.props.teachSession.current.teachId}
                                    autoTeach={this.props.teachSession.autoTeach}
                                    dialogMode={this.props.teachSession.mode}
                                    scoreResponse={this.props.teachSession.scoreResponse}
                                    scoreInput={this.props.teachSession.scoreInput}
                                    memories={this.props.teachSession.memories}
                                    onActionSelected={this.onActionScorerSubmit}
                                />}
                        </div>
                    </div>
                }
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
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
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachSessionAdmin))