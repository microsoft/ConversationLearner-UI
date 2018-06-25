/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Panel, PanelType, FontClassNames, DefaultButton } from 'office-ui-fabric-react';
import { clearErrorDisplay } from '../../actions/displayActions'
import { State } from '../../types'
import { ErrorHandler } from '../../ErrorHandler'
import { injectIntl, InjectedIntlProps, InjectedIntl, FormattedMessage } from 'react-intl'
import { AT } from '../../types/ActionTypes'
import { FM } from '../../react-intl-messages'
import { GetTip, TipType } from '../ToolTips'

class ErrorPanel extends React.Component<Props, {}> {

    static callbacks: ((actionType: AT) => void)[] = [];

    static customErrors = 
        {
            'Network Error' : FM.CUSTOMERROR_NETWORK_ERROR
        };

    public static registerCallback(actionType: AT, callback: (at: AT) => void[]): void {
        if (!ErrorPanel.callbacks[actionType]) {
            ErrorPanel.callbacks[actionType] = [];
        }
        ErrorPanel.callbacks[actionType].push(callback);
    }

    constructor(p: any) { 
        super(p);

        this.handleClose = this.handleClose.bind(this)
    }

    handleClose(actionType: AT) {
        this.props.clearErrorDisplay();

        // If error associated with an action
        if (actionType) {
          ErrorHandler.handleError(actionType);
        }
    }

    onRenderFooterContent(): JSX.Element {
        return (
          <div>
            <DefaultButton
              onClick={() => this.handleClose(this.props.error.actionType) }
            >
              Close
            </DefaultButton>
          </div>
        );
      }

    getCustomError(intl: InjectedIntl): string {
        if (this.props.error) {
            let fm = ErrorPanel.customErrors[this.props.error.error];
            return fm &&
                intl.formatMessage({
                    id: fm,
                    defaultMessage: fm
                })
        }
        return null;
    }

    render() {
        let key = 0;
        const { intl } = this.props
        let customError = this.getCustomError(intl);
        return (
            <div>
            {this.props.error.error != null &&
                <Panel
                    focusTrapZoneProps={{}}
                    isOpen={this.props.error.error != null}
                    type={PanelType.medium}
                    onDismiss={() => this.handleClose(this.props.error.actionType)}
                    isFooterAtBottom={ true }
                    closeButtonAriaLabel='Close'
                    onRenderFooterContent={() =>this.onRenderFooterContent() }
                    customWidth='600px'
                >
                <div className="cl-errorpanel" >
                    {this.props.error.actionType && <div className={FontClassNames.large}>
                    <FormattedMessage
                        id={this.props.error.actionType || FM.ERROR_ERROR}
                        defaultMessage='Unknown '
                    /> Failed</div>}
                    <div className={FontClassNames.medium}>{this.props.error.error}</div>
                    {this.props.error && this.props.error.messages.map(message => { 
                            // TODO: Need to not base this on string compare, but will greatly help end users so putting in for now
                            if (message.includes("LUIS_AUTHORING_KEY")) {
                                return (
                                    <div>
                                        <div key={key++} className={FontClassNames.medium}>{message}</div>
                                        {GetTip(TipType.LUIS_AUTHORING_KEY)}
                                    </div>
                                )
                            }
                            return message.length === 0 ? <br key={key++}></br> : <div key={key++} className={FontClassNames.medium}>{message}</div>;
                        })
                    }
                    {customError &&
                        <div className={FontClassNames.medium}>{customError}</div>}
                </div>
                </Panel>
            }
            </div>
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