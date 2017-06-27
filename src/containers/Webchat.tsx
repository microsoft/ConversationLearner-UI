import * as React from 'react';
import { createBLISApplication } from '../actions/create';
import { setWebchatDisplay } from '../actions/update';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types';
import { CommandButton, IIconProps } from 'office-ui-fabric-react';

interface Props {
    toggleMeta: Function;
    buttonText: string
}
class Webchat extends React.Component<any, any> {
    constructor(p: Props) {
        super(p);
    }
    render() {
        return (
            <div className="container">
                <CommandButton
                    data-automation-id='randomID12'
                    disabled={false}
                    className='webchatGoBack'
                    onClick={() => this.props.setWebchatDisplay(false)}
                    ariaDescription={this.props.buttonText}
                    iconProps={{ iconName: 'Back', styles: {color: 'black'} }}
                />
                <CommandButton
                    data-automation-id='randomID11'
                    disabled={false}
                    onClick={() => this.props.toggleMeta()}
                    className='toggleMeta'
                    ariaDescription={this.props.buttonText}
                    text={this.props.buttonText}
                />
                <span className="ms-font-su goldText">WEBCHAT</span>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createBLISApplication: createBLISApplication,
        setWebchatDisplay: setWebchatDisplay
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Webchat);