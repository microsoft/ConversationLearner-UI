import * as React from 'react';
import { setWebchatDisplay, toggleTrainDialog } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState, AppState } from '../types';
import { CommandButton, IIconProps, IIconStyles } from 'office-ui-fabric-react';
import Webchat from './Webchat'
import TeachSessionWindow from './TeachSessionWindow'
import ChatSessionHeader from './ChatSessionHeader'
import TeachSessionHeader from './TeachSessionHeader'

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
                <div className="webchatShrink">
                    <Webchat />
                </div>
                <div className="webchatMetaShrink">
                    <TeachSessionWindow />
                </div>
            </div>
        )
    }
    regularSession() {
        return (
            <div className="container">
                <Webchat />
            </div>
        )
    }
    render() {
        let sessionType = this.props.display.webchatTeachMode === true ? "TEACH SESSION" : "CHAT SESSION"
        return (
            <div className='container webchatController'>
                {this.state.teachSession === true ? <TeachSessionHeader sessionType={sessionType} toggleSessionType={this.toggleSessionType} /> : <ChatSessionHeader sessionType={sessionType} toggleSessionType={this.toggleSessionType}/>}
                <div className="webchatContent">
                    {this.state.teachSession === true ? this.teachSession() : this.regularSession()}
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
        display: state.display
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(SessionController as React.ComponentClass<any>);