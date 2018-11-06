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
import { setTipType } from '../actions/displayActions'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'

class HelpPanel extends React.Component<Props, {}> {
    onDismiss(): void {
        this.props.setTipType(ToolTip.TipType.NONE)
    }

    render() {
        return (
            <OF.Panel
                focusTrapZoneProps={{}}
                isBlocking={true}
                isOpen={this.props.tipType !== ToolTip.TipType.NONE}
                isLightDismiss={true}
                onDismiss={() => { this.onDismiss() }}
                type={OF.PanelType.medium}
                customWidth="400px"
                closeButtonAriaLabel="Close"
                hasCloseButton={true}
            >
                <span>{ToolTip.getTip(this.props.tipType)}</span>

                <div className="cl-modal_footer cl-modal_footer--border">
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary"/>
                        <div className="cl-modal-buttons_primary">
                            <OF.Button
                                data-testid="helppanel-close-button"
                                className="cl-button-close"
                                onClick={() => { this.onDismiss() }}
                            >
                                <FormattedMessage
                                    id={FM.BUTTON_CLOSE}
                                    defaultMessage='Close'
                                />
                            </OF.Button>
                        </div>
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

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(HelpPanel);