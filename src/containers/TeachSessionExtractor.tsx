import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { ExtractResponse, TrainExtractorStep, PredictedEntity, LabeledEntity, TextVariation } from 'blis-models'
import { postExtractorFeedbackAsync, runScorerAsync } from '../actions/teachActions';
import { CommandButton } from 'office-ui-fabric-react';
import ExtractorTextVariationCreator from './ExtractorTextVariationCreator';
import ExtractorResponseEditor from './ExtractorResponseEditor';
import EntityCreatorEditor from './EntityCreatorEditor';
import { generateGUID } from '../Util'

class TeachSessionExtractor extends React.Component<any, any> {
    constructor(p: any) {
        super(p)
        this.state = {
            entityModalOpen: false
        }
    }
    handleCloseEntityModal() {
        this.setState({
            entityModalOpen: false
        })
    }
    handleOpenEntityModal() {
        this.setState({
            entityModalOpen: true
        })
    }
    sendFeedback() {
        let textVariations : TextVariation[] = [];
        for (let extractResponse of this.props.teachSession.extractResponses)
            {
                textVariations.push(new TextVariation({text : extractResponse.text, labelEntities: extractResponse.predictedEntity}));
            }
        let trainExtractorStep = new TrainExtractorStep({
            textVariations: textVariations
        });

        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        this.props.postExtractorFeedback(this.props.user.key, appId, teachId, trainExtractorStep);
    }
    runScorer() {
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        this.props.runScorer(this.props.user.key, appId, teachId, this.props.teachSession.extractResponses[0]);
    }
    render() {
        let extractDisplay = [];
        let key = 0;
        for (let extractResponse of this.props.teachSession.extractResponses)
            {
                extractDisplay.push(<ExtractorResponseEditor key={key++} extractResponse={extractResponse}/>);
            }
        return (
            <div className="content">
                <div>
                    <span className='ms-font-xl extractorTitle'>Entities</span>
                    {extractDisplay}
                    <ExtractorTextVariationCreator/>
                </div>

                <div>
                    <CommandButton
                        data-automation-id='randomID16'
                        disabled={false}
                        onClick={this.sendFeedback.bind(this)}
                        className='ms-font-su goldButton teachSessionHeaderButton'
                        ariaDescription='Send Extract Feedback'
                        text='Send Extract Feedback'
                    />
                    <CommandButton
                        data-automation-id='randomID16'
                        disabled={false}
                        onClick={this.runScorer.bind(this)}
                        className='ms-font-su goldButton teachSessionHeaderButton'
                        ariaDescription='Run Scorer'
                        text='Run Scorer'
                    />
                    <CommandButton
                        data-automation-id='randomID8'
                        className="goldButton teachSessionHeaderButton actionCreatorCreateEntityButton"
                        disabled={false}
                        onClick={this.handleOpenEntityModal.bind(this)}
                        ariaDescription='Cancel'
                        text='Entity'
                        iconProps={{ iconName: 'CirclePlus' }}
                    />
                    <EntityCreatorEditor open={this.state.entityModalOpen} entity={null} handleClose={this.handleCloseEntityModal.bind(this)} />
                </div>
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        postExtractorFeedback: postExtractorFeedbackAsync,
        runScorer: runScorerAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        teachSession: state.teachSessions,
        apps: state.apps,
        entities: state.entities
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionExtractor as React.ComponentClass<any>);