import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { TeachMode } from '../../types/const';
import { editTrainDialogAsync } from '../../actions/updateActions';
import { clearExtractResponses } from '../../actions/teachActions'
import EntityExtractor from './EntityExtractor';
import { Activity } from 'botframework-directlinejs'
import { ActionBase, TrainDialog, TrainRound, TrainScorerStep, 
    EntityBase, TextVariation, ExtractResponse, ExtractType } from 'blis-models'

class TrainDialogAdmin extends React.Component<Props, {}> {

    constructor(p: Props) {
        super(p)
        this.onTextVariationsExtracted = this.onTextVariationsExtracted.bind(this)
    }

    findRoundAndScorerStep(trainDialog: TrainDialog, activity: Activity): { round: TrainRound, scorerStep: TrainScorerStep } {
        // TODO: Add roundIndex and scoreIndex to activity instead of hiding within id if these are needed as first class properties.
        const [roundIndex, scoreIndex] = activity.id.split(":").map(s => parseInt(s))

        if (roundIndex > trainDialog.rounds.length) {
            throw new Error(`Index out of range: You are attempting to access round by index: ${roundIndex} but there are only: ${trainDialog.rounds.length} rounds.`)
        }

        const round = trainDialog.rounds[roundIndex]

        if (scoreIndex > round.scorerSteps.length) {
            throw new Error(`Index out of range: You are attempting to access scorer step by index: ${scoreIndex} but there are only: ${round.scorerSteps.length} scorere steps.`)
        }

        const scorerStep = round.scorerSteps[scoreIndex]

        return {
            round,
            scorerStep
        }
    }

    onTextVariationsExtracted(extractResponse: ExtractResponse, textVariations: TextVariation[], turnIndex: number) : void {

        // TODO: Determine if extracted entities have changed.  If so, subsequent turns must be removed


        // Otherwise just update the text Variations
        let round = this.props.trainDialog.rounds[turnIndex]; 
        let newExtractorStep = {...round.extractorStep, textVariations: textVariations};
        let newRound = {...round, extractorStep: newExtractorStep };
        let newRounds = [...this.props.trainDialog.rounds];
        newRounds[turnIndex] = newRound;
        let updatedTrainDialog = {...this.props.trainDialog, rounds: newRounds};

        this.props.editTrainDialogAsync(this.props.user.key, updatedTrainDialog, this.props.appId);
        this.props.clearExtractResponses();
    }
    get turnIndex() : number {
        return this.props.selectedActivity ? this.props.selectedActivity.id.split(":").map(s => parseInt(s))[0] : 0;
    }
    render() {
        let round: TrainRound = null
        let scorerStep: TrainScorerStep = null
        let action: ActionBase = null
        let entities: EntityBase[] = []

        if (this.props.trainDialog && this.props.selectedActivity) {
            const result = this.findRoundAndScorerStep(this.props.trainDialog, this.props.selectedActivity)
            round = result.round
            scorerStep = result.scorerStep
            if (scorerStep != null) {
                action = this.props.actions.find(action => action.actionId == scorerStep.labelAction)
                entities = this.props.entities.filter(entity => scorerStep.input.filledEntities.includes(entity.entityId))
            }
        }

        let extractor = round ?
            <EntityExtractor
                appId = {this.props.appId}
                extractType = {ExtractType.TRAINDIALOG}
                sessionId = {this.props.trainDialog.trainDialogId}
                turnIndex = {this.turnIndex}  
                autoTeach = {false}
                teachMode = {TeachMode.Extractor}
                textVariations = {round.extractorStep.textVariations}
                extractButtonName = "Submit Changes"
                onTextVariationsExtracted = {this.onTextVariationsExtracted}
            />
            : "Select an activity";

        return (
            <div className="blis-log-dialog-admin ms-font-l">
                <div className="blis-log-dialog-admin__title">Entity Detection</div>
                <div className="blis-log-dialog-admin__content">
                    {extractor}
                </div>
                <div className="blis-log-dialog-admin__title">Memory</div>
                <div className="blis-log-dialog-admin__content">
                    {entities.length !== 0 && entities.map(entity => <div key={entity.entityName}>{entity.entityName}</div>)}
                </div>
                <div className="blis-log-dialog-admin__title">Action</div>
                <div className="blis-log-dialog-admin__content">
                    {action && action.payload}
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        editTrainDialogAsync,
        clearExtractResponses
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        appId: state.apps.current.appId,
        actions: state.actions,
        entities: state.entities
    }
}

export interface ReceivedProps {
    trainDialog: TrainDialog,
    selectedActivity: Activity
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(TrainDialogAdmin);