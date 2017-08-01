import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { TrainScorerStep } from 'blis-models';
import { postScorerFeedback } from '../actions/teachActions'
import { CommandButton } from 'office-ui-fabric-react';
import { dummyTrainScorerStep } from '../epics/apiHelpers' // TEMP

class TeachSessionScorer extends React.Component<any, any> {
    sendFeedback() {
        // TEMP
        let trainScorerStep = dummyTrainScorerStep();
        let appId: string = this.props.apps.current.appId;
        let teachId: string = this.props.teachSession.current.teachId;
        this.props.postScorerFeedback(this.props.user.key, appId, teachId, trainScorerStep);
    }
    render() {
        return (
            <div className="teachSessionHalfMode">
                TeachSessionScorer

                <CommandButton
                        data-automation-id='randomID16'
                        disabled={false}
                        onClick={this.sendFeedback.bind(this)}
                        className='ms-font-su goldButton abandonTeach'
                        ariaDescription='Send Score Feedback'
                        text='Send Score Feedback'
                    />
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        postScorerFeedback: postScorerFeedback,
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        user: state.user,
        teachSession: state.teachSessions,
        apps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionScorer as React.ComponentClass<any>);