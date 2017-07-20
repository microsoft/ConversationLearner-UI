import * as React from 'react';
import { setWebchatDisplay, toggleTrainDialog } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState, AppState } from '../types';
import Webchat from './Webchat'
import TeachSessionWindow from './TeachSessionWindow'
import { CommandButton, IIconProps, IIconStyles } from 'office-ui-fabric-react';

class SessionController extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            teachSession: false
        }
        this.teachSession = this.teachSession.bind(this)
        this.regularSession = this.regularSession.bind(this)
        this.toggleSessionType = this.toggleSessionType.bind(this)
    }
    toggleSessionType() {
        this.setState({
            teachSession: !this.state.teachSession
        })
    }
    teachSession() {
        return (
            <div className="container">
                <div className="webchatHeader">
                    <p className="webchatHeaderTitle ms-font-m-plus">TEACH SESSION</p>
                </div>
                <div className="webchatWindow">
                    <div className="webchatShrink">
                        <Webchat />
                    </div>
                    <div className="webchatMetaShrink">
                        <TeachSessionWindow />
                    </div>
                </div>
            </div>
        )
    }
    regularSession() {
        return (
            <div className="container">
                <div className="webchatHeader">
                    <p className="webchatHeaderTitle ms-font-m-plus">CHAT SESSION</p>
                </div>
                <div className="webchatWindow">
                    <Webchat />
                </div>
            </div>
        )
    }
    render() {
        return (
            <div className='container webchatController'>
                <div className="toggleTrainDialogBack">
                    <CommandButton
                        data-automation-id='randomID12'
                        className='webchatButton'
                        onClick={() => this.props.setWebchatDisplay(false)}
                        iconProps={{ iconName: 'Cancel' }}
                    />
                    <CommandButton
                        data-automation-id='randomID14'
                        disabled={false}
                        className='toggleTrainDialog'
                        onClick={() => this.props.toggleTrainDialog(false)}
                        iconProps={{ iconName: 'Back' }}
                    />
                </div>
                <div className="webchatContent">
                    {this.state.teachSession == true ? this.teachSession() : this.regularSession()}
                </div>
                <div className="toggleTrainDialogForward">
                    <CommandButton
                        data-automation-id='randomID11'
                        className='webchatButton'
                        onClick={() => this.toggleSessionType()}
                        iconProps={{ iconName: 'Settings' }}
                    />
                    <CommandButton
                        data-automation-id='randomID13'
                        disabled={false}
                        onClick={() => this.props.toggleTrainDialog(true)}
                        className='toggleTrainDialog'
                        iconProps={{ iconName: 'Forward' }}
                    />
                </div>
            </div>
        )

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
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(SessionController as React.ComponentClass<any>);