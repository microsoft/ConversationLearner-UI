import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react'
import { State, localStorageKeyForLuisAuthoringKey, localStorageKeyForLuisSubscriptionKey } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl'

class TextListModal extends React.Component<Props, {}> {

    componentWillReceiveProps(nextProps: Props) {
        // Reset when opening modal
        if (this.props.open === false && nextProps.open === true) {
            this.setState({
                luisAuthoringKeyVal: localStorage.getItem(localStorageKeyForLuisAuthoringKey),
                luisSubscriptionKeyVal: localStorage.getItem(localStorageKeyForLuisSubscriptionKey),
            })
        }
    }

    onRenderCell(item: any, index: number): JSX.Element {
        return (
                <div className={OF.FontClassNames.mediumPlus}>
                    {item}
                </div>
            )
    }

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={this.props.onClose}
                isBlocking={true}
                containerClassName="blis-modal blis-modal--small blis-modal--border"
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
    textItems: string[]
    onClose: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TextListModal))