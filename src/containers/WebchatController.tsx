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
                <div className="webchatShrink">
                    <Webchat toggleMeta={this.toggleMeta.bind(this)} buttonText="HIDE METADATA"/>
                </div>
                <div className="webchatMetaShrink">
                    <WebchatMetadata/>
                </div>
            </div>
        )
    }
    renderWithoutMeta(){
        return (
            <div className="container">
                <Webchat toggleMeta={this.toggleMeta.bind(this)} buttonText="SHOW METADATA" />
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
                { this.state.displayMetadata == true ? this.renderWithMeta() : this.renderWithoutMeta() }
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