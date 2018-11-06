/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { State } from '../types';
import { returntypeof } from 'react-redux-typescript';
import { connect } from 'react-redux';
import * as ToolTip from './ToolTips/ToolTips';
import * as OF from 'office-ui-fabric-react';
import { TipType } from './ToolTips/ToolTips';
import { setTipType } from '../actions/displayActions'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'

class HelpPanel extends React.Component<Props, {}> {
    onDismiss(): void {
        this.props.setTipType(TipType.NONE)
    }

    render() {
        return (
            <OF.Panel
                focusTrapZoneProps={{}}
                isBlocking={true}
                isOpen={this.props.tipType !== TipType.NONE}
                isLightDismiss={true}
                onDismiss={() => { this.onDismiss() }}
                type={OF.PanelType.medium}
                customWidth="400px"
                closeButtonAriaLabel="Close"
                hasCloseButton={true}
            >
                <span>{ToolTip.getTip(this.props.tipType)}</span>

                <div className="cl-ux-gutter" style={{width:'89%'}}>
                    <div className="cl-ux-flexpanel--right">
                        <OF.DefaultButton
                            data-testid="helppanel-close-button"
                            className="cl-button-close"
                            onClick={() => { this.onDismiss() }}>
                            <FormattedMessage
                                id={FM.BUTTON_CLOSE}
                                defaultMessage='Close'
                            />
                        </OF.DefaultButton>
                    </div>
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
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(HelpPanel);