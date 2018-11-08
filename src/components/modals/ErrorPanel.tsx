/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as OF from 'office-ui-fabric-react'
import { clearErrorDisplay } from '../../actions/displayActions'
import { State, ErrorState } from '../../types'
import { ErrorHandler } from '../../Utils/ErrorHandler'
import { injectIntl, InjectedIntlProps, InjectedIntl, FormattedMessage } from 'react-intl'
import { AT } from '../../types/ActionTypes'
import { FM } from '../../react-intl-messages'
import { getTip, TipType } from '../ToolTips/ToolTips'

class ErrorPanel extends React.Component<Props, {}> {
    static customErrors = {
        'Network Error': FM.CUSTOMERROR_NETWORK_ERROR
    }

    handleClose = (actionType: AT | null) => {
        this.props.clearErrorDisplay()

        // If error associated with an action
        if (actionType) {
            ErrorHandler.handleError(actionType)
        }
    }

    onRenderFooterContent(): JSX.Element {
        return (
            <div>
                <OF.DefaultButton
                    onClick={() => this.handleClose(this.props.error.actionType)}
                >
                    Close
                </OF.DefaultButton>
            </div>
        );
    }

    getCustomError(intl: InjectedIntl, error: ErrorState): string | null {
        if (!error || !error.title) {
            return null
        }

        const formattedMessageId = ErrorPanel.customErrors[error.title]
        return formattedMessageId &&
            intl.formatMessage({
                id: formattedMessageId,
                defaultMessage: formattedMessageId
            })
    }

    render() {
        const { intl, error } = this.props
        const customError = this.getCustomError(intl, error)
        return (
            <OF.Panel
                focusTrapZoneProps={{}}
                isOpen={error.title != null}
                type={OF.PanelType.medium}
                onDismiss={() => this.handleClose(error.actionType)}
                isFooterAtBottom={true}
                closeButtonAriaLabel='Close'
                onRenderFooterContent={() => this.onRenderFooterContent()}
                customWidth='600px'
            >
                <div className="cl-errorpanel">
                    {this.props.error.actionType && <div className={OF.FontClassNames.large}>
                        <FormattedMessage
                            id={this.props.error.actionType || FM.ERROR_ERROR}
                            defaultMessage={this.props.error.actionType || 'Unknown'}
                        /> Failed</div>}
                    <div className={OF.FontClassNames.medium}>{this.props.error.title}</div>
                    {this.props.error && Array.isArray(this.props.error.messages) && this.props.error.messages.map((message, key) => {
                        // TODO: Need to not base this on string compare, but will greatly help end users so putting in for now
                        if (message.includes("LUIS_AUTHORING_KEY")) {
                            return (
                                <div key={key}>
                                    <div>{message}</div>
                                    {getTip(TipType.LUIS_AUTHORING_KEY)}
                                </div>
                            )
                        }

                        return <div key={key}>{message}</div>
                    })}
                    {customError &&
                        <div className={OF.FontClassNames.medium}>{customError}</div>}
                </div>
            </OF.Panel>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        clearErrorDisplay
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        error: state.error
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(injectIntl(ErrorPanel))