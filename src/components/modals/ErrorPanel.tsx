import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { clearErrorDisplay } from '../../actions/displayActions'
import { State } from '../../types'
import { ErrorHandler } from '../../ErrorHandler'
import { FontClassNames } from 'office-ui-fabric-react'
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { AT } from '../../types/ActionTypes'

class ErrorPanel extends React.Component<Props, {}> {

    static callbacks: ((actionType: AT) => void)[] = [];

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
              onClick={() => this.handleClose(this.props.error.action) }
            >
              Close
            </DefaultButton>
          </div>
        );
      }

    render() {
        return (
            <div>
            {this.props.error.error != null &&
                <Panel 
                    isOpen={this.props.error.error != null}
                    type={PanelType.smallFixedNear}
                    onDismiss={() => this.handleClose(this.props.error.action)}
                    isFooterAtBottom={ true }
                    closeButtonAriaLabel='Close'
                    onRenderFooterContent={() =>this.onRenderFooterContent() }
                    customWidth='600px'
                >
                <div className="blis-errorpanel" >
                    {this.props.error.action && <div className={FontClassNames.large}>{this.props.error.action} Failed</div>}
                    <div className={FontClassNames.medium}>{this.props.error.error}</div>
                    <div className={FontClassNames.medium}>{this.props.error.message}</div>
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