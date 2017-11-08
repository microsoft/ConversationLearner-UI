import * as React from 'react';
import { bindActionCreators } from 'redux';
import { State } from '../types';
import { returntypeof } from 'react-redux-typescript';
import { connect } from 'react-redux';
import * as ToolTip from './ToolTips';
import * as OF from 'office-ui-fabric-react';
import { setTipType } from '../actions/displayActions'
interface ComponentState {
    tipType: ToolTip.TipType;
}

class HelpPanel extends React.Component<Props, ComponentState> {
    
    constructor() {
        super();
        this.state = { tipType: null };
    }

    componentWillReceiveProps(newProps: Props) {
        if (this.props.tipType !== newProps.tipType) {
            this.setState({
                tipType: newProps.tipType
            });
        }
    }

    onDismiss(): void {
      this.setState({ tipType: null }, () => this.props.setTipType(null));
    }

    render() {
        return (
        <div>
            <OF.Panel
                isBlocking={true}
                isOpen={this.state.tipType != null}
                isLightDismiss={true}
                onDismiss={() => {this.onDismiss()}}
                type={OF.PanelType.smallFixedFar}
                closeButtonAriaLabel="Close"
            >
                <span>{ToolTip.GetTip(this.props.tipType)}</span>
            </OF.Panel>
        </div>
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