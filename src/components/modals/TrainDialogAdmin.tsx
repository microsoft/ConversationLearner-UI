import * as React from 'react';
import "./TeachSessionWindow.css"
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types'
import { TeachMode } from '../../types/const';
import { editTrainDialogAsync } from '../../actions/updateActions';
import { clearExtractResponses } from '../../actions/teachActions'
import EntityExtractor from './EntityExtractor';
import { Activity } from 'botframework-directlinejs'
import { PrimaryButton, DefaultButton, Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react';
import { ActionBase, TrainDialog, TrainRound, TrainScorerStep, 
    EntityBase, TextVariation, ExtractResponse, ExtractType } from 'blis-models'

class TrainDialogAdmin extends React.Component<Props, ComponentState> {

    constructor(p: Props) {
        super(p);
        this.state = {
            saveTrainDialog: null,
            saveSliceRound: 0,
            roundIndex: null,
            scoreIndex: null
        }
        this.onEntityExtractorSubmit = this.onEntityExtractorSubmit.bind(this);
    }

    componentWillReceiveProps(newProps: Props) {

        if (newProps.selectedActivity && newProps.trainDialog) {
            let [roundIndex, scoreIndex] = newProps.selectedActivity.id.split(":").map(s => parseInt(s));
            // If rounds were trimmed, selectedActivity could have been in deleted rounds
            if (roundIndex > newProps.trainDialog.rounds.length-1) { 
                this.setState({
                    roundIndex: newProps.trainDialog.rounds.length-1,
                    scoreIndex: 0
                })
            }
            else {
                this.setState({
                    roundIndex: roundIndex,
                    scoreIndex: scoreIndex
                })
            }
        }
    }

    findRoundAndScorerStep(trainDialog: TrainDialog, activity: Activity): { round: TrainRound, scorerStep: TrainScorerStep } {

        if (this.state.roundIndex > trainDialog.rounds.length-1) {
            throw new Error(`Index out of range: You are attempting to access round by index: ${this.state.roundIndex} but there are only: ${trainDialog.rounds.length} rounds.`)
        }

        const round = trainDialog.rounds[this.state.roundIndex];
        let scorerStep = null;
        if (round.scorerSteps.length > 0) {
            if (this.state.scoreIndex > round.scorerSteps.length-1) {
                throw new Error(`Index out of range: You are attempting to access scorer step by index: ${this.state.scoreIndex} but there are only: ${round.scorerSteps.length} scorere steps.`) 
            }
            scorerStep = round.scorerSteps[this.state.scoreIndex];
        }

        return {
            round,
            scorerStep
        }
    }

    // Determine if extracted entities are different than those in given round
    haveEntitiesChanged(extractResponse: ExtractResponse, roundIndex: number): boolean {
        let newEntities = extractResponse.predictedEntities.map((p) => { return p.entityId });

        // Get list of entities from first text variation
        let round = this.props.trainDialog.rounds[roundIndex]; 
        let oldEntities = round.extractorStep.textVariations[0].labelEntities.map((l) => { return l.entityId });

        let missingnew = newEntities.filter((i) => oldEntities.indexOf(i) < 0).length;
        let missingold = oldEntities.filter((i) => newEntities.indexOf(i) < 0).length;
        return (missingnew + missingold > 0);
    }

    // User has submitted new entity extractions / text variations for a round
    onEntityExtractorSubmit(extractResponse: ExtractResponse, textVariations: TextVariation[], roundIndex: number) : void {

        // Generate the new train dialog
        let round = this.props.trainDialog.rounds[roundIndex]; 
        let newExtractorStep = {...round.extractorStep, textVariations: textVariations};
        let newRound = {...round, extractorStep: newExtractorStep };
        let newRounds = [...this.props.trainDialog.rounds];
        newRounds[roundIndex] = newRound;
        let updatedTrainDialog = {...this.props.trainDialog, rounds: newRounds};

        // Determine if extracted entities have changed.  If so, save and show prompt to user
        if (this.haveEntitiesChanged(extractResponse, roundIndex)) {
            // Save prompt will be shown to user
            this.setState({
                saveTrainDialog: updatedTrainDialog,
                saveSliceRound: roundIndex
            });
            return;
        }  
        // Otherwise just save with new text variations 
        else {
            this.props.editTrainDialogAsync(this.props.user.key, updatedTrainDialog, this.props.appId);
            this.props.clearExtractResponses();
        }
    }       
    onClickSaveCheckYes() {
        // Delete at steps after the current round
        let newRounds = this.state.saveTrainDialog.rounds.slice(0,this.state.saveSliceRound+1);
        newRounds[this.state.saveSliceRound].scorerSteps = [];
        let trainDialog = {...this.state.saveTrainDialog, rounds: newRounds};

        this.setState({
            saveTrainDialog: null, 
            saveSliceRound: 0,
            roundIndex: this.state.saveSliceRound
        });

        // Submit saved extractions
        this.props.editTrainDialogAsync(this.props.user.key, trainDialog, this.props.appId);
        this.props.clearExtractResponses();
    }
    onClickSaveCheckNo() {
        // Reset the entity extractor
        this.setState({saveTrainDialog: null, saveSliceRound: 0});
        this.props.clearExtractResponses();
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
                roundIndex = {this.state.roundIndex}  
                autoTeach = {false}
                teachMode = {TeachMode.Extractor}
                extractResponses = {this.props.extractResponses}
                originalTextVariations = {round.extractorStep.textVariations}
                onTextVariationsExtracted = {this.onEntityExtractorSubmit}
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
                <div className="blis-log-dialog-admin__dialogs">
                    <Dialog
                        hidden={this.state.saveTrainDialog === null}
                        isBlocking={true}
                        dialogContentProps={{
                            type: DialogType.normal,
                            subText: 'Your changes will invalidate the subsequent steps in the Train Dialog', 
                            title: 'Do you want to proceed and truncate the Train Dialog at this step?'
                        }}
                        modalProps={{
                            isBlocking: true
                        }}
                    >
                        <DialogFooter>
                            <PrimaryButton onClick={() => this.onClickSaveCheckYes()} text='Yes' />
                            <DefaultButton onClick={() => this.onClickSaveCheckNo()} text='No' />
                        </DialogFooter>
                    </Dialog>
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
        entities: state.entities,
        extractResponses: state.teachSessions.extractResponses
    }
}

interface ComponentState {
    saveTrainDialog: TrainDialog,
    saveSliceRound: number,
    roundIndex: number,
    scoreIndex: number
};

export interface ReceivedProps {
    trainDialog: TrainDialog,
    selectedActivity: Activity
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(TrainDialogAdmin);