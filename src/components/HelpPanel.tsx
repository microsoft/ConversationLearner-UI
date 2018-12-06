/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { State } from '../types';
import { returntypeof } from 'react-redux-typescript';
import { connect } from 'react-redux';
import * as ToolTip from './ToolTips';
import * as OF from 'office-ui-fabric-react';
import { setTipType } from '../actions/displayActions'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../react-intl-messages'
import './HelpPanel.css'

class HelpPanel extends React.Component<Props, {}> {
    onDismiss(): void {
        this.props.setTipType(null);
    }

    render() {
        const { intl } = this.props
        return (
            <OF.Panel
                focusTrapZoneProps={{}}
                isBlocking={true}
                isOpen={this.props.tipType != null}
                isLightDismiss={true}
                onDismiss={() => { this.onDismiss() }}
                type={OF.PanelType.medium}
                customWidth="400px"
                closeButtonAriaLabel="Close"
            >
                <div>{ToolTip.GetTip(this.props.tipType)}</div>
                <div className="cl-help-panel-footer">
                    <OF.DefaultButton
                        onClick={() => this.onDismiss()}
                        ariaDescription={intl.formatMessage({
                            id: FM.HELP_PANEL_CLOSE,
                            defaultMessage: 'Close'
                        })}
                        text={intl.formatMessage({
                            id: FM.HELP_PANEL_CLOSE,
                            defaultMessage: 'Close'
                        })}
                    />
                </div>
            </OF.Panel>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setTipType
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        tipType: state.display.tipType
    }
}

export interface ReceivedProps {
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(HelpPanel));