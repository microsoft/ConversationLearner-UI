import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react'
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'
import { ReplayError, ReplayErrorType, ReplayErrorMissingAction, ReplayErrorMissingEntity, ReplayErrorActionUnavailable, ReplayErrorEntityDiscrepancy } from 'blis-models'

class ReplayErrorList extends React.Component<Props, {}> {
    onRenderCell(item: ReplayError, index: number): JSX.Element {
        switch (item.type) {
            case ReplayErrorType.MissingAction:
                return (
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_MISSING_ACTION}
                            defaultMessage={FM.REPLAYERROR_DESC_MISSING_ACTION}
                        />
                        {` "${(item as ReplayErrorMissingAction).lastUserInput}"`}
                    </div>
                )
            case ReplayErrorType.MissingEntity:
                return (
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_MISSING_ENTITY}
                            defaultMessage={FM.REPLAYERROR_DESC_MISSING_ENTITY}
                        />
                        {` "${(item as ReplayErrorMissingEntity).value}"`}
                    </div>
                )
            case ReplayErrorType.ActionUnavailable:
                return (
                    <div className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={FM.REPLAYERROR_DESC_UNAVAILABLE_ACTION}
                            defaultMessage={FM.REPLAYERROR_DESC_UNAVAILABLE_ACTION}
                        />
                        {` "${(item as ReplayErrorActionUnavailable).lastUserInput}"`}
                    </div>
                )
            case ReplayErrorType.EntityDiscrepancy:
                let entityDiscrepancy = item as ReplayErrorEntityDiscrepancy;
                return (
                        <OF.TooltipHost  
                            id='myID' 
                            delay={ OF.TooltipDelay.zero }
                            calloutProps={ { gapSpace: 0 } }
                            tooltipProps={ {
                                onRenderContent: () => {
                                    return (
                                        <div className={OF.FontClassNames.mediumPlus}>
                                            <div className="blis-font--emphasis">Original Entities:</div>
                                            {entityDiscrepancy.originalEntities.length > 0 ?
                                                entityDiscrepancy.originalEntities.map(e => (<div className={OF.FontClassNames.mediumPlus}>{e}</div>))
                                                : <div className={OF.FontClassNames.mediumPlus}>-none-</div>
                                            }
                                            <div className="blis-font--emphasis">New Entities:</div>
                                            {entityDiscrepancy.newEntities.length > 0 ?
                                                entityDiscrepancy.newEntities.map(e => (<div className={OF.FontClassNames.mediumPlus}>{e}</div>))
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
                                <OF.Icon iconName="Info" className="blis-icon" />
                            </div>
                        </OF.TooltipHost>
                )
            default:
                throw new Error('Unhandled ReplayErrorType case');
        }
    }

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={this.props.onClose}
                isBlocking={true}
                containerClassName="blis-modal blis-modal--small"
            >
                <div className="blis-modal_header">
                    <span className={OF.FontClassNames.xxLarge}>
                        <FormattedMessage
                            id={this.props.formattedTitleId}
                            defaultMessage={this.props.formattedTitleId}
                        />
                    </span>
                </div>
                <div className="blis-modal_subheader blis-underline">
                    <span className={OF.FontClassNames.mediumPlus}>
                        <FormattedMessage
                            id={this.props.formattedMessageId}
                            defaultMessage={this.props.formattedMessageId}
                        />
                    </span>
                </div>
                <OF.List
                    className={OF.FontClassNames.medium}
                    items={this.props.textItems}
                    onRenderCell={this.onRenderCell}
                />
                <div className="blis-modal_footer">
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary">
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
    textItems: ReplayError[]
    onClose: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(ReplayErrorList))

