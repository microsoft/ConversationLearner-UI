import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { ActionBase, TrainScorerStep, EntityBase } from 'blis-models'
import ExtractorResponseEditor from './ExtractorResponseEditor';

class TrainDialogAdmin extends React.Component<Props, any> {
    getScore() {
        let trainDialog = this.props.trainDialog.current;
        let round = trainDialog.rounds[this.props.trainDialog.roundNumber];
        let score = round.scorerSteps[this.props.trainDialog.scoreNumber];
        return score;
    }
    getExtractResponses() {
        let trainDialog = this.props.trainDialog.current;
        let round = trainDialog.rounds[this.props.trainDialog.roundNumber];
        let key = 0;
        let extractDisplay = [];
        for (let extractResponse of round.extractorStep.textVariations) {    
            extractDisplay.push(<ExtractorResponseEditor key={key++} isPrimary={true} isValid={true} extractResponse={extractResponse}/>);   
        }
        return (
            <div className='content'>
                <div className='teachTitleBox'>
                    <div className='ms-font-l teachTitle'>Entity Detection</div>
                </div>
                {extractDisplay}
            </div>
        );
    }
    getMemory(score : TrainScorerStep) : JSX.Element {
        let entityIds = score.input.filledEntities;
        let details;
        if (entityIds.length == 0) {
            <div className='ms-font-l teachEmptyMemory'>Empty</div>;
        }
        else {
            details = [];
            for (let entityId of entityIds) {
                let entity: EntityBase = this.props.entities.find((a: EntityBase) => a.entityId == entityId);
                details.push(<div className='ms-font-l' key={entity.entityName}>{entity.entityName}</div>);     
            }
        }
        return (
            <div className='content'>
                <div className='teachTitleBox'>
                    <div className='ms-font-l teachTitle'>Memory</div>
                </div>
                {details}
            </div>
        );
    }
    getAction(score : TrainScorerStep) : JSX.Element {
        let actionId = score.labelAction;
        let action: ActionBase = this.props.actions.find((a: ActionBase) => a.actionId == actionId);  
        let payload = action ? action.payload : "ERROR: Missing Action"   ;
        return (
            <div className='content'>
                <div className='teachTitleBox'>
                    <div className='ms-font-l teachTitle'>Action</div>
                </div>
                <div className='ms-font-l teachEmptyMemory'>{payload}</div>
            </div>
        );
    }
    render() {
        let score = this.getScore();
        let extractResponses = this.getExtractResponses();
        // Not all rounds will have a score
        let actionPayload = score ? this.getAction(score) : "";
        let memory = score ? this.getMemory(score) : "";
        return (
            <div className="container teachSessionAdmin">
                {extractResponses}
                {memory}
                {actionPayload}
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        trainDialog: state.trainDialogs,
        actions: state.actions,
        entities: state.entities
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(TrainDialogAdmin);