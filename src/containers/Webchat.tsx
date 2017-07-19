import * as React from 'react';
import { setWebchatDisplay, toggleTrainDialog } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState, AppState } from '../types';
import { CommandButton, IIconProps, IIconStyles } from 'office-ui-fabric-react';
import { Chat } from 'botframework-webchat'

interface PassedProps {
    buttonText: string
}
interface ConnectedProps {
    blisApps: AppState,
    trainDialogs: TrainDialogState,
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
                <div className="toggleTrainDialogBack">
                    <CommandButton
                        data-automation-id='randomID14'
                        disabled={false}
                        className='toggleTrainDialog'
                        onClick={() => this.props.toggleTrainDialog(false)}
                        iconProps={{ iconName: 'Back' }}
                    />
                </div>
                <div>
                </div>
                <div className="toggleTrainDialogForward">
                    <CommandButton
                        data-automation-id='randomID13'
                        disabled={false}
                        onClick={() => this.props.toggleTrainDialog(true)}
                        className='toggleTrainDialog'
                        iconProps={{ iconName: 'Forward' }}
                    />
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
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