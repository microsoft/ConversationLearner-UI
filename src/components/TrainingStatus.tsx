/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
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
        className: "training-status__icon-row--unknown",
        iconName: "Unknown",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_UNKNOWN,
        additionalIconClasses: '',
        dataTestId: "training-status-unknown"
    }],
    [InternalTrainingStatus.Queued, {
        className: "cl-training-status__icon-row--queued",
        iconName: "Recent",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_QUEUED,
        additionalIconClasses: '',
        dataTestId: "training-status-queued"
    }],
    [InternalTrainingStatus.Running, {
        className: "cl-training-status__icon-row--running",
        iconName: "Sync",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_RUNNING,
        additionalIconClasses: 'cl-icon--spin',
        dataTestId: "training-status-running"
    }],
    [InternalTrainingStatus.Completed, {
        className: "cl-training-status__icon-row--success",
        iconName: "CompletedSolid",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_COMPLETED,
        additionalIconClasses: '',
        dataTestId: "training-status-completed"
    }],
    [InternalTrainingStatus.Failed, {
        className: "cl-training-status__icon-row--error",
        iconName: "StatusErrorFull",
        iconLabelMessageId: FM.APP_TRAINING_STATUS_FAILED,
        additionalIconClasses: '',
        dataTestId: "training-status-failed"
    }]
])

interface StatusUI {
    className: string
    iconName: string
    iconLabelMessageId: string
    additionalIconClasses: string
    dataTestId: string
}

export interface Props {
    didPollingExpire: boolean
    status: InternalTrainingStatus
    failureMessage: string | null
    lastUpdatedDatetime: Date | null
    onClickRefresh: () => void
}

const Component: React.SFC<Props> = (props: Props) => {
    const uiState = internalStatusToUiStateMap.get(props.status)!
    return (
        <div className={`cl-training-status ${FontClassNames.mediumPlus}`} data-testid="training-status-status-group">
            <div className={`cl-training-status__icon-row ${uiState.className} ${props.didPollingExpire ? 'cl-training-status__icon-row--expired': ''}`}>
                <FormattedMessage
                    id={FM.APP_TRAINING_STATUS_STATUS}
                    defaultMessage="Status"
                />: &nbsp;<Icon iconName={uiState.iconName} className={uiState.additionalIconClasses} />
                &nbsp;<span className="cl-training-status__icon-label" data-testid={`${uiState.dataTestId}`}>
                    <FormattedMessage
                        id={uiState.iconLabelMessageId}
                        defaultMessage="Status Placeholder"
                    />
                </span>
                {props.status === InternalTrainingStatus.Failed && props.failureMessage
                    && <TooltipHost content={props.failureMessage}>
                        <Icon iconName="Info" className="cl-icon" />
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
                         &nbsp;<Icon iconName="Warning" className="cl-icon" data-testid="training-status-polling-stopped-warning"/>
                    </TooltipHost>}
            </div>
            <div className={`cl-training-status__text-row ${FontClassNames.small}`} data-testid="training-status-last-update">
                <FormattedMessage
                    id={FM.APP_TRAINING_STATUS_LAST_UPDATE}
                    defaultMessage="Last Update"
                />: &nbsp;
                    <span className="cl-training-status__time">
                    {props.lastUpdatedDatetime ? <FormattedRelative value={props.lastUpdatedDatetime} /> : ''}
                </span>
                <button className={`cl-training-status__trigger ${FontClassNames.small}`} onClick={props.onClickRefresh} data-testid="training-status-refresh-button">
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

