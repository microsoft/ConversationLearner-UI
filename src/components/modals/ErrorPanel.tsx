/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as OF from 'office-ui-fabric-react'
import { State, ErrorState } from '../../types'
import actions from '../../actions'
import { ErrorHandler } from '../../Utils/ErrorHandler'
import { injectIntl, InjectedIntlProps, InjectedIntl, FormattedMessage } from 'react-intl'
import { AT } from '../../types/ActionTypes'
import { FM } from '../../react-intl-messages'
import { getTip, TipType } from '../ToolTips/ToolTips'
import { ErrorCode } from '@conversationlearner/models'
import * as Util from '../../Utils/util'

interface ComponentState {
    errorCode: ErrorCode | null
    errorMessages: string[],
    customError: string | null
}

class ErrorPanel extends React.Component<Props, ComponentState> {
    static customErrors = {
        'Network Error': FM.CUSTOMERROR_NETWORK_ERROR
    }

    state: ComponentState = {
        errorCode: null,
        errorMessages: [""],
        customError: null
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.error !== this.props.error) {
            const errorMessages = this.getErrorMessages(this.props.error)
            const errorCode = this.getErrorCode(errorMessages[0])
            const customError = this.getCustomError(this.props.intl, this.props.error)

            this.setState({
                errorCode,
                errorMessages,
                customError
            })
        }
    }

    handleClose = (actionType?: AT) => {
        this.props.clearErrorDisplay()

        // If error associated with an action
        if (actionType) {
            ErrorHandler.HandleError(actionType)
        }

        if (this.state.errorCode === ErrorCode.INVALID_BOT_CHECKSUM) {
            this.props.fetchBotInfoThunkAsync(this.props.browserId, this.props.appId)
        }

        if (this.props.error.closeCallback) {
            this.props.error.closeCallback()
        }
    }

    onRenderFooterContent(): JSX.Element {
        return (
            <div>
                <OF.DefaultButton
                    className="cl-button-close cl-ux-flexpanel--right"
                    style={{ marginBottom: '1em' }}
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
            Util.formatMessageId(intl, formattedMessageId)
    }

    getErrorMessages(error: ErrorState): string[] {
        if (error.messages) {
            return error.messages.map(message => {
                try {
                    // Try to parse as JSON
                    const errorObj = JSON.parse(message)
                    if (errorObj.data) {
                        return JSON.stringify(errorObj.data)
                    }
                    else {
                        return message
                    }
                }
                catch {
                    return message
                }
            })
        }
        return []
    }

    getErrorCode(errorBody: string): ErrorCode | null {
        if (errorBody.includes(ErrorCode.INVALID_BOT_CHECKSUM)) {
            return ErrorCode.INVALID_BOT_CHECKSUM
        }

        // TODO: Need to not base this on string compare, but will greatly help end users so putting in for now
        if (errorBody.includes("LUIS_AUTHORING_KEY")) {
            return ErrorCode.INVALID_LUIS_AUTHORING_KEY
        }

        return null
    }

    renderErrorBody(): React.ReactNode {
        return this.state.errorMessages.map((item, i) => <p key={i}>{item}</p>);
    }

    renderErrorCode(): React.ReactNode {
        switch (this.state.errorCode) {
            case ErrorCode.INVALID_LUIS_AUTHORING_KEY:
                return (
                    <div className="cl-errorpanel">
                        <div>
                            <div>{this.renderErrorBody()}</div>
                            {getTip(TipType.LUIS_AUTHORING_KEY)}
                        </div>
                    </div>
                )
            case ErrorCode.INVALID_BOT_CHECKSUM:
                return (
                    <div>
                        <div>Detected changes in running Bot that require a refresh</div>
                    </div>
                )
            default:
                return null
        }
    }

    renderError(): React.ReactNode {
        if (this.state.errorCode) {
            return this.renderErrorCode()
        }
        else {
            return (
                <div className="cl-errorpanel">
                    {this.props.error.actionType && <div className={OF.FontClassNames.large}>
                        <FormattedMessage
                            id={this.props.error.actionType ?? FM.ERROR_ERROR}
                            defaultMessage={this.props.error.actionType ?? 'Unknown'}
                        /> Failed</div>}
                    <div className={OF.FontClassNames.medium}>{this.props.error.title}</div>
                    {this.renderErrorBody()}
                    {this.state.customError &&
                        <div className={OF.FontClassNames.medium}>{this.state.customError}</div>}
                </div>
            )
        }
    }
    render() {
        return (
            <OF.Panel
                isOpen={this.props.error.title != null}
                isLightDismiss={true}
                type={OF.PanelType.medium}
                onDismiss={() => this.handleClose(this.props.error.actionType)}
                isFooterAtBottom={true}
                closeButtonAriaLabel='Close'
                onRenderFooterContent={() => this.onRenderFooterContent()}
                customWidth='600px'
            >
                {this.renderError()}
            </OF.Panel>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchBotInfoThunkAsync: actions.bot.fetchBotInfoThunkAsync,
        clearErrorDisplay: actions.display.clearErrorDisplay
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        error: state.error,
        browserId: state.bot.browserId,
        appId: state.apps.selectedAppId
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>;
type dispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = stateProps & dispatchProps & InjectedIntlProps

export default connect<stateProps, dispatchProps>(mapStateToProps, mapDispatchToProps)(injectIntl(ErrorPanel))