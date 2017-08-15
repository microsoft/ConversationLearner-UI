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

class TeachSessionExtractor extends React.Component<any, any> {
    constructor(p: any) {
        super(p)
        this.state = {
            inputText: "",//current.extractResponse.text,  TODO - clean up
            textVariations: [],
            predictedEntities: [],//current.extractResponse.predictedEntities,
            initialExtractResponse: [],//current.extractResponse,
            entityModalOpen: false
        }
        this.updateExtractValues = this.updateExtractValues.bind(this)
        this.updatePredictedEntities = this.updatePredictedEntities.bind(this)
    }
    updateExtractValues(props: any) {
        console.log('updating')
        let current = props.teachSession
        if (current.extractResponse && (current.extractResponse.text !== this.state.inputText)) {
            console.log('setting state')
            this.setState({
                inputText: current.extractResponse.text,
                textVariations: [],
                predictedEntities: current.extractResponse.predictedEntities,
                initialExtractResponse: current.extractResponse
            })
        }
    }
    updatePredictedEntities(predictedEntities: PredictedEntity[]){
        this.setState({
            predictedEntities: predictedEntities
        })
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
    componentWillMount() {
        this.updateExtractValues(this.props)
    }
    componentWillReceiveProps(props: any) {
        this.updateExtractValues(props)
    }
    sendFeedback() {
        // TEMP 
        let trainExtractorStep = new TrainExtractorStep({
            textVariations: [new TextVariation({text: this.state.inputText, labelEntities: []})]
        });

        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        this.props.postExtractorFeedback(this.props.user.key, appId, teachId, trainExtractorStep);
    }
    runScorer() {
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        let extractResponse = new ExtractResponse({
            predictedEntities: this.state.predictedEntities,
            text: this.state.inputText,
            metrics: this.state.initialExtractResponse.metrics,
            packageId: this.state.initialExtractResponse.packageId
        })
        this.props.runScorer(this.props.user.key, appId, teachId, extractResponse);
    }
    render() {
        return (
            <div className="content">
                <div>
                    <span className='ms-font-xl extractorTitle'>Entities</span>
                    <ExtractorResponseEditor input={this.state.inputText} predictedEntities={this.state.predictedEntities} updatePredictedEntities={this.updatePredictedEntities}/>
                </div>
                <div>
                    <span className='ms-font-xl extractorTitle'>Variations</span>
                    {
                        this.state.textVariations.map((t: any) => {
                            <ExtractorTextVariationCreator textVariation={t} />
                        })
                    }
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