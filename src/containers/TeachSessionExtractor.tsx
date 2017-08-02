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
    sendFeedback() {
        // TEMP 
        let trainExtractorStep = dummyTrainExtractorStep();
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        this.props.postExtractorFeedback(this.props.user.key, appId, teachId, trainExtractorStep);
    }
    runScorer() {
        // TEMP
        let dummyER = dummyExtractResponse();
        let extractResponse = dummyER.extractResponse;
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        console.log('UI Extract Response Object', dummyER);
        console.log('Extract response property', extractResponse);
        // this.props.runScorer(this.props.user.key, appId, teachId, extractResponse);
    }
    render() {
        console.log('teach state', this.props.teachSession)
        return (
            <div className='content'>
                <div className="teachSessionHalfMode">
                    <div className="extractorResponse">
                        <ExtractorResponseEditor />
                    </div>
                    <div className="extractorTextVariations">
                        <ExtractorTextVariationCreator />
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