import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { TeachMode } from '../types/const';
import { runScorerAsync } from '../actions/teachActions';
import { BlisAppBase, TextVariation, ExtractResponse, TrainExtractorStep, UIScoreInput } from 'blis-models'
import TeachSessionScorer from './TeachSessionScorer';
import TeachSessionExtractor from './TeachSessionExtractor';
import TeachSessionMemory from './TeachSessionMemory';

class TeachSessionAdmin extends React.Component<Props, {}> {

    constructor(p: Props) {
        super(p)
        this.onTextVariationsExtracted = this.onTextVariationsExtracted.bind(this)
    }

    onTextVariationsExtracted(extractResponse: ExtractResponse, textVariations:TextVariation[]) : void {
        let trainExtractorStep = new TrainExtractorStep({
            textVariations: textVariations
        });

        let uiScoreInput = new UIScoreInput({ trainExtractorStep: trainExtractorStep, extractResponse: extractResponse });

        let appId = this.props.app.appId;
        let teachId = this.props.teachSession.current.teachId;
        this.props.runScorerAsync(this.props.user.key, appId, teachId, uiScoreInput);

    }
    renderTeachSessionExtractor() : JSX.Element {
        return (
            <TeachSessionExtractor 
                teachSessionId = {this.props.teachSession.current.teachId}
                autoTeach = {this.props.teachSession.autoTeach}
                teachMode = {this.props.teachSession.mode}
                extractResponses = {this.props.teachSession.extractResponses}
                extractButtonName = "Score Actions"
                onTextVariationsExtracted = {this.onTextVariationsExtracted}
            />
        )
    }
    render() {
        let userWindow = null;
        switch (this.props.teachSession.mode) {
            case TeachMode.Extractor:
                userWindow = (
                    <div>
                        <TeachSessionMemory />
                        {this.renderTeachSessionExtractor()}
                    </div>
                )
                break;
            case TeachMode.Scorer:
                userWindow = (
                    <div>
                        <TeachSessionMemory />
                        {this.renderTeachSessionExtractor()}
                        <TeachSessionScorer />
                    </div>
                )
                break;
            default:
                // If in auto mode show all windows as long as there's at least one round
                if (this.props.teachSession.autoTeach && this.props.teachSession.currentConversationStack.length > 0) {
                    userWindow = (
                        <div>
                            <TeachSessionMemory />
                            {this.renderTeachSessionExtractor()}
                            <TeachSessionScorer />
                        </div>
                    )
                }
                else {
                    userWindow = (
                        <div>
                            <TeachSessionMemory />
                        </div>
                    )
                }
                break;
        }
        return (
            <div>
                {userWindow}
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        runScorerAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        teachSession: state.teachSessions
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(TeachSessionAdmin);