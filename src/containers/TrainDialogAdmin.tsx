import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { updateExtractResponse, removeExtractResponse } from '../actions/teachActions'
import ExtractorResponseEditor from './ExtractorResponseEditor'
import { Activity } from 'botframework-directlinejs'
import { ActionBase, TrainDialog, TrainRound, TrainScorerStep, EntityBase, ExtractResponse } from 'blis-models'

class TrainDialogAdmin extends React.Component<Props, any> {

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

    render() {
        let round: TrainRound = null
        let scorerStep: TrainScorerStep = null
        let action: ActionBase = null
        let entities: EntityBase[] = []

        if (this.props.trainDialog && this.props.selectedActivity) {
            const result = this.findRoundAndScorerStep(this.props.trainDialog, this.props.selectedActivity)
            round = result.round
            scorerStep = result.scorerStep
            action = this.props.actions.find(action => action.actionId == scorerStep.labelAction)
            entities = this.props.entities.filter(entity => scorerStep.input.filledEntities.includes(entity.entityId))
        }

        return (
            <div className="blis-log-dialog-admin ms-font-l">
                <div className="blis-log-dialog-admin__title">Entity Detection</div>
                <div className="blis-log-dialog-admin__content">
                    {round
                        ? round.extractorStep.textVariations.map((textVariaion, i) =>
                            <ExtractorResponseEditor
                                key={i}
                                isPrimary={true}
                                isValid={true}
                                // TODO: Fix ExtractorResponseEditor to use text and entities base.
                                extractResponse={(textVariaion as any) as ExtractResponse}
                                canEdit={false}
                                updateExtractResponse={() => {}}
                                removeExtractResponse={() => {}}
                            />)
                        : "Select an activity"}
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
        updateExtractResponse,
        removeExtractResponse
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
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