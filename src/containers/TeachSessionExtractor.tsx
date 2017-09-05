import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { UIScoreInput, ExtractResponse, TrainExtractorStep, PredictedEntity, LabeledEntity, TextVariation } from 'blis-models'
import { runScorerAsync } from '../actions/teachActions';
import { CommandButton } from 'office-ui-fabric-react';
import ExtractorTextVariationCreator from './ExtractorTextVariationCreator';
import ExtractorResponseEditor from './ExtractorResponseEditor';
import EntityCreatorEditor from './EntityCreatorEditor';
import { generateGUID } from '../Util'
import PopUpMessage from '../components/PopUpMessage';

class TeachSessionExtractor extends React.Component<any, any> {
    constructor(p: any) {
        super(p)
        this.state = {
            entityModalOpen: false,
            popUpOpen: false
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
    handleClosePopUpModal() {
        this.setState({
            popUpOpen: false
        })
    }
    handleOpenPopUpModal() {
        this.setState({
            popUpOpen: true
        })
    }
    /** Returns true is predicted entities match */
    isValid(extractResponse : ExtractResponse) : boolean {
        let primaryResponse = this.props.teachSession.extractResponses[0] as ExtractResponse;
        let missing = primaryResponse.predictedEntities.filter(item => 
            !extractResponse.predictedEntities.find(er => { return item.entityName == er.entityName }));

        if (missing.length > 0) { 
            return false;
        }
        missing = extractResponse.predictedEntities.filter(item => 
            !primaryResponse.predictedEntities.find(er => { return item.entityName == er.entityName }));
        if (missing.length > 0) { 
            return false;
        }
        return true;
    }
    allValid() : boolean
    {
        for (let extractResponse of this.props.teachSession.extractResponses) {
            if (extractResponse != this.props.teachSession.extractResponses[0])
            {
                if (!this.isValid(extractResponse))
                    {
                        return false;
                    }
            }
        }
        return true;
    }
    runScorer() {
        if (!this.allValid()) {
            this.handleOpenPopUpModal();
            return;
        }
        let textVariations : TextVariation[] = [];
        for (let extractResponse of this.props.teachSession.extractResponses)
            {
                textVariations.push(new TextVariation({text : extractResponse.text, labelEntities: extractResponse.predictedEntity}));
            }
        let trainExtractorStep = new TrainExtractorStep({
            textVariations: textVariations
        });

        let uiScoreInput = new UIScoreInput({trainExtractorStep : trainExtractorStep, extractResponse : this.props.teachSession.extractResponses[0]});

        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        this.props.runScorer(this.props.user.key, appId, teachId, uiScoreInput);
    }
    render() {
        let extractDisplay = [];
        let key = 0;
        for (let extractResponse of this.props.teachSession.extractResponses)
            {
                let isValid = true;
                if (extractResponse != this.props.teachSession.extractResponses[0])
                {
                    isValid = this.isValid(extractResponse);
                }
                
                extractDisplay.push(<ExtractorResponseEditor key={key++} isPrimary={key==1} isValid={isValid} extractResponse={extractResponse}/>);
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
                <PopUpMessage open={this.state.popUpOpen} onConfirm={() => this.handleClosePopUpModal()} title="Text variations must all have same tagged entities." />  
            </div>                          
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
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