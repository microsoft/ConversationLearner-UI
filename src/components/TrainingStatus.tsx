import * as React from 'react'
import { FormattedMessage, FormattedRelative } from 'react-intl'
import { FM } from '../react-intl-messages'
import { TooltipHost, FontClassNames } from 'office-ui-fabric-react'
import { Icon } from 'office-ui-fabric-react/lib/Icon'
import './TrainingStatus.css'

export enum InternalTrainingStatus {
    Unknown = "Unknown",
    Queued = "Queued",
    Running = "Running",
    Completed = "Completed",
    Failed = "Failed"
}

const internalStatusToUiStateMap = new Map<InternalTrainingStatus, StatusUI>([
    [InternalTrainingStatus.Unknown, {
        className: "blis-training-status__icon-row--unknown",
        iconName: "Unknown",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_UNKNOWN,
        additionalIconClasses: ''
    }],
    [InternalTrainingStatus.Queued, {
        className: "blis-training-status__icon-row--queued",
        iconName: "Recent",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_QUEUED,
        additionalIconClasses: ''
    }],
    [InternalTrainingStatus.Running, {
        className: "blis-training-status__icon-row--running",
        iconName: "Sync",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_RUNNING,
        additionalIconClasses: 'blis-icon--spin'
    }],
    [InternalTrainingStatus.Completed, {
        className: "blis-training-status__icon-row--success",
        iconName: "CompletedSolid",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_COMPLETED,
        additionalIconClasses: ''
    }],
    [InternalTrainingStatus.Failed, {
        className: "blis-training-status__icon-row--error",
        iconName: "StatusErrorFull",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_FAILED,
        additionalIconClasses: ''
    }]
])

interface StatusUI {
    className: string
    iconName: string
    iconLabelMessageId: string
    additionalIconClasses: string
}

export interface Props {
    didPollingExpire: boolean
    status: InternalTrainingStatus
    failureMessage: string
    lastUpdatedDatetime: Date | null
    onClickRefresh: () => void
}

const Component: React.SFC<Props> = (props: Props) => {
    const uiState = internalStatusToUiStateMap.get(props.status)
    return (
        <div className={`blis-training-status ${FontClassNames.large}`}>
            <div className={`blis-training-status__icon-row ${uiState.className} ${props.didPollingExpire ? 'blis-training-status__icon-row--expired': ''}`}>
                <FormattedMessage
                    id={FM.APP_TRAINING_STATUS_STATUS}
                    defaultMessage="Status"
                />: &nbsp;<Icon iconName={uiState.iconName} className={uiState.additionalIconClasses} />
                &nbsp;<span className="blis-training-status__icon-label">
                    <FormattedMessage
                        id={uiState.iconLabelMessageId}
                        defaultMessage="Status Placeholder"
                    />
                </span>
                {props.status === InternalTrainingStatus.Failed
                    && <TooltipHost content={props.failureMessage}>
                        <Icon iconName="Info" className="blis-icon" />
                    </TooltipHost>}
                {props.didPollingExpire
                    && <TooltipHost
                        tooltipProps={{
                            onRenderContent: () =>
                                <FormattedMessage
                                    id={FM.APP_TRAINING_STATUS_EXPIRED}
                                    defaultMessage="Status Placeholder"
                                />
                        }}
                    >
                         &nbsp;<Icon iconName="Warning" className="blis-icon" />
                    </TooltipHost>}
            </div>
            <div className={`blis-training-status__text-row ${FontClassNames.small}`}>
                <FormattedMessage
                    id={FM.APP_TRAINING_STATUS_LAST_UPDATE}
                    defaultMessage="Last Update"
                />: &nbsp;
                    <span className="blis-training-status__time">
                    {props.lastUpdatedDatetime ? <FormattedRelative value={props.lastUpdatedDatetime} /> : ''}
                </span>
                <button className={`blis-training-status__trigger ${FontClassNames.small}`} onClick={props.onClickRefresh}>
                    <FormattedMessage
                        id={FM.APP_TRAINING_STATUS_REFRESH}
                        defaultMessage="Refresh"
                    />
                </button>
            </div>
        </div>
    )
}

export default Component

