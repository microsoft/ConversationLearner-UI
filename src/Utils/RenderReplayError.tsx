/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import * as OF from 'office-ui-fabric-react'
import { FM } from '../react-intl-messages'
import HelpIcon from '../components/HelpIcon'
import { TipType } from '../components/ToolTips/ToolTips';
import FormattedMessageId from '../components/FormattedMessageId'
import * as CLM from '@conversationlearner/models'

export function renderReplayError(replayError: CLM.ReplayError): JSX.Element {
    switch (replayError.type) {
        case CLM.ReplayErrorType.ActionUndefined:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.REPLAYERROR_DESC_ACTION_UNDEFINED} />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ACTION_UNDEFINED} customClass="cl-icon-redbackground" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.EntityEmpty:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.REPLAYERROR_DESC_ENTITY_EMPTY} />
                        {` "${(replayError as CLM.ReplayErrorEntityEmpty).values.join(", ")}"`}
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ENTITY_EMPTY} customClass="cl-icon-redbackground" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.EntityUndefined:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.REPLAYERROR_DESC_ENTITY_UNDEFINED} />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ENTITY_UNDEFINED} customClass="cl-icon-redbackground" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.EntityUnexpectedMultivalue:
            return (
                <div className="cl-editdialog-warning">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.REPLAYERROR_DESC_ENTITY_UNEXPECTED_MULTIVALUE} />
                        {`: "${(replayError as CLM.EntityUnexpectedMultivalue).entityName}"`}
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ENTITY_UNEXPECTED_MULTIVALUE} customClass="cl-icon-redbackground" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.ActionUnavailable:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.REPLAYERROR_DESC_ACTION_UNAVAILABLE} />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ACTION_UNAVAILABLE} customClass="cl-icon-redbackground" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.ActionAfterWait:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.REPLAYERROR_DESC_ACTION_AFTER_WAIT} />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ACTION_AFTER_WAIT} customClass="cl-icon-redbackground" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.TwoUserInputs:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.REPLAYERROR_DESC_TWO_USER_INPUTS} />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_TWO_USER_INPUTS} customClass="cl-icon-redbackground" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.InputAfterNonWait:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.REPLAYERROR_DESC_INPUT_AFTER_NONWAIT} />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_INPUT_AFTER_NONWAIT} customClass="cl-icon-redbackground" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.Exception:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessageId id={FM.REPLAYERROR_DESC_EXCEPTION} />
                    </div>
                </div>
            )
        /* Currently not used, but may when check for API changes
        case CLM.ReplayErrorType.EntityDiscrepancy:
            let entityDiscrepancy = replayError as CLM.ReplayErrorEntityDiscrepancy;
            return (
                    <OF.TooltipHost  
                        id='myID' 
                        delay={ OF.TooltipDelay.zero }
                        calloutProps={ { gapSpace: 0 } }
                        tooltipProps={ {
                            onRenderContent: () => {
                                return (
                                    <div className={OF.FontClassNames.mediumPlus}>
                                        <div className="cl-font--emphasis">Original Entities:</div>
                                        {entityDiscrepancy.originalEntities.length > 0 ?
                                            entityDiscrepancy.originalEntities.map((e: any) => (<div className={OF.FontClassNames.mediumPlus}>{e}</div>))
                                            : <div className={OF.FontClassNames.mediumPlus}>-none-</div>
                                        }
                                        <div className="cl-font--emphasis">New Entities:</div>
                                        {entityDiscrepancy.newEntities.length > 0 ?
                                            entityDiscrepancy.newEntities.map((e: any) => (<div className={OF.FontClassNames.mediumPlus}>{e}</div>))
                                            : <div className={OF.FontClassNames.mediumPlus}>-none-</div>
                                        }
                                    </div>
                                );
                                }
                          } }
                        >
                        <div className={OF.FontClassNames.mediumPlus}>
                            <FormattedMessage
                                id={FM.REPLAYERROR_DESC_CHANGED_ENTITIES}
                                defaultMessage={FM.REPLAYERROR_DESC_CHANGED_ENTITIES}
                            />
                            {` "${entityDiscrepancy.lastUserInput}"`}
                            <OF.Icon iconName="Info" className="cl-icon" />
                        </div>
                    </OF.TooltipHost>
            )
        */
        default:
            throw new Error(`Unhandled ReplayErrorType case: ${replayError.type}`);
    }
}