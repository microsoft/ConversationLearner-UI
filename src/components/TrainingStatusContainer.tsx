import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../types'
import { BlisAppBase, TrainingStatusCode } from 'blis-models'
import { fetchApplicationTrainingStatusAsync } from '../actions/fetchActions'
import { InternalTrainingStatus, default as TrainingStatus } from './TrainingStatus'


const externalStatusToInternalStatusMap = new Map<TrainingStatusCode, InternalTrainingStatus>([
    [TrainingStatusCode.Completed, InternalTrainingStatus.Completed],
    [TrainingStatusCode.Failed, InternalTrainingStatus.Failed],
])

interface ComponentState {
    status: InternalTrainingStatus
}

class Component extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        status: InternalTrainingStatus.Unknown
    }

    constructor(props: Props) {
        super(props)
        console.log(`TrainingStatusContainer: ${this.constructor.name}: constructor`, props.app.appId, props.app.datetime)
        this.state.status = externalStatusToInternalStatusMap.get(props.app.trainingStatus) || InternalTrainingStatus.Unknown
    }

    componentWillReceiveProps(nextProps: Props) {
        console.log(`TrainingStatusContainer: componentWillReceiveProps`, nextProps.app.appId, nextProps.app.datetime)
        this.setState({
            status: externalStatusToInternalStatusMap.get(nextProps.app.trainingStatus) || InternalTrainingStatus.Unknown,
        })
    }

    onClickRefresh = () => {
        this.setState({
            status: InternalTrainingStatus.Queued
        }, () => {
            this.props.fetchApplicationTrainingStatusAsync(this.props.app.appId)
        })
    }

    render() {
        return (
            <TrainingStatus
                status={this.state.status}
                failureMessage={this.props.app.trainingFailureMessage}
                lastUpdatedDatetime={this.props.app.datetime}
                onClickRefresh={this.onClickRefresh}
            />
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchApplicationTrainingStatusAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(Component);

