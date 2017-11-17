import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../types'
import { BlisAppBase, TrainingStatusCode } from 'blis-models'
import { fetchApplicationTrainingStatusAsync } from '../actions/fetchActions'
import { FormattedRelative } from 'react-intl'
import './TrainingStatus.css'

enum InternalTrainingStatus {
    Unknown = "Unknown",
    Pending = "Pending",
    Completed = "Completed",
    Failed = "Failed"
}

const externalStatusToInternalStatusMap = new Map<TrainingStatusCode, InternalTrainingStatus>([
    [TrainingStatusCode.Completed, InternalTrainingStatus.Completed],
    [TrainingStatusCode.Failed, InternalTrainingStatus.Failed],
])

const internalStatusToUiStateMap = new Map<InternalTrainingStatus, StatusUI>([
    [InternalTrainingStatus.Unknown, {
        className: "blis-training-status__icon-row--unknown",
        iconClassName: "ms-Icon--Unknown",
        iconLabel: "Unknown",
    }],
    [InternalTrainingStatus.Pending, {
        className: "blis-training-status__icon-row--pending",
        iconClassName: "ms-Icon--Sync",
        iconLabel: "Pending",
    }],
    [InternalTrainingStatus.Completed, {
        className: "blis-training-status__icon-row--success",
        iconClassName: "ms-Icon--CompletedSolid",
        iconLabel: "Trained",
    }],
    [InternalTrainingStatus.Failed, {
        className: "blis-training-status__icon-row--error",
        iconClassName: "ms-Icon--StatusErrorFull",
        iconLabel: "Failed",
    }]
])

interface StatusUI {
    className: string
    iconClassName: string
    iconLabel: string
}

interface ComponentState {
    status: InternalTrainingStatus
}

class Component extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        status: InternalTrainingStatus.Unknown
    }

    constructor(props: Props) {
        super(props)
        console.log(`TrainingStatus: constructor`, props.app.appId, props.app.datetime)
        this.state.status = externalStatusToInternalStatusMap.get(props.app.trainingStatus) || InternalTrainingStatus.Unknown
    }

    componentWillReceiveProps(nextProps: Props) {
        console.log(`TrainingStatus: componentWillReceiveProps`, nextProps.app.appId, nextProps.app.datetime)
        this.setState({
            status: externalStatusToInternalStatusMap.get(nextProps.app.trainingStatus) || InternalTrainingStatus.Unknown,
        })
    }

    onClickRefresh = () => {
        this.setState({
            status: InternalTrainingStatus.Pending
        }, () => {
            this.props.fetchApplicationTrainingStatusAsync(this.props.app.appId)
        })
    }

    render() {
        const uiState = internalStatusToUiStateMap.get(this.state.status)
        return (
            <div className="blis-training-status ms-font-l">
                <div className={"blis-training-status__icon-row " + uiState.className}>Status: &nbsp;<span className={"ms-Icon " + uiState.iconClassName} aria-hidden="true" /> &nbsp;<span className="blis-training-status__icon-label">{uiState.iconLabel}</span></div>
                <div className="blis-training-status__text-row ms-font-s">
                    Last Update: &nbsp;
                    <span className="blis-training-status__time">
                        {this.props.app.datetime ? <FormattedRelative value={this.props.app.datetime} /> : ''}
                    </span>
                    <button className="blis-training-status__trigger ms-font-s" onClick={this.onClickRefresh}>Refresh</button>
                </div>
            </div>
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

