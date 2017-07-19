import * as React from 'react';
import { createBLISApplication } from '../actions/createActions';
import { setWebchatDisplay, toggleTrainDialog } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState, AppState } from '../types';
import { CommandButton, IIconProps, IIconStyles } from 'office-ui-fabric-react';
import { Chat } from 'botframework-webchat'

interface PassedProps {
    toggleMeta: Function;
    buttonText: string
}
interface ConnectedProps {
    blisApps: AppState,
    trainDialogs: TrainDialogState,
    createBLISApplication: Function,
    setWebchatDisplay: Function,
    toggleTrainDialog: Function
}
type Props = PassedProps & ConnectedProps;

class Webchat extends React.Component<Props, any> {
    constructor(p: Props) {
        super(p);
    }
    render() {
        return (
            <div className="container">
                <div className="webchatHeader">
                    <CommandButton
                        data-automation-id='randomID12'
                        disabled={false}
                        className='webchatGoBack'
                        onClick={() => this.props.setWebchatDisplay(false)}
                        ariaDescription={this.props.buttonText}
                        iconProps={{ iconName: 'Cancel' }}
                    />
                    <CommandButton
                        data-automation-id='randomID11'
                        disabled={false}
                        onClick={() => this.props.toggleMeta()}
                        className='toggleMeta'
                        ariaDescription={this.props.buttonText}
                        text={this.props.buttonText}
                    />
                </div>
                <div className="toggleTrainDialogBack">
                    <CommandButton
                        data-automation-id='randomID14'
                        disabled={false}
                        className='toggleTrainDialog'
                        onClick={() => this.props.toggleTrainDialog(false)}
                        ariaDescription={this.props.buttonText}
                        iconProps={{ iconName: 'Back' }}
                    />
                </div>
                <div style={{border: "1px solid red"}}>
                </div>
                <div className="toggleTrainDialogForward">
                    <CommandButton
                        data-automation-id='randomID13'
                        disabled={false}
                        onClick={() => this.props.toggleTrainDialog(true)}
                        className='toggleTrainDialog'
                        ariaDescription={this.props.buttonText}
                        iconProps={{ iconName: 'Forward' }}
                    />
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createBLISApplication: createBLISApplication,
        setWebchatDisplay: setWebchatDisplay,
        toggleTrainDialog: toggleTrainDialog
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        blisApps: state.apps,
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Webchat as React.ComponentClass<any>);