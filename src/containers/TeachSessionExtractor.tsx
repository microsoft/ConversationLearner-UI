import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { ExtractResponse, TrainExtractorStep } from 'blis-models'
import { postExtractorFeedback, runScorer } from '../actions/teachActions';
import { CommandButton } from 'office-ui-fabric-react';
import { dummyExtractResponse, dummyTrainExtractorStep } from '../epics/apiHelpers'; // TEMP
import ExtractorTextVariationCreator from './ExtractorTextVariationCreator';
import ExtractorResponseEditor from './ExtractorResponseEditor';

class TeachSessionExtractor extends React.Component<any, any> {
    constructor(p: any) {
        super(p)
        this.state = {
            textVariations: [],
            predictedEntities: [],
            inputText: ""
        }
        this.setInitialValues = this.setInitialValues.bind(this)
    }
    setInitialValues(props: any){
        let current = props.teachSession
        if (current.extractResponse && (current.extractResponse.text !== this.state.inputText)) {
            console.log('setting state')
            this.setState({
                inputText: current.extractResponse.text,
                textVariations: [],
                predictedEntities: current.extractResponse.predictedEntities
            })
        }
    }
    componentDidMount(){
        this.setInitialValues(this.props)
    }
    componentWillReceiveProps(props: any) {
        this.setInitialValues(props)
    }
    sendFeedback() {
        // TEMP 
        let trainExtractorStep = dummyTrainExtractorStep();
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        // this.props.postExtractorFeedback(this.props.user.key, appId, teachId, trainExtractorStep);
    }
    runScorer() {
        // TEMP
        let dummyER = dummyExtractResponse();
        let extractResponse = dummyER.extractResponse;
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        // this.props.runScorer(this.props.user.key, appId, teachId, extractResponse);
    }
    render() {
        return (
            <div className='content'>
                <div className="teachSessionHalfMode">
                    <div className="extractorResponse">
                        <ExtractorResponseEditor input={this.state.inputText} predictedEntities={this.state.predictedEntities} />
                    </div>
                    <div className="extractorTextVariations">
                        {
                            this.state.textVariations.map((t: any) => {
                                <ExtractorTextVariationCreator textVariation={t}/>
                            })
                        }
                    </div>
                    <div className="extractorOperations">
                        <CommandButton
                            data-automation-id='randomID16'
                            disabled={false}
                            onClick={this.sendFeedback.bind(this)}
                            className='ms-font-su grayButton abandonTeach'
                            ariaDescription='Send Extract Feedback'
                            text='Send Extract Feedback'
                        />
                        <CommandButton
                            data-automation-id='randomID16'
                            disabled={false}
                            onClick={this.runScorer.bind(this)}
                            className='ms-font-su goldButton abandonTeach'
                            ariaDescription='Run Scorer'
                            text='Run Scorer'
                        />
                    </div>
                </div>
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        postExtractorFeedback: postExtractorFeedback,
        runScorer: runScorer
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
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionExtractor as React.ComponentClass<any>);