import * as React from 'react';
import { setWebchatDisplay, toggleTrainDialog } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState, AppState } from '../types';
import Webchat from './Webchat'
import WebchatMetadata from './WebchatMetadata'
import { CommandButton, IIconProps, IIconStyles } from 'office-ui-fabric-react';

class WebchatController extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            displayMetadata: true
        }
        this.renderWithMeta = this.renderWithMeta.bind(this)
        this.toggleMeta = this.toggleMeta.bind(this)
    }
    toggleMeta() {
        this.setState({
            displayMetadata: !this.state.displayMetadata
        })
    }
    renderWithMeta() {
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
                <div className="webchatContent">
                    <div className="webchatShrink">
                        <Webchat />
                    </div>
                    <div className="webchatMetaShrink">
                        <WebchatMetadata />
                    </div>
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
        )
    }
    renderWithoutMeta() {
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
                <div className="webchatContent">
                    <Webchat />
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
        )
    }
    render() {
        let buttonText = this.state.displayMetadata === true ? "HIDE METADATA" : "SHOW METADATA"
        return (
            <div className='container webchatController'>
                <div className="webchatHeader">
                    <CommandButton
                        data-automation-id='randomID12'
                        className='webchatGoBack'
                        onClick={() => this.props.setWebchatDisplay(false)}
                        iconProps={{ iconName: 'Cancel' }}
                    />
                    <CommandButton
                        data-automation-id='randomID11'
                        onClick={() => this.toggleMeta()}
                        className='toggleMeta'
                        text={buttonText}
                    />
                </div>
                {this.state.displayMetadata == true ? this.renderWithMeta() : this.renderWithoutMeta()}
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
export default connect(mapStateToProps, mapDispatchToProps)(WebchatController as React.ComponentClass<any>);