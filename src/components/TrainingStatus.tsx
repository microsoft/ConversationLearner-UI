import * as React from 'react'
import { FormattedMessage, FormattedRelative } from 'react-intl'
import { FM } from '../react-intl-messages'
import { TooltipHost } from 'office-ui-fabric-react'
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
        iconClassName: "ms-Icon--Unknown",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_UNKNOWN,
    }],
    [InternalTrainingStatus.Queued, {
        className: "blis-training-status__icon-row--queued",
        iconClassName: "ms-Icon--Recent",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_QUEUED,
    }],
    [InternalTrainingStatus.Running, {
        className: "blis-training-status__icon-row--running",
        iconClassName: "ms-Icon--Sync blis-icon--spin",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_RUNNING,
    }],
    [InternalTrainingStatus.Completed, {
        className: "blis-training-status__icon-row--success",
        iconClassName: "ms-Icon--CompletedSolid",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_COMPLETED,
    }],
    [InternalTrainingStatus.Failed, {
        className: "blis-training-status__icon-row--error",
        iconClassName: "ms-Icon--StatusErrorFull",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_FAILED,
    }]
])

interface StatusUI {
    className: string
    iconClassName: string
    iconLabelMessageId: string
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
        <div className="blis-training-status ms-font-l">
            <div className={`blis-training-status__icon-row ${uiState.className} ${props.didPollingExpire ? 'blis-training-status__icon-row--expired': ''}`}>
                <FormattedMessage
                    id={FM.APP_TRAINING_STATUS_STATUS}
                    defaultMessage="Status"
                />: &nbsp;<span className={"ms-Icon " + uiState.iconClassName} aria-hidden="true" />
                &nbsp;<span className="blis-training-status__icon-label">
                    <FormattedMessage
                        id={uiState.iconLabelMessageId}
                        defaultMessage="Status Placeholder"
                    />
                </span>
                {props.status === InternalTrainingStatus.Failed
                    && <TooltipHost content={props.failureMessage}>
                        <span className="blis-icon ms-Icon ms-Icon--Info" aria-hidden="true" />
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
                         &nbsp;<span className="blis-icon ms-Icon ms-Icon--Warning" aria-hidden="true" />
                    </TooltipHost>}
            </div>
            <div className="blis-training-status__text-row ms-font-s">
                <FormattedMessage
                    id={FM.APP_TRAINING_STATUS_LAST_UPDATE}
                    defaultMessage="Last Update"
                />: &nbsp;
                    <span className="blis-training-status__time">
                    {props.lastUpdatedDatetime ? <FormattedRelative value={props.lastUpdatedDatetime} /> : ''}
                </span>
                <button className="blis-training-status__trigger ms-font-s" onClick={props.onClickRefresh}>
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

