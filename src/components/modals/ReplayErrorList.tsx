/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import HelpIcon from '../HelpIcon'
import { TipType } from '../ToolTips/ToolTips';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import * as CLM from '@conversationlearner/models'

export function renderReplayError(replayError: CLM.ReplayError): JSX.Element {
    switch (replayError.type) {
        case CLM.ReplayErrorType.ActionUndefined:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_ACTION_UNDEFINED}
                            defaultMessage={FM.REPLAYERROR_DESC_ACTION_UNDEFINED}
                        />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ACTION_UNDEFINED} customStyle="cl-icon--transparent" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.EntityEmpty:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_ENTITY_EMPTY}
                            defaultMessage={FM.REPLAYERROR_DESC_ENTITY_EMPTY}
                        />
                        {` "${(replayError as CLM.ReplayErrorEntityEmpty).values.join(", ")}"`}
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ENTITY_EMPTY} customStyle="cl-icon--transparent" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.EntityUndefined:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_ENTITY_UNDEFINED}
                            defaultMessage={FM.REPLAYERROR_DESC_ENTITY_UNDEFINED}
                        />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ENTITY_UNDEFINED} customStyle="cl-icon--transparent" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.EntityUnexpectedMultivalue:
            return (
                <div className="cl-editdialog-warning">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_ENTITY_UNEXPECTED_MULTIVALUE}
                            defaultMessage={FM.REPLAYERROR_DESC_ENTITY_UNEXPECTED_MULTIVALUE}
                        />
                        {`: "${(replayError as CLM.EntityUnexpectedMultivalue).entityName}"`}
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ENTITY_UNEXPECTED_MULTIVALUE} customStyle="cl-icon--transparent" />
                    </div>
                </div>
            )
        case CLM. ReplayErrorType.ActionUnavailable:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_ACTION_UNAVAILABLE}
                            defaultMessage={FM.REPLAYERROR_DESC_ACTION_UNAVAILABLE}
                        />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ACTION_UNAVAILABLE} customStyle="cl-icon--transparent" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.ActionAfterWait:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_ACTION_AFTER_WAIT}
                            defaultMessage={FM.REPLAYERROR_DESC_ACTION_AFTER_WAIT}
                        />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_ACTION_AFTER_WAIT} customStyle="cl-icon--transparent" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.TwoUserInputs:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_TWO_USER_INPUTS}
                            defaultMessage={FM.REPLAYERROR_DESC_TWO_USER_INPUTS}
                        />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_TWO_USER_INPUTS} customStyle="cl-icon--transparent" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.InputAfterNonWait:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_INPUT_AFTER_NONWAIT}
                            defaultMessage={FM.REPLAYERROR_DESC_INPUT_AFTER_NONWAIT}
                        />
                        <HelpIcon tipType={TipType.REPLAYERROR_DESC_INPUT_AFTER_NONWAIT} customStyle="cl-icon--transparent" />
                    </div>
                </div>
            )
        case CLM.ReplayErrorType.Exception:
            return (
                <div className="cl-editdialog-error">
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_EXCEPTION}
                            defaultMessage={FM.REPLAYERROR_DESC_EXCEPTION}
                        />
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

class ReplayErrorList extends React.Component<Props, {}> {
    render() {
        const { intl, formattedTitleId, formattedMessageId } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={this.props.onClose}
                isBlocking={true}
                containerClassName="cl-modal cl-modal--small"
            >
                <div className="cl-modal_header">
                    <span className={OF.FontClassNames.xxLarge}>
                        {formattedTitleId && <FormattedMessage
                            id={this.props.formattedTitleId}
                            defaultMessage="Default Error Title"
                        />}
                    </span>
                </div>
                <div className="cl-modal_subheader cl-underline">
                    <span className={OF.FontClassNames.mediumPlus}>
                        {formattedMessageId && <FormattedMessage
                            id={this.props.formattedMessageId}
                            defaultMessage="Default Error Message"
                        />}
                    </span>
                </div>
                <OF.List
                    className={OF.FontClassNames.medium}
                    items={this.props.textItems}
                    onRenderCell={renderReplayError}
                />
                <div className="cl-modal_footer">
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_primary">
                            <OF.PrimaryButton
                                onClick={this.props.onClose}
                                ariaDescription={intl.formatMessage({
                                    id: FM.BUTTON_OK,
                                    defaultMessage: 'OK'
                                })}
                                text={intl.formatMessage({
                                    id: FM.BUTTON_OK,
                                    defaultMessage: 'OK'
                                })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
    }
}

export interface ReceivedProps {
    open: boolean
    formattedTitleId: string
    formattedMessageId: string
    textItems: CLM.ReplayError[]
    onClose: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(ReplayErrorList))