import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../types'
import { AppBase, TrainingStatusCode } from 'conversationlearner-models'
import { fetchApplicationTrainingStatusThunkAsync } from '../actions/fetchActions'
import { InternalTrainingStatus, default as TrainingStatus } from './TrainingStatus'
import { App } from '../types/models';

const externalStatusToInternalStatusMap = new Map<TrainingStatusCode, InternalTrainingStatus>([
    [TrainingStatusCode.Queued, InternalTrainingStatus.Queued],
    [TrainingStatusCode.Running, InternalTrainingStatus.Running],
    [TrainingStatusCode.Completed, InternalTrainingStatus.Completed],
    [TrainingStatusCode.Failed, InternalTrainingStatus.Failed],
])

interface ComponentState {
    status: InternalTrainingStatus
}

class TrainingStatusContainer extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        status: InternalTrainingStatus.Unknown
    }

    constructor(props: Props) {
        super(props)
        this.state.status = externalStatusToInternalStatusMap.get(props.app.trainingStatus) || InternalTrainingStatus.Unknown
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState({
            status: externalStatusToInternalStatusMap.get(nextProps.app.trainingStatus) || InternalTrainingStatus.Unknown,
        })
    }

    onClickRefresh = () => {
        this.props.fetchApplicationTrainingStatusThunkAsync(this.props.app.appId)
    }

    render() {
        return (
            <TrainingStatus
                status={this.state.status}
                failureMessage={this.props.app.trainingFailureMessage}
                lastUpdatedDatetime={this.props.app.datetime}
                onClickRefresh={this.onClickRefresh}
                didPollingExpire={(this.props.app as App).didPollingExpire === true}
            />
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchApplicationTrainingStatusThunkAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
    }
}

export interface ReceivedProps {
    app: AppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(TrainingStatusContainer);

